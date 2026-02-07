import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import TodayDashboard from './TodayDashboard';
import FarmInformation from './FarmInformation';
import Profile from './Profile';
import Sidebar from './Sidebar';
import Ai from "./DashboardLayout"
import FarmMap from "./FarmMap";
import HandsFreeVoice from "./HandsFreeVoice";
import AgentCatalog from "./AgentCatalog";
import HardwareIoT from "./HardwareIoT";
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard/MainDashboard.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Logout clicked');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  return (
    <div className="main-dashboard-layout">
      <Sidebar isOpen={true} onLogout={handleLogout} />
      <div className="main-dashboard-content">
        <Routes>
          <Route path="/today" element={<TodayDashboard />} />
          <Route path="/farm-information" element={<FarmInformation />} />
          <Route path="/farm-map" element={<FarmMap />} />
          <Route path="/voice" element={<HandsFreeVoice />} />
          <Route path="/agents" element={<AgentCatalog />} />
          <Route path="/hardware-iot" element={<HardwareIoT />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orchestrator/*" element={<Ai />} />
          <Route path="/" element={<Navigate to="/dashboard/today" replace />} />
          <Route path="*" element={<Navigate to="/dashboard/today" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainDashboard;
