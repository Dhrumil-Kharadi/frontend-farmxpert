import { useMemo, useEffect, useState } from "react"

export default function SoilGauge({ value, type }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage?.getItem('theme')
    if (stored) return stored
    return document.documentElement.getAttribute('data-theme') || 'dark'
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    const updateTheme = () => {
      const attr = document.documentElement.getAttribute('data-theme')
      const stored = window.localStorage?.getItem('theme')
      setTheme(stored || attr || 'dark')
    }
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('storage', updateTheme)
    // Sync immediately on mount in case Sidebar hasn't set attribute yet
    updateTheme()
    return () => {
      observer.disconnect()
      window.removeEventListener('storage', updateTheme)
    }
  }, [])
  const { color, unit, min, max, displayValue } = useMemo(() => {
    switch (type) {
      case "moisture":
        return {
          color: value < 40 ? "#f59e0b" : value > 80 ? "#ef4444" : "#22c55e",
          label: "Moisture",
          unit: "%",
          min: 0,
          max: 100,
          displayValue: value,
        }
      case "temperature":
        return {
          color: value < 18 ? "#3b82f6" : value > 28 ? "#ef4444" : "#22c55e",
          label: "Temperature",
          unit: "°C",
          min: 0,
          max: 50,
          displayValue: value,
        }
      case "ph":
        return {
          color: value < 5.5 ? "#ef4444" : value > 7.5 ? "#f59e0b" : "#22c55e",
          label: "pH",
          unit: "",
          min: 0,
          max: 14,
          displayValue: value,
        }
      default:
        return {
          color: "#22c55e",
          label: "Value",
          unit: "",
          min: 0,
          max: 100,
          displayValue: value,
        }
    }
  }, [value, type])

  const percentage = Math.max(0, Math.min(100, ((displayValue - min) / (max - min)) * 100))
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const trackColor = useMemo(() => (theme === 'dark' ? '#3a3a3a' : '#c7c9cc'), [theme])

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle cx="60" cy="60" r="45" stroke={trackColor} strokeWidth="8" fill="transparent" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: color }}>
            {type === "ph" ? displayValue.toFixed(1) : displayValue.toFixed(0)}
            {unit}
          </div>
        </div>
      </div>
    </div>
  )
}