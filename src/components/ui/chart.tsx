// // Improve type definitions for chart components

// import type React from "react"
// import { JSX } from "react"

// import {
//   ResponsiveContainer,
//   LineChart as RechartsLineChart,
//   Line as RechartsLine,
//   XAxis as RechartsXAxis,
//   YAxis as RechartsYAxis,
//   Tooltip,
//   type TooltipProps,
// } from "recharts"

// interface ChartTooltipContentProps<T> extends TooltipProps<T, any> {}

// export function ChartContainer({ children }: { children: React.ReactNode }): JSX.Element {
//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       {children}
//     </ResponsiveContainer>
//   )
// }

// export function Chart({ children }: { children: React.ReactNode }): JSX.Element {
//   return <>{children}</>
// }

// type CurveType = "linear" | "monotone" | "natural" | "step" | "stepBefore" | "stepAfter"

// interface LineChartProps {
//   data: any[]
//   index: string
//   categories: string[]
//   colors: string[]
//   yScale: any
//   showLegend: boolean
//   showGridLines: boolean
//   showTooltip: boolean
//   curveType: CurveType
//   children: React.ReactNode
// }

// export function LineChart({
//   data,
//   index,
//   categories,
//   colors,
//   yScale,
//   showLegend,
//   showGridLines,
//   showTooltip,
//   curveType,
//   children,
// }: LineChartProps): JSX.Element {
//   return <RechartsLineChart data={data}>{children}</RechartsLineChart>
// }

// interface LineProps {
//   dataKey: string
//   strokeWidth: number
// }

// export function Line({ dataKey, strokeWidth }: LineProps): JSX.Element {
//   return <RechartsLine type="monotone" dataKey={dataKey} stroke="#8884d8" strokeWidth={strokeWidth} />
// }

// export function XAxis(): JSX.Element {
//   return <RechartsXAxis dataKey="time" />
// }

// export function YAxis(): JSX.Element {
//   return <RechartsYAxis />
// }

// interface ChartTooltipContentProps<T> extends TooltipProps<T, any> {}

// export function ChartTooltip<T>(props: ChartTooltipContentProps<T>): JSX.Element {
//   return <Tooltip content={<ChartTooltipContent {...props} />} />
// }

// export function ChartTooltipContent<T extends object>(props: ChartTooltipContentProps<T>): JSX.Element | null {
//   if (!props.active || !props.payload) {
//     return null
//   }

//   const data = props.payload[0]?.payload as any

//   return (
//     <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
//       <p className="text-sm font-medium leading-none">{data.time}</p>
//       <p className="text-sm text-muted-foreground">Price: {data.price}</p>
//     </div>
//   )
// }
