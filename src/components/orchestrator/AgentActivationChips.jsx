import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const AgentChip = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.status) {
      case 'running':
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;
      case 'failed':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `;
      case 'pending':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const AgentIcon = styled.span`
  font-size: 1rem;
`;

const AgentName = styled.span`
  white-space: nowrap;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'running': return '#60a5fa';
      case 'completed': return '#34d399';
      case 'failed': return '#f87171';
      case 'pending': return '#fbbf24';
      default: return '#9ca3af';
    }
  }};
  animation: ${props => props.status === 'running' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const AgentActivationChips = ({ 
  agents = [], 
  onAgentClick = null,
  showStatus = true,
  className = '' 
}) => {
  const getAgentIcon = (agentName) => {
    const iconMap = {
      'soil_health_agent': '🧪',
      'weather_watcher_agent': '🌦️',
      'market_intelligence_agent': '💹',
      'crop_selector_agent': '🌱',
      'seed_selection_agent': '🌾',
      'fertilizer_advisor_agent': '💊',
      'irrigation_planner_agent': '💧',
      'pest_disease_diagnostic_agent': '🐛',
      'yield_predictor_agent': '📊',
      'profit_optimization_agent': '💰',
      'task_scheduler_agent': '📅',
      'machinery_equipment_agent': '🚜',
      'farm_layout_mapping_agent': '🗺️',
      'logistics_storage_agent': '📦',
      'crop_insurance_risk_agent': '🛡️',
      'farmer_coach_agent': '👨‍🌾',
      'compliance_certification_agent': '📋',
      'community_engagement_agent': '👥'
    };
    
    return iconMap[agentName] || '🤖';
  };

  const getAgentDisplayName = (agentName) => {
    const nameMap = {
      'soil_health_agent': 'Soil Health',
      'weather_watcher_agent': 'Weather Watcher',
      'market_intelligence_agent': 'Market Intelligence',
      'crop_selector_agent': 'Crop Selector',
      'seed_selection_agent': 'Seed Selection',
      'fertilizer_advisor_agent': 'Fertilizer Advisor',
      'irrigation_planner_agent': 'Irrigation Planner',
      'pest_disease_diagnostic_agent': 'Pest Diagnostic',
      'yield_predictor_agent': 'Yield Predictor',
      'profit_optimization_agent': 'Profit Optimization',
      'task_scheduler_agent': 'Task Scheduler',
      'machinery_equipment_agent': 'Machinery',
      'farm_layout_mapping_agent': 'Farm Layout',
      'logistics_storage_agent': 'Logistics',
      'crop_insurance_risk_agent': 'Risk Management',
      'farmer_coach_agent': 'Farmer Coach',
      'compliance_certification_agent': 'Compliance',
      'community_engagement_agent': 'Community'
    };
    
    return nameMap[agentName] || agentName.replace('_agent', '').replace(/_/g, ' ');
  };

  const handleAgentClick = (agent) => {
    if (onAgentClick) {
      onAgentClick(agent);
    }
  };

  if (!agents || agents.length === 0) {
    return (
      <ChipsContainer className={className}>
        <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
          No agents active
        </div>
      </ChipsContainer>
    );
  }

  return (
    <ChipsContainer className={className}>
      <AnimatePresence>
        {agents.map((agent, index) => (
          <AgentChip
            key={agent.id || agent.name || index}
            status={agent.status || 'pending'}
            onClick={() => handleAgentClick(agent)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showStatus && <StatusIndicator status={agent.status || 'pending'} />}
            <AgentIcon>{getAgentIcon(agent.name)}</AgentIcon>
            <AgentName>{getAgentDisplayName(agent.name)}</AgentName>
          </AgentChip>
        ))}
      </AnimatePresence>
    </ChipsContainer>
  );
};

export default AgentActivationChips;
