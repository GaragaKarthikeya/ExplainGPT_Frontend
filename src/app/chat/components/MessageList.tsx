"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { Theme, getThemeClasses, Message } from "@/lib/utils";
import { BotMessage } from "./BotMessage";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  theme: Theme;
  setInput: (input: string) => void;
}

export function MessageList({ 
  messages, 
  loading, 
  theme,
  setInput
}: MessageListProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const theme_classes = getThemeClasses(theme);

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

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
    }
  };

  const promptSuggestions = [
    "Explain quantum computing in simple terms",
    "Create a detailed project plan for a mobile app",
    "Write a poem about programming in the style of Shakespeare",
    "Help me debug my React component that's not rendering correctly"
  ];

  const currentUser = "GaragaKarthikeya";
  const currentDateTime = "2025-03-31 00:12:00";
  const userInitials = "GK";

  if (messages.length === 0) {
    return (
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scroll-smooth ${theme_classes.chatBg}`}
      >
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className={`rounded-full ${theme_classes.iconBg} p-5 mb-6`}>
            <HiOutlineSparkles className={`text-4xl ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${theme_classes.text} mb-2`}>Welcome to ChatVerse</h2>
          <p className={`${theme_classes.textMuted} max-w-md mb-8`}>
            Unleash the power of AI to answer questions, generate content, solve problems, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
            {promptSuggestions.map((suggestion, i) => (
              <button
                key={`suggestion-${i}`}
                onClick={() => setInput(suggestion)}
                className={`${theme_classes.input} ${theme_classes.textSecondary} text-sm rounded-xl p-3 text-left border transition-all hover:shadow-md`}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <p className={`text-xs ${theme_classes.textMuted} mt-8`}>
            {currentDateTime} • {currentUser}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scroll-smooth"
    >
      <div className="pb-32 pt-4 mx-auto w-full max-w-3xl">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={`message-${index}-${msg.timestamp}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`px-4 py-6 ${
                msg.sender === "user" 
                  ? theme_classes.userMessage
                  : theme_classes.botMessage
              } mb-px transition-colors duration-200`}
            >
              <div className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1">
                  {msg.sender === "user" ? (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{userInitials}</span>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full w-8 h-8 flex items-center justify-center">
                      <HiOutlineSparkles className="text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div className={`font-medium ${theme_classes.text}`}>
                      {msg.sender === "user" ? currentUser : "ChatVerse"}
                    </div>
                    {msg.timestamp && (
                      <div className={`text-xs ${theme_classes.textMuted}`}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                  <div className={theme_classes.textSecondary}>
                    {msg.sender === "bot" ? (
                      <BotMessage text={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className={`px-4 py-6 ${theme_classes.botMessage} transition-colors duration-200`}>
            <div className="flex gap-4 max-w-3xl mx-auto">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <HiOutlineSparkles className="text-white" />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${theme_classes.text} mb-1`}>ChatVerse</div>
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
              <div className={`text-xs self-start ${theme_classes.textMuted}`}>
                {currentDateTime.split(' ')[1]}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll-to-Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className={`absolute right-6 bottom-32 p-2 ${theme_classes.buttonSecondary} rounded-full shadow-lg transition-colors z-10`}
            aria-label="Scroll to bottom"
          >
            <FiChevronDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}