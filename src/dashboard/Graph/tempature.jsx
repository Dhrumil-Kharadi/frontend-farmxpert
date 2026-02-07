import SVGChart from "./SVG-graph"

export const temperatureData = [
  { time: "Mon", value: 22 },
  { time: "Tue", value: 24 },
  { time: "Wed", value: 26 },
  { time: "Thu", value: 25 },
  { time: "Fri", value: 23 },
  { time: "Sat", value: 21 },
  { time: "Sun", value: 22 },
]

export default function TemperatureSVGChart({ width = 600, height = 300 }) {
  return (
    <SVGChart
      data={temperatureData}
      lineColor="#f59e0b"
      label="Temperature (°C)"
      tooltipLabel="Temperature"
      tooltipValueColor="#f59e0b"
      yAxisMin={20}
      yAxisMax={30}
      width={width}
      height={height}
    />
  )
}