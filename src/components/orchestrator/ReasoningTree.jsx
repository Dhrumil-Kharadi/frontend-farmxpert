import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const TreeContainer = styled.div`
  margin: 1rem 0;
  font-family: 'Inter', sans-serif;
`;

const TreeNode = styled.div`
  margin: 0.5rem 0;
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: -6px;
    top: 0.75rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => {
      switch (props.status) {
        case 'completed': return '#10b981';
        case 'running': return '#3b82f6';
        case 'failed': return '#ef4444';
        case 'pending': return '#f59e0b';
        default: return '#9ca3af';
      }
    }};
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const NodeHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: ${props => props.isExpanded ? '#f8fafc' : 'white'};
  border-radius: 8px;
  border: 1px solid ${props => props.isExpanded ? '#3b82f6' : '#e5e7eb'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    border-color: #3b82f6;
  }
`;

const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #1f2937;
`;

const NodeIcon = styled.span`
  font-size: 1.25rem;
`;

const NodeStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const ExpandButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const NodeContent = styled(motion.div)`
  margin-top: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ContentSection = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionContent = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecommendationItem = styled.li`
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #1e40af;
`;

const WarningList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const WarningItem = styled.li`
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: #fef2f2;
  border-left: 3px solid #ef4444;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #dc2626;
`;

const ExecutionTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
`;

const ReasoningTree = ({ 
  data = [], 
  defaultExpanded = false,
  onNodeClick = null,
  className = '' 
}) => {
  const [expandedNodes, setExpandedNodes] = useState(
    defaultExpanded ? new Set(data.map(item => item.id || item.name)) : new Set()
  );

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (nodeId) => expandedNodes.has(nodeId);

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
      'soil_health_agent': 'Soil Health Analysis',
      'weather_watcher_agent': 'Weather Analysis',
      'market_intelligence_agent': 'Market Intelligence',
      'crop_selector_agent': 'Crop Selection',
      'seed_selection_agent': 'Seed Selection',
      'fertilizer_advisor_agent': 'Fertilizer Recommendation',
      'irrigation_planner_agent': 'Irrigation Planning',
      'pest_disease_diagnostic_agent': 'Pest & Disease Diagnosis',
      'yield_predictor_agent': 'Yield Prediction',
      'profit_optimization_agent': 'Profit Optimization',
      'task_scheduler_agent': 'Task Scheduling',
      'machinery_equipment_agent': 'Machinery Planning',
      'farm_layout_mapping_agent': 'Farm Layout',
      'logistics_storage_agent': 'Logistics & Storage',
      'crop_insurance_risk_agent': 'Risk Assessment',
      'farmer_coach_agent': 'Farmer Guidance',
      'compliance_certification_agent': 'Compliance Check',
      'community_engagement_agent': 'Community Support'
    };
    
    return nameMap[agentName] || agentName.replace('_agent', '').replace(/_/g, ' ');
  };

  const renderContent = (node) => {
    const output = node.outputs || node.output || {};
    
    return (
      <NodeContent
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {output.recommendations && output.recommendations.length > 0 && (
          <ContentSection>
            <SectionTitle>
              💡 Recommendations
            </SectionTitle>
            <RecommendationList>
              {output.recommendations.map((rec, index) => (
                <RecommendationItem key={index}>{rec}</RecommendationItem>
              ))}
            </RecommendationList>
          </ContentSection>
        )}

        {output.warnings && output.warnings.length > 0 && (
          <ContentSection>
            <SectionTitle>
              ⚠️ Warnings
            </SectionTitle>
            <WarningList>
              {output.warnings.map((warning, index) => (
                <WarningItem key={index}>{warning}</WarningItem>
              ))}
            </WarningList>
          </ContentSection>
        )}

        {output.insights && output.insights.length > 0 && (
          <ContentSection>
            <SectionTitle>
              🔍 Insights
            </SectionTitle>
            <SectionContent>
              {output.insights.map((insight, index) => (
                <div key={index}>• {insight}</div>
              ))}
            </SectionContent>
          </ContentSection>
        )}

        {output.summary && (
          <ContentSection>
            <SectionTitle>
              📋 Summary
            </SectionTitle>
            <SectionContent>{output.summary}</SectionContent>
          </ContentSection>
        )}

        {node.execution_time && (
          <ExecutionTime>
            Execution time: {node.execution_time.toFixed(2)}s
          </ExecutionTime>
        )}
      </NodeContent>
    );
  };

  if (!data || data.length === 0) {
    return (
      <TreeContainer className={className}>
        <div style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
          No reasoning data available
        </div>
      </TreeContainer>
    );
  }

  return (
    <TreeContainer className={className}>
      {data.map((node, index) => {
        const nodeId = node.id || node.name || index;
        const expanded = isExpanded(nodeId);
        
        return (
          <TreeNode key={nodeId} status={node.status || 'pending'}>
            <NodeHeader
              isExpanded={expanded}
              onClick={() => {
                toggleNode(nodeId);
                if (onNodeClick) onNodeClick(node);
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <NodeTitle>
                <NodeIcon>{getAgentIcon(node.name)}</NodeIcon>
                {getAgentDisplayName(node.name)}
              </NodeTitle>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <NodeStatus>
                  <span style={{ 
                    textTransform: 'capitalize',
                    color: node.status === 'completed' ? '#10b981' : 
                           node.status === 'running' ? '#3b82f6' : 
                           node.status === 'failed' ? '#ef4444' : '#f59e0b'
                  }}>
                    {node.status || 'pending'}
                  </span>
                </NodeStatus>
                
                <ExpandButton
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {expanded ? '−' : '+'}
                </ExpandButton>
              </div>
            </NodeHeader>
            
            <AnimatePresence>
              {expanded && renderContent(node)}
            </AnimatePresence>
          </TreeNode>
        );
      })}
    </TreeContainer>
  );
};

export default ReasoningTree;
