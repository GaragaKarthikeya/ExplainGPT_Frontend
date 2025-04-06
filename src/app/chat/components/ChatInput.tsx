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
    return currentScroll.onChange((latest) => {
      setScrollY(latest);
    });
  }, [currentScroll]);

  // Adjust textarea height dynamically
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const maxHeight = isMobile ? 120 : 160;
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight, 
        maxHeight
      )}px`;
    }
  }, [isMobile]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    const resetHeight = () => {
      if (inputRef.current) {
        inputRef.current.style.height = isMobile ? "48px" : "56px";
      }
    };
    window.addEventListener("resetTextareaHeight", resetHeight);
    return () => window.removeEventListener("resetTextareaHeight", resetHeight);
  }, [isMobile]);

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleVirtualKeyboard = () => {
      if (focused && inputRef.current) {
        const isKeyboardOpen = window.innerHeight < viewportSize.height * 0.8;
        if (isKeyboardOpen) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    };
    
    window.addEventListener('resize', handleVirtualKeyboard);
    return () => window.removeEventListener('resize', handleVirtualKeyboard);
  }, [focused, isMobile, viewportSize.height]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        sendMessage();
      }
    } else if (e.key === "/" && input === "" && togglePromptBar) {
      e.preventDefault();
      togglePromptBar();
    }
  }, [input, loading, sendMessage, togglePromptBar]);

  const canSend = !loading && input.trim();
  
  // Memoized theme styles
  const styles = useMemo(() => ({
    primaryColor: isDarkMode ? "rgba(139,92,246,0.8)" : "rgba(124,58,237,0.8)",
    secondaryColor: isDarkMode ? "rgba(79,70,229,0.8)" : "rgba(99,102,241,0.8)",
    accentColor: isDarkMode ? "rgba(168,85,247,0.7)" : "rgba(147,51,234,0.7)",
    placeholderColor: focused 
      ? (isDarkMode ? 'rgba(167, 139, 250, 0.4)' : 'rgba(124, 58, 237, 0.3)')
      : (isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(107, 114, 128, 0.5)'),
    textColor: isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(31, 41, 55, 0.9)',
    mutedTextColor: isDarkMode ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
    borderGlow: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)',
    backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    boxShadow: focused 
      ? `0 8px 30px rgba(0,0,0,${isDarkMode ? '0.25' : '0.1'}), 0 0 10px ${isDarkMode ? 'rgba(139,92,246,0.25)' : 'rgba(124,58,237,0.15)'}` 
      : hovered 
        ? `0 5px 20px rgba(0,0,0,${isDarkMode ? '0.2' : '0.08'})` 
        : `0 4px 12px rgba(0,0,0,${isDarkMode ? '0.15' : '0.05'})`,
    buttonDisabledBg: isDarkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(156, 163, 175, 0.7)',
  }), [isDarkMode, focused, hovered]);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  const inputContainerVariants = {
    initial: { scale: 0.98 },
    animate: { 
      scale: focused ? 1.01 : hovered ? 1.005 : 1,
      backdropFilter: scrollY > 50 ? `blur(${focused ? 12 : 8}px)` : 'blur(6px)',
      background: `rgba(${isDarkMode ? '17,24,39' : '255,255,255'}, ${Math.min(0.1 + scrollY * 0.002, 0.4)})`,
    },
  };

  const characterCounterVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 0.7, y: 0 },
    exit: { opacity: 0, y: 5 },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 pointer-events-none pb-3 z-50"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom, 0px), ${isMobile ? '8px' : '12px'})`,
      }}
    >
      <div className="relative max-w-2xl mx-auto px-4 pb-2 pointer-events-auto">
        <motion.div 
          variants={inputContainerVariants}
          transition={{ 
            duration: 0.3, 
            type: "spring", 
            stiffness: 300, 
            damping: 18 
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          className="relative overflow-hidden rounded-[1rem] sm:rounded-[1.2rem] border shadow-lg"
          style={{ 
            borderWidth: focused ? '1.5px' : '1px',
            borderColor: focused 
              ? `${styles.primaryColor.replace('0.8', '0.5')}` 
              : styles.borderColor,
            boxShadow: styles.boxShadow,
            transition: 'border-color 0.3s ease, border-width 0.2s ease',
            transform: `translateZ(0)`, // Force GPU acceleration
          }}
        >
          {/* Border glow effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: focused 
                ? `inset 0 0 0 1px ${styles.borderGlow}, 0 0 12px ${styles.borderGlow}` 
                : 'none',
              borderRadius: 'inherit',
              opacity: focused ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Visual Effects */}
          {focused && (
            <>
              <div 
                className="absolute inset-0 pointer-events-none animate-gradientSoft"
                style={{
                  backgroundImage: `linear-gradient(120deg, 
                    ${styles.primaryColor.replace('0.8', '0.05')}, 
                    ${styles.secondaryColor.replace('0.8', '0.02')}, 
                    ${styles.accentColor.replace('0.7', '0.05')})`,
                  backgroundSize: '200% 200%',
                  opacity: 0.9
                }}
              />
              <div 
                className="absolute -inset-full h-[400%] w-[40%] transition-all duration-1000 pointer-events-none animate-slowGleam" 
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}, transparent)`,
                  transform: 'rotate(35deg)',
                }}
              />
            </>
          )}

          <div 
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundImage: isDarkMode
                ? 'linear-gradient(to bottom right, rgba(255,255,255,0.03), transparent, transparent)'
                : 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent, transparent)',
              opacity: focused ? 0.9 : 0.6
            }}
          />

          {/* Textarea */}
          <textarea
            ref={inputRef}
            className="w-full bg-transparent resize-none outline-none transition-all duration-300 py-3 sm:py-4 px-4 sm:px-5 pr-12 sm:pr-14"
            style={{ 
              minHeight: isMobile ? "48px" : "54px", 
              maxHeight: isMobile ? "120px" : "160px",
              color: styles.textColor,
              caretColor: styles.primaryColor,
              fontSize: isMobile ? "15px" : "16px",
              lineHeight: isMobile ? "1.4" : "1.5",
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
                variants={characterCounterVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute bottom-1.5 sm:bottom-2 left-4 sm:left-5 text-[9px] sm:text-[10px] font-medium"
                style={{ color: styles.mutedTextColor.replace('0.8', '0.7') }}
              >
                {input.length} characters
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send button */}
          <motion.button
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            onClick={() => canSend && sendMessage()}
            disabled={!canSend}
            aria-label="Send message"
            className="absolute right-2.5 sm:right-3 bottom-[0.5rem] sm:bottom-[0.6rem] flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden transition-all duration-300 border"
            style={{
              borderColor: canSend 
                ? `${styles.primaryColor.replace('0.8', '0.6')}` 
                : styles.borderColor,
              boxShadow: canSend 
                ? `0 2px 8px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}, 0 0 0 1px ${styles.borderGlow}` 
                : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <div 
              className={`absolute inset-0 transition-all duration-300 ${
                canSend ? 'opacity-100 animate-gradientSoft' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${styles.primaryColor}, ${styles.secondaryColor}, ${styles.accentColor})`,
                backgroundSize: '200% 200%',
              }}
            />
            
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                backgroundColor: styles.buttonDisabledBg,
                opacity: canSend ? 0 : 1
              }}
            />
            
            <div className={`relative z-10 text-white ${canSend && !loading ? 'animate-subtle-pulse' : ''}`}>
              {loading ? (
                <div 
                  className="rounded-full animate-spin"
                  style={{
                    height: isMobile ? '0.875rem' : '1.125rem',
                    width: isMobile ? '0.875rem' : '1.125rem',
                    borderWidth: '2px',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    borderTopColor: 'transparent'
                  }}
                />
              ) : (
                <FiSend style={{ 
                  height: isMobile ? '0.875rem' : '1.125rem', 
                  width: isMobile ? '0.875rem' : '1.125rem' 
                }} />
              )}
            </div>
          </motion.button>

          {/* Dynamic bottom border */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: focused ? 1 : 0.7,
              background: `linear-gradient(90deg, 
                ${styles.primaryColor}, 
                ${styles.secondaryColor}, 
                ${styles.accentColor})`,
              opacity: focused ? 0.8 : 0.3
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        {/* Keyboard shortcut hint */}
        <div className="mt-1.5 text-center">
          <div 
            className="text-[10px] sm:text-[11px] font-medium opacity-60 hover:opacity-100 transition-opacity duration-200 inline-block"
            style={{ 
              color: isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            }}
          >
            Press <span className="inline-block px-1 mx-0.5 border rounded bg-opacity-30" style={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(229, 231, 235, 0.5)',
              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            }}>Enter</span> to send, <span className="inline-block px-1 mx-0.5 border rounded bg-opacity-30" style={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(229, 231, 235, 0.5)',
              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            }}>Shift + Enter</span> for new line
          </div>
        </div>
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
        
        /* Custom scrollbar for textarea */
        textarea::-webkit-scrollbar {
          width: ${isMobile ? '3px' : '4px'};
        }
        
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background-color: ${isDarkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(107, 114, 128, 0.2)'};
          border-radius: 20px;
        }
        
        @media (max-width: 640px) {
          /* Improve touch targets on mobile */
          button {
            touch-action: manipulation;
          }
          
          /* Prevent iOS zoom on focus */
          textarea {
            font-size: 16px;
          }
        }
      `}</style>
    </motion.div>
  );
}