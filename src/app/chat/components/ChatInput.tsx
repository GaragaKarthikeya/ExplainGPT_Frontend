"use client";

import { useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { Theme, getThemeClasses } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  sendMessage: () => void;
  theme: Theme;
  togglePromptBar?: () => void; // Made optional
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
  const theme_classes = getThemeClasses(theme);
  const currentUser = "GaragaKarthikeya";
  const currentDateTime = "2025-03-31 00:14:44";

  const adjustTextareaHeight = () => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "inherit";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
  };

  // Reset textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Listen for reset event from useChat
  useEffect(() => {
    const resetHeight = () => {
      if (inputRef.current) {
        inputRef.current.style.height = "52px";
      }
    };
    
    window.addEventListener('resetTextareaHeight', resetHeight);
    return () => window.removeEventListener('resetTextareaHeight', resetHeight);
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

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme_classes.gradientStart} to-transparent pt-20 pointer-events-none transition-colors duration-200`}>
      <div className="max-w-3xl mx-auto px-4 pb-6 pointer-events-auto">
        <div className={`relative ${theme_classes.input} border shadow-lg rounded-xl overflow-hidden transition-all duration-200`}>
          <textarea
            ref={inputRef}
            className={`w-full bg-transparent ${theme_classes.text} placeholder-gray-400 py-4 px-4 pr-14 resize-none outline-none overflow-hidden`}
            style={{ minHeight: '52px', maxHeight: '120px' }}
            placeholder="Message ChatVerse..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={() => {
              if (!loading && input.trim()) {
                sendMessage();
              }
            }}
            disabled={loading || !input.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-lg ${
              loading || !input.trim()
                ? `${theme_classes.textMuted} cursor-not-allowed`
                : 'text-white bg-indigo-600 hover:bg-indigo-700'
            } transition-colors shadow-md`}
          >
            <FiSend />
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className={`text-xs ${theme_classes.textMuted}`}>
            {currentUser}
          </p>
          <p className={`text-xs ${theme_classes.textMuted}`}>
            {currentDateTime}
          </p>
        </div>
      </div>
    </div>
  );
}