"use client";

import { useState, useEffect } from "react";
import { getCurrentDateTime, Message, ChatHistory, generateMessageId } from "@/lib/utils";

const STORAGE_KEY = "chatverse_history";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Load chat history on init
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }
  }, []);

  // Save chat history when it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setCurrentChatId(null);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(chat => chat.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const generateChatTitle = (userMessage: string): string => {
    // Create a title from the first user message
    return userMessage.length > 30 
      ? userMessage.substring(0, 30) + "..." 
      : userMessage;
  };

  const saveCurrentChat = (updatedMessages: Message[]) => {
    // Don't save empty chats
    if (updatedMessages.length < 2) return;
    
    const now = getCurrentDateTime();
    
    if (currentChatId) {
      // Update existing chat
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: updatedMessages,
              timestamp: now,
              preview: updatedMessages[updatedMessages.length-1].text.substring(0, 50)
            } 
          : chat
      ));
    } else {
      // Create new chat
      const newChatId = `chat_${Date.now()}`;
      const firstUserMessage = updatedMessages.find(m => m.sender === "user")?.text || "";
      const newChat: ChatHistory = {
        id: newChatId,
        title: generateChatTitle(firstUserMessage),
        timestamp: now,
        messages: updatedMessages,
        preview: updatedMessages[updatedMessages.length-1].text.substring(0, 50)
      };
      
      setChatHistory(prev => [newChat, ...prev].slice(0, 20)); // Keep last 20 chats
      setCurrentChatId(newChatId);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { 
      id: generateMessageId(),
      text: input, 
      sender: "user",
      timestamp: getCurrentDateTime()
    };
    
    // Add the initial messages
    const updatedMessages: Message[] = [
      ...messages, 
      userMessage, 
      { 
        id: generateMessageId(),
        text: "", 
        sender: "bot", 
        timestamp: getCurrentDateTime() 
      }
    ];
    
    setMessages(updatedMessages);
    setLoading(true);

    const currentUserInput = input;
    setInput("");

    try {
      // Reset textarea height if needed through a custom event
      window.dispatchEvent(new CustomEvent('resetTextareaHeight'));
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentUserInput,
          history: updatedMessages.filter(m => m.text !== ""), // Filter out empty messages
        }),
      });
      
      if (!response.body) throw new Error("Response body missing");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";
      const botMessageId = updatedMessages[updatedMessages.length - 1].id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        botMessage += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const botMessageIndex = updated.findIndex(m => m.id === botMessageId);
          if (botMessageIndex !== -1) {
            updated[botMessageIndex] = { 
              ...updated[botMessageIndex],
              text: botMessage, 
            };
          }
          return updated;
        });
      }

      // Get final messages with complete bot response
      setMessages(prev => {
        const finalMessages = prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: botMessage } 
            : msg
        );
        
        // Save this chat to history
        saveCurrentChat(finalMessages);
        
        return finalMessages;
      });
      
    } catch (error) {
      console.error("Error streaming response:", error);
      setMessages((prev) => {
        const updated = prev.filter(m => m.id !== updatedMessages[updatedMessages.length - 1].id);
        const errorMessage: Message = {
          id: generateMessageId(),
          text: "⚠️ Error fetching response", 
          sender: "bot",
          timestamp: getCurrentDateTime()
        };
        return [...updated, errorMessage];
      });
    }
    
    setLoading(false);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    resetChat,
    chatHistory,
    loadChat,
    currentChatId
  };
}