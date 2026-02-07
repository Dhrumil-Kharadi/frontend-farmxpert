import React, { useState, useEffect } from 'react';
import '../styles/Dashboard/AgentDetails.css';

const AGENT_INFO = {
  'super-agent': {
    name: 'SuperAgent',
    description: 'Your intelligent agricultural assistant that coordinates all specialized agents',
    capabilities: [
      'Coordinates all specialized agents',
      'Provides comprehensive farming advice',
      'Analyzes multiple data sources',
      'Synthesizes responses from multiple experts'
    ],
    tools: ['Soil Analysis', 'Weather Data', 'Market Intelligence', 'Crop Planning', 'Pest Management']
  },
  'crop_selector': {
    name: 'Crop Selector Agent',
    description: 'Helps select the best crops based on soil, weather, and market conditions',
    capabilities: ['Analyzes soil conditions', 'Considers weather patterns', 'Evaluates market demand', 'Provides crop recommendations'],
    tools: ['Soil Analysis', 'Weather Data', 'Market Intelligence', 'Crop Database']
  },
  'soil_health': {
    name: 'Soil Health Agent',
    description: 'Analyzes soil conditions and provides health recommendations',
    capabilities: ['Soil nutrient analysis', 'pH level assessment', 'Organic matter evaluation', 'Soil improvement recommendations'],
    tools: ['Soil Testing', 'Nutrient Analysis', 'pH Monitoring']
  },
  'fertilizer_advisor': {
    name: 'Fertilizer Advisor Agent',
    description: 'Provides fertilizer recommendations based on soil analysis',
    capabilities: ['Nutrient deficiency identification', 'Fertilizer dosage calculation', 'Application timing guidance', 'Organic alternatives'],
    tools: ['Soil Analysis', 'Fertilizer Database', 'Dosage Calculator']
  },
  'irrigation_planner': {
    name: 'Irrigation Planner Agent',
    description: 'Plans irrigation schedules based on weather and crop needs',
    capabilities: ['Water requirement calculation', 'Irrigation scheduling', 'Water conservation strategies', 'System optimization'],
    tools: ['Weather Data', 'Water Calculator', 'Irrigation Systems']
  },
  'yield_predictor': {
    name: 'Yield Predictor Agent',
    description: 'Predicts crop yields based on various factors',
    capabilities: ['Historical data analysis', 'Weather impact assessment', 'Yield forecasting', 'Risk evaluation'],
    tools: ['Historical Data', 'Weather Models', 'Yield Algorithms']
  },
  'market_intelligence': {
    name: 'Market Intelligence Agent',
    description: 'Provides market insights and price trends',
    capabilities: ['Price trend analysis', 'Market demand forecasting', 'Competitive analysis', 'Selling recommendations'],
    tools: ['Market Data', 'Price APIs', 'Demand Models']
  }
};

const AgentDetails = ({ agent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimer, setHideTimer] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const info = AGENT_INFO[agent] || AGENT_INFO['super-agent'];
  
  // Calculate if content might overflow (rough estimate)
  const hasLongContent = info.capabilities.length > 3 || info.tools.length > 4;
  
  const toggleVisibility = (e) => {
    if (e) { 
      // Avoid preventDefault on passive touch listeners
      e.stopPropagation(); 
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
    setIsVisible(!isVisible);
  };
  
  const handleEnter = () => {
    // Disable hover on mobile
    if (isMobile) return;
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
    setIsVisible(true);
  };

  const handleLeave = () => {
    // Disable hover on mobile
    if (isMobile) return;
    const t = setTimeout(() => setIsVisible(false), 200);
    setHideTimer(t);
  };

  // Explicit open/close helpers to avoid rapid oscillation
  const openPanel = (e) => {
    if (e) { 
      // Avoid preventDefault to prevent passive listener warning
      e.stopPropagation(); 
    }
    if (hideTimer) { 
      clearTimeout(hideTimer); 
      setHideTimer(null); 
    }
    setIsVisible(true);
  };

  const closePanel = (e) => {
    if (e) { 
      // Avoid preventDefault to prevent passive listener warning
      e.stopPropagation(); 
    }
    if (hideTimer) { 
      clearTimeout(hideTimer); 
      setHideTimer(null); 
    }
    setIsVisible(false);
  };

  // Reflect visibility on root for layout adjustments (shifts chat to the left)
  useEffect(() => {
    const root = document.documentElement;
    if (isVisible) {
      root.classList.add('agent-details-open');
    } else {
      root.classList.remove('agent-details-open');
    }
  }, [isVisible]);

  // Track mobile viewport width
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* Hover strip at right edge to reveal panel (tap to open on mobile) */}
      <div
        className="hover-reveal-AgentDetail"
        onMouseEnter={!isMobile ? handleEnter : undefined}
        onTouchStart={isMobile ? openPanel : undefined}
      />

      {/* Mobile overlay: tap outside to close when visible */}
      {isMobile && isVisible && (
        <div
          className="agent-details-overlay"
          onClick={closePanel}
          onTouchEnd={closePanel}
        />
      )}
      <div
        className={`agent-details-wrapper-AgentDetail ${isVisible ? 'expanded-AgentDetail' : 'collapsed-AgentDetail'}`}
        onMouseEnter={!isMobile ? handleEnter : undefined}
        onMouseLeave={!isMobile ? handleLeave : undefined}
      >
      {/* Agent Details Container */}
      <div className="container-AgentDetail" id="agent-details-panel">
        <div className="header-AgentDetail">
          <h3>Agent Details</h3>
          {/* Toggle Button - Only visible when expanded */}
          {isVisible && (
            <button 
              className="agent-details-toggle-AgentDetail"
              onClick={toggleVisibility}
              onTouchEnd={isMobile ? toggleVisibility : undefined}
              aria-label="Hide agent details"
            >
              <div className="hamburger-icon-AgentDetail">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          )}
        </div>
        <div className={`content-AgentDetail ${hasLongContent ? 'always-visible-scroll-AgentDetail' : ''}`}>
          <div className="info-AgentDetail">
            <div className="avatar-large-AgentDetail">🤖</div>
            <h4>{info.name}</h4>
            <p>{info.description}</p>
          </div>
          <div className="capabilities-AgentDetail">
            <h5>Capabilities</h5>
            <ul>
              {info.capabilities.map((capability, index) => (
                <li key={index}>{capability}</li>
              ))}
            </ul>
          </div>
          <div className="tools-AgentDetail">
            <h5>Available Tools</h5>
            <div className="list-AgentDetail">
              {info.tools.map((tool, index) => (
                <span key={index} className="tag-AgentDetail">{tool}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AgentDetails;