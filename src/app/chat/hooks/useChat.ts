"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentDateTime, Message, ChatHistory, generateMessageId } from "@/lib/utils";

const STORAGE_KEY = "chatverse_history";
const MAX_CHAT_HISTORY = 20;

export function useChat() {
  const [state, setState] = useState({
    messages: [] as Message[],
    input: "",
    loading: false,
    currentChatId: null as string | null,
    chatHistory: [] as ChatHistory[],
    error: null as string | null
  });

  // Load chat history on init
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setState(prev => ({ ...prev, chatHistory: parsedHistory }));
        }
      }
    } catch (e) {
      console.error("Failed to parse chat history:", e);
    }
  }, []);

  // Save chat history when it changes
  useEffect(() => {
    if (state.chatHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.chatHistory));
    }
  }, [state.chatHistory]);

  const resetChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      input: "",
      currentChatId: null,
      error: null
    }));
  }, []);

  const loadChat = useCallback((chatId: string) => {
    const chat = state.chatHistory.find(chat => chat.id === chatId);
    if (chat) {
      setState(prev => ({
        ...prev,
        messages: chat.messages,
        currentChatId: chatId,
        error: null
      }));
    }
  }, [state.chatHistory]);

  const generateChatTitle = useCallback((userMessage: string): string => {
    return userMessage.length > 30 
      ? `${userMessage.substring(0, 30)}...` 
      : userMessage;
  }, []);

  const saveCurrentChat = useCallback((updatedMessages: Message[]) => {
    if (updatedMessages.length < 2) return;
    
    const now = getCurrentDateTime();
    const lastMessage = updatedMessages[updatedMessages.length - 1].text;
    
    setState(prev => {
      if (prev.currentChatId) {
        // Update existing chat
        const updatedHistory = prev.chatHistory.map(chat => 
          chat.id === prev.currentChatId 
            ? { 
                ...chat, 
                messages: updatedMessages,
                timestamp: now,
                preview: lastMessage.substring(0, 50)
              } 
            : chat
        );
        return { ...prev, chatHistory: updatedHistory };
      } else {
        // Create new chat
        const newChatId = `chat_${Date.now()}`;
        const firstUserMessage = updatedMessages.find(m => m.sender === "user")?.text || "";
        
        const newChat: ChatHistory = {
          id: newChatId,
          title: generateChatTitle(firstUserMessage),
          timestamp: now,
          messages: updatedMessages,
          preview: lastMessage.substring(0, 50)
        };
        
        return {
          ...prev,
          chatHistory: [newChat, ...prev.chatHistory].slice(0, MAX_CHAT_HISTORY),
          currentChatId: newChatId
        };
      }
    });
  }, [generateChatTitle]);

  const sendMessage = useCallback(async () => {
    if (!state.input.trim() || state.loading) return;
    
    const userMessage: Message = { 
      id: generateMessageId(),
      text: state.input, 
      sender: "user",
      timestamp: getCurrentDateTime()
    };
    
    const botMessagePlaceholder: Message = {
      id: generateMessageId(),
      text: "", 
      sender: "bot", 
      timestamp: getCurrentDateTime() 
    };
    
    const updatedMessages = [...state.messages, userMessage, botMessagePlaceholder];
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages,
      input: "",
      loading: true,
      error: null
    }));

    try {
      window.dispatchEvent(new CustomEvent('resetTextareaHeight'));
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: state.input,
          history: updatedMessages.filter(m => m.text !== ""),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Response body missing");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";
      const botMessageId = botMessagePlaceholder.id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;
        
        setState(prev => {
          const updatedMessages = prev.messages.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: botMessage } 
              : msg
          );
          return { ...prev, messages: updatedMessages };
        });
      }

      // Final update with complete message
      setState(prev => {
        const finalMessages = prev.messages.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: botMessage } 
            : msg
        );
        
        saveCurrentChat(finalMessages);
        return { ...prev, messages: finalMessages, loading: false };
      });
      
    } catch (error) {
      console.error("Error streaming response:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to get response from server",
        messages: [
          ...prev.messages.slice(0, -1), // Remove bot placeholder
          {
            id: generateMessageId(),
            text: "⚠️ Error fetching response. Please try again.", 
            sender: "bot",
            timestamp: getCurrentDateTime()
          }
        ]
      }));
    }
  }, [state.input, state.messages, state.loading, saveCurrentChat]);

  return {
    ...state,
    setInput: (input: string) => setState(prev => ({ ...prev, input })),
    sendMessage,
    resetChat,
    loadChat
  };
}