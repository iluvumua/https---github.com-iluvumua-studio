
"use client"

import * as React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  ArcElement,
  PieController,
} from "chart.js"
import {
  Recharts,
  type RechartsProps,
  type TooltipProps,
} from "recharts"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  ArcElement,
  PieController
)


const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: any
  }
>(({ config, className, ...props }, ref) => {
  const chartConfig = config
    ? {
        ...config,
        color: `hsl(${config.color})`,
      }
    : undefined

  return (
    <div
      ref={ref}
      data-chart-config={chartConfig ? JSON.stringify(chartConfig) : undefined}
      className={cn("flex aspect-video justify-center", className)}
      {...props}
    />
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id }: { id: string }) => {
  return <style id={id}></style>
}

const ChartTooltip = ChartJSTooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TooltipProps<any, any>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "min-w-[8rem] rounded-lg border bg-background p-2 text-sm shadow-md",
        className
      )}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = ChartJSLegend

const ChartLegendContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>((props, ref) => {
  return <ul ref={ref} {...props} />
})
ChartLegendContent.displayName = "ChartLegendContent"

// Dummy components
const Chart = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartXAxis = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartYAxis = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartGrid = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartSeries = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartLines = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartLine = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartBars = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartBar = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartPies = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ChartPie = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Chart,
  ChartContainer,
  ChartStyle,
  ChartXAxis,
  ChartYAxis,
  ChartGrid,
  ChartSeries,
  ChartLines,
  ChartLine,
  ChartBars,
  ChartBar,
  ChartPies,
  ChartPie,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
