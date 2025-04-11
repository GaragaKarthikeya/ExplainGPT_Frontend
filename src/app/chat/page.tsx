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
import { TypingIndicator } from "./components/TypingIndicator";

export default function ChatPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [isPromptBarOpen, setIsPromptBarOpen] = useState(false);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
  
  // Light theme colors: Clean white with blue accents
  const lightBg = "bg-gray-50";
  const lightSecondary = "bg-white";

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
        <Sidebar 
          theme={theme}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          resetChat={resetChat}
          chatHistory={chatHistory}
          loadChat={loadChat}
          currentChatId={currentChatId}
        />
        
        <div className={`flex-1 flex flex-col ${theme === "dark" ? darkSecondary : lightSecondary}`}
          style={{
            marginLeft: sidebarOpen ? undefined : 0,
            transition: "margin-left 0.2s ease-in-out"
          }}
        >
          <MessageList 
            messages={messages}
            loading={loading}
            theme={theme}
            setInput={setInput}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center"
          style={{
            paddingLeft: sidebarOpen ? '288px' : '0',
            transition: "padding-left 0.2s ease-in-out"
          }}
        >
          <ChatInput 
            input={input}
            setInput={setInput}
            loading={loading}
            sendMessage={sendMessage}
            theme={theme}
            togglePromptBar={togglePromptBar}
            sidebarOpen={sidebarOpen}
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