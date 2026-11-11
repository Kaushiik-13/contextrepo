"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { ContextRecord, ContextType } from "@/lib/context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const labels: Record<ContextType, string> = {
  decision: "Decisions",
  requirement: "Requirements",
  constraint: "Constraints",
  research: "Research",
  "rejected-approach": "Rejected",
  "open-question": "Open questions",
  "project-state": "Project state",
}

const chartConfig = {
  records: { label: "Records", color: "var(--primary)" },
} satisfies ChartConfig

export function ChartAreaInteractive({ records }: { records: ContextRecord[] }) {
  const types = Object.keys(labels) as ContextType[]
  const chartData = types.map((type) => ({
    type: labels[type],
    records: records.filter((record) => record.type === type).length,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Context distribution</CardTitle>
        <CardDescription>Number of records by type</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="records" fill="var(--color-records)" radius={4} maxBarSize={52} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
