import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Droplets, ThermometerSun, FlaskRoundIcon as Flask, Info, RefreshCw, Calendar, Sprout } from "lucide-react"
import MoistureSVGChart from "./Graph/moisture"
import TemperatureSVGChart from "./Graph/tempature"
import PhSVGChart from "./Graph/ph"
import AllSVGChart from "./Graph/all"
import SoilGauge from "./Graph/soil-gauge"
import "../styles/Dashboard/FarmInfoDashboard/farminformation.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"

const initialSoilData = {
  moisture: 0,
  temperature: 0,
  ph: 0,
  lastUpdated: new Date().toISOString(),
  iot: {
    status: "loading",
    error: null,
    source: null,
  },
}

// Responsive chart container component
function ResponsiveChartContainer({ selectedChart }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = 300
        setDimensions({ width, height })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <div ref={containerRef} style={{ width: "100%", height: dimensions.height }}>
      {selectedChart === "moisture" && <MoistureSVGChart width={dimensions.width} height={dimensions.height} />}
      {selectedChart === "temperature" && <TemperatureSVGChart width={dimensions.width} height={dimensions.height} />}
      {selectedChart === "ph" && <PhSVGChart width={dimensions.width} height={dimensions.height} />}
      {selectedChart === "all" && <AllSVGChart width={dimensions.width} height={dimensions.height} />}
    </div>
  )
}

export default function FarmerDashboard() {
  const [soilData, setSoilData] = useState(initialSoilData)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChart, setSelectedChart] = useState("moisture")

  const isNum = (v) => typeof v === "number" && Number.isFinite(v)
  const fmt1 = (v) => (isNum(v) ? v.toFixed(1) : "--")

  const fetchLatestSoilData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/agents/soil-health/iot/latest`)
    const json = await response.json()

    if (!response.ok || json?.error) {
      const msg = json?.message || `Failed to fetch IoT data (status ${response.status})`
      throw new Error(msg)
    }

    const payload = json?.data
    const soil = payload?.soil_data
    if (!payload?.success || !soil) {
      throw new Error(payload?.error || "IoT payload missing soil_data")
    }

    const moisture = typeof soil.moisture === "number" ? soil.moisture : null
    const temperature = typeof soil.temperature === "number" ? soil.temperature : null
    const ph = typeof soil.pH === "number" ? soil.pH : null

    return {
      moisture,
      temperature,
      ph,
      fetchedAt: payload?.fetched_at || new Date().toISOString(),
      source: payload?.source || "IoT",
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const latest = await fetchLatestSoilData()

      setSoilData((prev) => ({
        ...prev,
        moisture: latest.moisture !== null ? latest.moisture : prev.moisture,
        temperature: latest.temperature !== null ? latest.temperature : prev.temperature,
        ph: latest.ph !== null ? latest.ph : prev.ph,
        lastUpdated: latest.fetchedAt,
        iot: {
          status: "live",
          error: null,
          source: latest.source,
        },
      }))
    } catch (e) {
      setSoilData((prev) => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        iot: {
          status: "offline",
          error: String(e?.message || e),
          source: null,
        },
      }))
    }
    setIsLoading(false)
  }

  // Get suggestions based on soil data
  const getSuggestions = () => {
    const suggestions = []

    if (isNum(soilData.moisture) && soilData.moisture < 40) {
      suggestions.push({
        type: "warning",
        title: "Low Soil Moisture",
        description: "Your soil is too dry. Consider watering your crops soon.",
        icon: Droplets,
      })
    } else if (isNum(soilData.moisture) && soilData.moisture > 80) {
      suggestions.push({
        type: "warning",
        title: "High Soil Moisture",
        description: "Your soil is too wet. Avoid watering until moisture levels decrease.",
        icon: Droplets,
      })
    }

    if (isNum(soilData.temperature) && soilData.temperature < 18) {
      suggestions.push({
        type: "warning",
        title: "Low Soil Temperature",
        description: "Soil temperature is low. Consider using mulch to increase soil temperature.",
        icon: ThermometerSun,
      })
    } else if (isNum(soilData.temperature) && soilData.temperature > 28) {
      suggestions.push({
        type: "warning",
        title: "High Soil Temperature",
        description: "Soil temperature is high. Consider providing shade or irrigation.",
        icon: ThermometerSun,
      })
    }

    if (isNum(soilData.ph) && soilData.ph < 5.5) {
      suggestions.push({
        type: "warning",
        title: "Low Soil pH",
        description: "Your soil is too acidic. Consider adding lime to raise pH.",
        icon: Flask,
      })
    } else if (isNum(soilData.ph) && soilData.ph > 7.5) {
      suggestions.push({
        type: "warning",
        title: "High Soil pH",
        description: "Your soil is too alkaline. Consider adding sulfur to lower pH.",
        icon: Flask,
      })
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: "info",
        title: "Optimal Soil Conditions",
        description: "Your soil conditions are currently optimal for most crops.",
        icon: Info,
      })
    }

    suggestions.push({
      type: "info",
      title: "Scheduled Maintenance",
      description: "Remember to check your irrigation system weekly.",
      icon: Calendar,
    })

    suggestions.push({
      type: "info",
      title: "Crop Rotation",
      description: "Consider rotating crops next season to maintain soil health.",
      icon: Sprout,
    })

    return suggestions
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const [clientLastUpdated, setClientLastUpdated] = useState("")

  useEffect(() => {
    setClientLastUpdated(formatDate(soilData.lastUpdated))
  }, [soilData.lastUpdated])

  const getStatusColor = (value, type) => {
    if (type === "moisture") {
      if (value < 40 || value > 80) return "status-warning-farminformation"
      return "status-optimal-farminformation"
    } else if (type === "temperature") {
      if (value < 18 || value > 28) return "status-warning-farminformation"
      return "status-optimal-farminformation"
    } else if (type === "ph") {
      if (value < 5.5 || value > 7.5) return "status-warning-farminformation"
      return "status-optimal-farminformation"
    }
    return "status-optimal-farminformation"
  }

  useEffect(() => {
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const suggestions = getSuggestions()

  return (
    <div className="dashboard-container-farminformation">
      <div className="container-farminformation">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="dashboard-header-farminformation">
              <h1 className="dashboard-title-farminformation">Farmer Dashboard</h1>
              <p className="dashboard-subtitle-farminformation">Monitor your soil conditions and get personalized recommendations.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={refreshData} disabled={isLoading} className="btn-farminformation btn-primary-farminformation">
                <RefreshCw
                  className={isLoading ? "animate-rotate-farminformation" : ""}
                  style={{ marginRight: "8px", width: "16px", height: "16px" }}
                />
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          <div className="stats-grid-farminformation">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="stat-card-farminformation">
                <div className="stat-header-farminformation">
                  <div className="stat-title-farminformation">Soil Moisture</div>
                  <Droplets className="stat-icon-farminformation" />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-value-farminformation">{fmt1(soilData.moisture)}%</div>
                    <div
                      className={`stat-status-farminformation ${
                        isNum(soilData.moisture)
                          ? getStatusColor(soilData.moisture, "moisture")
                          : "status-warning-farminformation"
                      }`}
                    >
                      {isNum(soilData.moisture)
                        ? soilData.moisture < 40
                          ? "Low"
                          : soilData.moisture > 80
                            ? "High"
                            : "Optimal"
                        : soilData?.iot?.status === "offline"
                          ? "Offline"
                          : "--"}
                    </div>
                  </div>
                  <SoilGauge value={isNum(soilData.moisture) ? soilData.moisture : 0} type="moisture" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="stat-card-farminformation">
                <div className="stat-header-farminformation">
                  <div className="stat-title-farminformation">Soil Temperature</div>
                  <ThermometerSun className="stat-icon-farminformation" />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-value-farminformation">{fmt1(soilData.temperature)}°C</div>
                    <div
                      className={`stat-status-farminformation ${
                        isNum(soilData.temperature)
                          ? getStatusColor(soilData.temperature, "temperature")
                          : "status-warning-farminformation"
                      }`}
                    >
                      {isNum(soilData.temperature)
                        ? soilData.temperature < 18
                          ? "Low"
                          : soilData.temperature > 28
                            ? "High"
                            : "Optimal"
                        : soilData?.iot?.status === "offline"
                          ? "Offline"
                          : "--"}
                    </div>
                  </div>
                  <SoilGauge value={isNum(soilData.temperature) ? soilData.temperature : 0} type="temperature" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="stat-card-farminformation">
                <div className="stat-header-farminformation">
                  <div className="stat-title-farminformation">Soil pH</div>
                  <Flask className="stat-icon-farminformation" />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-value-farminformation">{fmt1(soilData.ph)} pH</div>
                    <div
                      className={`stat-status-farminformation ${
                        isNum(soilData.ph) ? getStatusColor(soilData.ph, "ph") : "status-warning-farminformation"
                      }`}
                    >
                      {isNum(soilData.ph)
                        ? soilData.ph < 5.5
                          ? "Acidic"
                          : soilData.ph > 7.5
                            ? "Alkaline"
                            : "Optimal"
                        : soilData?.iot?.status === "offline"
                          ? "Offline"
                          : "--"}
                    </div>
                  </div>
                  <SoilGauge value={isNum(soilData.ph) ? soilData.ph : 0} type="ph" />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="chart-container-farminformation">
              <div className="chart-header-farminformation">
                <div className="chart-title-farminformation">Soil Data History</div>
                <div className="chart-description-farminformation">Last updated: {clientLastUpdated}</div>
              </div>
              <div className="chart-buttons-farminformation">
                <button
                  className={`chart-button-farminformation ${selectedChart === "moisture" ? "active-farminformation" : ""}`}
                  onClick={() => setSelectedChart("moisture")}
                >
                  Moisture Graph
                </button>
                <button
                  className={`chart-button-farminformation ${selectedChart === "temperature" ? "active-farminformation" : ""}`}
                  onClick={() => setSelectedChart("temperature")}
                >
                  Temperature Graph
                </button>
                <button
                  className={`chart-button-farminformation ${selectedChart === "ph" ? "active-farminformation" : ""}`}
                  onClick={() => setSelectedChart("ph")}
                >
                  pH Graph
                </button>
                <button
                  className={`chart-button-farminformation ${selectedChart === "all" ? "active-farminformation" : ""}`}
                  onClick={() => setSelectedChart("all")}
                >
                  All
                </button>
              </div>
              <ResponsiveChartContainer selectedChart={selectedChart} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="chart-container-farminformation">
              <div className="chart-header-farminformation">
                <div className="chart-title-farminformation">Recommendations & Alerts</div>
                <div className="chart-description-farminformation">Based on your current soil conditions</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className={`alert-farminformation alert-${suggestion.type}-farminformation`}>
                      <suggestion.icon style={{ width: "16px", height: "16px" }} />
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>{suggestion.title}</div>
                        <div>{suggestion.description}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}