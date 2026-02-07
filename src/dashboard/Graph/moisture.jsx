import SVGChart from "./SVG-graph"

export const moistureData = [
  { time: "Mon", value: 65 },
  { time: "Tue", value: 62 },
  { time: "Wed", value: 58 },
  { time: "Thu", value: 55 },
  { time: "Fri", value: 52 },
  { time: "Sat", value: 68 },
  { time: "Sun", value: 71 },
]

export default function MoistureSVGChart({ width = 600, height = 300 }) {
  return (
    <SVGChart
      data={moistureData}
      lineColor="#22c55e"
      label="Moisture Level"
      tooltipLabel="Moisture"
      tooltipValueColor="#32fc83"
      yAxisMin={45}
      yAxisMax={80}
      width={width}
      height={height}
    />
  )
}