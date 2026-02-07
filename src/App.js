import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import LandingPage from './LandingPage/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import MainDashboard from './dashboard/MainDashboard';

import LoadingSpinner from './components/LoadingSpinner';
import OfflineIndicator from './components/OfflineIndicator';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AgentProvider } from './contexts/AgentContext';
import { ChatProvider } from './contexts/ChatContext';

// Styles

// Auth Container Component
const AuthContainer = ({ children }) => (
  <div className="auth-container">
    {children}
  </div>
);

// Auth Card Component  
const AuthCard = ({ children }) => (
  <div className="auth-card">
    {children}
  </div>
);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AuthContainer>
        <LoadingSpinner />
      </AuthContainer>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Main App Component
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AuthContainer>
        <LoadingSpinner />
      </AuthContainer>
    );
  }

  if (!user) {
    return (
      <AuthContainer>
        <AuthCard>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthCard>
      </AuthContainer>
    );
  }

  return <Navigate to="/dashboard" replace />;
};

// Root App Component
function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <AgentProvider>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <MainDashboard />
              </PrivateRoute>
            } />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </ChatProvider>
      </AgentProvider>
    </AuthProvider>
  );
}

export default App;