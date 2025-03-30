"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Message = { text: string; sender: "user" | "bot" };

/**
 * BotMessage component tracks the previously rendered text and only
 * fades in the newly appended portion without flashing the entire block.
 */
function BotMessage({ text }: { text: string }) {
  const [staticText, setStaticText] = useState(text);
  const [newPortion, setNewPortion] = useState("");
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (text.length > prevTextRef.current.length) {
      const diff = text.slice(prevTextRef.current.length);
      setNewPortion(diff);
      const timer = setTimeout(() => {
        setStaticText(text);
        setNewPortion("");
        prevTextRef.current = text;
      }, 200);
      return () => clearTimeout(timer);
    }
    if (text.length < prevTextRef.current.length) {
      setStaticText(text);
      setNewPortion("");
      prevTextRef.current = text;
    }
  }, [text]);

  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeKatex]}>
        {staticText}
      </ReactMarkdown>
      {newPortion && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {newPortion}
        </motion.span>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // scrollToBottom helper
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 50);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage, { text: "", sender: "bot" }]);
    setLoading(true);

    const updatedHistory = [...messages, userMessage];
    const currentUserInput = input;
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentUserInput,
          history: updatedHistory,
        }),
      });
      if (!response.body) throw new Error("Response body missing");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        botMessage += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { text: botMessage, sender: "bot" };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      setMessages((prev) => {
        const updated = prev.slice(0, -1);
        updated.push({ text: "⚠️ Error fetching response", sender: "bot" });
        return updated;
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center p-6">
      <header className="w-full max-w-3xl mb-8">
        <h1 className="text-4xl md:text-5xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          Chat with Progressive Rendering 🚀
        </h1>
      </header>
      <div className="w-full max-w-3xl bg-gray-700 p-6 rounded-2xl shadow-2xl">
        <div
          ref={chatContainerRef}
          className="flex flex-col space-y-4 h-96 overflow-y-auto p-4 border border-gray-600 rounded-lg bg-gray-800"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl break-words max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-blue-600 self-end text-white"
                  : "bg-gray-600 self-start text-white"
              }`}
            >
              {msg.sender === "bot" ? (
                <BotMessage text={msg.text} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-gray-300 italic">Typing...</div>
          )}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-lg bg-gray-600 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && input.trim()) {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg transition"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
