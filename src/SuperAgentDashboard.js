// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from './contexts/AuthContext';
// import axios from 'axios';
// import './SuperAgentDashboard.css';
// import { dataService } from './services/apiService';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// const SuperAgentDashboard = () => {
//   const { user, logout } = useAuth();
//   const [selectedAgent, setSelectedAgent] = useState('orchestrator');
//   const [currentAgent, setCurrentAgent] = useState('super-agent');
//   const [agentChats, setAgentChats] = useState({});
//   const [sessionId, setSessionId] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState('');
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [farmData, setFarmData] = useState({
//     farm_name: "Krishna farm",
//     location: "Ahmedabad, Gujarat",
//     size_acres: 15,
//     weather: {
//       temperature: 27,
//       humidity: 85,
//       condition: "Partly Cloudy"
//     }
//   });
//   const [agentCategories, setAgentCategories] = useState({});
//   const [expandedCategories, setExpandedCategories] = useState({});
//   const [activeCommunications, setActiveCommunications] = useState([]);
//   const [soilData, setSoilData] = useState({
//     ph_level: 6.8,
//     nitrogen: "Medium",
//     phosphorus: "High", 
//     potassium: "Medium",
//     moisture: 45
//   });
//   const [tasks, setTasks] = useState([]);
  
//   const messagesEndRef = useRef(null);
//   const chatInputRef = useRef(null);

//   useEffect(() => {
//     initializeDashboard();
//     generateSessionId();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showProfileMenu && !event.target.closest('.user-profile-container')) {
//         setShowProfileMenu(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showProfileMenu]);

//   const generateSessionId = () => {
//     const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//     setSessionId(newSessionId);
//   };

//   const initializeDashboard = async () => {
//     try {
//       // Load real data from APIs
//       const dashboardData = await dataService.getDashboardData(1);
//       const agentData = await dataService.getAgentStatusData();

//       // Update farm data with real data
//       if (dashboardData.farm) {
//         setFarmData({
//           farm_name: dashboardData.farm.name || "Krishna farm",
//           location: dashboardData.farm.location || "Ahmedabad, Gujarat",
//           size_acres: dashboardData.farm.size_acres || 15,
//           weather: dashboardData.weather || {
//             temperature: 27,
//             humidity: 85,
//             condition: "Partly Cloudy"
//           }
//         });
//       }

//       // Update agent categories with real data
//       if (agentData.agents && agentData.categories) {
//         setAgentCategories(agentData.agents);
//       }

//       // Add welcome message
//       setMessages([{
//         id: Date.now(),
//         type: 'system',
//         content: 'Welcome to FarmXpert SuperAgent! I\'m your intelligent agricultural assistant. How can I help you with your farming needs today?',
//         timestamp: new Date().toISOString()
//       }]);
//     } catch (error) {
//       console.error('Error initializing dashboard:', error);
//       setMessages([{
//         id: Date.now(),
//         type: 'system',
//         content: 'Welcome to FarmXpert SuperAgent! I\'m ready to help with your farming needs.',
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       // The AuthContext will handle redirecting to login
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const toggleProfileMenu = () => {
//     setShowProfileMenu(!showProfileMenu);
//   };

//   const sendMessage = async () => {
//     const message = inputValue.trim();
//     if (!message || isLoading) return;

//     // Add user message
//     const userMessage = {
//       id: Date.now(),
//       type: 'user',
//       content: message,
//       timestamp: new Date().toISOString()
//     };
    
//     // Update current agent's chat
//     const updatedMessages = [...messages, userMessage];
//     setMessages(updatedMessages);
//     setAgentChats(prev => ({
//       ...prev,
//       [currentAgent]: updatedMessages
//     }));
    
//     setInputValue('');
//     setIsLoading(true);

//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/super-agent/query`, {
//         query: message,
//         context: {
//           farm_location: farmData?.farm?.location || 'ahmedabad, India',
//           farm_size: farmData?.farm?.size_acres || '5 acres',
//           current_season: 'Kharif',
//           session_id: sessionId
//         },
//         session_id: sessionId
//       });

//       if (response.data.success) {
//         const assistantMessage = {
//           id: Date.now() + 1,
//           type: 'assistant',
//           content: response.data.response,
//           timestamp: new Date().toISOString(),
//           agentResponses: response.data.agent_responses,
//           recommendations: response.data.recommendations,
//           warnings: response.data.warnings
//         };
        
//         // Update current agent's chat
//         const updatedMessages = [...messages, userMessage, assistantMessage];
//         setMessages(updatedMessages);
//         setAgentChats(prev => ({
//           ...prev,
//           [currentAgent]: updatedMessages
//         }));
//       } else {
//         throw new Error('Failed to get response');
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       const errorMessage = {
//         id: Date.now() + 1,
//         type: 'system',
//         content: 'Sorry, I encountered an error processing your request. Please try again.',
//         timestamp: new Date().toISOString()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const switchToAgent = (agentName) => {
//     setCurrentAgent(agentName);
    
//     // Initialize chat for this agent if it doesn't exist
//     if (!agentChats[agentName]) {
//       const welcomeMessage = {
//         id: Date.now(),
//         type: 'system',
//         content: `Welcome to ${getAgentDisplayName(agentName)}! I'm ready to help you with ${agentName.replace('_', ' ')} related tasks.`,
//         timestamp: new Date().toISOString()
//       };
//       setAgentChats(prev => ({
//         ...prev,
//         [agentName]: [welcomeMessage]
//       }));
//     }
    
//     // Switch to this agent's chat
//     setMessages(agentChats[agentName] || []);
    
//     const systemMessage = {
//       id: Date.now(),
//       type: 'system',
//       content: `Switched to ${getAgentDisplayName(agentName)}`,
//       timestamp: new Date().toISOString()
//     };
//     setMessages(prev => [...prev, systemMessage]);
//   };

//   const toggleCategory = (categoryName) => {
//     setExpandedCategories(prev => ({
//       ...prev,
//       [categoryName]: !prev[categoryName]
//     }));
//   };

//   const clearChat = () => {
//     setMessages([{
//       id: Date.now(),
//       type: 'system',
//       content: 'Chat cleared. How can I help you today?',
//       timestamp: new Date().toISOString()
//     }]);
//   };

//   const startNewSession = () => {
//     generateSessionId();
//     clearChat();
//     setMessages([{
//       id: Date.now(),
//       type: 'system',
//       content: 'New session started. Welcome back!',
//       timestamp: new Date().toISOString()
//     }]);
//   };

//   const getAgentDisplayName = (agentName) => {
//     const agentNames = {
//       'super-agent': 'SuperAgent',
//       'crop_selector': 'Crop Selector Agent',
//       'soil_health': 'Soil Health Agent',
//       'fertilizer_advisor': 'Fertilizer Advisor Agent',
//       'task_scheduler': 'Task Scheduler Agent',
//       'irrigation_planner': 'Irrigation Planner Agent',
//       'yield_predictor': 'Yield Predictor Agent',
//       'market_intelligence': 'Market Intelligence Agent'
//     };
//     return agentNames[agentName] || agentName;
//   };

//   const getAgentInfo = (agentName) => {
//     const agentDatabase = {
//       'super-agent': {
//         name: 'SuperAgent',
//         description: 'Your intelligent agricultural assistant that coordinates all specialized agents',
//         capabilities: [
//           'Coordinates all specialized agents',
//           'Provides comprehensive farming advice',
//           'Analyzes multiple data sources',
//           'Synthesizes responses from multiple experts'
//         ],
//         tools: ['Soil Analysis', 'Weather Data', 'Market Intelligence', 'Crop Planning', 'Pest Management']
//       },
//       'crop_selector': {
//         name: 'Crop Selector Agent',
//         description: 'Helps select the best crops based on soil, weather, and market conditions',
//         capabilities: [
//           'Analyzes soil conditions',
//           'Considers weather patterns',
//           'Evaluates market demand',
//           'Provides crop recommendations'
//         ],
//         tools: ['Soil Analysis', 'Weather Data', 'Market Intelligence', 'Crop Database']
//       },
//       'soil_health': {
//         name: 'Soil Health Agent',
//         description: 'Analyzes soil conditions and provides health recommendations',
//         capabilities: [
//           'Soil nutrient analysis',
//           'pH level assessment',
//           'Organic matter evaluation',
//           'Soil improvement recommendations'
//         ],
//         tools: ['Soil Testing', 'Nutrient Analysis', 'pH Monitoring']
//       },
//       'fertilizer_advisor': {
//         name: 'Fertilizer Advisor Agent',
//         description: 'Provides fertilizer recommendations based on soil analysis',
//         capabilities: [
//           'Nutrient deficiency identification',
//           'Fertilizer dosage calculation',
//           'Application timing guidance',
//           'Organic alternatives'
//         ],
//         tools: ['Soil Analysis', 'Fertilizer Database', 'Dosage Calculator']
//       },
//       'task_scheduler': {
//         name: 'Task Scheduler Agent',
//         description: 'Schedules farm tasks and operations efficiently',
//         capabilities: [
//           'Seasonal planning',
//           'Task prioritization',
//           'Resource allocation',
//           'Timeline optimization'
//         ],
//         tools: ['Calendar System', 'Task Database', 'Resource Tracker']
//       },
//       'irrigation_planner': {
//         name: 'Irrigation Planner Agent',
//         description: 'Plans irrigation schedules based on weather and crop needs',
//         capabilities: [
//           'Water requirement calculation',
//           'Irrigation scheduling',
//           'Water conservation strategies',
//           'System optimization'
//         ],
//         tools: ['Weather Data', 'Water Calculator', 'Irrigation Systems']
//       },
//       'yield_predictor': {
//         name: 'Yield Predictor Agent',
//         description: 'Predicts crop yields based on various factors',
//         capabilities: [
//           'Historical data analysis',
//           'Weather impact assessment',
//           'Yield forecasting',
//           'Risk evaluation'
//         ],
//         tools: ['Historical Data', 'Weather Models', 'Yield Algorithms']
//       },
//       'market_intelligence': {
//         name: 'Market Intelligence Agent',
//         description: 'Provides market insights and price trends',
//         capabilities: [
//           'Price trend analysis',
//           'Market demand forecasting',
//           'Competitive analysis',
//           'Selling recommendations'
//         ],
//         tools: ['Market Data', 'Price APIs', 'Demand Models']
//       }
//     };
    
//     return agentDatabase[agentName] || agentDatabase['super-agent'];
//   };

//   const formatMessage = (content) => {
//     return content.replace(/\n/g, '<br>');
//   };

//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <div className="app-container">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <div className="logo">
//             <div className="logo-icon">🌾</div>
//             <h1>FarmXpert</h1>
//           </div>
//           <p className="tagline">AI-Powered Farming Assistant</p>
//         </div>

//         {/* Farm Orchestrator */}
//         <div className="orchestrator-section">
//           <div 
//             className={`orchestrator-card ${selectedAgent === 'orchestrator' ? 'active' : ''}`}
//             onClick={() => setSelectedAgent('orchestrator')}
//           >
//             <div className="orchestrator-icon">🎯</div>
//             <div className="orchestrator-info">
//               <h3>Farm Orchestrator</h3>
//               <span className="status-indicator active">Active</span>
//             </div>
//           </div>
//         </div>

//         {/* Agent Categories */}
//         <div className="agent-categories">
//           {/* Crop Planning & Growth */}
//           <div className="agent-category" data-category="crop_planning">
//             <div 
//               className="category-header"
//               onClick={() => toggleCategory('crop_planning')}
//             >
//               <span className="category-icon">🌾</span>
//               <span className="category-title">CROP PLANNING & GROWTH</span>
//               <span className={`category-toggle ${expandedCategories.crop_planning ? '' : 'collapsed'}`}>▼</span>
//             </div>
//             {expandedCategories.crop_planning && (
//               <div className="agent-list">
//                                     <div 
//                       className={`agent-item ${currentAgent === 'crop_selector' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('crop_selector')}
//                     >
//                       <span className="agent-icon">🌱</span>
//                       <span className="agent-name">Crop Selector</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                                     <div 
//                       className={`agent-item ${currentAgent === 'seed_selection' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('seed_selection')}
//                     >
//                       <span className="agent-icon">🌰</span>
//                       <span className="agent-name">Seed Selection</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'soil_health' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('soil_health')}
//                     >
//                       <span className="agent-icon">🌍</span>
//                       <span className="agent-name">Soil Health</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'fertilizer_advisor' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('fertilizer_advisor')}
//                     >
//                       <span className="agent-icon">💊</span>
//                       <span className="agent-name">Fertilizer Advisor</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'irrigation_planner' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('irrigation_planner')}
//                     >
//                       <span className="agent-icon">💧</span>
//                       <span className="agent-name">Irrigation Planner</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'pest_diagnostic' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('pest_diagnostic')}
//                     >
//                       <span className="agent-icon">🐛</span>
//                       <span className="agent-name">Pest & Disease Diagnostic</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'weather_watcher' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('weather_watcher')}
//                     >
//                       <span className="agent-icon">🌤️</span>
//                       <span className="agent-name">Weather Watcher</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'growth_monitor' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('growth_monitor')}
//                     >
//                       <span className="agent-icon">📈</span>
//                       <span className="agent-name">Growth Stage Monitor</span>
//                       <span className="agent-status active"></span>
//                     </div>
//               </div>
//             )}
//           </div>

//           {/* Farm Operations & Automation */}
//           <div className="agent-category" data-category="farm_operations">
//             <div 
//               className="category-header"
//               onClick={() => toggleCategory('farm_operations')}
//             >
//               <span className="category-icon">🚜</span>
//               <span className="category-title">FARM OPERATIONS & AUTOMATION</span>
//               <span className={`category-toggle ${expandedCategories.farm_operations ? '' : 'collapsed'}`}>▼</span>
//             </div>
//             {expandedCategories.farm_operations && (
//               <div className="agent-list">
//                                     <div 
//                       className={`agent-item ${currentAgent === 'task_scheduler' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('task_scheduler')}
//                     >
//                       <span className="agent-icon">📅</span>
//                       <span className="agent-name">Task Scheduler</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'machinery_manager' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('machinery_manager')}
//                     >
//                       <span className="agent-icon">🚜</span>
//                       <span className="agent-name">Machinery & Equipment</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'drone_commander' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('drone_commander')}
//                     >
//                       <span className="agent-icon">🚁</span>
//                       <span className="agent-name">Drone Command</span>
//                       <span className="agent-status processing"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'layout_mapper' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('layout_mapper')}
//                     >
//                       <span className="agent-icon">🗺️</span>
//                       <span className="agent-name">Farm Layout & Mapping</span>
//                       <span className="agent-status active"></span>
//                     </div>
//               </div>
//             )}
//           </div>

//           {/* Analytics */}
//           <div className="agent-category" data-category="analytics">
//             <div 
//               className="category-header"
//               onClick={() => toggleCategory('analytics')}
//             >
//               <span className="category-icon">📊</span>
//               <span className="category-title">ANALYTICS</span>
//               <span className={`category-toggle ${expandedCategories.analytics ? '' : 'collapsed'}`}>▼</span>
//             </div>
//             {expandedCategories.analytics && (
//               <div className="agent-list">
//                                     <div 
//                       className={`agent-item ${currentAgent === 'yield_predictor' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('yield_predictor')}
//                     >
//                       <span className="agent-icon">📊</span>
//                       <span className="agent-name">Yield Predictor</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'profit_optimizer' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('profit_optimizer')}
//                     >
//                       <span className="agent-icon">💰</span>
//                       <span className="agent-name">Profit Optimization</span>
//                       <span className="agent-status active"></span>
//                     </div>
//                     <div 
//                       className={`agent-item ${currentAgent === 'sustainability_tracker' ? 'active' : ''}`}
//                       onClick={() => switchToAgent('sustainability_tracker')}
//                     >
//                       <span className="agent-icon">🌿</span>
//                       <span className="agent-name">Carbon & Sustainability</span>
//                       <span className="agent-status active"></span>
//                     </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Dashboard */}
//       <div className="main-dashboard">
//         {/* Dashboard Header */}
//         <div className="dashboard-header">
//           <div className="farm-info">
//             <h2>{farmData.farm_name}</h2>
//             <div className="farm-location">{farmData.location} • {farmData.size_acres} acres</div>
//           </div>
//           <div className="header-right">
//             <div className="weather-widget">
//               <div className="weather-icon">☀️</div>
//               <div className="weather-info">
//                 <div className="temperature">{farmData.weather.temperature}°F</div>
//                 <div className="condition">{farmData.weather.condition}</div>
//               </div>
//             </div>
//             <div className="user-profile-container">
//               <div className="user-profile" onClick={toggleProfileMenu}>
//                 <div className="user-avatar">
//                   <span className="user-initials">
//                     {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
//                   </span>
//                 </div>
//                 <div className="user-info">
//                   <div className="user-name">{user?.username || 'User'}</div>
//                   <div className="user-role">{user?.role || 'Farm User'}</div>
//                 </div>
//                 <button className="profile-menu-btn">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M6 9l6 6 6-6"/>
//                   </svg>
//                 </button>
//               </div>
              
//               {showProfileMenu && (
//                 <div className="profile-dropdown">
//                   <div className="profile-dropdown-header">
//                     <div className="profile-dropdown-avatar">
//                       <span className="user-initials-large">
//                         {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
//                       </span>
//                     </div>
//                     <div className="profile-dropdown-info">
//                       <div className="profile-dropdown-name">{user?.username || 'User'}</div>
//                       <div className="profile-dropdown-email">{user?.email || 'user@farmxpert.com'}</div>
//                     </div>
//                   </div>
//                   <div className="profile-dropdown-divider"></div>
//                   <div className="profile-dropdown-menu">
//                     <button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//                         <circle cx="12" cy="7" r="4"/>
//                       </svg>
//                       Profile Settings
//                     </button>
//                     <button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M12 20h9"/>
//                         <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
//                       </svg>
//                       Edit Profile
//                     </button>
//                     <button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
//                         <line x1="12" y1="9" x2="12" y2="13"/>
//                         <line x1="12" y1="17" x2="12.01" y2="17"/>
//                       </svg>
//                       Help & Support
//                     </button>
//                     <div className="profile-dropdown-divider"></div>
//                     <button className="profile-menu-item logout-btn" onClick={handleLogout}>
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
//                         <polyline points="16,17 21,12 16,7"/>
//                         <line x1="21" y1="12" x2="9" y2="12"/>
//                       </svg>
//                       Sign Out
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Status Overview */}
//         <div className="status-overview">
//           <div className="status-card">
//             <span className="status-label">ACTIVE</span>
//             <span className="status-count">6</span>
//           </div>
//           <div className="status-card">
//             <span className="status-label">PROCESSING</span>
//             <span className="status-count processing">2</span>
//           </div>
//           <div className="status-card">
//             <span className="status-label">IDLE</span>
//             <span className="status-count idle">15</span>
//           </div>
//         </div>

//         {/* Content Grid */}
//         <div className="content-grid">
//           {/* Communication Panel */}
//           <div className="communication-panel">
//             <h3>{currentAgent === 'super-agent' ? 'Farm Orchestrator Chat' : `${getAgentDisplayName(currentAgent)} Chat`}</h3>
//             <div className="message-container">
//               {messages.map((message) => (
//                 <div key={message.id} className="message">
//                   <div className="message-header">
//                     <span className="message-agent">{message.sender || 'Farm Orchestrator'}</span>
//                     <span className="message-time">{formatTime(message.timestamp)}</span>
//                   </div>
//                   <div className="message-content">{message.content}</div>
//                 </div>
//               ))}
          
//               {/* Typing Indicator */}
//               {isLoading && (
//                 <div className="message">
//                   <div className="message-header">
//                     <span className="message-agent">Farm Orchestrator</span>
//                   </div>
//                   <div className="typing-indicator">
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                   </div>
//                 </div>
//               )}
          
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Chat Input */}
//             <div className="chat-input-container">
//               <div className="chat-input-wrapper">
//                 <textarea
//                   ref={chatInputRef}
//                   id="chat-input"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Ask me anything about farming... (e.g., 'What crops should I plant this season?')"
//                   rows="1"
//                   disabled={isLoading}
//                 />
//                 <button 
//                   className="send-button" 
//                   onClick={sendMessage}
//                   disabled={isLoading || !inputValue.trim()}
//                 >
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <line x1="22" y1="2" x2="11" y2="13"></line>
//                     <polygon points="22,2 15,22 11,13 2,9"></polygon>
//                   </svg>
//                 </button>
//               </div>
//               <div className="input-suggestions">
//                 <span className="suggestion-label">Try asking:</span>
//                 <button 
//                   className="suggestion-chip" 
//                   onClick={() => {
//                     setInputValue("What crops should I plant this season?");
//                     sendMessage();
//                   }}
//                 >
//                   Crop recommendations
//                 </button>
//                 <button 
//                   className="suggestion-chip" 
//                   onClick={() => {
//                     setInputValue("How can I improve my soil health?");
//                     sendMessage();
//                   }}
//                 >
//                   Soil health
//                 </button>
//                 <button 
//                   className="suggestion-chip" 
//                   onClick={() => {
//                     setInputValue("What's the weather forecast for my area?");
//                     sendMessage();
//                   }}
//                 >
//                   Weather forecast
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Agent Details Panel */}
//           <div className="agent-details-panel" id="agent-details-panel">
//             <div className="panel-header">
//               <h3>Agent Details</h3>
//               <button className="close-panel" onClick={() => {
//                 document.getElementById('agent-details-panel').classList.remove('open');
//               }}>×</button>
//             </div>
//             <div className="panel-content">
//               <div className="agent-info">
//                 <div className="agent-avatar-large">🤖</div>
//                 <h4>{getAgentInfo(currentAgent).name}</h4>
//                 <p>{getAgentInfo(currentAgent).description}</p>
//               </div>
//               <div className="agent-capabilities">
//                 <h5>Capabilities</h5>
//                 <ul>
//                   {getAgentInfo(currentAgent).capabilities.map((capability, index) => (
//                     <li key={index}>{capability}</li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="agent-tools">
//                 <h5>Available Tools</h5>
//                 <div className="tools-list">
//                   {getAgentInfo(currentAgent).tools.map((tool, index) => (
//                     <span key={index} className="tool-tag">{tool}</span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAgentDashboard;