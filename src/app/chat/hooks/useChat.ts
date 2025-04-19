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
    
    // Check if message is requesting animation (starts with /animate or similar)
    const isAnimationRequest = state.input.trim().toLowerCase().startsWith("!animate");
    if (isAnimationRequest) {
      botMessagePlaceholder.text = "Generating animation, please wait...";
      botMessagePlaceholder.animation = {
        jobId: '', // Will be filled later
        status: "loading"
      };
    }
    
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
      
      // Check if this is an animation request
      const isAnimationRequest = state.input.trim().toLowerCase().startsWith("!animate");
      
      if (isAnimationRequest) {
        // Extract animation prompt (remove the !animate command)
        const prompt = state.input.trim().substring("!animate".length).trim();
        const complexity = 3; // Default complexity
        
        try {
          const animationResult = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: state.input,
              history: updatedMessages.filter(m => m.text !== ""),
              isAnimationRequest: true,
              animationPrompt: prompt,
              complexity
            }),
          });
          
          if (!animationResult.ok) {
            throw new Error(`Animation API error: ${animationResult.status}`);
          }
          
          const animationData = await animationResult.json();
          
          // Update the message with animation data
          setState(prev => {
            const updatedMessages = prev.messages.map(msg => 
              msg.id === botMessagePlaceholder.id
                ? { 
                    ...msg, 
                    text: `I've generated an animation for "${prompt}". It should appear below shortly.`,
                    animation: {
                      jobId: animationData.jobId,
                      status: "loading" as "loading"
                    }
                  }
                : msg
            );
            
            saveCurrentChat(updatedMessages);
            return { ...prev, messages: updatedMessages, loading: false };
          });
          
          // Start polling for animation status
          const pollInterval = setInterval(async () => {
            try {
              const statusResult = await fetch(`/api/animation-status?jobId=${animationData.jobId}`);
              const statusData = await statusResult.json();
              
              if (statusData.success && statusData.videoUrl) {
                // Animation is ready
                clearInterval(pollInterval);
                
                setState(prev => {
                  const finalMessages = prev.messages.map(msg => 
                    msg.id === botMessagePlaceholder.id
                      ? { 
                          ...msg,
                          animation: {
                            jobId: animationData.jobId,
                            videoUrl: statusData.videoUrl,
                            status: "complete" as "complete"
                          }
                        }
                      : msg
                  );
                  
                  saveCurrentChat(finalMessages);
                  return { ...prev, messages: finalMessages };
                });
              } else if (statusData.error) {
                // Animation failed
                clearInterval(pollInterval);
                
                setState(prev => {
                  const finalMessages = prev.messages.map(msg => 
                    msg.id === botMessagePlaceholder.id
                      ? { 
                          ...msg, 
                          animation: {
                            jobId: animationData.jobId,
                            status: "error" as "error",
                            error: statusData.error
                          }
                        }
                      : msg
                  );
                  
                  saveCurrentChat(finalMessages);
                  return { ...prev, messages: finalMessages };
                });
              }
            } catch (error) {
              console.error("Error polling animation status:", error);
            }
          }, 3000); // Check every 3 seconds
          
          // Return early - we don't need the normal chat flow for animations
          return;
        } catch (error) {
          console.error("Animation generation error:", error);
          
          setState(prev => {
            const errorMessages = prev.messages.map(msg => 
              msg.id === botMessagePlaceholder.id
                ? { 
                    ...msg, 
                    text: `Sorry, there was an error generating your animation: ${error.message}`,
                    animation: {
                      jobId: "error_" + Date.now().toString(),
                      status: "error" as "error",
                      error: error.message
                    }
                  }
                : msg
            );
            
            return { ...prev, messages: errorMessages, loading: false };
          });
          
          return;
        }
      }
      
      // Regular chat message flow
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
      
      // For better performance - use a buffer and update less frequently
      let buffer = "";
      let lastUpdateTime = Date.now();
      const updateInterval = 20; // Update every 20ms at most
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;
        buffer += chunk;
        
        // Only update the UI if we have accumulated enough text or enough time has passed
        const now = Date.now();
        if (buffer.length > 3 || now - lastUpdateTime > updateInterval) {
          setState(prev => {
            const updatedMessages = prev.messages.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: botMessage } 
                : msg
            );
            return { ...prev, messages: updatedMessages };
          });
          
          buffer = "";
          lastUpdateTime = now;
        }
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