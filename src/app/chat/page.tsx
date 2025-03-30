"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { FiSend, FiChevronDown, FiUser, FiMessageSquare, FiMenu, FiPlus, FiClock, FiMoon, FiSun, FiCommand, FiGithub } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

type Message = { text: string; sender: "user" | "bot"; timestamp?: string };
type Theme = "dark" | "light";

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
    <div className="prose prose-invert max-w-none">
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [isPromptBarOpen, setIsPromptBarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const togglePromptBar = () => {
    setIsPromptBarOpen(!isPromptBarOpen);
  };

  const adjustTextareaHeight = () => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "inherit";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { 
      text: input, 
      sender: "user",
      timestamp: getCurrentDateTime()
    };
    setMessages((prev) => [...prev, userMessage, { text: "", sender: "bot" }]);
    setLoading(true);

    const updatedHistory = [...messages, userMessage];
    const currentUserInput = input;
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
    }

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
          updated[updated.length - 1] = { 
            text: botMessage, 
            sender: "bot",
            timestamp: getCurrentDateTime()
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      setMessages((prev) => {
        const updated = prev.slice(0, -1);
        updated.push({ 
          text: "⚠️ Error fetching response", 
          sender: "bot",
          timestamp: getCurrentDateTime()
        });
        return updated;
      });
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        sendMessage();
      }
    }
  };

  const promptSuggestions = [
    "Explain quantum computing in simple terms",
    "Create a detailed project plan for a mobile app",
    "Write a poem about programming in the style of Shakespeare",
    "Help me debug my React component that's not rendering correctly",
    "Design a database schema for an e-commerce platform",
    "Compare microservices vs monolithic architecture",
    "Suggest 5 ways to improve website performance",
    "Explain how blockchain works without technical jargon"
  ];

  const chatHistory = [
    { title: "Building a Neural Network", date: "Today" },
    { title: "React Performance Tips", date: "Today" },
    { title: "Kubernetes Setup Guide", date: "Yesterday" },
    { title: "Python Data Analysis", date: "3 days ago" },
    { title: "Building a Mobile App", date: "1 week ago" },
  ];

  // Group chat history by date
  const groupedHistory = chatHistory.reduce((groups, chat) => {
    if (!groups[chat.date]) {
      groups[chat.date] = [];
    }
    groups[chat.date].push(chat);
    return groups;
  }, {} as Record<string, typeof chatHistory>);

  const getThemeClasses = () => {
    return theme === "dark" 
      ? {
          bg: "bg-[#171923]",
          header: "bg-[#1A202C]",
          sidebar: "bg-[#171923]",
          chatBg: "bg-[#1E2230]",
          userMessage: "bg-[#2D3748]",
          botMessage: "bg-[#1A202C]",
          input: "bg-[#2D3748] border-gray-700",
          text: "text-white",
          textSecondary: "text-gray-300",
          textMuted: "text-gray-400",
          hover: "hover:bg-[#2D3748]",
          button: "bg-indigo-600 hover:bg-indigo-700",
          buttonSecondary: "bg-gray-700 hover:bg-gray-600",
          gradientStart: "from-[#171923]",
          iconBg: "bg-[#2D3748]",
          border: "border-gray-700",
        }
      : {
          bg: "bg-gray-50",
          header: "bg-white",
          sidebar: "bg-white",
          chatBg: "bg-gray-50",
          userMessage: "bg-indigo-50",
          botMessage: "bg-white",
          input: "bg-white border-gray-200",
          text: "text-gray-900",
          textSecondary: "text-gray-700",
          textMuted: "text-gray-500",
          hover: "hover:bg-gray-100",
          button: "bg-indigo-600 hover:bg-indigo-700",
          buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
          gradientStart: "from-gray-50",
          iconBg: "bg-gray-200",
          border: "border-gray-200",
        };
  };

  const theme_classes = getThemeClasses();

  return (
    <div className={`flex flex-col h-screen ${theme_classes.bg} transition-colors duration-200`}>
      {/* Header */}
      <header className={`flex items-center justify-between h-14 border-b ${theme_classes.border} ${theme_classes.header} px-4 transition-colors duration-200`}>
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className={`p-2 rounded-md mr-2 ${theme_classes.hover} ${theme_classes.text} transition-colors`}
            aria-label="Toggle sidebar"
          >
            <FiMenu />
          </button>
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className={`${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
            <h1 className={`text-xl font-semibold tracking-tight ${theme_classes.text}`}>ChatVerse</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-md ${theme_classes.hover} ${theme_classes.text} transition-colors`}>
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button 
            onClick={togglePromptBar} 
            className={`p-2 rounded-md ${isPromptBarOpen ? 'bg-indigo-100 text-indigo-600' : theme_classes.hover} ${theme_classes.text} transition-colors`}
          >
            <FiCommand />
          </button>
          <a 
            href="https://github.com/GaragaKarthikeya" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`p-2 rounded-md ${theme_classes.hover} ${theme_classes.text} transition-colors`}
          >
            <FiGithub />
          </a>
          <div className={`ml-3 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-medium`}>
            GK
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              className={`w-72 ${theme_classes.sidebar} border-r ${theme_classes.border} p-3 flex flex-col z-10 absolute sm:relative h-full transition-colors duration-200`}
            >
              <button 
                onClick={() => {
                  setMessages([]);
                  if (window.innerWidth < 640) setSidebarOpen(false);
                }}
                className={`w-full ${theme_classes.button} text-white rounded-md py-2 px-3 text-sm flex items-center justify-center gap-2 mb-4`}
              >
                <FiPlus size={16} />
                <span>New Chat</span>
              </button>
              
              <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedHistory).map(([date, chats]) => (
                  <div key={date} className="mb-4">
                    <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1 flex items-center gap-1`}>
                      <FiClock size={12} />
                      <span>{date}</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {chats.map((chat, idx) => (
                        <button 
                          key={idx} 
                          className={`w-full text-left ${theme_classes.textSecondary} ${theme_classes.hover} rounded py-2 px-3 text-sm font-medium truncate transition-colors`}
                        >
                          {chat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`pt-3 mt-2 border-t ${theme_classes.border} text-xs ${theme_classes.textMuted}`}>
                <div className="flex justify-between items-center px-2 pb-1">
                  <span>GaragaKarthikeya</span>
                  <span>2025-03-30</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat container */}
        <div className={`flex-1 flex flex-col max-h-full relative ${theme_classes.chatBg} transition-colors duration-200`}>
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className={`rounded-full ${theme_classes.iconBg} p-5 mb-6`}>
                  <HiOutlineSparkles className={`text-4xl ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                </div>
                <h2 className={`text-2xl font-semibold ${theme_classes.text} mb-2`}>Welcome to ChatVerse</h2>
                <p className={`${theme_classes.textMuted} max-w-md mb-8`}>
                  Unleash the power of AI to answer questions, generate content, solve problems, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  {promptSuggestions.slice(0, 4).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        if (inputRef.current) {
                          inputRef.current.focus();
                          adjustTextareaHeight();
                        }
                      }}
                      className={`${theme_classes.input} ${theme_classes.textSecondary} text-sm rounded-xl p-3 text-left border transition-all hover:shadow-md`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pb-32 pt-4 mx-auto w-full max-w-3xl">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
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
                              <span className="text-white text-xs font-medium">GK</span>
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
                              {msg.sender === "user" ? "You" : "ChatVerse"}
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
                      <div className="flex items-start">
                        <div className="font-medium mb-2 text-sm">ChatVerse</div>
                      </div>
                    </div>
                    <div className="pl-12 flex gap-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme_classes.gradientStart} to-transparent pt-20 pointer-events-none transition-colors duration-200`}>
            <div className="max-w-3xl mx-auto px-4 pb-6 pointer-events-auto">
              <div className={`relative ${theme_classes.input} border shadow-lg rounded-xl overflow-hidden transition-all duration-200`}>
                <textarea
                  ref={inputRef}
                  className={`w-full bg-transparent ${theme_classes.text} placeholder-gray-400 py-4 px-4 pr-14 resize-none outline-none overflow-hidden`}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                  placeholder="Message ChatVerse..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`absolute right-3 bottom-3 p-2 rounded-lg ${
                    loading || !input.trim()
                      ? `${theme_classes.textMuted} cursor-not-allowed`
                      : 'text-white bg-indigo-600 hover:bg-indigo-700'
                  } transition-colors shadow-md`}
                >
                  <FiSend />
                </button>
              </div>
              <p className={`text-xs text-center ${theme_classes.textMuted} mt-3`}>
                ChatVerse provides AI-generated responses which may not always be accurate.
              </p>
            </div>
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

        {/* Prompt suggestions sidebar */}
        <AnimatePresence>
          {isPromptBarOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-80 ${theme_classes.sidebar} border-l ${theme_classes.border} p-4 flex flex-col z-10 absolute right-0 top-0 bottom-0 transition-colors duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${theme_classes.text}`}>Prompt Library</h3>
                <button 
                  onClick={togglePromptBar}
                  className={`p-1.5 rounded-md ${theme_classes.hover} ${theme_classes.text}`}
                >
                  &times;
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1`}>
                  Coding & Development
                </div>
                <div className="space-y-2 mt-2 mb-6">
                  {[
                    "Review my code for security vulnerabilities",
                    "Create a unit test for this function",
                    "Convert this code from JavaScript to TypeScript",
                    "Explain this regex pattern in simple terms"
                  ].map((prompt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setInput(prompt);
                        adjustTextareaHeight();
                        togglePromptBar();
                      }}
                      className={`w-full text-left ${theme_classes.textSecondary} ${theme_classes.hover} rounded p-2 text-sm transition-colors`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                
                <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1`}>
                  Writing & Content
                </div>
                <div className="space-y-2 mt-2 mb-6">
                  {[
                    "Write a blog post about artificial intelligence",
                    "Summarize this article in 3 bullet points",
                    "Create an engaging LinkedIn post about my new project",
                    "Improve the clarity of this paragraph"
                  ].map((prompt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setInput(prompt);
                        adjustTextareaHeight();
                        togglePromptBar();
                      }}
                      className={`w-full text-left ${theme_classes.textSecondary} ${theme_classes.hover} rounded p-2 text-sm transition-colors`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                
                <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1`}>
                  Problem Solving
                </div>
                <div className="space-y-2 mt-2">
                  {[
                    "Help me design a system architecture for a social media app",
                    "What's the best approach to implement authentication?",
                    "Suggest an algorithm to solve this sorting problem",
                    "Create a detailed project plan for launching a new product"
                  ].map((prompt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setInput(prompt);
                        adjustTextareaHeight();
                        togglePromptBar();
                      }}
                      className={`w-full text-left ${theme_classes.textSecondary} ${theme_classes.hover} rounded p-2 text-sm transition-colors`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}