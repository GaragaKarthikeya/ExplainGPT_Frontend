"use client";

import { FiMenu, FiSun, FiMoon, FiCommand, FiGithub } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { Theme, getThemeClasses } from "@/lib/utils";

interface ChatHeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  togglePromptBar: () => void;
  isPromptBarOpen: boolean;
}

export function ChatHeader({ 
  theme, 
  toggleTheme, 
  toggleSidebar, 
  togglePromptBar,
  isPromptBarOpen 
}: ChatHeaderProps) {
  const theme_classes = getThemeClasses(theme);

  return (
    <header className={`flex items-center justify-between h-16 border-b ${theme_classes.border} ${theme_classes.header} px-4 transition-all duration-300 sticky top-0 z-20`}>
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-md mr-3 ${theme_classes.hover} ${theme_classes.text} transition-colors`}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-sm opacity-75"></div>
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
              <HiOutlineSparkles className="text-white text-lg" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">ChatVerse</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className={`p-2.5 rounded-full ${theme_classes.hover} ${theme_classes.text} transition-colors`}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
        <button 
          onClick={togglePromptBar} 
          className={`p-2.5 rounded-full ${isPromptBarOpen ? 'bg-indigo-100 text-indigo-600' : theme_classes.hover} ${theme_classes.text} transition-colors relative`}
        >
          <FiCommand />
          {isPromptBarOpen && (
            <span className="absolute inset-0 rounded-full border border-indigo-300 animate-ping opacity-75"></span>
          )}
        </button>
        <a 
          href="https://github.com/GaragaKarthikeya" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`p-2.5 rounded-full ${theme_classes.hover} ${theme_classes.text} transition-colors`}
        >
          <FiGithub />
        </a>
        <div className="relative ml-2">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-full blur opacity-80 animate-pulse-slow"></div>
          <div className="relative h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white font-medium shadow-lg">
            GK
          </div>
        </div>
      </div>
    </header>
  );
}