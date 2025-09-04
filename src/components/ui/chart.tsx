
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex justify-center", className)}
      {...props}
    />
  )
})

ChartContainer.displayName = "ChartContainer"

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-2 text-sm bg-background border rounded-md shadow-sm", className)}
      {...props}
    />
  )
})

ChartTooltipContent.displayName = "ChartTooltipContent"

// Keep dummy exports to prevent breaking other components that might import them.
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ChartLegend = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ChartLegendContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ChartStyle = () => null;
