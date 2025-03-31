"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Theme } from "@/lib/utils";
import { useChat } from "./hooks/useChat";
import { ChatHeader } from "./components/ChatHeader";
import { Sidebar } from "./components/Sidebar";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { PromptLibrary } from "./components/PromptLibrary";

export default function ChatPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPromptBarOpen, setIsPromptBarOpen] = useState(false);
  const { 
    messages, 
    input, 
    setInput, 
    loading, 
    sendMessage, 
    resetChat,
    chatHistory,
    loadChat,
    currentChatId
  } = useChat();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const togglePromptBar = () => {
    setIsPromptBarOpen(!isPromptBarOpen);
  };

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('chatverse_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatverse_theme', theme);
  }, [theme]);

  return (
    <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-[#171923]" : "bg-gray-50"} transition-colors duration-200`}>
      <ChatHeader 
        theme={theme}
        toggleTheme={toggleTheme}
        toggleSidebar={toggleSidebar}
        togglePromptBar={togglePromptBar}
        isPromptBarOpen={isPromptBarOpen}
      />

      <div className="flex-1 overflow-hidden flex relative">
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar 
              theme={theme}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              resetChat={resetChat}
              chatHistory={chatHistory}
              loadChat={loadChat}
              currentChatId={currentChatId}
            />
          )}
        </AnimatePresence>

        <div className={`flex-1 flex flex-col max-h-full relative ${theme === "dark" ? "bg-[#1E2230]" : "bg-gray-50"} transition-colors duration-200`}>
          <MessageList 
            messages={messages}
            loading={loading}
            theme={theme}
            setInput={setInput}
          />

          <ChatInput 
            input={input}
            setInput={setInput}
            loading={loading}
            sendMessage={sendMessage}
            theme={theme}
          />
        </div>

        <AnimatePresence>
          {isPromptBarOpen && (
            <PromptLibrary 
              theme={theme}
              isPromptBarOpen={isPromptBarOpen}
              togglePromptBar={togglePromptBar}
              setInput={setInput}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}