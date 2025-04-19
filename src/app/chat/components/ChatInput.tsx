"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Theme, getThemeClasses } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  sendMessage: () => void;
  theme: Theme;
  togglePromptBar?: () => void;
  sidebarOpen?: boolean;
  maxInputLength?: number;
}

export function ChatInput({ 
  input, 
  setInput, 
  loading, 
  sendMessage, 
  theme,
  togglePromptBar,
  sidebarOpen = false,
  maxInputLength = 4000
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [inputHovered, setInputHovered] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isComposing, setIsComposing] = useState(false); // For IME input support
  
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
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(
        textarea.scrollHeight,
        200 // Max height in pixels
      );
      textarea.style.height = `${newHeight}px`;
    };
    
    adjustHeight();
  }, [input]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger shortcut actions during IME composition
    if (isComposing) return;
    
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
    
    // Keyboard shortcuts for advanced users
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Enter or Cmd+Enter to send
      if (e.key === 'Enter' && !loading && input.trim()) {
        e.preventDefault();
        sendMessage();
      }
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
  
  // Animation mode management with hidden prefix
  const [animationMode, setAnimationMode] = useState(false);
  const [internalInput, setInternalInput] = useState("");
  
  // Set up internal state to handle hidden animate prefix
  useEffect(() => {
    // Update internal state when input changes from outside this component
    setInternalInput(input.startsWith("!animate ") ? input.substring(9) : input);
    
    // Sync animation mode with the actual input content
    const isAnimateCommand = input.startsWith("!animate ");
    if (isAnimateCommand !== animationMode) {
      setAnimationMode(isAnimateCommand);
    }
  }, [input]);
  
  // Handle the animation toggle without showing !animate in the UI
  const handleAnimationClick = useCallback(() => {
    const newAnimationMode = !animationMode;
    
    if (newAnimationMode) {
      // Add hidden animation command (user doesn't see this)
      const visibleText = animationMode ? internalInput : input;
      setInput(`!animate ${visibleText}`);
    } else {
      // Restore the input the user was actually seeing
      setInput(internalInput);
    }
    
    // Set the animation mode after modifying input
    setAnimationMode(newAnimationMode);
    
    // Focus the input after toggling
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  }, [input, setInput, animationMode, internalInput]);
  
  // Override onChange handler to keep animation prefix hidden
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (newValue.length <= maxInputLength) {
      if (animationMode) {
        // Update the internal value the user sees
        setInternalInput(newValue);
        // Keep the !animate prefix in the actual input
        setInput(`!animate ${newValue}`);
      } else {
        // Normal behavior when not in animation mode
        setInput(newValue);
      }
    }
  }, [animationMode, setInput, maxInputLength]);
  
  return (
    <div className="w-full max-w-3xl px-4 pb-6">
      <div 
        className={`relative rounded-lg ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-sm`}
        onMouseEnter={() => setInputHovered(true)}
        onMouseLeave={() => setInputHovered(false)}
      >
        <div className="flex items-center">
          {/* Animation toggle button */}
          <button
            onClick={handleAnimationClick}
            disabled={loading}
            className={`p-2.5 m-1 rounded-md flex items-center justify-center ${
              animationMode 
                ? (isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600') 
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
            }`}
            title={animationMode ? "Animation mode ON" : "Animation mode OFF"}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" />
            </svg>
            
            {animationMode && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </button>
          
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={animationMode ? internalInput : input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={animationMode ? "Describe your animation..." : placeholders[placeholderIndex]}
              rows={1}
              maxLength={maxInputLength}
              className={`w-full py-3 px-2 resize-none bg-transparent border-0 outline-none ${
                isDarkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'
              }`}
              style={{
                minHeight: '24px',
                maxHeight: '200px'
              }}
              disabled={loading}
              spellCheck="true"
            />
          </div>
          
          {/* Send button */}
          <button
            onClick={() => !loading && input.trim() && sendMessage()}
            disabled={loading || !input.trim()}
            className={`p-2 m-1 rounded-md flex items-center justify-center transition-colors ${
              input.trim() && !loading
                ? (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                : (isDarkMode ? 'text-gray-500 bg-gray-700' : 'text-gray-400 bg-gray-100')
            }`}
            aria-label="Send message"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        {/* Info bar */}
        {focused && (
          <div 
            className={`px-3 py-1.5 text-xs border-t ${
              isDarkMode 
                ? 'border-gray-700 text-gray-400' 
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex justify-between">
              <div>
                <span>Enter to send</span>
                <span className="mx-1.5">·</span>
                <span>Shift+Enter for new line</span>
              </div>
              {!isMobile && (input.trim().length > 0 || internalInput.trim().length > 0) && (
                <div>{animationMode ? internalInput.trim().length : input.trim().length} chars</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}