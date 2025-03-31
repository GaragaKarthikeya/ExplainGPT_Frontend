"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Theme, getThemeClasses } from "@/lib/utils";
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
      setTheme(savedTheme as Theme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatverse_theme', theme);
  }, [theme]);

  // Dark theme colors: Sleek blue-gray
  const darkBg = "bg-slate-900";
  const darkSecondary = "bg-slate-800";
  const darkAccent = "from-blue-500 to-indigo-600";
  
  // Light theme colors: Clean white with blue accents
  const lightBg = "bg-gray-50";
  const lightSecondary = "bg-white";
  const lightAccent = "from-blue-500 to-indigo-500";

  return (
    <div className={`flex flex-col h-screen ${theme === "dark" ? darkBg : lightBg} transition-colors duration-200`}>
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

        <div className={`flex-1 flex flex-col max-h-full relative ${theme === "dark" ? darkSecondary : lightSecondary} transition-colors duration-200`}>
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
            togglePromptBar={togglePromptBar}
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
      
      {/* Simple footer with user info */}
      <div className={`px-4 py-2 text-xs text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
        GaragaKarthikeya • 2025-03-31 00:28:39
      </div>
    </div>
  );
}