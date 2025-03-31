"use client";

import { motion } from "framer-motion";
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
  const isDarkMode = theme === 'dark';

  return (
    <header
      className="flex items-center justify-between h-16 px-4 transition-all duration-300 sticky top-0 z-20"
      style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        boxShadow: isDarkMode 
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
          : '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        borderBottom: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.07)' 
          : '1px solid rgba(0, 0, 0, 0.07)',
      }}
    >
      {/* Left side - Logo and sidebar toggle */}
      <div className="flex items-center">
        {/* Sidebar toggle button */}
        <motion.button 
          onClick={toggleSidebar}
          className="p-2 rounded-full relative overflow-hidden"
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Transparent background that shows on hover */}
          <motion.div
            className="absolute inset-0 rounded-full z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: isDarkMode 
                ? 'rgba(99, 102, 241, 0.2)' 
                : 'rgba(224, 231, 255, 0.5)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <FiMenu className="relative z-10" />
        </motion.button>
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 ml-3">
          <div className="relative">
            {/* Logo glass background */}
            <div 
              className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: isDarkMode 
                  ? 'rgba(139, 92, 246, 0.3)' 
                  : 'rgba(139, 92, 246, 0.1)',
                backdropFilter: 'blur(8px)',
                border: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
              }}
            >
              {/* Moving gradient background */}
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%'], 
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed, #c026d3, #7c3aed, #4f46e5)",
                  backgroundSize: "200% 200%",
                  opacity: 0.8,
                }}
              />
              
              {/* Reflective overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(145deg, 
                    rgba(255, 255, 255, 0.4) 0%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    rgba(255, 255, 255, 0) 100%)`,
                }}
              />
              
              {/* Sparkle icon */}
              <div className="relative z-10">
                <HiOutlineSparkles className="text-white text-lg" />
              </div>
            </div>
          </div>
          
          {/* Logo text with gradient */}
          <h1 
            className="text-xl font-bold tracking-tight bg-clip-text text-transparent select-none"
            style={{
              background: "linear-gradient(to right, #4f46e5, #7c3aed, #c026d3)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            TRINITY AI
          </h1>
        </div>
      </div>
      
      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <motion.button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: isDarkMode 
                ? 'rgba(99, 102, 241, 0.2)' 
                : 'rgba(224, 231, 255, 0.5)',
              backdropFilter: 'blur(8px)',
            }}
          />
          {theme === "dark" ? <FiSun className="relative z-10" /> : <FiMoon className="relative z-10" />}
        </motion.button>
        
        {/* Command button */}
        <motion.button 
          onClick={togglePromptBar}
          className="p-2.5 rounded-full relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            color: isPromptBarOpen 
              ? '#6366f1' 
              : isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isPromptBarOpen ? 1 : 0,
            }}
            whileHover={{ opacity: 1 }}
            style={{
              background: isDarkMode 
                ? 'rgba(99, 102, 241, 0.2)' 
                : 'rgba(224, 231, 255, 0.5)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <FiCommand className="relative z-10" />
          
          {/* Pulsing ring for active state */}
          {isPromptBarOpen && (
            <motion.div 
              className="absolute inset-0 rounded-full border-2"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse", 
              }}
              style={{
                borderColor: '#6366f1',
              }}
            />
          )}
        </motion.button>
        
        {/* GitHub button */}
        <motion.a 
          href="https://github.com/GaragaKarthikeya" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 rounded-full relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: isDarkMode 
                ? 'rgba(99, 102, 241, 0.2)' 
                : 'rgba(224, 231, 255, 0.5)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <FiGithub className="relative z-10" />
        </motion.a>
      </div>
    </header>
  );
}