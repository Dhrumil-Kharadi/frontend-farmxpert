import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Bot, BarChart3, Droplets, ThermometerSun, FlaskConical, Sprout, Calendar, Zap, Circle, Bug, Cloud, TrendingUp, Clock, Truck, MapPin, DollarSign, Leaf, Package, ShoppingCart, Shield, GraduationCap, Users } from 'lucide-react';
import '../styles/Dashboard/ChatPanel.css';
import '../styles/Dashboard/ChatPanel-reasoning.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const ChatPanel = ({ agent, farmData, sessionId }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showReasoningFor, setShowReasoningFor] = useState(new Set()); // Track which messages show reasoning
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const formatScalar = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  // SmartChatUI component removed per user request for simple chatbot interface

  // Debug logging removed

  useEffect(() => {
    setMessages([{
      id: Date.now(),
      type: 'system',
      content: `Welcome to ${getAgentDisplayName(agent)}!`,
      timestamp: new Date().toISOString()
    }]);
  }, [agent]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.agent-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const getAgentDisplayName = (name) => {
    const map = {
      'super-agent': 'SuperAgent',
      'crop_selector': 'Crop Selector Agent',
      'seed_selection': 'Seed Selection Agent',
      'soil_health': 'Soil Health Agent',
      'fertilizer_advisor': 'Fertilizer Advisor Agent',
      'irrigation_planner': 'Irrigation Planner Agent',
      'pest_disease_diagnostic': 'Pest & Disease Diagnostic Agent',
      'weather_watcher': 'Weather Watcher Agent',
      'growth_stage_monitor': 'Growth Stage Monitor Agent',
      'task_scheduler': 'Task Scheduler Agent',
      'machinery_manager': 'Machinery & Equipment Agent',
      'drone_commander': 'Drone Command Agent',
      'layout_mapper': 'Farm Layout & Mapping Agent',
      'yield_predictor': 'Yield Predictor Agent',
      'profit_optimization': 'Profit Optimization Agent',
      'sustainability_tracker': 'Carbon & Sustainability Agent',
      'market_intelligence': 'Market Intelligence Agent'
    };
    return map[name] || name;
  };

  const agentOptions = [
    // Super Agent
    { id: 'orchestrator', name: 'Super Agent', icon: Bot, path: '/dashboard/orchestrator' },

    // Crop Planning & Growth
    { id: 'crop-selector', name: 'Crop Selector', icon: Sprout, path: '/dashboard/orchestrator/crop-selector' },
    { id: 'seed-selection', name: 'Seed Selection', icon: Circle, path: '/dashboard/orchestrator/seed-selection' },
    { id: 'soil-health', name: 'Soil Health', icon: FlaskConical, path: '/dashboard/orchestrator/soil-health' },
    { id: 'fertilizer-advisor', name: 'Fertilizer Advisor', icon: Droplets, path: '/dashboard/orchestrator/fertilizer-advisor' },
    { id: 'irrigation-planner', name: 'Irrigation Planner', icon: ThermometerSun, path: '/dashboard/orchestrator/irrigation-planner' },
    { id: 'pest-diagnostic', name: 'Pest & Disease Diagnostic', icon: Bug, path: '/dashboard/orchestrator/pest-diagnostic' },
    { id: 'weather-watcher', name: 'Weather Watcher', icon: Cloud, path: '/dashboard/orchestrator/weather-watcher' },
    { id: 'growth-monitor', name: 'Growth Stage Monitor', icon: TrendingUp, path: '/dashboard/orchestrator/growth-monitor' },

    // Farm Operations & Automation
    { id: 'task-scheduler', name: 'Task Scheduler', icon: Clock, path: '/dashboard/orchestrator/task-scheduler' },
    { id: 'machinery-manager', name: 'Machinery & Equipment', icon: Truck, path: '/dashboard/orchestrator/machinery-manager' },
    { id: 'drone-commander', name: 'Drone Command', icon: Zap, path: '/dashboard/orchestrator/drone-commander' },
    { id: 'layout-mapper', name: 'Farm Layout & Mapping', icon: MapPin, path: '/dashboard/orchestrator/layout-mapper' },

    // Analytics
    { id: 'yield-predictor', name: 'Yield Predictor', icon: BarChart3, path: '/dashboard/orchestrator/yield-predictor' },
    { id: 'profit-optimizer', name: 'Profit Optimization', icon: DollarSign, path: '/dashboard/orchestrator/profit-optimizer' },
    { id: 'sustainability-tracker', name: 'Carbon & Sustainability', icon: Leaf, path: '/dashboard/orchestrator/sustainability-tracker' },
    { id: 'market-intelligence', name: 'Market Intelligence', icon: Calendar, path: '/dashboard/orchestrator/market-intelligence' },

    // Supply Chain & Market Access
    { id: 'logistics-storage', name: 'Logistics & Storage', icon: Package, path: '/dashboard/orchestrator/logistics-storage' },
    { id: 'input-procurement', name: 'Input Procurement', icon: ShoppingCart, path: '/dashboard/orchestrator/input-procurement' },
    { id: 'crop-insurance-risk', name: 'Crop Insurance & Risk', icon: Shield, path: '/dashboard/orchestrator/crop-insurance-risk' },

    // Farmer Support & Education
    { id: 'farmer-coach', name: 'Farmer Coach', icon: GraduationCap, path: '/dashboard/orchestrator/farmer-coach' },
    { id: 'compliance-certification', name: 'Compliance & Certification', icon: Shield, path: '/dashboard/orchestrator/compliance-certification' },
    { id: 'community-engagement', name: 'Community Engagement', icon: Users, path: '/dashboard/orchestrator/community-engagement' }
  ];

  const handleAgentChange = (selectedAgent) => {
    navigate(selectedAgent.path);
    setIsDropdownOpen(false);
  };

  // Get current agent name for display
  const getCurrentAgentName = () => {
    const currentAgent = agentOptions.find(option => option.id === agent);
    return currentAgent ? currentAgent.name : getAgentDisplayName(agent);
  };

  const cleanText = (text) => {
    if (!text) return '';

    // Clean up the text and ensure proper formatting
    return text
      .replace(/^["']|["']$/g, '')     // Remove surrounding quotes only
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/\n\s*-\s*-\s*/g, '\n- ') // Fix double dashes
      .replace(/\n\s*-\s*/g, '\n- ')    // Ensure proper bullet point formatting
      .replace(/\n\s*\*\s*/g, '\n- ')   // Convert * to - for consistency
      .trim();
  };

  const renderMarkdownText = (text) => {
    // Handle all Markdown formatting
    let result = text;

    // Handle code blocks first (```)
    result = result.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');

    // Handle inline code (`)
    result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle bold text (**text**) - must be done before italic
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="bold-text">$1</strong>');

    // Handle italic text (*text*)
    result = result.replace(/\*([^*]+)\*/g, '<em class="italic-text">$1</em>');

    // Handle headers (##)
    result = result.replace(/^## (.+)$/gm, '<h3 class="markdown-header">$1</h3>');

    // Split by line breaks and render
    const lines = result.split('\n');
    return lines.map((line, lineIndex) => {
      if (line.trim() === '') {
        return <div key={lineIndex} className="text-line empty-line"></div>;
      }

      // Check if it's a section header (ends with colon)
      if (line.trim().endsWith(':')) {
        return (
          <div key={lineIndex} className="text-line section-header">
            <span dangerouslySetInnerHTML={{ __html: line }} />
          </div>
        );
      }

      // Check if it's a bullet point (starts with - or *)
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        // Remove the dash/asterisk from the text since CSS will add the bullet
        const cleanLine = line.replace(/^[\s]*[-*]\s*/, '');
        return (
          <div key={lineIndex} className="text-line bullet-point">
            <span dangerouslySetInnerHTML={{ __html: cleanLine }} />
          </div>
        );
      }

      // Check if it's a numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={lineIndex} className="text-line numbered-point">
            <span dangerouslySetInnerHTML={{ __html: line }} />
          </div>
        );
      }

      // Check if line contains bullet-like content (fallback for poorly formatted text)
      if (line.includes('•') || line.includes('*') || line.includes('-')) {
        // Try to extract bullet content
        const bulletMatch = line.match(/(?:•|\*|-)\s*(.+)/);
        if (bulletMatch) {
          return (
            <div key={lineIndex} className="text-line bullet-point">
              <span dangerouslySetInnerHTML={{ __html: bulletMatch[1] }} />
            </div>
          );
        }
      }

      // Regular text line
      return (
        <div key={lineIndex} className="text-line regular-text">
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      );
    });
  };

  const renderStructuredText = (text) => {
    const cleanedText = cleanText(text);
    return renderMarkdownText(cleanedText);
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    const userMessage = { id: Date.now(), type: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create a placeholder for the response
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      if (agent === 'super-agent') {
        const response = await fetch(`${API_BASE_URL}/api/super-agent/query/ui-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: text,
            context: {
              farm_location: farmData?.farm?.location || 'ahmedabad, India',
              farm_size: farmData?.farm?.size_acres || '5 acres',
              current_season: 'Rainy',
              session_id: sessionId
            },
            session_id: sessionId
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const applyUpdate = ({ ui, answer, sop, agent_responses, done }) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== assistantMessageId) return msg;
              return {
                ...msg,
                ui: ui ?? msg.ui,
                content: typeof answer === 'string' ? answer : msg.content,
                sop: sop ?? msg.sop,  // Capture SOP from streaming
                agent_responses: agent_responses ?? msg.agent_responses,  // Capture agent responses
                isStreaming: done ? false : msg.isStreaming,
              };
            })
          );
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const evt = JSON.parse(raw);
              if (evt.type === 'ui' && evt.ui) {
                applyUpdate({
                  ui: evt.ui,
                  answer: evt.answer,
                  sop: evt.sop,  // Capture SOP from event
                  agent_responses: evt.agent_responses,  // Capture agent responses
                  done: false
                });
              } else if (evt.type === 'complete') {
                applyUpdate({ done: true });
              } else if (evt.type === 'error') {
                throw new Error(evt.error || 'Unknown streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      } else {
        // Individual agent chat - use unified agent endpoint for consistent natural language output
        // Backend route: POST /api/agents/{agent_name}
        const agentName = String(agent || '').replace(/-/g, '_');
        const url = `${API_BASE_URL}/api/agents/${agentName}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: text,
            context: {
              farm_location: farmData?.farm?.location || 'ahmedabad, India',
              farm_size: farmData?.farm?.size_acres || '5 acres',
              current_season: 'Rainy',
            },
            session_id: sessionId
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Unified endpoint guarantees a top-level `response` when possible.
        // Still keep fallbacks for safety.
        let content = '';
        if (data?.response && typeof data.response === 'string') {
          content = data.response;
        } else if (data?.natural_language && typeof data.natural_language === 'string') {
          content = data.natural_language;
        } else if (data?.answer && typeof data.answer === 'string') {
          content = data.answer;
        } else if (data?.message && typeof data.message === 'string') {
          content = data.message;
        } else {
          content = JSON.stringify(data, null, 2);
        }

        const ui = data?.ui && typeof data.ui === 'object' ? data.ui : null;
        const sop = data; // Use full data as SOP for reasoning
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content, ui, sop, isStreaming: false }
              : msg
          )
        );
      }
    } catch (e) {
      console.error('Error:', e);
      setMessages((prev) =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Error. Please try again.', isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const setSuggestionText = (text) => {
    setInputValue(text);
    // Optional: Auto-focus the textarea after setting text
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="communication-panel">
      <h3>{agent === 'super-agent' ? 'Farm Orchestrator Chat' : `${getAgentDisplayName(agent)} Chat`}</h3>
      <div className="message-container">
        {messages.map((m) => (
          <div key={m.id} className="message" data-type={m.type}>
            <div className="message-header">
              <span className="message-agent">{m.type === 'user' ? 'You' : (agent === 'super-agent' ? 'Farm Orchestrator' : getAgentDisplayName(agent))}</span>
              <span className="message-time">{formatTime(m.timestamp)}</span>
            </div>
            <div className="message-content">
              {m.type === 'assistant' ? (
                <div>
                  {/* Show natural language text as main content */}
                  {renderStructuredText(m.content)}
                  {m.isStreaming && (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}

                  {/* Consulted Agents Chips - Simple & Clean */}
                  {m.agent_responses && m.agent_responses.length > 0 && !m.isStreaming && (
                    <div className="consulted-agents-row" style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', alignSelf: 'center', fontWeight: 500 }}>INPUTS FROM:</span>
                      {m.agent_responses.filter(a => a.success).map((agent, i) => (
                        <span key={i} style={{
                          fontSize: '11px',
                          background: '#f8fafc',
                          color: '#64748b',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 500
                        }}>
                          ⚡ {getAgentDisplayName(agent.agent_name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <div className="agent-selector-container">
          <div className="agent-dropdown">
            <button
              className="agent-dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Bot size={16} />
              <span>{getCurrentAgentName()}</span>
              <ChevronDown size={16} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="agent-dropdown-menu">
                {agentOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isGroupSeparator = index === 1 || index === 9 || index === 13;
                  const isCurrentAgent = option.id === agent || (agent === 'super-agent' && option.id === 'orchestrator');
                  return (
                    <button
                      key={option.id}
                      className={`agent-dropdown-item ${isGroupSeparator ? 'group-separator' : ''} ${isCurrentAgent ? 'active' : ''}`}
                      onClick={() => handleAgentChange(option)}
                    >
                      <Icon size={16} />
                      <span>{option.name}</span>
                      {isCurrentAgent && <span className="current-indicator">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about farming..."
            rows="1"
            disabled={isLoading}
          />
          <button
            className={`send-button ${isLoading ? 'loading' : ''}`}
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
        <div className="input-suggestions">
          <span className="suggestion-label">Try asking:</span>
          <button className="suggestion-chip" onClick={() => setSuggestionText("What crops should I plant this season?")}>
            Crop recommendations
          </button>
          <button className="suggestion-chip" onClick={() => setSuggestionText("How can I improve my soil health?")}>
            Soil health
          </button>
          <button className="suggestion-chip" onClick={() => setSuggestionText("What's the weather forecast for my area?")}>
            Weather forecast
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;