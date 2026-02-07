import React, { useEffect, useState } from "react";
import "../styles/Dashboard/HardwareIoT.css";

const BLYNK_TOKEN = "PBrw14c3z0O1biZJaH258X9MGpW-FnCE";
const BASE_URL = "https://blr1.blynk.cloud/external/api/get?token=" + BLYNK_TOKEN;

const SENSORS = [
  { label: "Air Temperature", pin: "V0", unit: "°C", color: "#FF6B6B" },
  { label: "Air Humidity", pin: "V1", unit: "%", color: "#4ECDC4" },
  { label: "Soil Moisture", pin: "V2", unit: "%", color: "#45B7D1" },
  { label: "Soil Temperature", pin: "V3", unit: "°C", color: "#FF9F43" },
  { label: "Soil EC", pin: "V4", unit: "µS/cm", color: "#A8D8EA" },
  { label: "Soil pH", pin: "V5", unit: "pH", color: "#AA96DA" },
  { label: "Nitrogen (N)", pin: "V6", unit: "mg/kg", color: "#FCBAD3" },
  { label: "Phosphorus (P)", pin: "V7", unit: "mg/kg", color: "#FFFFD2" },
  { label: "Potassium (K)", pin: "V8", unit: "mg/kg", color: "#837E7C" },
];

const SENSOR_RANGES = {
  V0: { min: 0, max: 50 },
  V1: { min: 0, max: 100 },
  V2: { min: 0, max: 100 },
  V3: { min: 0, max: 50 },
  V4: { min: 0, max: 5000 },
  V5: { min: 0, max: 14 },
  V6: { min: 0, max: 200 },
  V7: { min: 0, max: 200 },
  V8: { min: 0, max: 200 },
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const parseNumeric = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const formatValue = (n) => {
  if (n === null || n === undefined) return "--";
  if (!Number.isFinite(n)) return "--";
  if (Math.abs(n) >= 1000) return String(Math.round(n));
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
};

const toPercent = (pin, n) => {
  const range = SENSOR_RANGES[pin] || { min: 0, max: 100 };
  if (n === null) return 0;
  const denom = range.max - range.min || 1;
  const pct = ((n - range.min) / denom) * 100;
  return clamp(pct, 0, 100);
};

export default function HardwareIoT() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const promises = SENSORS.map(async (sensor) => {
        const response = await fetch(`${BASE_URL}&${sensor.pin}`);
        if (!response.ok) throw new Error(`Failed to fetch ${sensor.label}`);
        const value = await response.text();
        return { [sensor.pin]: value };
      });

      const results = await Promise.all(promises);
      const newData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setSensorData(newData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("Failed to fetch sensor data. Please check connection.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hardware-iot-page">
      <div className="hardware-iot-header">
        <div className="hardware-iot-header-left">
          <div className="hardware-iot-title">Live Farm Sensors</div>
          <div className="hardware-iot-subtitle">Real-time environmental and soil monitoring.</div>
        </div>
        <div className="hardware-iot-status">
          <span className={`status-indicator ${error ? "offline" : "online"}`}></span>
          {error ? "Offline" : "Live"}
        </div>
      </div>

      {loading && !Object.keys(sensorData).length ? (
        <div className="loading-state">Loading sensor data...</div>
      ) : (
        <div className="sensors-grid">
          {SENSORS.map((sensor) => (
            (() => {
              const numeric = parseNumeric(sensorData[sensor.pin]);
              const percent = toPercent(sensor.pin, numeric);
              const display = numeric === null ? "--" : formatValue(numeric);
              return (
                <div
                  key={sensor.pin}
                  className="sensor-card"
                  style={{
                    "--accent": sensor.color,
                    "--gauge": `${percent}%`,
                  }}
                >
                  <div className="sensor-card-top">
                    <div className="sensor-label">{sensor.label}</div>
                  </div>

                  <div className="sensor-gauge" aria-label={`${sensor.label} gauge`}>
                    <div className="sensor-gauge-inner">
                      <div className="sensor-gauge-value">
                        {display}
                        <span className="sensor-unit">{sensor.unit}</span>
                      </div>
                      <div className="sensor-gauge-percent">{Math.round(percent)}%</div>
                    </div>
                  </div>
                </div>
              );
            })()
          ))}
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
