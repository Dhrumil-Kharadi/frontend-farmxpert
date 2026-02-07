import SVGChart from "./SVG-graph"
import { moistureData } from "./moisture"
import { temperatureData } from "./tempature"
import { phData } from "./ph"

export default function AllSVGChart({ width = 600, height = 300 }) {
  return (
    <SVGChart
      useIndependentYAxis={true}
      showPoints={false}
      hoverRadius={25}
      yAxisMin={45}
      yAxisMax={80}
      datasets={[
        {
          data: moistureData,
          lineColor: "#22c55e",
          tooltipLabel: "Moisture",
        },
        {
          data: temperatureData,
          lineColor: "#f59e0b",
          tooltipLabel: "Temperature",
          yAxisMin: 20,
          yAxisMax: 30,
          fillOpacityTop: 0.35,
          fillOpacityBottom: 0.08,
        },
        {
          data: phData,
          lineColor: "#8b5cf6",
          tooltipLabel: "pH",
          yAxisMin: 5,
          yAxisMax: 7,
          fillOpacityTop: 0.35,
          fillOpacityBottom: 0.08,
        },
      ]}
      label="All"
      width={width}
      height={height}
    />
  )
}
