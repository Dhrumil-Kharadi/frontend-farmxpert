/**
 * API Service for FarmXpert Orchestrator
 * Handles all backend communication for the orchestrator components
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Generic API request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                ...this.defaultHeaders,
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Health check endpoint
     */
    async healthCheck() {
        return this.request('/api/health');
    }

    /**
     * Process farmer query through orchestrator
     */
    async processQuery(query, sessionId = null) {
        const payload = {
            query,
            session_id: sessionId,
        };

        return this.request('/api/orchestrator/process', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Get workflow status
     */
    async getWorkflowStatus(workflowId) {
        return this.request(`/api/orchestrator/workflow/${workflowId}/status`);
    }

    /**
     * Get session data
     */
    async getSession(sessionId) {
        return this.request(`/api/orchestrator/session/${sessionId}`);
    }

    /**
     * Update session preferences
     */
    async updateSession(sessionId, preferences) {
        return this.request(`/api/orchestrator/session/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(preferences),
        });
    }

    /**
     * Get agent status for a specific workflow
     */
    async getAgentStatus(workflowId, agentName) {
        return this.request(`/api/orchestrator/workflow/${workflowId}/agent/${agentName}/status`);
    }

    /**
     * Get reasoning tree for a workflow
     */
    async getReasoningTree(workflowId) {
        return this.request(`/api/orchestrator/workflow/${workflowId}/reasoning`);
    }

    /**
     * Submit voice input
     */
    async submitVoiceInput(audioBlob, sessionId = null) {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        if (sessionId) {
            formData.append('session_id', sessionId);
        }

        return this.request('/api/orchestrator/voice/process', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    /**
     * Get voice output (text-to-speech)
     */
    async getVoiceOutput(text, language = 'en') {
        return this.request('/api/orchestrator/voice/synthesize', {
            method: 'POST',
            body: JSON.stringify({ text, language }),
        });
    }

    /**
     * Get workflow history for a session
     */
    async getWorkflowHistory(sessionId) {
        return this.request(`/api/orchestrator/session/${sessionId}/workflows`);
    }

    /**
     * Cancel ongoing workflow
     */
    async cancelWorkflow(workflowId) {
        return this.request(`/api/orchestrator/workflow/${workflowId}/cancel`, {
            method: 'POST',
        });
    }

    /**
     * Get system status and available agents
     */
    async getSystemStatus() {
        return this.request('/api/orchestrator/status');
    }
}

// Create singleton instance
const apiService = new ApiService();

export const api = {
    auth: {
        getSession: async () => {
            try {
                return await apiService.request('/api/auth/session');
            } catch (e) {
                return null;
            }
        },
    },
    hardware: {
        getDevices: async () => {
            try {
                const res = await apiService.request('/api/hardware/devices');
                return Array.isArray(res) ? res : (res?.devices || []);
            } catch (e) {
                return [];
            }
        },
    },
    fields: {
        getFields: async () => {
            try {
                const res = await apiService.request('/api/fields');
                return Array.isArray(res) ? res : (res?.fields || []);
            } catch (e) {
                return [];
            }
        },
    },
    logs: {
        addLog: async (payload) => {
            try {
                return await apiService.request('/api/logs', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } catch (e) {
                return null;
            }
        },
    },
};

export default apiService;
