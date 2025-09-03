
"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useMetersStore } from "@/hooks/use-meters-store";

const chartConfig = {
  msan: { label: "MSAN", color: "hsl(var(--chart-1))" },
  gsm: { label: "GSM", color: "hsl(var(--chart-2))" },
  mt: { label: "MT", color: "hsl(var(--chart-3))" },
  other: { label: "Autres", color: "hsl(var(--chart-4))" },
};

const COLORS = Object.values(chartConfig).map(c => c.color);

export function CostBreakdownChart() {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();

  const yearlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const annualBills = bills.filter(bill => bill.month.endsWith(currentYear.toString()));

    let msanCost = 0;
    let gsmCost = 0;
    let mtCost = 0;
    let otherCost = 0;

    const msanMeterIds = new Set(equipment.filter(e => e.type === 'MSI' || e.type === 'MSN').map(e => e.compteurId));
    const gsmMeterIds = new Set(equipment.filter(e => e.type === 'BTS').map(e => e.compteurId));
    const mtMeterIds = new Set(meters.filter(m => m.typeTension.includes('Moyen Tension')).map(m => m.id));
    
    const categorizedMeters = new Set([...msanMeterIds, ...gsmMeterIds, ...mtMeterIds]);

    annualBills.forEach(bill => {
      if (msanMeterIds.has(bill.meterId)) {
        msanCost += bill.amount;
      } else if (gsmMeterIds.has(bill.meterId)) {
        gsmCost += bill.amount;
      } else if (mtMeterIds.has(bill.meterId)) {
        mtCost += bill.amount;
      } else {
        otherCost += bill.amount;
      }
    });
    
    // Handle cases where a meter might fit multiple categories
    // For now, simple if-else logic is used. A more complex logic could distribute cost.
    // Re-evaluating MT cost to not overlap with already categorized MSAN/GSM
    let refinedMtCost = 0;
    meters.forEach(meter => {
      if (mtMeterIds.has(meter.id) && !msanMeterIds.has(meter.id) && !gsmMeterIds.has(meter.id)) {
        const meterBills = annualBills.filter(b => b.meterId === meter.id);
        refinedMtCost += meterBills.reduce((acc, b) => acc + b.amount, 0);
      }
    });

    const chartData = [
      { name: 'MSAN', value: msanCost },
      { name: 'GSM', value: gsmCost },
      { name: 'MT', value: refinedMtCost },
      { name: 'Autres', value: otherCost },
    ].filter(d => d.value > 0);

    const totalConsumption = annualBills.reduce((acc, bill) => acc + bill.consumptionKWh, 0);
    
    return { chartData, totalConsumption };
  }, [bills, equipment, meters]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
  const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' kWh';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Coûts Annuels</CardTitle>
        <CardDescription>Coûts par catégorie d'équipement pour l'année en cours.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie
                        data={yearlyData.chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {yearlyData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent formatter={(val) => formatCurrency(val as number)} />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Consommation Annuelle Totale</p>
            <p className="text-2xl font-bold text-primary">{formatKWh(yearlyData.totalConsumption)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
