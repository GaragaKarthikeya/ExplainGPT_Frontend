"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import { Theme, getThemeClasses } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  sendMessage: () => void;
  theme: Theme;
  togglePromptBar?: () => void;
}

export function ChatInput({ 
  input, 
  setInput, 
  loading, 
  sendMessage, 
  theme,
  togglePromptBar
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const isDarkMode = theme === "dark";
  
  // Adjust textarea height dynamically
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "inherit";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    const resetHeight = () => {
      if (inputRef.current) inputRef.current.style.height = "56px";
    };
    window.addEventListener("resetTextareaHeight", resetHeight);
    return () => window.removeEventListener("resetTextareaHeight", resetHeight);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        sendMessage();
      }
    } else if (e.key === "/" && input === "" && togglePromptBar) {
      e.preventDefault();
      togglePromptBar();
    }
  };

  const canSend = !loading && input.trim();
  
  // Theme-aware styles
  const styles = {
    primaryColor: isDarkMode ? "rgba(139,92,246,0.8)" : "rgba(124,58,237,0.8)",
    secondaryColor: isDarkMode ? "rgba(79,70,229,0.8)" : "rgba(99,102,241,0.8)",
    accentColor: isDarkMode ? "rgba(168,85,247,0.7)" : "rgba(147,51,234,0.7)",
    placeholderColor: focused 
      ? (isDarkMode ? 'rgba(167, 139, 250, 0.4)' : 'rgba(124, 58, 237, 0.3)')
      : (isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(107, 114, 128, 0.5)'),
    textColor: isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(31, 41, 55, 0.9)',
    mutedTextColor: isDarkMode ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.15)',
    backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    boxShadow: focused 
      ? `0 8px 30px rgba(0,0,0,${isDarkMode ? '0.25' : '0.1'}), 0 0 10px ${isDarkMode ? 'rgba(139,92,246,0.25)' : 'rgba(124,58,237,0.15)'}` 
      : hovered 
        ? `0 5px 20px rgba(0,0,0,${isDarkMode ? '0.2' : '0.08'})` 
        : `0 4px 12px rgba(0,0,0,${isDarkMode ? '0.15' : '0.05'})`,
    buttonDisabledBg: isDarkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(156, 163, 175, 0.7)',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="absolute bottom-0 left-0 right-0 pointer-events-none pb-3"
    >
      {/* Input Container */}
      <div className="relative max-w-2xl mx-auto px-4 pb-2 pointer-events-auto">
        <motion.div 
          initial={{ scale: 0.98 }}
          animate={{ 
            scale: focused ? 1.01 : hovered ? 1.005 : 1,
          }}
          transition={{ 
            duration: 0.3, 
            type: "spring", 
            stiffness: 300, 
            damping: 18 
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          className="relative overflow-hidden rounded-[1.2rem]"
          style={{ boxShadow: styles.boxShadow }}
        >
          {/* Input field container */}
          <div 
            className="relative border rounded-[1.2rem] overflow-hidden transition-all duration-300"
            style={{
              borderColor: styles.borderColor,
              backgroundColor: styles.backgroundColor
            }}
          >
            {/* Gradient effect when focused */}
            {focused && (
              <div 
                className="absolute inset-0 pointer-events-none animate-gradientSoft"
                style={{
                  backgroundImage: `linear-gradient(120deg, 
                    ${styles.primaryColor.replace('0.8', '0.05')}, 
                    ${styles.secondaryColor.replace('0.8', '0.02')}, 
                    ${styles.accentColor.replace('0.7', '0.05')})`,
                  backgroundSize: '200% 200%',
                  opacity: 0.7
                }}
              />
            )}
            
            {/* Light reflection effect */}
            <div 
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                backgroundImage: isDarkMode
                  ? 'linear-gradient(to bottom right, rgba(255,255,255,0.03), transparent, transparent)'
                  : 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent, transparent)',
                opacity: focused ? 0.9 : 0.6
              }}
            />

            {/* Gleam animation effect when focused */}
            {focused && (
              <div 
                className="absolute -inset-full h-[400%] w-[40%] transition-all duration-1000 pointer-events-none animate-slowGleam" 
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}, transparent)`,
                  transform: 'rotate(35deg)',
                }}
              />
            )}

            {/* Textarea */}
            <textarea
              ref={inputRef}
              className="w-full bg-transparent resize-none outline-none transition-all duration-300 py-4 px-5 pr-14"
              style={{ 
                minHeight: "54px", 
                maxHeight: "160px",
                color: styles.textColor,
                caretColor: styles.primaryColor
              }}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={1}
            />

            {/* Character counter */}
            <AnimatePresence>
              {input.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-2 left-5 text-[10px] font-medium"
                  style={{ color: styles.mutedTextColor.replace('0.8', '0.7') }}
                >
                  {input.length} characters
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (canSend) {
                  sendMessage();
                }
              }}
              disabled={!canSend}
              aria-label="Send message"
              className="absolute right-3 bottom-[0.6rem] flex items-center justify-center w-10 h-10 rounded-full overflow-hidden transition-all duration-300 border"
              style={{
                borderColor: styles.borderColor,
                boxShadow: canSend 
                  ? `0 4px 10px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'}` 
                  : 'none'
              }}
            >
              {/* Button background */}
              <div 
                className={`absolute inset-0 transition-all duration-300 ${
                  canSend ? 'opacity-100 animate-gradientSoft' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${styles.primaryColor}, ${styles.secondaryColor}, ${styles.accentColor})`,
                  backgroundSize: '200% 200%',
                }}
              />
              
              {/* Disabled state */}
              <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  backgroundColor: styles.buttonDisabledBg,
                  opacity: canSend ? 0 : 1
                }}
              />
              
              {/* Button icon */}
              <div className={`relative z-10 text-white ${canSend && !loading ? 'animate-subtle-pulse' : ''}`}>
                {loading ? (
                  <div 
                    className="rounded-full animate-spin"
                    style={{
                      height: '1.125rem',
                      width: '1.125rem',
                      borderWidth: '2px',
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                      borderTopColor: 'transparent'
                    }}
                  ></div>
                ) : (
                  <FiSend style={{ height: '1.125rem', width: '1.125rem' }} />
                )}
              </div>
            </motion.button>

            {/* Bottom glow when focused */}
            {focused && (
              <div 
                className="absolute bottom-0 left-[10%] right-[10%] h-[1px] rounded-full transition-opacity duration-500"
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${styles.primaryColor.replace('0.8', '0.3')}, transparent)`,
                  opacity: 0.6
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes gradientSoft {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slowGleam {
          0% { transform: translateX(-100%) rotate(35deg); opacity: 0; }
          10% { opacity: ${isDarkMode ? '0.06' : '0.1'}; }
          80% { opacity: ${isDarkMode ? '0.06' : '0.1'}; }
          100% { transform: translateX(250%) rotate(35deg); opacity: 0; }
        }

        @keyframes subtle-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-gradientSoft {
          animation: gradientSoft 8s ease infinite;
        }

        .animate-slowGleam {
          animation: slowGleam 4s ease-in-out infinite;
        }

        .animate-subtle-pulse {
          animation: subtle-pulse 2.5s ease-in-out infinite;
        }

        textarea::placeholder {
          color: ${styles.placeholderColor};
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
}