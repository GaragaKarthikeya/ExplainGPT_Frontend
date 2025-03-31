"use client";

import { motion } from "framer-motion";
import { Theme, getThemeClasses } from "@/lib/utils";

interface PromptLibraryProps {
  theme: Theme;
  isPromptBarOpen: boolean;
  togglePromptBar: () => void;
  setInput: (input: string) => void;
}

export function PromptLibrary({ 
  theme, 
  isPromptBarOpen, 
  togglePromptBar, 
  setInput 
}: PromptLibraryProps) {
  const theme_classes = getThemeClasses(theme);

  if (!isPromptBarOpen) return null;

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    togglePromptBar();
  };

  return (
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
              onClick={() => handlePromptSelect(prompt)}
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
              onClick={() => handlePromptSelect(prompt)}
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
              onClick={() => handlePromptSelect(prompt)}
              className={`w-full text-left ${theme_classes.textSecondary} ${theme_classes.hover} rounded p-2 text-sm transition-colors`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}