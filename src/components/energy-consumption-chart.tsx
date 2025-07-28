
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
} from "@/components/ui/chart";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMemo } from "react";

const chartConfig = {
  consumption: {
    label: "Consommation",
    color: "hsl(var(--chart-1))",
  },
};

const monthOrder: { [key: string]: number } = {
  "janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
  "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12
};

export function EnergyConsumptionChart() {
  const { bills } = useBillingStore();

  const chartData = useMemo(() => {
    const monthlyConsumption: { [month: string]: number } = {};

    bills.forEach(bill => {
      const monthName = bill.month.split(' ')[0].toLowerCase();
      if (monthlyConsumption[monthName]) {
        monthlyConsumption[monthName] += bill.consumptionKWh;
      } else {
        monthlyConsumption[monthName] = bill.consumptionKWh;
      }
    });

    return Object.entries(monthlyConsumption)
      .map(([month, consumption]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        consumption,
        order: monthOrder[month] || 0,
      }))
      .sort((a, b) => a.order - b.order);

  }, [bills]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu de la Consommation d'Énergie</CardTitle>
        <CardDescription>Consommation mensuelle (en kWh) basée sur les factures</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
                tickFormatter={(value) => `${value / 1000}k`}
             />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value) => `${new Intl.NumberFormat('fr-FR').format(value as number)} kWh`}
                    indicator="dot"
                />}
            />
            <Bar dataKey="consumption" fill="var(--color-consumption)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
