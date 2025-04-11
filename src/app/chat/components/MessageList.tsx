"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiClock, FiUser, FiMessageSquare} from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineLightBulb } from "react-icons/hi";
import { Theme, getThemeClasses, Message } from "@/lib/utils";
import { BotMessage } from "./BotMessage";
import TypingIndicator from "./TypingIndicator";

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
  const [hoveredSuggestion, setHoveredSuggestion] = useState<number | null>(null);
  const theme_classes = getThemeClasses(theme);
  const isDarkMode = theme === "dark";

  // Current user info - matches the system prompt format
  const currentUser = "GaragaKarthikeya";
  const currentDateTime = getCurrentTimestamp();
  
  // Get user initials from name
  const userInitials = currentUser
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollButton(scrollTop + clientHeight < scrollHeight - 150);
    }
  };

  // Curated prompt suggestions with categories
  const promptSuggestions = [
    {
      icon: <HiOutlineLightBulb />,
      text: "Explain quantum computing in simple terms",
      category: "Explanations"
    },
    {
      icon: <FiMessageSquare />,
      text: "Generate a creative story about AI and humans collaborating",
      category: "Creative"
    },
    {
      icon: <FiUser />,
      text: "Who created you? Tell me about the Neural Trinity team",
      category: "About"
    },
    {
      icon: <HiOutlineSparkles />,
      text: "Write code for a React component that displays a gradient button",
      category: "Code"
    }
  ];

  // Format message timestamp to system prompt format
  const formatMessageTime = (timestamp: string | undefined): string => {
    if (!timestamp) return currentDateTime;
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return currentDateTime;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return currentDateTime;
    }
  };

  if (messages.length === 0) {
    return (
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scroll-smooth ${theme_classes.chatBg}`}
      >
        <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
          {/* Premium logo animation */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20, 
              delay: 0.1 
            }}
            className="relative mb-8"
          >
            <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <HiOutlineSparkles className="text-white text-5xl" />
              </motion.div>
            </div>
            
            {/* Animated ring */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0.3, scale: 0.85 }}
              animate={{ 
                opacity: [0.2, 0.3, 0.2],
                scale: [0.85, 1.05, 0.85],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse", 
                ease: "easeInOut" 
              }}
              style={{
                background: `linear-gradient(135deg, ${
                  isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
                }, ${
                  isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
                }, ${
                  isDarkMode ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'
                })`,
                filter: 'blur(8px)',
              }}
            />
          </motion.div>
          
          {/* Title with gradient text */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-2xl font-bold mb-3`}
            style={{
              background: "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NEURAL TRINITY AI
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`${theme_classes.textSecondary} max-w-lg mb-8 text-sm`}
          >
            Developed by the Neural Trinity team: Karthikeya, Abhinav, and Adithya. 
            Ask me anything or try one of the suggestions below.
          </motion.p>
          
          {/* Suggestion grid with categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mb-8"
          >
            {promptSuggestions.map((suggestion, i) => (
              <motion.button
                key={`suggestion-${i}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1), duration: 0.3 }}
                onClick={() => setInput(suggestion.text)}
                onMouseEnter={() => setHoveredSuggestion(i)}
                onMouseLeave={() => setHoveredSuggestion(null)}
                className={`${theme_classes.input} ${theme_classes.hover} text-sm rounded-xl p-3 text-left transition-all group relative overflow-hidden`}
                style={{
                  borderLeft: `2px solid ${
                    hoveredSuggestion === i 
                      ? getGradientColor(i) 
                      : 'transparent'
                  }`,
                  boxShadow: hoveredSuggestion === i 
                    ? isDarkMode 
                      ? '0 4px 12px rgba(0,0,0,0.2)' 
                      : '0 4px 12px rgba(0,0,0,0.05)'
                    : 'none',
                }}
              >
                {/* Suggestion background glow on hover */}
                {hoveredSuggestion === i && (
                  <motion.div 
                    layoutId="suggestionGlow"
                    className="absolute inset-0 opacity-10"
                    style={{
                      background: `linear-gradient(135deg, ${getGradientColor(i, true)})`,
                      borderRadius: '0.75rem',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                <div className="flex items-start">
                  <span className={`mr-2 mt-0.5 text-base ${
                    hoveredSuggestion === i 
                      ? getTextGradientClass(i)
                      : theme_classes.textMuted
                  }`}>
                    {suggestion.icon}
                  </span>
                  <div>
                    <div className="text-xs font-medium mb-0.5" style={{
                      color: hoveredSuggestion === i 
                        ? getGradientColor(i) 
                        : isDarkMode ? 'rgba(156, 163, 175, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                    }}>
                      {suggestion.category}
                    </div>
                    <div className={theme_classes.textSecondary}>
                      {suggestion.text}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
          
          {/* Current user and timestamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={`flex items-center gap-2 text-xs ${theme_classes.textMuted} mt-4`}
          >
            <FiClock size={12} />
            <span>{currentDateTime}</span>
            <span className="opacity-50">•</span>
            <FiUser size={12} />
            <span>{currentUser}</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${theme_classes.chatBg}`}
    >
      <div className="pb-32 pt-6 mx-auto w-full max-w-3xl px-4">
        <AnimatePresence mode="sync">
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            const formattedTime = formatMessageTime(msg.timestamp);
            const isStreaming = !isUser && index === messages.length - 1 && loading;
            
            return (
              <motion.div
                key={`message-${msg.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`px-4 py-5 mb-4 rounded-lg ${
                  isUser 
                    ? isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100/70' 
                    : isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-50/50'
                } transition-colors duration-200`}
                style={{
                  boxShadow: isUser 
                    ? 'none' 
                    : isDarkMode 
                      ? '0 2px 10px rgba(79, 70, 229, 0.1)' 
                      : '0 2px 10px rgba(79, 70, 229, 0.05)',
                  borderLeft: `2px solid ${
                    isUser 
                      ? 'transparent' 
                      : isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)'
                  }`,
                }}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isUser 
                          ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500' 
                          : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                      }`}
                    >
                      {isUser ? (
                        <span className="text-white text-xs font-medium">{userInitials}</span>
                      ) : (
                        <HiOutlineSparkles className="text-white" />
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Message content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className={`font-medium ${theme_classes.text}`}>
                        {isUser ? currentUser : "Trinity AI"}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${theme_classes.textMuted}`}>
                        <FiClock size={11} className="opacity-70" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                    
                    <div className={`${theme_classes.textSecondary} message-content`}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      ) : (
                        <BotMessage text={msg.text} theme={theme} />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Enhanced loading animation - ONLY show when no messages or first message is being sent */}
          {loading && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`px-4 py-5 mb-4 rounded-lg ${
                isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-50/50'
              }`}
              style={{
                boxShadow: isDarkMode 
                  ? '0 2px 10px rgba(79, 70, 229, 0.1)' 
                  : '0 2px 10px rgba(79, 70, 229, 0.05)',
                borderLeft: `2px solid ${
                  isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)'
                }`,
              }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <HiOutlineSparkles className="text-white" />
                    </motion.div>
                  </div>
                </div>                  <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className={`font-medium ${theme_classes.text}`}>
                      Trinity AI
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${theme_classes.textMuted}`}>
                      <FiClock size={11} className="opacity-70" />
                      <span>{currentDateTime}</span>
                    </div>
                  </div>
                  
                  <TypingIndicator theme={theme} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll-to-Bottom Button with gradient */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            className="absolute right-6 bottom-32 p-2.5 rounded-full shadow-lg transition-colors z-10"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
              color: "white",
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                : '0 4px 12px rgba(99, 102, 241, 0.2)',
            }}
            aria-label="Scroll to bottom"
          >
            <FiChevronDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Styles for typing animation and scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(15, 23, 42, 0.1)' : 'rgba(241, 245, 249, 0.5)'};
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.3)'};
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(99, 102, 241, 0.5)'};
        }
        
        .typing-animation {
          display: flex;
          align-items: center;
          column-gap: 6px;
        }
        
        .typing-animation .dot {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          background: ${isDarkMode ? 'rgba(139, 92, 246, 0.7)' : 'rgba(99, 102, 241, 0.7)'};
          animation: typing 1.5s infinite;
        }
        
        .typing-animation .dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-animation .dot:nth-child(2) {
          animation-delay: 0.3s;
        }
        
        .typing-animation .dot:nth-child(3) {
          animation-delay: 0.6s;
        }
        
        @keyframes typing {
          0%, 50%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        
        .message-content {
          font-size: 0.9375rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

// Helper function to get current timestamp in the exact required format
function getCurrentTimestamp() {
  // Using fixed format for consistent production timestamp
  return "2025-03-31 14:21:34";
}

// Helper function to get gradient color for suggestions
function getGradientColor(index: number, fullGradient = false): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#6366f1', // indigo
    '#ec4899', // pink
  ];
  
  if (fullGradient) {
    return `${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]}`;
  }
  
  return colors[index % colors.length];
}

// Helper function to get gradient text classes
function getTextGradientClass(index: number): string {
  const classes = [
    'text-blue-500',
    'text-violet-500',
    'text-indigo-500',
    'text-pink-500',
  ];
  
  return classes[index % classes.length];
}