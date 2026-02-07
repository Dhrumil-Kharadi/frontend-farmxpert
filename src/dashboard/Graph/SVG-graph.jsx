import React, { useState, useEffect, useRef, useCallback } from "react"

const padding = 50

export default function SVGChart({
  data,
  datasets,
  useIndependentYAxis = false,
  showPoints = true,
  hoverRadius = 15,
  width = 600,
  height = 300,
  lineColor = "#2563eb",
  label = "",
  yAxisMin,
  yAxisMax,
  backgroundColor = "#14141400",
  tooltipLabel,
  tooltipValueColor,
}) {
  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    time: "",
    value: 0,
    values: null,
    visible: false,
  })
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const svgRef = useRef(null)
  const animationRef = useRef(null)
  const observerRef = useRef(null)

  const isMultiDataset = Array.isArray(datasets) && datasets.length > 0
  const primaryData = isMultiDataset ? datasets[0].data : data

  // Calculate chart points
  const allValues = isMultiDataset
    ? datasets.flatMap((ds) => ds.data.map((d) => d.value))
    : data.map((d) => d.value)
  const maxValue = yAxisMax !== undefined ? yAxisMax : Math.max(...allValues)
  const minValue = yAxisMin !== undefined ? yAxisMin : Math.min(...allValues)
  const valueRange = maxValue - minValue || 1
  const xStep = (width - 2 * padding) / (primaryData.length - 1)
  // eslint-disable-next-line no-unused-vars
  const _yScale = (height - 2 * padding) / valueRange

  const buildPoints = (seriesData, seriesMinValue, seriesMaxValue) =>
    seriesData.map((point, index) => {
      const x = padding + index * xStep
      const seriesRange = seriesMaxValue - seriesMinValue || 1
      const seriesScale = (height - 2 * padding) / seriesRange
      const y = height - padding - (point.value - seriesMinValue) * seriesScale
      return { x, y, time: point.time, value: point.value, index }
    })

  const points = buildPoints(primaryData, minValue, maxValue)
  const datasetPoints = isMultiDataset
    ? datasets.map((ds) => ({
      ...ds,
      points: buildPoints(
        ds.data,
        useIndependentYAxis && ds.yAxisMin !== undefined ? ds.yAxisMin : minValue,
        useIndependentYAxis && ds.yAxisMax !== undefined ? ds.yAxisMax : maxValue
      ),
    }))
    : null

  // Generate smooth Bezier curve path
  function getSmoothPath(points) {
    if (points.length < 2) return ""

    function controlPoints(current, previous, next, reverse) {
      const smoothing = 0.25
      const p = previous || current
      const n = next || current

      const o = {
        length: Math.sqrt(Math.pow(n.x - p.x, 2) + Math.pow(n.y - p.y, 2)),
        angle: Math.atan2(n.y - p.y, n.x - p.x),
      }

      const angle = o.angle + (reverse ? Math.PI : 0)
      const length = o.length * smoothing

      return {
        x: current.x + Math.cos(angle) * length,
        y: current.y + Math.sin(angle) * length,
      }
    }

    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const cp1 = controlPoints(points[i], points[i - 1], points[i + 1], false)
      const cp2 = controlPoints(points[i + 1], points[i], points[i + 2], true)
      d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${points[i + 1].x} ${points[i + 1].y}`
    }

    return d
  }

  const pathData = getSmoothPath(points)
  const datasetPaths = isMultiDataset ? datasetPoints.map((ds) => getSmoothPath(ds.points)) : null

  // Animation function
  const animateLine = useCallback(() => {
    if (isAnimating || hasAnimated) return

    setIsAnimating(true)
    setAnimationProgress(0)

    const duration = 2000 // 2 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      setAnimationProgress(easeInOutCubic(progress))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setHasAnimated(true)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, hasAnimated])

  // Setup intersection observer for visibility detection
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Small delay to ensure smooth animation start
            setTimeout(() => {
              animateLine()
            }, 100)
          }
        })
      },
      {
        threshold: 0.3, // Trigger when 30% of the chart is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before fully visible
      }
    )

    observerRef.current.observe(svg)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasAnimated, animateLine])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Handle mouse move for tooltip
  const handleMouseMove = (event) => {
    if (isAnimating) return // Disable tooltip during animation

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    let foundPoint = null
    let foundIndex = null

    const candidatePoints = isMultiDataset ? datasetPoints.flatMap((ds) => ds.points) : points

    for (let i = 0; i < candidatePoints.length; i++) {
      const point = candidatePoints[i]
      const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2))
      if (distance <= hoverRadius) {
        foundPoint = point
        foundIndex = point.index
        break
      }
    }

    if (foundPoint) {
      let values = null
      if (isMultiDataset) {
        values = {}
        datasetPoints.forEach((ds) => {
          const v = ds.data[foundIndex]?.value
          values[ds.tooltipLabel] = v
        })
      }

      setTooltip({
        x: foundPoint.x,
        y: foundPoint.y,
        time: foundPoint.time,
        value: foundPoint.value,
        values,
        visible: true,
      })
      setHoveredPointIndex(foundIndex)
      svg.style.cursor = "pointer"
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }))
      setHoveredPointIndex(null)
      svg.style.cursor = "default"
    }
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
    setHoveredPointIndex(null)
    if (svgRef.current) {
      svgRef.current.style.cursor = "default"
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block", width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ backgroundColor: backgroundColor || "#959595" }}
      >
        {/* Background */}
        <rect width={width} height={height} fill={backgroundColor || "#959595"} />

        {/* Label */}
        <text x={padding} y={30} fill="#959595" fontSize="18" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
          {label}
        </text>

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth={1} />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth={1} />

        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map((i) => {
          const y = padding + ((height - 2 * padding) / 5) * i
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#959595"
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          )
        })}

        {/* Gradient fill below curve */}
        <defs>
          <linearGradient id="gradient" x1="0" y1={padding} x2="0" y2={height - padding} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.5} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0.1} />
          </linearGradient>
          {isMultiDataset &&
            datasetPoints.map((ds, i) => (
              <linearGradient
                key={i}
                id={`gradient-${i}`}
                x1="0"
                y1={padding}
                x2="0"
                y2={height - padding}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={ds.lineColor} stopOpacity={ds.fillOpacityTop ?? 0.35} />
                <stop offset="100%" stopColor={ds.lineColor} stopOpacity={ds.fillOpacityBottom ?? 0.08} />
              </linearGradient>
            ))}
          <clipPath id="animationClip">
            <rect
              x={0}
              y={0}
              width={width * animationProgress}
              height={height}
            />
          </clipPath>
        </defs>

        {!isMultiDataset && (
          <>
            {/* Animated gradient fill below curve */}
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="url(#gradient)"
              clipPath="url(#animationClip)"
            />

            {/* Animated smooth curve line */}
            <path
              d={pathData}
              fill="none"
              stroke={lineColor}
              strokeWidth={3}
              clipPath="url(#animationClip)"
            />
          </>
        )}

        {isMultiDataset &&
          datasetPoints.map((ds, i) => (
            <React.Fragment key={i}>
              <path
                d={`${datasetPaths[i]} L ${ds.points[ds.points.length - 1].x} ${height - padding} L ${ds.points[0].x} ${height - padding} Z`}
                fill={`url(#gradient-${i})`}
                clipPath="url(#animationClip)"
              />
              <path
                d={datasetPaths[i]}
                fill="none"
                stroke={ds.lineColor}
                strokeWidth={3}
                clipPath="url(#animationClip)"
              />
            </React.Fragment>
          ))}
        {showPoints && !isMultiDataset &&
          points.map((point, index) => {
            const pointProgress = (point.x - padding) / (width - 2 * padding)
            const shouldShow = animationProgress >= pointProgress
            const isHovered = hoveredPointIndex === index && !isAnimating

            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={isHovered ? 8 : 6}
                fill={lineColor}
                stroke="#ffffffaa"
                strokeWidth={isHovered ? 4 : 3}
                style={{
                  filter: isHovered ? "drop-shadow(0 0 6px " + lineColor + ")" : "none",
                  opacity: shouldShow ? 1 : 0,
                  transition: isAnimating ? "opacity 0.2s ease" : "none",
                }}
              />
            )
          })}

        {showPoints && isMultiDataset &&
          datasetPoints.map((ds, datasetIndex) =>
            ds.points.map((point) => {
              const pointProgress = (point.x - padding) / (width - 2 * padding)
              const shouldShow = animationProgress >= pointProgress
              const isHovered = hoveredPointIndex === point.index && !isAnimating

              return (
                <circle
                  key={`${datasetIndex}-${point.index}`}
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 8 : 6}
                  fill={ds.lineColor}
                  stroke="#ffffffaa"
                  strokeWidth={isHovered ? 4 : 3}
                  style={{
                    filter: isHovered ? "drop-shadow(0 0 6px " + ds.lineColor + ")" : "none",
                    opacity: shouldShow ? 1 : 0,
                    transition: isAnimating ? "opacity 0.2s ease" : "none",
                  }}
                />
              )
            })
          )}
        {/* X axis labels */}
        {primaryData.map((point, index) => {
          const x = padding + index * xStep
          const y = height - padding + 20
          return (
            <text
              key={index}
              x={x}
              y={y}
              fill="#959595"
              fontSize="14"
              fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              textAnchor="middle"
            >
              {point.time}
            </text>
          )
        })}
        {/* Y axis labels */}
        <text x={5} y={height - padding} fill="#959595" fontSize="14" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
          {minValue.toFixed(1)}
        </text>
        <text x={5} y={padding + 15} fill="#959595" fontSize="14" fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
          {maxValue.toFixed(1)}
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip.visible && !isAnimating && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x - 50,
            top: tooltip.y - 65,
            backgroundColor: "#666666c3",
            color: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            pointerEvents: "none",
            zIndex: 1000,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minWidth: "100px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px", color: "white" }}>{tooltip.values ? `Day: ${tooltip.time}` : tooltip.time}</div>

          {!tooltip.values && (
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              <span style={{ color: "#d1d5db" }}>{tooltipLabel || "None"}: </span>
              <span style={{ fontWeight: "600", color: tooltipValueColor || "#32fc83" }}>
                {tooltipLabel && tooltipLabel.toLowerCase().includes("ph") ? tooltip.value.toFixed(2) : tooltip.value.toFixed(0)}
              </span>
            </div>
          )}

          {tooltip.values && (
            <>
              {["Moisture", "Temperature", "pH"].map((k) => (
                <div key={k} style={{ color: "#9ca3af", fontSize: "12px" }}>
                  <span style={{ color: "#d1d5db" }}>{k}: </span>
                  <span style={{ fontWeight: "600", color: "white" }}>
                    {typeof tooltip.values?.[k] === "number"
                      ? tooltip.values[k].toFixed(k.toLowerCase().includes("ph") ? 2 : 0)
                      : "-"}
                  </span>
                </div>
              ))}
            </>
          )}

          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(102, 102, 102, 0.23)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-7px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "7px solid rgba(102, 102, 102, 0.07)",
              zIndex: -1,
            }}
          />
        </div>
      )}
    </div>
  )
}