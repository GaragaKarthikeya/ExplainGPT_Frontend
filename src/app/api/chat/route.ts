import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
//import fs from "fs";
//import mime from "mime-types";

// Get the Gemini API key from environment variables.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("❌ GEMINI_API_KEY is missing. Add it to .env.local");

// Initialize the Gemini client.
const genAI = new GoogleGenerativeAI(apiKey);

// Use the Gemini 2.0 flash lite model per the docs.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Set generation configuration parameters.
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [],
  responseMimeType: "text/plain",
};

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Format the provided history.
    // Expected input: an array of objects with { text, sender } where sender is "user" or "bot"
    // For Gemini we convert "bot" to "model".
    const formattedHistory = (history || []).map(
      (msg: { text: string; sender: "user" | "bot" }) => ({
        role: msg.sender === "bot" ? "model" : "user",
        parts: [{ text: msg.text }],
      })
    );

    // Limit history to the last 10 exchanges to avoid token overflow.
    const trimmedHistory = formattedHistory.slice(-10);

    // Create a chat session with the conversation history.
    const chatSession = model.startChat({
      generationConfig,
      history: trimmedHistory,
    });

    // Stream the new message.
    const streamResult = await chatSession.sendMessageStream(message);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            if (chunk.text) {
              const text = typeof chunk.text === "function" ? chunk.text() : chunk.text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `⚠️ Streaming error: ${
                error instanceof Error ? error.message : String(error)
              }`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}