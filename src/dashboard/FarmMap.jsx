import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/Dashboard/FarmMap.css";

// Leaflet is loaded from CDN in index.html
const L = window.L;

export default function FarmMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const drawControlRef = useRef(null);

  const [farmPolygon, setFarmPolygon] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [status, setStatus] = useState({ text: "No area selected", area: "Not calculated" });
  const [buttonsEnabled, setButtonsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    soil_type: "black",
    water_source: "borewell",
    season: "kharif",
    land_area: "5.2",
    crop_preferences: "cotton,soybean"
  });

  // Calculate polygon area (approximate using bounding box)
  const calculateArea = useCallback((geojson) => {
    if (!geojson || !geojson.coordinates || geojson.coordinates.length === 0) {
      return 0;
    }

    const coords = geojson.coordinates[0];
    let minLat = coords[0][1], maxLat = coords[0][1];
    let minLng = coords[0][0], maxLng = coords[0][0];

    coords.forEach(coord => {
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
    });

    // Rough conversion: 1 degree latitude ≈ 69 miles
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const avgLat = (minLat + maxLat) / 2;
    const latMiles = latDiff * 69;
    const lngMiles = lngDiff * 69 * Math.cos(avgLat * Math.PI / 180);
    const areaSqMiles = latMiles * lngMiles;
    const areaAcres = areaSqMiles * 640; // 1 square mile = 640 acres

    return areaAcres.toFixed(2);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView([23.0225, 72.5714], 13); // Gujarat, India

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Create feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    mapInstanceRef.current = map;
    drawnItemsRef.current = drawnItems;

    // Handle polygon creation
    map.on("draw:created", (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      const polygon = e.layer.toGeoJSON();
      setFarmPolygon(polygon);

      const calculatedArea = calculateArea(polygon.geometry);
      setStatus({ text: "Area selected successfully", area: `${calculatedArea} acres` });
      setActiveStep(3);
      setFormData(prev => ({ ...prev, land_area: calculatedArea }));
      setButtonsEnabled(true);
      setDrawingEnabled(false);

      // Remove draw control
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }

      // Scroll to form
      setTimeout(() => {
        document.querySelector(".farm-map-form-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    // Load saved data
    const savedData = localStorage.getItem("savedFarmData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setFormData({
          soil_type: data.soil_type || "black",
          water_source: data.water_source?.[0] || "borewell",
          season: data.season || "kharif",
          land_area: data.land_area_acres?.toString() || "5.2",
          crop_preferences: data.crop_preferences?.join(", ") || "cotton,soybean"
        });

        if (data.polygon?.coordinates) {
          const restoredPolygon = { type: "Feature", geometry: data.polygon };
          setFarmPolygon(restoredPolygon);

          const layer = L.geoJSON(restoredPolygon);
          drawnItems.addLayer(layer);

          setStatus({ text: "Loaded saved area", area: `${data.land_area_acres} acres` });
          setActiveStep(3);
          setButtonsEnabled(true);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [calculateArea]);

  // Enable drawing
  const enableDrawing = () => {
    if (!mapInstanceRef.current || !L) return;

    if (drawingEnabled) {
      // Disable drawing
      if (drawControlRef.current) {
        mapInstanceRef.current.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      setDrawingEnabled(false);
      setActiveStep(1);
      return;
    }

    setDrawingEnabled(true);
    setActiveStep(2);

    // Add draw control
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItemsRef.current },
      draw: {
        polygon: true,
        rectangle: false,
        circle: false,
        polyline: false,
        marker: false,
        circlemarker: false
      }
    });
    mapInstanceRef.current.addControl(drawControl);
    drawControlRef.current = drawControl;
  };

  // Clear drawing
  const clearDrawing = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    setFarmPolygon(null);
    setStatus({ text: "No area selected", area: "Not calculated" });
    setActiveStep(1);
    setButtonsEnabled(false);

    if (drawControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }
    setDrawingEnabled(false);
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save farm data
  const saveFarmData = () => {
    if (!farmPolygon) {
      alert("Please select a farm area first");
      return;
    }

    setSaving(true);
    const cropPreferences = formData.crop_preferences
      .split(",")
      .map(crop => crop.trim())
      .filter(crop => crop);

    const farmData = {
      farm_location: { lat: 23.0225, lon: 72.5714 },
      land_area_acres: parseFloat(formData.land_area),
      soil_type: formData.soil_type,
      water_source: [formData.water_source],
      crop_preferences: cropPreferences,
      season: formData.season,
      polygon: farmPolygon.geometry,
      saved_at: new Date().toISOString()
    };

    localStorage.setItem("savedFarmData", JSON.stringify(farmData));
    setStatus({ text: "✅ Farm data saved successfully!", area: `${farmData.land_area_acres} acres` });
    setActiveStep(4);

    setTimeout(() => {
      setStatus({ text: "Area selected", area: `${farmData.land_area_acres} acres` });
      setSaving(false);
    }, 2000);
  };

  // Analyze farm
  const analyzeFarm = () => {
    if (!farmPolygon) {
      alert("Please select a farm area first");
      return;
    }

    setAnalyzing(true);
    const cropPreferences = formData.crop_preferences
      .split(",")
      .map(crop => crop.trim())
      .filter(crop => crop);

    const farmData = {
      farm_location: { lat: 23.0225, lon: 72.5714 },
      land_area_acres: parseFloat(formData.land_area),
      soil_type: formData.soil_type,
      water_source: [formData.water_source],
      crop_preferences: cropPreferences,
      season: formData.season,
      polygon: farmPolygon.geometry,
      analyzed_at: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem("savedFarmData", JSON.stringify(farmData));
    localStorage.setItem("farmResult", JSON.stringify({
      ...farmData,
      plots: generateMockPlots(farmData),
      confidence_score: 0.85,
      warnings: cropPreferences.length === 0 ? ["No crop preferences specified"] : []
    }));

    setStatus({ text: "✅ Analysis complete! Data saved.", area: `${farmData.land_area_acres} acres` });
    setActiveStep(4);

    setTimeout(() => {
      setAnalyzing(false);
    }, 1500);
  };

  // Generate mock plots for demonstration
  const generateMockPlots = (farmData) => {
    const crops = farmData.crop_preferences.length > 0 ? farmData.crop_preferences : ["general_crop"];
    const plotArea = (farmData.land_area_acres / crops.length).toFixed(2);

    return crops.map((crop, idx) => ({
      plot_id: `P${idx + 1}`,
      area_acres: parseFloat(plotArea),
      recommended_crop: crop,
      reason: `${farmData.soil_type} soil + ${farmData.water_source[0]} water`
    }));
  };

  return (
    <div className="farm-map-container">
      <h2 className="farm-map-header">🌾 Farm Layout Designer</h2>

      {/* Info Panel */}
      <div className="farm-map-info-panel">
        <h4 className="farm-map-info-title">📋 Quick Start Guide</h4>

        <div className={`farm-map-workflow-step ${activeStep === 1 ? "step-active" : activeStep > 1 ? "step-completed" : "step-inactive"}`}>
          <div className="step-number">1</div>
          <div>Click "Select Area" to enable drawing</div>
        </div>

        <div className={`farm-map-workflow-step ${activeStep === 2 ? "step-active" : activeStep > 2 ? "step-completed" : "step-inactive"}`}>
          <div className="step-number">2</div>
          <div>Draw your farm boundary on the map</div>
        </div>

        <div className={`farm-map-workflow-step ${activeStep === 3 ? "step-active" : activeStep > 3 ? "step-completed" : "step-inactive"}`}>
          <div className="step-number">3</div>
          <div>Fill in farm details below</div>
        </div>

        <div className={`farm-map-workflow-step ${activeStep === 4 ? "step-active" : activeStep > 4 ? "step-completed" : "step-inactive"}`}>
          <div className="step-number">4</div>
          <div>Save your work or Analyze directly</div>
        </div>

        <div className={`farm-map-drawing-indicator ${drawingEnabled ? "drawing-active" : "drawing-inactive"}`}>
          {drawingEnabled ? "✏️ Drawing Mode: Active - Draw your farm boundary" : "🎯 Drawing Mode: Inactive"}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="farm-map-leaflet"></div>

      {/* Controls */}
      <div className="farm-map-controls">
        <div className="farm-map-button-group">
          <button
            className={`farm-map-btn ${drawingEnabled ? "btn-warning" : "btn-primary"}`}
            onClick={enableDrawing}
          >
            {drawingEnabled ? "⏹️ Stop Drawing" : "📍 Select Area"}
          </button>
          <button
            className="farm-map-btn btn-danger"
            onClick={clearDrawing}
            disabled={!buttonsEnabled}
          >
            🗑️ Clear Drawing
          </button>
        </div>

        {/* Status Panel */}
        <div className={`farm-map-status-panel ${status.text.includes("✅") ? "status-success" : ""}`}>
          <h4 className="status-title">📊 Current Status</h4>
          <div className="status-content">
            <div><strong>Status:</strong> {status.text}</div>
            <div><strong>Area:</strong> {status.area}</div>
          </div>
        </div>

        {/* Form Section */}
        <div className="farm-map-form-section">
          <h4 className="form-title">🌱 Farm Details</h4>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="soil_type">🏔️ Soil Type</label>
              <select
                id="soil_type"
                value={formData.soil_type}
                onChange={(e) => handleFormChange("soil_type", e.target.value)}
              >
                <option value="black">Black Soil</option>
                <option value="red">Red Soil</option>
                <option value="alluvial">Alluvial Soil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="water_source">💧 Water Source</label>
              <select
                id="water_source"
                value={formData.water_source}
                onChange={(e) => handleFormChange("water_source", e.target.value)}
              >
                <option value="borewell">Borewell</option>
                <option value="canal">Canal</option>
                <option value="rain">Rain-fed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="season">🌤️ Season</label>
              <select
                id="season"
                value={formData.season}
                onChange={(e) => handleFormChange("season", e.target.value)}
              >
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="zaid">Zaid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="land_area">📏 Land Area (acres)</label>
              <input
                type="number"
                id="land_area"
                value={formData.land_area}
                onChange={(e) => handleFormChange("land_area", e.target.value)}
                step="0.1"
                min="0.1"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="crop_preferences">🌾 Crop Preferences (comma-separated)</label>
            <input
              type="text"
              id="crop_preferences"
              value={formData.crop_preferences}
              onChange={(e) => handleFormChange("crop_preferences", e.target.value)}
              placeholder="e.g., cotton,soybean,wheat"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="farm-map-actions">
          <h4 className="actions-title">🚀 Next Steps</h4>
          <div className="farm-map-button-group">
            <button
              className="farm-map-btn btn-success"
              onClick={saveFarmData}
              disabled={!buttonsEnabled || saving}
            >
              {saving ? "💾 Saving..." : "💾 Save Farm Data"}
            </button>
            <button
              className="farm-map-btn btn-warning"
              onClick={analyzeFarm}
              disabled={!buttonsEnabled || analyzing}
            >
              {analyzing ? "🔄 Analyzing..." : "🔬 Analyze & Auto-Save"}
            </button>
          </div>
          <p className="actions-tip">
            💡 <strong>Tip:</strong> Save your work to continue later, or analyze directly to auto-save and get AI recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
