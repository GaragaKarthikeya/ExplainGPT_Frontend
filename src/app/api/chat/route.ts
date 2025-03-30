import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is missing. Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid or missing message" }, { status: 400 });
    }

    // Convert "bot"->"model", "user"->"user".
    let formattedHistory = Array.isArray(history)
      ? history.map((msg) => ({
          role: msg.sender === "bot" ? "model" : "user",
          parts: [{ text: msg.text }],
        }))
      : [];

    // Limit to last 10 messages, then ensure the first is from "user".
    formattedHistory = formattedHistory.slice(-10);
    const firstUserIndex = formattedHistory.findIndex((h) => h.role === "user");
    if (firstUserIndex > 0) {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    }

    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });

    const streamResult = await chatSession.sendMessageStream(message);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const responseText =
              typeof chunk.text === "function" ? chunk.text() : chunk.text;
            if (responseText) {
              controller.enqueue(encoder.encode(responseText));
            }
          }
          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          controller.enqueue(
            encoder.encode(`⚠️ Streaming error: ${error instanceof Error ? error.message : String(error)}`)
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