import SVGChart from "./SVG-graph"

export const phData = [
  { time: "Mon", value: 6.9 },
  { time: "Tue", value: 5.1 },
  { time: "Wed", value: 6.9 },
  { time: "Thu", value: 5.1 },
  { time: "Fri", value: 6.9 },
  { time: "Sat", value: 5.1 },
  { time: "Sun", value: 6.9 },
]

export default function PhSVGChart({ width = 600, height = 300 }) {
  return (
    <SVGChart
      data={phData}
      lineColor="#8b5cf6"
      label="pH Level"
      tooltipLabel="pH"
      tooltipValueColor="#c1a6ff"
      yAxisMin={5}
      yAxisMax={7}
      width={width}
      height={height}
    />
  )
}