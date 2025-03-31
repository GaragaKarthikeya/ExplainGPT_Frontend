"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiClock, FiMessageSquare, FiChevronRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { Theme, getThemeClasses, ChatHistory } from "@/lib/utils";

interface SidebarProps {
  theme: Theme;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  resetChat: () => void;
  chatHistory: ChatHistory[];
  loadChat: (chatId: string) => void;
  currentChatId: string | null;
}

// Safe date parsing function to handle invalid dates
const safeParseDate = (dateString: string): Date | null => {
  try {
    const parsedDate = new Date(dateString);
    // Check if date is valid (invalid dates in JS return NaN for getTime())
    return !isNaN(parsedDate.getTime()) ? parsedDate : null;
  } catch (e) {
    console.warn("Invalid date string:", dateString);
    return null;
  }
};

// Improved getRelativeDate function to handle errors
const getRelativeDate = (timestamp: string): string => {
  const parsedDate = safeParseDate(timestamp);
  if (!parsedDate) return "Unknown date";
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset hours to compare dates properly
  const dateToCompare = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  
  if (dateToCompare.getTime() === today.getTime()) return "Today";
  if (dateToCompare.getTime() === yesterday.getTime()) return "Yesterday";
  
  const diffTime = Math.abs(today.getTime() - dateToCompare.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  // Format date for older chats
  return parsedDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: parsedDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

export function Sidebar({ 
  theme, 
  sidebarOpen, 
  setSidebarOpen, 
  resetChat,
  chatHistory,
  loadChat,
  currentChatId
}: SidebarProps) {
  const theme_classes = getThemeClasses(theme);
  const isDarkMode = theme === 'dark';
  const [buttonHovered, setButtonHovered] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // Filter duplicate chat IDs
  const uniqueChats = chatHistory.reduce((unique: ChatHistory[], chat) => {
    const exists = unique.some(item => item.id === chat.id);
    if (!exists) {
      unique.push(chat);
    }
    return unique;
  }, []);

  // Sort chats by timestamp (newest first) - with safe date parsing
  const sortedChats = [...uniqueChats].sort((a, b) => {
    const dateA = safeParseDate(a.timestamp);
    const dateB = safeParseDate(b.timestamp);
    
    // Handle invalid dates
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return dateB.getTime() - dateA.getTime();
  });

  // Group chat history by date
  const groupedHistory = sortedChats.reduce((groups, chat) => {
    const dateKey = getRelativeDate(chat.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(chat);
    return groups;
  }, {} as Record<string, ChatHistory[]>);

  // Sort the date keys to ensure consistent order
  const orderedDateKeys = Object.keys(groupedHistory).sort((a, b) => {
    const dateOrder = {
      "Today": 0,
      "Yesterday": 1,
      "Unknown date": 999 // Put unknown dates at the end
    };
    
    // Custom sorting for special date labels
    if (a in dateOrder && b in dateOrder) {
      return dateOrder[a as keyof typeof dateOrder] - dateOrder[b as keyof typeof dateOrder];
    } else if (a in dateOrder) {
      return -1;
    } else if (b in dateOrder) {
      return 1;
    }
    
    // For other dates, compare them
    if (a.includes("days ago") && b.includes("days ago")) {
      const daysA = parseInt(a.split(" ")[0]);
      const daysB = parseInt(b.split(" ")[0]);
      return daysA - daysB;
    } else if (a.includes("weeks ago") && b.includes("weeks ago")) {
      const weeksA = parseInt(a.split(" ")[0]);
      const weeksB = parseInt(b.split(" ")[0]);
      return weeksA - weeksB;
    }
    
    return a.localeCompare(b);
  });

  if (!sidebarOpen) return null;

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ duration: 0.2 }}
      className={`w-72 ${theme_classes.sidebar} border-r ${theme_classes.border} flex flex-col z-10 absolute sm:relative h-full transition-colors duration-200`}
      style={{
        boxShadow: isDarkMode ? '0 0 15px rgba(0,0,0,0.2)' : '0 0 15px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header section */}
      <div className="px-3 pt-3 pb-2">
        {/* Animated gradient new chat button */}
        <motion.button 
          onClick={() => {
            resetChat();
            if (window.innerWidth < 640) setSidebarOpen(false);
          }}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          className="w-full rounded-md py-2 px-3 text-sm flex items-center justify-center gap-2 mb-2 relative overflow-hidden"
          style={{
            boxShadow: buttonHovered 
              ? isDarkMode 
                ? '0 4px 12px rgba(129, 140, 248, 0.3)' 
                : '0 4px 12px rgba(129, 140, 248, 0.2)'
              : isDarkMode 
                ? '0 2px 6px rgba(129, 140, 248, 0.2)' 
                : '0 2px 6px rgba(129, 140, 248, 0.1)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background gradient with animation */}
          <motion.div 
            className="absolute inset-0"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ 
              backgroundPosition: buttonHovered ? "100% 50%" : "0% 50%",
            }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6)",
              backgroundSize: "300% 300%",
              filter: buttonHovered ? "brightness(1.1)" : "brightness(1)",
            }}
          />
          
          {/* Gleam effect */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            initial={{ x: "-100%", skew: "-20deg" }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: buttonHovered ? 1.5 : 0, 
              ease: "easeInOut", 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
            style={{
              width: "50%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
              display: buttonHovered ? "block" : "none"
            }}
          />
          
          {/* Button content */}
          <motion.div
            className="relative flex items-center justify-center gap-2 text-white font-medium"
            animate={{ scale: buttonHovered ? 1.03 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <FiPlus size={16} />
            <span>New Chat</span>
          </motion.div>
        </motion.button>
      </div>
      
      {/* Chat history section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
        <AnimatePresence>
          {orderedDateKeys.length > 0 ? (
            <div>
              {/* Chat stats summary */}
              <div className="mb-3 px-2 py-1.5 text-xs flex justify-between items-center">
                <span className={`${theme_classes.textSecondary} font-medium`}>
                  {chatHistory.length} {chatHistory.length === 1 ? 'Conversation' : 'Conversations'}
                </span>
                {sortedChats.length > 0 && (
                  <span className={`text-[10px] ${theme_classes.textMuted}`}>
                    Last active: {getRelativeDate(sortedChats[0].timestamp)}
                  </span>
                )}
              </div>
              
              {/* Date groups */}
              {orderedDateKeys.map((date, dateIndex) => (
                <motion.div 
                  key={`date-${date}`} 
                  className="mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIndex * 0.05, duration: 0.2 }}
                >
                  <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1 flex items-center gap-1 mb-1 ${
                    isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60'
                  } rounded-md`}>
                    <FiClock size={12} />
                    <span>{date}</span>
                    <span className="ml-auto bg-slate-700/20 px-1.5 py-0.5 rounded-sm text-[9px]">
                      {groupedHistory[date].length}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {groupedHistory[date].map((chat, index) => (
                      <motion.button 
                        key={`chat-${chat.id}-${index}`}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (dateIndex * 0.05) + (index * 0.03), duration: 0.2 }}
                        onClick={() => {
                          loadChat(chat.id);
                          if (window.innerWidth < 640) setSidebarOpen(false);
                        }}
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                        className={`w-full text-left rounded-md py-1.5 px-2 text-sm relative ${theme_classes.hover} transition-all duration-200 ${
                          currentChatId === chat.id 
                            ? `${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'} ${theme_classes.text}`
                            : theme_classes.textSecondary
                        }`}
                        style={{
                          borderLeft: currentChatId === chat.id 
                            ? `2px solid ${isDarkMode ? '#8b5cf6' : '#6366f1'}`
                            : '2px solid transparent',
                        }}
                        whileHover={{ x: 1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center truncate mr-1">
                            {currentChatId === chat.id ? (
                              <HiOutlineSparkles
                                size={13}
                                className="mr-1.5 text-purple-400"
                              />
                            ) : (
                              <FiMessageSquare 
                                size={13} 
                                className={`mr-1.5 ${hoveredChatId === chat.id ? 'text-indigo-400' : 'opacity-70'}`} 
                              />
                            )}
                            <span className="truncate">{chat.title}</span>
                          </div>
                          
                          {(hoveredChatId === chat.id || currentChatId === chat.id) && (
                            <FiChevronRight size={14} className="flex-shrink-0 text-indigo-400" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center ${theme_classes.textMuted} mt-6 mx-2 p-3 rounded-lg ${
                isDarkMode ? 'bg-slate-800/30' : 'bg-slate-100/60'
              }`}
            >
              <FiMessageSquare size={18} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1 opacity-70">Start a new conversation!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Custom scrollbar styles */}
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
      `}</style>
    </motion.div>
  );
}