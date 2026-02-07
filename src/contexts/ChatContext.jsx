import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { getAuthHeaders } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);

  // Send message to orchestrator
  const sendMessage = useCallback(async (message, selectedAgent = null) => {
    try {
      setLoading(true);
      
      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        agent: selectedAgent ? selectedAgent.indian_name : null
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Prepare request
      const requestBody = {
        query: message,
        session_id: sessionId,
        context: {
          selected_agent: selectedAgent ? selectedAgent.key : null,
          agent_name: selectedAgent ? selectedAgent.indian_name : null
        }
      };

      // Send to orchestrator
      const response = await fetch(`${API_BASE_URL}/api/orchestrator/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: false, response: 'Unexpected server response.' };
      }

      if (!response.ok || data?.success === false) {
        const serverMsg = data?.response || data?.error || 'Failed to send message';
        // Show server message as assistant reply instead of throwing
        const errorAssistant = {
          id: Date.now() + 1,
          type: 'assistant',
          content: serverMsg,
          timestamp: new Date(),
          agent: null,
        };
        setMessages(prev => [...prev, errorAssistant]);
        return { success: false, error: serverMsg };
      }
      
      // Update session ID if provided
      if (data.session?.id) {
        setSessionId(data.session.id);
      }

      // Add assistant response to chat
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
        agent: data.agent_details ? Object.keys(data.agent_details)[0] : null,
        intent: data.intent,
        recommendations: data.recommendations || [],
        warnings: data.warnings || [],
        executionTime: data.execution_time
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [sessionId, getAuthHeaders]);

  // Send message to specific agent
  const sendMessageToAgent = useCallback(async (message, agent) => {
    return sendMessage(`@${agent.indian_name} ${message}`, agent);
  }, [sendMessage]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setCurrentAgent(null);
  }, []);

  // Parse message for @mentions
  const parseMessage = useCallback((message) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }
    
    return {
      originalMessage: message,
      mentions,
      hasMentions: mentions.length > 0
    };
  }, []);

  // Get message history
  const getMessageHistory = useCallback(() => {
    return messages;
  }, [messages]);

  // Get last message
  const getLastMessage = useCallback(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  // Get messages by agent
  const getMessagesByAgent = useCallback((agentName) => {
    return messages.filter(msg => 
      msg.agent === agentName || 
      (msg.type === 'user' && msg.content.includes(`@${agentName}`))
    );
  }, [messages]);

  // Get conversation summary
  const getConversationSummary = useCallback(() => {
    const userMessages = messages.filter(msg => msg.type === 'user');
    const assistantMessages = messages.filter(msg => msg.type === 'assistant');
    const errorMessages = messages.filter(msg => msg.type === 'error');
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      errorMessages: errorMessages.length,
      lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
      agentsUsed: [...new Set(messages.map(msg => msg.agent).filter(Boolean))]
    };
  }, [messages]);

  const value = {
    messages,
    loading,
    sessionId,
    currentAgent,
    setCurrentAgent,
    sendMessage,
    sendMessageToAgent,
    clearChat,
    parseMessage,
    getMessageHistory,
    getLastMessage,
    getMessagesByAgent,
    getConversationSummary,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
