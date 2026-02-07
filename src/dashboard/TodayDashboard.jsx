import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CloudRain, Mic, MessageSquare, ShieldCheck, TrendingUp } from 'lucide-react';
import { dataService } from '../services/apiService';
import '../styles/Dashboard/TodayDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TodayDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [farmData, setFarmData] = useState(null);
  const [soilData, setSoilData] = useState({
    moisture: null,
    temperature: null,
    ph: null,
    lastUpdated: null,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const dashboardData = await dataService.getDashboardData(1);
        setFarmData(dashboardData);
      } catch (e) {
        setFarmData(null);
      }
    })();
  }, []);

  const refreshSoil = async () => {
    setSoilData((p) => ({ ...p, status: 'loading', error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/agents/soil-health/iot/latest`);
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.message || `Failed to fetch IoT data (status ${res.status})`);
      }
      const payload = json?.data;
      const soil = payload?.soil_data;
      if (!payload?.success || !soil) {
        throw new Error(payload?.error || 'IoT payload missing soil_data');
      }

      setSoilData({
        moisture: typeof soil.moisture === 'number' ? soil.moisture : null,
        temperature: typeof soil.temperature === 'number' ? soil.temperature : null,
        ph: typeof soil.pH === 'number' ? soil.pH : null,
        lastUpdated: payload?.fetched_at || new Date().toISOString(),
        status: 'live',
        error: null,
      });
    } catch (e) {
      setSoilData((p) => ({
        ...p,
        status: 'offline',
        error: String(e?.message || e),
        lastUpdated: new Date().toISOString(),
      }));
    }
  };

  useEffect(() => {
    refreshSoil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowLabel = useMemo(() => new Date().toLocaleString(), []);

  const weather = farmData?.weather;

  const todayActions = useMemo(() => {
    const actions = [];

    if (weather?.condition && /rain/i.test(weather.condition)) {
      actions.push({
        tone: 'warning',
        icon: CloudRain,
        title: 'Weather risk: Rain expected',
        action: 'Avoid spraying. Check drainage in low-lying plots.',
        why: ['Higher wash-off risk for sprays', 'Waterlogging risk increases pest/disease'],
        confidence: 'Medium',
        dataUsed: ['Weather forecast'],
      });
    } else {
      actions.push({
        tone: 'good',
        icon: CloudRain,
        title: 'Weather: No major alerts',
        action: 'Follow normal irrigation schedule. Recheck forecast in evening.',
        why: ['No rain/heat alerts detected'],
        confidence: 'Medium',
        dataUsed: ['Weather snapshot'],
      });
    }

    if (typeof soilData.moisture === 'number') {
      if (soilData.moisture < 40) {
        actions.push({
          tone: 'warning',
          icon: AlertTriangle,
          title: 'Low soil moisture',
          action: 'Irrigate within 24 hours if crop is at sensitive stage.',
          why: ['Moisture below 40% can stress plants'],
          confidence: 'High',
          dataUsed: ['Soil moisture sensor'],
        });
      } else if (soilData.moisture > 80) {
        actions.push({
          tone: 'warning',
          icon: AlertTriangle,
          title: 'High soil moisture',
          action: 'Pause irrigation; monitor for fungal disease signs.',
          why: ['High moisture increases fungal risk'],
          confidence: 'High',
          dataUsed: ['Soil moisture sensor'],
        });
      } else {
        actions.push({
          tone: 'good',
          icon: AlertTriangle,
          title: 'Soil moisture is in range',
          action: 'No immediate irrigation change needed.',
          why: ['Moisture is within typical safe range'],
          confidence: 'High',
          dataUsed: ['Soil moisture sensor'],
        });
      }
    }

    actions.push({
      tone: 'info',
      icon: TrendingUp,
      title: 'Market check',
      action: 'Open Market Intelligence to compare nearby mandi prices.',
      why: ['Prices can change daily; compare before selling'],
      confidence: 'Low',
      dataUsed: ['(Connect price feed)'],
      cta: { label: 'View prices', onClick: () => navigate('/dashboard/orchestrator/market-intelligence') },
    });

    actions.push({
      tone: 'info',
      icon: ShieldCheck,
      title: 'Schemes & insurance',
      action: 'Check deadlines for crop insurance and subsidies.',
      why: ['Missing a deadline can block eligibility'],
      confidence: 'Low',
      dataUsed: ['(Connect scheme feed)'],
    });

    return actions;
  }, [navigate, soilData.moisture, weather?.condition]);

  const lastUpdatedLabel = soilData?.lastUpdated ? new Date(soilData.lastUpdated).toLocaleString() : '--';

  return (
    <div className="today-page">
      <div className="today-header">
        <div>
          <div className="today-title">Today</div>
          <div className="today-subtitle">
            {farmData?.farm?.location || 'Your farm'}
            <span className={`today-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}>{isOnline ? 'Online' : 'Offline'}</span>
            <span className="today-pill pill-muted">Updated: {lastUpdatedLabel}</span>
          </div>
        </div>

        <div className="today-actions">
          <button className="today-btn secondary" onClick={() => navigate('/dashboard/voice')}>
            <Mic size={16} />
            Voice
          </button>
          <button className="today-btn primary" onClick={() => navigate('/dashboard/orchestrator')}>
            <MessageSquare size={16} />
            Ask AI
          </button>
        </div>
      </div>

      <div className="today-grid">
        {todayActions.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`action-card ${card.tone}`}>
              <div className="action-card-top">
                <div className="action-card-icon">
                  <Icon size={18} />
                </div>
                <div className="action-card-head">
                  <div className="action-card-title">{card.title}</div>
                  <div className="action-card-action">{card.action}</div>
                </div>
              </div>

              <div className="action-card-meta">
                <div className="meta-row">
                  <span className="meta-label">Why</span>
                  <div className="meta-value">
                    {card.why?.map((w, i) => (
                      <div key={i} className="meta-bullet">{w}</div>
                    ))}
                  </div>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Confidence</span>
                  <span className="meta-chip">{card.confidence || '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Data used</span>
                  <span className="meta-muted">{(card.dataUsed || []).join(', ')}</span>
                </div>
              </div>

              <div className="action-card-footer">
                <button className="today-btn link" onClick={() => navigate('/dashboard/farm-information')}>
                  View details
                </button>
                {card.cta && (
                  <button className="today-btn secondary" onClick={card.cta.onClick}>
                    {card.cta.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="today-footnote">Generated at: {nowLabel}</div>
    </div>
  );
};

export default TodayDashboard;
