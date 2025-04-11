"use client";

import { motion } from "framer-motion";
import { Theme } from "@/lib/utils";

interface TypingIndicatorProps {
  theme: Theme;
}

function TypingIndicator({ theme }: TypingIndicatorProps) {
  const isDarkMode = theme === "dark";
  
  return (
    <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <motion.div 
        className={`w-2 h-2 mx-0.5 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
      />
      <motion.div 
        className={`w-2 h-2 mx-0.5 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
      />
      <motion.div 
        className={`w-2 h-2 mx-0.5 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
      />
    </div>
  );
}

// Export both as a named export and default export to ensure compatibility
export { TypingIndicator };
export default TypingIndicator;
