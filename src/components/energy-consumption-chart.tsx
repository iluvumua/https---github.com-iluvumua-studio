"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { energyConsumptionData } from "@/lib/data";

const chartConfig = {
  building1: {
    label: "Bureau Principal",
    color: "hsl(var(--chart-1))",
  },
  building2: {
    label: "Centre de Données",
    color: "hsl(var(--chart-2))",
  },
};

const monthTranslations: { [key: string]: string } = {
  "May": "Mai",
  "Jun": "Juin",
  "Jul": "Juil",
  "Aug": "Août",
  "Sep": "Sep",
  "Oct": "Oct",
};

export function EnergyConsumptionChart() {
  const translatedData = energyConsumptionData.map(item => ({
    ...item,
    month: monthTranslations[item.month] || item.month
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu de la Consommation d'Énergie</CardTitle>
        <CardDescription>Mai - Octobre 2023 (en kWh)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={translatedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="building1" fill="var(--color-building1)" radius={4} />
            <Bar dataKey="building2" fill="var(--color-building2)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
