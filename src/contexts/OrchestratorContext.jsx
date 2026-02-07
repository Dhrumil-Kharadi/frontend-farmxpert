import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SESSION: 'SET_SESSION',
    SET_WORKFLOW: 'SET_WORKFLOW',
    UPDATE_AGENT_STATUS: 'UPDATE_AGENT_STATUS',
    ADD_MESSAGE: 'ADD_MESSAGE',
    SET_REASONING_TREE: 'SET_REASONING_TREE',
    CLEAR_WORKFLOW: 'CLEAR_WORKFLOW',
    SET_SYSTEM_STATUS: 'SET_SYSTEM_STATUS',
};

// Initial state
const initialState = {
    loading: false,
    error: null,
    session: null,
    currentWorkflow: null,
    agentStatuses: {},
    messages: [],
    reasoningTree: null,
    systemStatus: null,
};

// Reducer function
function orchestratorReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        
        case ACTIONS.SET_SESSION:
            return { ...state, session: action.payload };
        
        case ACTIONS.SET_WORKFLOW:
            return { 
                ...state, 
                currentWorkflow: action.payload,
                loading: false,
                error: null 
            };
        
        case ACTIONS.UPDATE_AGENT_STATUS:
            return {
                ...state,
                agentStatuses: {
                    ...state.agentStatuses,
                    [action.payload.agentName]: action.payload.status
                }
            };
        
        case ACTIONS.ADD_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };
        
        case ACTIONS.SET_REASONING_TREE:
            return { ...state, reasoningTree: action.payload };
        
        case ACTIONS.CLEAR_WORKFLOW:
            return {
                ...state,
                currentWorkflow: null,
                agentStatuses: {},
                reasoningTree: null,
                error: null
            };
        
        case ACTIONS.SET_SYSTEM_STATUS:
            return { ...state, systemStatus: action.payload };
        
        default:
            return state;
    }
}

// Create context
const OrchestratorContext = createContext();

// Provider component
export function OrchestratorProvider({ children }) {
    const [state, dispatch] = useReducer(orchestratorReducer, initialState);

    // Initialize system status on mount
    useEffect(() => {
        initializeSystem();
    }, []);

    const initializeSystem = async () => {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const status = await apiService.getSystemStatus();
            dispatch({ type: ACTIONS.SET_SYSTEM_STATUS, payload: status });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    const processQuery = async (query, sessionId = null) => {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: ACTIONS.SET_ERROR, payload: null });

            // Add user message
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: {
                    id: Date.now(),
                    type: 'user',
                    content: query,
                    timestamp: new Date().toISOString()
                }
            });

            const response = await apiService.processQuery(query, sessionId);
            
            // Set workflow
            dispatch({ type: ACTIONS.SET_WORKFLOW, payload: response.workflow });
            
            // Set session if provided
            if (response.session) {
                dispatch({ type: ACTIONS.SET_SESSION, payload: response.session });
            }

            // Add system response
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: {
                    id: Date.now() + 1,
                    type: 'system',
                    content: response.response,
                    timestamp: new Date().toISOString(),
                    workflowId: response.workflow?.id
                }
            });

            return response;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const getWorkflowStatus = async (workflowId) => {
        try {
            const status = await apiService.getWorkflowStatus(workflowId);
            
            // Update agent statuses
            if (status.agents) {
                Object.entries(status.agents).forEach(([agentName, agentStatus]) => {
                    dispatch({
                        type: ACTIONS.UPDATE_AGENT_STATUS,
                        payload: { agentName, status: agentStatus }
                    });
                });
            }

            // Update workflow status
            if (status.workflow) {
                dispatch({ type: ACTIONS.SET_WORKFLOW, payload: status.workflow });
            }

            return status;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const getReasoningTree = async (workflowId) => {
        try {
            const reasoningTree = await apiService.getReasoningTree(workflowId);
            dispatch({ type: ACTIONS.SET_REASONING_TREE, payload: reasoningTree });
            return reasoningTree;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const submitVoiceInput = async (audioBlob, sessionId = null) => {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const response = await apiService.submitVoiceInput(audioBlob, sessionId);
            
            // Process the voice input response
            if (response.query) {
                await processQuery(response.query, sessionId);
            }
            
            return response;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const getVoiceOutput = async (text, language = 'en') => {
        try {
            return await apiService.getVoiceOutput(text, language);
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const updateSession = async (preferences) => {
        try {
            if (!state.session?.id) {
                throw new Error('No active session');
            }
            
            const updatedSession = await apiService.updateSession(state.session.id, preferences);
            dispatch({ type: ACTIONS.SET_SESSION, payload: updatedSession });
            return updatedSession;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const cancelWorkflow = async (workflowId) => {
        try {
            await apiService.cancelWorkflow(workflowId);
            dispatch({ type: ACTIONS.CLEAR_WORKFLOW });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    const clearError = () => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    };

    const clearWorkflow = () => {
        dispatch({ type: ACTIONS.CLEAR_WORKFLOW });
    };

    const value = {
        ...state,
        processQuery,
        getWorkflowStatus,
        getReasoningTree,
        submitVoiceInput,
        getVoiceOutput,
        updateSession,
        cancelWorkflow,
        clearError,
        clearWorkflow,
        initializeSystem,
    };

    return (
        <OrchestratorContext.Provider value={value}>
            {children}
        </OrchestratorContext.Provider>
    );
}

// Custom hook to use the orchestrator context
export function useOrchestrator() {
    const context = useContext(OrchestratorContext);
    if (!context) {
        throw new Error('useOrchestrator must be used within an OrchestratorProvider');
    }
    return context;
}
