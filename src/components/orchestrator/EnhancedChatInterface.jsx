import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchestrator } from '../../contexts/OrchestratorContext';

// Import orchestrator components
import VoiceInterface from './VoiceInterface';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc; /* Cleaner flat background */
  font-family: 'Inter', sans-serif;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isConnected ? '#10b981' : '#ef4444'};
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 900px; /* Limit width for better reading experience */
  width: 100%;
  margin: 0 auto;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Message = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  max-width: 85%;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    flex-direction: row-reverse;
  ` : `
    align-self: flex-start;
  `}
`;

const MessageAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px; /* Squircle */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  ${props => props.isUser ? `
    background: #3b82f6;
    color: white;
  ` : `
    background: white;
    border: 1px solid #e2e8f0;
    color: #0f172a;
  `}
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MessageBubble = styled.div`
  padding: 1rem 1.25rem;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  
  ${props => props.isUser ? `
    background: #3b82f6;
    color: white;
    border-top-right-radius: 4px;
  ` : `
    background: white;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-top-left-radius: 4px;
  `}
`;

const MessageText = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ConsultedAgentsChip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-left: 0.5rem;
`;

const SmallAgentChip = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid #e2e8f0;
`;

const InputSection = styled.div`
  padding: 1.5rem 2rem;
  background: white;
  border-top: 1px solid #f1f5f9;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:focus-within {
    border-color: #cbd5e1;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const TextInput = styled.textarea`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  color: #334155;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SendButton = styled(motion.button)`
  padding: 0.75rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 1rem;
  color: #94a3b8;
  
  span {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const EnhancedChatInterface = ({ className = '' }) => {
  const {
    loading: isProcessing,
    error,
    session,
    currentWorkflow: workflow,
    messages,
    processQuery,
    submitVoiceInput,
    clearError
  } = useOrchestrator();

  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleSendMessage = async () => {
    if (inputText.trim() && !isProcessing) {
      try {
        await processQuery(inputText.trim(), session?.id);
        setInputText('');
      } catch (error) {
        console.error('Failed to process query:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = async (voiceInput) => {
    try {
      if (typeof voiceInput === 'string') {
        const text = voiceInput.trim();
        if (text) {
          await processQuery(text, session?.id);
        }
        return;
      }
      await submitVoiceInput(voiceInput, session?.id);
    } catch (error) {
      console.error('Failed to process voice input:', error);
    }
  };

  // Helper to get agents from the LATEST workflow if the message is the latest one
  const getConsultedAgents = () => {
    if (!workflow || !workflow.tasks) return [];
    return workflow.tasks
      .filter(t => t.status === 'completed')
      .map(t => t.agent_name.replace(/_/g, ' ').replace('agent', '').trim());
  };

  const executedAgents = getConsultedAgents();

  return (
    <ChatContainer className={className}>
      <ChatHeader>
        <HeaderTitle>
          <span>🌾</span> FarmXpert AI
        </HeaderTitle>
        <HeaderStatus>
          <StatusDot isConnected={isConnected} />
          {isConnected ? 'Online' : 'Offline'}
        </HeaderStatus>
      </ChatHeader>

      <ChatContent>
        <MessagesContainer>
          <AnimatePresence>
            {messages.map((message, index) => (
              <Message
                key={message.id || index}
                isUser={message.type === 'user'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MessageAvatar isUser={message.type === 'user'}>
                  {message.type === 'user' ? '👤' : '🤖'}
                </MessageAvatar>

                <MessageContent>
                  <MessageBubble isUser={message.type === 'user'}>
                    <MessageText>{message.content}</MessageText>
                  </MessageBubble>

                  {/* Consulted Agents Chips - Per Message Source Attribution */}
                  {!message.type === 'user' && (
                    (message.agent_responses && message.agent_responses.length > 0) ||
                    (index === messages.length - 1 && executedAgents.length > 0 && !isProcessing)
                  ) && (
                      <ConsultedAgentsChip>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>INPUTS FROM:</span>
                        {/* Priority: message.agent_responses (history), then executedAgents (current session fallback) */}
                        {(message.agent_responses || []).map(r => (
                          <SmallAgentChip key={r.agent_name}>
                            ⚡ {r.agent_name.replace(/_/g, ' ').replace('agent', '').trim()}
                          </SmallAgentChip>
                        ))}
                        {(!message.agent_responses && index === messages.length - 1) && executedAgents.map(agent => (
                          <SmallAgentChip key={agent}>
                            ⚡ {agent}
                          </SmallAgentChip>
                        ))}
                      </ConsultedAgentsChip>
                    )}
                </MessageContent>
              </Message>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <Message isUser={false}>
              <MessageAvatar isUser={false}>🤖</MessageAvatar>
              <MessageContent>
                <MessageBubble isUser={false}>
                  <LoadingDots>
                    <span></span><span></span><span></span>
                  </LoadingDots>
                </MessageBubble>
                {/* Show Live Active Agents while processing */}
                <ConsultedAgentsChip>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Thinking...</span>
                  {workflow?.tasks?.filter(t => t.status === 'running').map(t => (
                    <SmallAgentChip key={t.id} style={{ color: '#3b82f6', borderColor: '#bfdbfe', background: '#eff6ff' }}>
                      🔄 {t.agent_name.replace(/_/g, ' ').replace('agent', '').trim()}
                    </SmallAgentChip>
                  ))}
                </ConsultedAgentsChip>
              </MessageContent>
            </Message>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

      </ChatContent>

      <InputSection>
        <InputContainer>
          <TextInput
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isProcessing}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isProcessing ? '...' : 'Send'}
          </SendButton>

          <VoiceInterface
            onVoiceInput={handleVoiceInput}
            textToSpeak={messages.length > 0 && messages[messages.length - 1].type !== 'user' ? messages[messages.length - 1].content : ''}
          />
        </InputContainer>
      </InputSection>
    </ChatContainer>
  );
};

export default EnhancedChatInterface;
