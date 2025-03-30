"use client";

import { useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    try {
      const response = await axios.post("/api/chat", { message: input });
      setMessages((prev) => [...prev, { text: response.data.content, sender: "bot" }]);
    } catch (error) {
      console.error("API error:", error);
      setMessages((prev) => [...prev, { text: "Error fetching response", sender: "bot" }]);
    }

    setInput("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Chat with Gemini 🚀</h1>
      <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="h-64 overflow-y-auto border-b border-gray-600 mb-2 p-2">
          {messages.map((msg, index) => (
            <div key={index} className={`p-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-700 text-gray-300 self-start"}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex mt-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l-lg bg-gray-700 text-white outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="p-2 bg-blue-600 text-white rounded-r-lg" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
