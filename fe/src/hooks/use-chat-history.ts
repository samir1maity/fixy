import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define message interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChatHistory = (websiteId: string) => {
  // Create a unique key for this chat session
  const storageKey = `chat_history_${websiteId}`;
  
  // Initialize state with data from localStorage or empty array
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        // Convert string timestamps back to Date objects
        return JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      localStorage.removeItem(storageKey);
    }
    return [];
  });

  // Track session ID from backend
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(`session_${websiteId}`);
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [messages, storageKey]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(`session_${websiteId}`, sessionId);
    } else {
      localStorage.removeItem(`session_${websiteId}`);
    }
  }, [sessionId, websiteId]);

  // Function to add a new message
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Function to clear the current chat history
  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`session_${websiteId}`);
  };

  // Function to update session ID from backend
  const updateSessionId = (id: string) => {
    setSessionId(id);
  };

  return {
    messages,
    sessionId,
    addMessage,
    clearChat,
    updateSessionId
  };
}; 