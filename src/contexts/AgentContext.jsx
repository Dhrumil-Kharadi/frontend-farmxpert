import React, { createContext, useContext, useState, useEffect } from 'react';

// Base URL for backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAgents, setActiveAgents] = useState([]);

  // Fetch agents data
  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const agentsResponse = await fetch(`${API_BASE_URL}/api/agents`);
      if (!agentsResponse.ok) {
        throw new Error('Failed to fetch agents data');
      }

      const agentsData = await agentsResponse.json();
      const agentList = Object.entries(agentsData || {}).map(([name, description]) => ({
        name,
        description,
      }));

      setAgents(agentList);
      setCategories([]);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active agents
  const fetchActiveAgents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/status/active`);
      if (response.ok) {
        const data = await response.json();
        setActiveAgents(data.active_agents);
      }
    } catch (err) {
      console.error('Error fetching active agents:', err);
    }
  };

  // Search agents
  const searchAgents = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.results;
      }
      return [];
    } catch (err) {
      console.error('Error searching agents:', err);
      return [];
    }
  };

  // Get agent by Indian name
  const getAgentByIndianName = (indianName) => {
    return agents.find(agent => agent.indian_name === indianName);
  };

  // Get agents by category
  const getAgentsByCategory = (categoryKey) => {
    return agents.filter(agent => {
      const category = categories.find(cat => cat.key === categoryKey);
      return category && category.agents.some(agentName => agentName === agent.indian_name);
    });
  };

  // Get agent details
  const getAgentDetails = async (agentName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentName}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching agent details:', err);
      return null;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchAgents();
    fetchActiveAgents();
    
    // Refresh active agents every 30 seconds
    const interval = setInterval(fetchActiveAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    agents,
    categories,
    activeAgents,
    loading,
    error,
    fetchAgents,
    fetchActiveAgents,
    searchAgents,
    getAgentByIndianName,
    getAgentsByCategory,
    getAgentDetails,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};
