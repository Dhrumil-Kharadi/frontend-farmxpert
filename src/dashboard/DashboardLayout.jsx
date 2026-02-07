import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import AgentDetails from './AgentDetails';
// import OfflineIndicator from '../components/OfflineIndicator';
import { dataService } from '../services/apiService';
import '../styles/Dashboard/DashboardLayout.css';
import '../styles/components/OfflineIndicator.css';

const DashboardLayout = () => {
  const location = useLocation();
  const [farmData, setFarmData] = useState({
    farm_name: 'Krishna farm',
    location: 'Ahmedabad, Gujarat',
    size_acres: 15,
    weather: { temperature: 27, humidity: 85, condition: 'Partly Cloudy' }
  });
  const [sessionId] = useState('session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  // const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const dashboardData = await dataService.getDashboardData(1);
        if (dashboardData.farm) {
          setFarmData({
            farm_name: dashboardData.farm.name || 'Krishna farm',
            location: dashboardData.farm.location || 'Ahmedabad, Gujarat',
            size_acres: dashboardData.farm.size_acres || 15,
            weather: dashboardData.weather || { temperature: 27, humidity: 85, condition: 'Partly Cloudy' }
          });
        }
        // Check if we're in offline mode
        // setIsOffline(dashboardData.system?.status === 'offline');
      } catch (e) {
        // setIsOffline(true);
      }
    })();
  }, []);


  const routeToAgent = () => {
    const last = location.pathname.split('/').pop();
    switch (last) {
      case 'orchestrator':
        return 'super-agent';
      case 'crop-selector':
        return 'crop_selector';
      case 'seed-selection':
        return 'seed_selection';
      case 'soil-health':
        return 'soil_health';
      case 'fertilizer-advisor':
        return 'fertilizer_advisor';
      case 'irrigation-planner':
        return 'irrigation_planner';
      case 'pest-diagnostic':
        return 'pest_disease_diagnostic';
      case 'weather-watcher':
        return 'weather_watcher';
      case 'growth-monitor':
        return 'growth_stage_monitor';
      case 'task-scheduler':
        return 'task_scheduler';
      case 'machinery-manager':
        return 'machinery_manager';
      case 'drone-commander':
        return 'drone_commander';
      case 'layout-mapper':
        return 'layout_mapper';
      case 'yield-predictor':
        return 'yield_predictor';
      case 'profit-optimizer':
        return 'profit_optimization';
      case 'sustainability-tracker':
        return 'sustainability_tracker';
      case 'market-intelligence':
        return 'market_intelligence';
      case 'logistics-storage':
        return 'logistics_storage';
      case 'input-procurement':
        return 'input_procurement';
      case 'crop-insurance-risk':
        return 'crop_insurance_risk';
      case 'farmer-coach':
        return 'farmer_coach';
      case 'compliance-certification':
        return 'compliance_certification';
      case 'community-engagement':
        return 'community_engagement';
      default:
        return 'super-agent';
    }
  };

  const agent = routeToAgent();

  return (
    <>
      {/* <OfflineIndicator isOnline={!isOffline} /> */}
      <div className="chat-agent-container">
        <div className="chat-wrapper">
          <Routes>
            <Route path="orchestrator" element={<ChatPanel agent="super-agent" farmData={farmData} sessionId={sessionId} />} />
            <Route path="crop-selector" element={<ChatPanel agent="crop_selector" farmData={farmData} sessionId={sessionId} />} />
            <Route path="seed-selection" element={<ChatPanel agent="seed_selection" farmData={farmData} sessionId={sessionId} />} />
            <Route path="soil-health" element={<ChatPanel agent="soil_health" farmData={farmData} sessionId={sessionId} />} />
            <Route path="fertilizer-advisor" element={<ChatPanel agent="fertilizer_advisor" farmData={farmData} sessionId={sessionId} />} />
            <Route path="irrigation-planner" element={<ChatPanel agent="irrigation_planner" farmData={farmData} sessionId={sessionId} />} />
            <Route path="pest-diagnostic" element={<ChatPanel agent="pest_disease_diagnostic" farmData={farmData} sessionId={sessionId} />} />
            <Route path="weather-watcher" element={<ChatPanel agent="weather_watcher" farmData={farmData} sessionId={sessionId} />} />
            <Route path="growth-monitor" element={<ChatPanel agent="growth_stage_monitor" farmData={farmData} sessionId={sessionId} />} />
            <Route path="task-scheduler" element={<ChatPanel agent="task_scheduler" farmData={farmData} sessionId={sessionId} />} />
            <Route path="machinery-manager" element={<ChatPanel agent="machinery_manager" farmData={farmData} sessionId={sessionId} />} />
            <Route path="drone-commander" element={<ChatPanel agent="drone_commander" farmData={farmData} sessionId={sessionId} />} />
            <Route path="layout-mapper" element={<ChatPanel agent="layout_mapper" farmData={farmData} sessionId={sessionId} />} />
            <Route path="yield-predictor" element={<ChatPanel agent="yield_predictor" farmData={farmData} sessionId={sessionId} />} />
            <Route path="profit-optimizer" element={<ChatPanel agent="profit_optimization" farmData={farmData} sessionId={sessionId} />} />
            <Route path="sustainability-tracker" element={<ChatPanel agent="sustainability_tracker" farmData={farmData} sessionId={sessionId} />} />
            <Route path="market-intelligence" element={<ChatPanel agent="market_intelligence" farmData={farmData} sessionId={sessionId} />} />
            <Route path="logistics-storage" element={<ChatPanel agent="logistics_storage" farmData={farmData} sessionId={sessionId} />} />
            <Route path="input-procurement" element={<ChatPanel agent="input_procurement" farmData={farmData} sessionId={sessionId} />} />
            <Route path="crop-insurance-risk" element={<ChatPanel agent="crop_insurance_risk" farmData={farmData} sessionId={sessionId} />} />
            <Route path="farmer-coach" element={<ChatPanel agent="farmer_coach" farmData={farmData} sessionId={sessionId} />} />
            <Route path="compliance-certification" element={<ChatPanel agent="compliance_certification" farmData={farmData} sessionId={sessionId} />} />
            <Route path="community-engagement" element={<ChatPanel agent="community_engagement" farmData={farmData} sessionId={sessionId} />} />
            <Route path="" element={<ChatPanel agent="super-agent" farmData={farmData} sessionId={sessionId} />} />
            <Route path="*" element={<Navigate to="/dashboard/orchestrator" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;


