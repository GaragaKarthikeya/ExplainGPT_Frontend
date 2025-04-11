"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { FiSend } from "react-icons/fi";
import { Theme, getThemeClasses } from "@/lib/utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  sendMessage: () => void;
  theme: Theme;
  togglePromptBar?: () => void;
  sidebarOpen?: boolean;
}

export function ChatInput({ 
  input, 
  setInput, 
  loading, 
  sendMessage, 
  theme,
  togglePromptBar,
  sidebarOpen = false
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { scrollY: currentScroll } = useScroll();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  const isDarkMode = theme === "dark";
  const isMobile = viewportSize.width > 0 && viewportSize.width < 640;
  
  // Update viewport dimensions for responsive behavior
  useEffect(() => {
    const updateViewportDimensions = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateViewportDimensions();
    window.addEventListener('resize', updateViewportDimensions);
    return () => window.removeEventListener('resize', updateViewportDimensions);
  }, []);
  
  // Track scroll position
  useEffect(() => {
    return currentScroll.onChange(latest => setScrollY(latest));
  }, [currentScroll]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(
        textarea.scrollHeight,
        300 // Max height in pixels
      );
      textarea.style.height = `${newHeight}px`;
    };
    
    adjustHeight();
    
    // Reset height when event triggered
    const resetHeightListener = () => {
      if (textarea) {
        textarea.style.height = 'auto';
      }
    };
    
    window.addEventListener('resetTextareaHeight', resetHeightListener);
    return () => {
      window.removeEventListener('resetTextareaHeight', resetHeightListener);
    };
  }, [input]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without shift (for mobile, require shift+enter for newline)
    if (e.key === 'Enter' && !e.shiftKey && (!isMobile || (isMobile && input.trim().length > 0))) {
      e.preventDefault();
      if (!loading && input.trim()) {
        sendMessage();
      }
    }
    
    // Handle Slash commands - opening prompt library with "/"
    if (e.key === '/' && input === '' && !e.shiftKey && !e.ctrlKey && !e.altKey && togglePromptBar) {
      e.preventDefault();
      togglePromptBar();
    }
    
    // Clear input with Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setInput('');
      inputRef.current?.focus();
    }
  };
  
  // Placeholder text animation
  const placeholders = useMemo(() => [
    "Ask anything...",
    "Explain a concept...",
    "Get creative ideas...",
    "Debug some code...",
    "Type / to see prompts..."
  ], []);
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);
  
  const theme_classes = getThemeClasses(theme);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isMobile]);
  
  // Support emoji picker toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);
  
  return (
    <div 
      className={`w-full max-w-3xl px-4 pb-6`}
      style={{
        position: 'relative',
        zIndex: focused || hovered ? 50 : 40
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-xl overflow-hidden p-1 transition-shadow ${
          focused 
            ? (isDarkMode ? 'shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_4px_20px_rgba(0,0,0,0.3)]' : 'shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_4px_20px_rgba(0,0,0,0.08)]') 
            : (isDarkMode ? 'shadow-md shadow-black/30' : 'shadow-lg shadow-slate-200/70')
        }`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.5))' 
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${
            isDarkMode 
              ? (focused ? 'rgba(99, 102, 241, 0.3)' : 'rgba(30, 41, 59, 0.6)') 
              : (focused ? 'rgba(99, 102, 241, 0.3)' : 'rgba(241, 245, 249, 0.9)')
          }`
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholders[placeholderIndex]}
              rows={1}
              className={`w-full p-3 resize-none bg-transparent border-0 outline-none ${theme_classes.text} ${
                isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'
              }`}
              style={{
                minHeight: '24px',
                maxHeight: '300px',
                lineHeight: '1.5',
              }}
              disabled={loading}
              aria-disabled={loading}
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => !loading && input.trim() && sendMessage()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-lg flex-shrink-0 focus:outline-none transition-colors"
            style={{
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                : isDarkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.7)",
              opacity: input.trim() && !loading ? 1 : 0.7,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
            }}
            aria-label="Send message"
          >
            <FiSend 
              className={input.trim() && !loading 
                ? "text-white" 
                : isDarkMode ? "text-gray-400" : "text-gray-500"
              } 
              size={18} 
            />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {focused && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className={`px-3 py-2 flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              style={{
                borderTop: `1px solid ${isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.7)'}`,
              }}
            >
              <div>
                <span>Enter to send</span>
                <span className="opacity-60 mx-1">•</span>
                <span>Shift+Enter for new line</span>
                <span className="opacity-60 mx-1">•</span>
                <span>/ for prompts</span>
              </div>
              {!isMobile && input.trim().length > 0 && (
                <div>{input.trim().length} characters</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}