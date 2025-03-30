import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import mime from "mime-types";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("❌ GEMINI_API_KEY is missing. Add it to .env.local");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const chatSession = model.startChat({ generationConfig, history: [] });
    const result = await chatSession.sendMessage(message);
    const candidates = result.response.candidates || [];
    let reply = "";

    // Process responses
    for (const candidate of candidates) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          try {
            const filename = `output.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, "base64"));
            console.log(`📂 Output written to: ${filename}`);
          } catch (err) {
            console.error("❌ File write error:", err);
          }
        } else if (part.text) {
          reply = part.text;
        }
      }
    }

    return NextResponse.json({ content: reply || "⚠️ No valid response from Gemini." });
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}
