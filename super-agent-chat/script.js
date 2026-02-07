/**
 * FarmXpert SuperAgent Chat Interface
 * Handles chat functionality, agent switching, and API communication
 */

class SuperAgentChat {
    constructor() {
        this.currentAgent = 'super-agent';
        this.sessionId = this.generateSessionId();
        this.isLoading = false;
        this.apiBaseUrl = 'http://localhost:8000/api'; // Update this to match your backend URL
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadAgentInformation();
        this.initializeChat();
    }

    initializeElements() {
        // Chat elements
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Agent elements
        this.currentAgentName = document.getElementById('current-agent-name');
        this.currentAgentDescription = document.getElementById('current-agent-description');
        this.agentDetailsPanel = document.getElementById('agent-details-panel');
        this.panelContent = document.getElementById('panel-content');
        
        // Action buttons
        this.clearChatBtn = document.getElementById('clear-chat');
        this.newSessionBtn = document.getElementById('new-session');
        this.closePanelBtn = document.getElementById('close-panel');
        
        // Agent selection elements
        this.superAgentCard = document.querySelector('.super-agent-card');
        this.agentItems = document.querySelectorAll('.agent-item');
        this.categoryHeaders = document.querySelectorAll('.category-header');
        
        // Suggestion chips
        this.suggestionChips = document.querySelectorAll('.suggestion-chip');
    }

    attachEventListeners() {
        // Chat input events
        this.chatInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.chatInput.addEventListener('input', () => this.handleInputResize());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Action buttons
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.newSessionBtn.addEventListener('click', () => this.startNewSession());
        this.closePanelBtn.addEventListener('click', () => this.closeAgentPanel());
        
        // Agent selection
        this.superAgentCard.addEventListener('click', () => this.switchToAgent('super-agent'));
        this.agentItems.forEach(item => {
            item.addEventListener('click', () => {
                const agentName = item.dataset.agent;
                this.switchToAgent(agentName);
            });
        });
        
        // Category toggles
        this.categoryHeaders.forEach(header => {
            header.addEventListener('click', () => this.toggleCategory(header));
        });
        
        // Suggestion chips
        this.suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.dataset.query;
                this.chatInput.value = query;
                this.sendMessage();
            });
        });
        
        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async loadAgentInformation() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/super-agent/agents`);
            const data = await response.json();
            
            if (data.success) {
                this.agents = data.agents;
                this.updateAgentDetails('super-agent');
            }
        } catch (error) {
            console.error('Failed to load agent information:', error);
            this.showError('Failed to load agent information');
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isLoading) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.autoResizeTextarea();
        
        // Show loading state
        this.setLoading(true);
        this.addTypingIndicator();

        try {
            const response = await this.callSuperAgentAPI(message);
            this.removeTypingIndicator();
            
            if (response.success) {
                this.addMessage('assistant', response.response, response);
            } else {
                this.addMessage('system', 'Sorry, I encountered an error processing your request. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addMessage('system', 'Sorry, I\'m having trouble connecting to the server. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async callSuperAgentAPI(message) {
        const requestBody = {
            query: message,
            context: {
                farm_location: document.getElementById('farm-location').textContent,
                farm_size: document.getElementById('farm-size').textContent,
                current_season: document.getElementById('current-season').textContent,
                session_id: this.sessionId
            },
            session_id: this.sessionId
        };

        const response = await fetch(`${this.apiBaseUrl}/super-agent/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    addMessage(type, content, responseData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} new`;
        
        const avatar = this.getAvatarForType(type);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let messageContent = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${time}</div>
        `;
        
        // Add agent response details if available
        if (responseData && responseData.agent_responses) {
            messageContent += this.createAgentResponseDetails(responseData);
        }
        
        messageContent += '</div>';
        messageDiv.innerHTML = messageContent;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Remove 'new' class after animation
        setTimeout(() => {
            messageDiv.classList.remove('new');
        }, 400);
    }

    getAvatarForType(type) {
        const avatars = {
            'user': '👤',
            'assistant': '🤖',
            'system': 'ℹ️'
        };
        return avatars[type] || '🤖';
    }

    formatMessage(content) {
        // Convert line breaks to HTML
        return content.replace(/\n/g, '<br>');
    }

    createAgentResponseDetails(responseData) {
        if (!responseData.agent_responses || responseData.agent_responses.length === 0) {
            return '';
        }

        let detailsHtml = '<div class="agent-response-details">';
        detailsHtml += '<h4>Agent Analysis</h4>';
        
        // Show which agents were used
        const usedAgents = responseData.agent_responses.map(r => r.agent_name);
        detailsHtml += '<div class="agent-list-details">';
        usedAgents.forEach(agent => {
            detailsHtml += `<span class="agent-tag">${agent}</span>`;
        });
        detailsHtml += '</div>';
        
        // Show recommendations if available
        if (responseData.recommendations && responseData.recommendations.length > 0) {
            detailsHtml += '<div class="recommendations">';
            detailsHtml += '<h5>Recommendations</h5><ul>';
            responseData.recommendations.forEach(rec => {
                detailsHtml += `<li>${rec}</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        // Show warnings if available
        if (responseData.warnings && responseData.warnings.length > 0) {
            detailsHtml += '<div class="warnings">';
            detailsHtml += '<h5>Warnings</h5><ul>';
            responseData.warnings.forEach(warning => {
                detailsHtml += `<li>${warning}</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        detailsHtml += '</div>';
        return detailsHtml;
    }

    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>SuperAgent is thinking</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    switchToAgent(agentName) {
        this.currentAgent = agentName;
        
        // Update UI
        this.updateCurrentAgentDisplay(agentName);
        this.updateAgentSelection(agentName);
        this.updateAgentDetails(agentName);
        
        // Add system message
        this.addMessage('system', `Switched to ${this.getAgentDisplayName(agentName)}`);
    }

    updateCurrentAgentDisplay(agentName) {
        const agentInfo = this.getAgentInfo(agentName);
        this.currentAgentName.textContent = agentInfo.name;
        this.currentAgentDescription.textContent = agentInfo.description;
    }

    updateAgentSelection(agentName) {
        // Update super agent card
        this.superAgentCard.classList.toggle('active', agentName === 'super-agent');
        
        // Update individual agent items
        this.agentItems.forEach(item => {
            item.classList.toggle('active', item.dataset.agent === agentName);
        });
    }

    updateAgentDetails(agentName) {
        const agentInfo = this.getAgentInfo(agentName);
        
        // Update panel content
        document.getElementById('panel-agent-name').textContent = agentInfo.name;
        document.getElementById('panel-agent-description').textContent = agentInfo.description;
        
        // Update capabilities
        const capabilitiesList = document.getElementById('agent-capabilities-list');
        capabilitiesList.innerHTML = '';
        agentInfo.capabilities.forEach(capability => {
            const li = document.createElement('li');
            li.textContent = capability;
            capabilitiesList.appendChild(li);
        });
        
        // Update tools
        const toolsList = document.getElementById('tools-list');
        toolsList.innerHTML = '';
        agentInfo.tools.forEach(tool => {
            const span = document.createElement('span');
            span.className = 'tool-tag';
            span.textContent = tool;
            toolsList.appendChild(span);
        });
    }

    getAgentInfo(agentName) {
        const agentDatabase = {
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
                capabilities: [
                    'Analyzes soil conditions',
                    'Considers weather patterns',
                    'Evaluates market demand',
                    'Provides crop recommendations'
                ],
                tools: ['Soil Analysis', 'Weather Data', 'Market Intelligence', 'Crop Database']
            },
            'soil_health': {
                name: 'Soil Health Agent',
                description: 'Analyzes soil conditions and provides health recommendations',
                capabilities: [
                    'Soil nutrient analysis',
                    'pH level assessment',
                    'Organic matter evaluation',
                    'Soil improvement recommendations'
                ],
                tools: ['Soil Testing', 'Nutrient Analysis', 'pH Monitoring']
            },
            'fertilizer_advisor': {
                name: 'Fertilizer Advisor Agent',
                description: 'Provides fertilizer recommendations based on soil analysis',
                capabilities: [
                    'Nutrient deficiency identification',
                    'Fertilizer dosage calculation',
                    'Application timing guidance',
                    'Organic alternatives'
                ],
                tools: ['Soil Analysis', 'Fertilizer Database', 'Dosage Calculator']
            },
            'task_scheduler': {
                name: 'Task Scheduler Agent',
                description: 'Schedules farm tasks and operations efficiently',
                capabilities: [
                    'Seasonal planning',
                    'Task prioritization',
                    'Resource allocation',
                    'Timeline optimization'
                ],
                tools: ['Calendar System', 'Task Database', 'Resource Tracker']
            },
            'irrigation_planner': {
                name: 'Irrigation Planner Agent',
                description: 'Plans irrigation schedules based on weather and crop needs',
                capabilities: [
                    'Water requirement calculation',
                    'Irrigation scheduling',
                    'Water conservation strategies',
                    'System optimization'
                ],
                tools: ['Weather Data', 'Water Calculator', 'Irrigation Systems']
            },
            'yield_predictor': {
                name: 'Yield Predictor Agent',
                description: 'Predicts crop yields based on various factors',
                capabilities: [
                    'Historical data analysis',
                    'Weather impact assessment',
                    'Yield forecasting',
                    'Risk evaluation'
                ],
                tools: ['Historical Data', 'Weather Models', 'Yield Algorithms']
            },
            'market_intelligence': {
                name: 'Market Intelligence Agent',
                description: 'Provides market insights and price trends',
                capabilities: [
                    'Price trend analysis',
                    'Market demand forecasting',
                    'Competitive analysis',
                    'Selling recommendations'
                ],
                tools: ['Market Data', 'Price APIs', 'Demand Models']
            }
        };
        
        return agentDatabase[agentName] || agentDatabase['super-agent'];
    }

    getAgentDisplayName(agentName) {
        return this.getAgentInfo(agentName).name;
    }

    toggleCategory(header) {
        const category = header.parentElement;
        category.classList.toggle('expanded');
    }

    clearChat() {
        // Keep only the welcome message
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        this.chatMessages.innerHTML = '';
        if (welcomeMessage) {
            this.chatMessages.appendChild(welcomeMessage);
        }
        
        this.addMessage('system', 'Chat cleared. How can I help you today?');
    }

    startNewSession() {
        this.sessionId = this.generateSessionId();
        this.clearChat();
        this.addMessage('system', 'New session started. Welcome back!');
    }

    closeAgentPanel() {
        this.agentDetailsPanel.classList.remove('open');
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.chatInput.disabled = loading;
        
        if (loading) {
            this.loadingOverlay.classList.add('show');
        } else {
            this.loadingOverlay.classList.remove('show');
        }
    }

    showError(message) {
        this.addMessage('system', message);
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputResize() {
        this.autoResizeTextarea();
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    initializeChat() {
        // Add initial welcome message if not present
        if (!this.chatMessages.querySelector('.welcome-message')) {
            this.addMessage('system', 'Welcome to FarmXpert SuperAgent! How can I help you with your farming needs today?');
        }
        
        // Focus on input
        this.chatInput.focus();
        
        // Set up periodic health check
        this.startHealthCheck();
    }

    async startHealthCheck() {
        // Check API health every 30 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBaseUrl}/health`);
                if (!response.ok) {
                    console.warn('API health check failed');
                }
            } catch (error) {
                console.warn('API health check error:', error);
            }
        }, 30000);
    }

    // Utility methods for better UX
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    sanitizeInput(input) {
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Export chat history
    exportChatHistory() {
        const messages = Array.from(this.chatMessages.querySelectorAll('.message')).map(msg => {
            const type = msg.classList.contains('user') ? 'user' : 
                        msg.classList.contains('assistant') ? 'assistant' : 'system';
            const content = msg.querySelector('.message-text').textContent;
            const time = msg.querySelector('.message-time').textContent;
            return { type, content, time };
        });

        const dataStr = JSON.stringify(messages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `farmxpert-chat-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Import chat history
    importChatHistory(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const messages = JSON.parse(e.target.result);
                this.clearChat();
                messages.forEach(msg => {
                    this.addMessage(msg.type, msg.content);
                });
            } catch (error) {
                this.showError('Invalid chat history file');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.superAgentChat = new SuperAgentChat();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to clear chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            window.superAgentChat.clearChat();
        }
        
        // Ctrl/Cmd + N for new session
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.superAgentChat.startNewSession();
        }
        
        // Escape to close agent panel
        if (e.key === 'Escape') {
            window.superAgentChat.closeAgentPanel();
        }
    });
    
    // Add drag and drop for chat history import
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatMessages.classList.add('drag-over');
    });
    
    chatMessages.addEventListener('dragleave', () => {
        chatMessages.classList.remove('drag-over');
    });
    
    chatMessages.addEventListener('drop', (e) => {
        e.preventDefault();
        chatMessages.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/json') {
            window.superAgentChat.importChatHistory(files[0]);
        }
    });
});

// Add CSS for drag and drop
const style = document.createElement('style');
style.textContent = `
    .drag-over {
        background-color: rgba(33, 128, 141, 0.1) !important;
        border: 2px dashed var(--color-primary) !important;
    }
`;
document.head.appendChild(style);