"use client";
import { useState } from "react";

type Message = {
  text: string;
  sender: "user" | "bot"; // Restrict sender to only "user" or "bot"
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    // Simulating bot response
    setTimeout(() => {
      const botMessage: Message = { text: "Hello! I'm ExplainGPT 🤖", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInput("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">ExplainGPT Chat</h1>
      <div className="w-full max-w-md h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 my-2 rounded-md ${msg.sender === "user" ? "bg-blue-500 text-right" : "bg-gray-700 text-left"}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-md flex mt-4">
        <input
          className="flex-1 p-2 bg-gray-700 text-white rounded-l-md outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="p-2 bg-blue-600 rounded-r-md" onClick={sendMessage}>
          Send
        </button>
      </div>
    </main>
  );
}
