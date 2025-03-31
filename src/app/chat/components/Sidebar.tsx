"use client";

import { motion } from "framer-motion";
import { FiPlus, FiClock } from "react-icons/fi";
import { Theme, getThemeClasses, ChatHistory, getRelativeDate } from "@/lib/utils";

interface SidebarProps {
  theme: Theme;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  resetChat: () => void;
  chatHistory: ChatHistory[];
  loadChat: (chatId: string) => void;
  currentChatId: string | null;
}

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

  // Filter duplicate chat IDs
  const uniqueChats = chatHistory.reduce((unique: ChatHistory[], chat) => {
    const exists = unique.some(item => item.id === chat.id);
    if (!exists) {
      unique.push(chat);
    }
    return unique;
  }, []);

  // Sort chats by timestamp (newest first) before grouping
  const sortedChats = [...uniqueChats].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
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

  // Sort the date keys to ensure consistent order (Today, Yesterday, etc.)
  const orderedDateKeys = Object.keys(groupedHistory).sort((a, b) => {
    const dateOrder = {
      "Today": 0,
      "Yesterday": 1
    };
    
    // Custom sorting for special date labels
    if (a in dateOrder && b in dateOrder) {
      return dateOrder[a as keyof typeof dateOrder] - dateOrder[b as keyof typeof dateOrder];
    } else if (a in dateOrder) {
      return -1;
    } else if (b in dateOrder) {
      return 1;
    }
    
    // For other dates, compare them as they might be "X days ago", "X weeks ago", or actual dates
    if (a.includes("days ago") && b.includes("days ago")) {
      return parseInt(a) - parseInt(b);
    } else if (a.includes("weeks ago") && b.includes("weeks ago")) {
      return parseInt(a) - parseInt(b);
    }
    
    // Default to alphabetical sort for other cases
    return a.localeCompare(b);
  });

  if (!sidebarOpen) return null;

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ duration: 0.2 }}
      className={`w-72 ${theme_classes.sidebar} border-r ${theme_classes.border} p-3 flex flex-col z-10 absolute sm:relative h-full transition-colors duration-200`}
    >
      <button 
        onClick={() => {
          resetChat();
          if (window.innerWidth < 640) setSidebarOpen(false);
        }}
        className={`w-full ${theme_classes.button} text-white rounded-md py-2 px-3 text-sm flex items-center justify-center gap-2 mb-4`}
      >
        <FiPlus size={16} />
        <span>New Chat</span>
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {orderedDateKeys.length > 0 ? (
          orderedDateKeys.map((date) => (
            <div key={`date-${date}`} className="mb-4">
              <div className={`text-xs font-medium ${theme_classes.textMuted} px-2 py-1 flex items-center gap-1`}>
                <FiClock size={12} />
                <span>{date}</span>
              </div>
              <div className="space-y-1 mt-1">
                {groupedHistory[date].map((chat, index) => (
                  <button 
                    key={`chat-${chat.id}-${index}`}
                    onClick={() => {
                      loadChat(chat.id);
                      if (window.innerWidth < 640) setSidebarOpen(false);
                    }}
                    className={`w-full text-left ${
                      currentChatId === chat.id 
                        ? `${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`
                        : ''
                    } ${theme_classes.textSecondary} ${theme_classes.hover} rounded py-2 px-3 text-sm font-medium truncate transition-colors`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center ${theme_classes.textMuted} mt-4 px-2`}>
            No chat history yet. Start a new conversation!
          </div>
        )}
      </div>
    </motion.div>
  );
}