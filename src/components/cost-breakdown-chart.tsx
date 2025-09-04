
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
import { useBuildingsStore } from "@/hooks/use-buildings-store";

// Base colors for dynamic generation
const BASE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1) / 0.7)",
  "hsl(var(--chart-2) / 0.7)",
  "hsl(var(--chart-3) / 0.7)",
  "hsl(var(--chart-4) / 0.7)",
  "hsl(var(--chart-5) / 0.7)",
];

export function CostBreakdownChart() {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();

  const { chartData, totalCost, year, chartConfig } = useMemo(() => {
    const latestYear = bills.reduce((maxYear, bill) => {
        const year = parseInt(bill.month.split(' ')[1]);
        return isNaN(year) ? maxYear : Math.max(maxYear, year);
    }, 0);
    
    const yearToDisplay = latestYear > 0 ? latestYear : new Date().getFullYear();
    const annualBills = bills.filter(bill => bill.month.endsWith(yearToDisplay.toString()));

    const costsByCategory: { [key: string]: number } = {};

    const metersById = new Map(meters.map(m => [m.id, m]));
    const equipmentByMeter = new Map<string, typeof equipment>();
    equipment.forEach(e => {
        if (e.compteurId) {
            if (!equipmentByMeter.has(e.compteurId)) {
                equipmentByMeter.set(e.compteurId, []);
            }
            equipmentByMeter.get(e.compteurId)!.push(e);
        }
    });
    
    const buildingMeters = new Set(buildings.map(b => b.meterId).filter(Boolean));

    annualBills.forEach(bill => {
      const meter = metersById.get(bill.meterId);
      if (!meter) {
        costsByCategory['Autres'] = (costsByCategory['Autres'] || 0) + bill.amount;
        return;
      }
      
      const tensionLabel = meter.typeTension.includes('Basse') ? 'BT' : 'MT';
      const associatedEquipment = equipmentByMeter.get(meter.id) || [];

      if (associatedEquipment.length > 0) {
        // Distribute cost among equipment on the same meter
        const costPerEquipment = bill.amount / associatedEquipment.length;
        associatedEquipment.forEach(eq => {
          const categoryKey = `${eq.type} (${tensionLabel})`;
          costsByCategory[categoryKey] = (costsByCategory[categoryKey] || 0) + costPerEquipment;
        });
      } else if (buildingMeters.has(meter.id)) {
        costsByCategory['Bâtiments Seuls'] = (costsByCategory['Bâtiments Seuls'] || 0) + bill.amount;
      } else {
        costsByCategory['Compteurs non-associés'] = (costsByCategory['Compteurs non-associés'] || 0) + bill.amount;
      }
    });

    const finalChartData = Object.entries(costsByCategory).map(([name, value]) => ({
      name,
      value,
    })).filter(d => d.value > 0).sort((a,b) => b.value - a.value);

    const dynamicChartConfig: { [key: string]: { label: string, color: string } } = {};
    finalChartData.forEach((data, index) => {
        const key = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        dynamicChartConfig[key] = {
            label: data.name,
            color: BASE_COLORS[index % BASE_COLORS.length],
        };
    });

    const totalCost = annualBills.reduce((acc, bill) => acc + bill.amount, 0);
    
    return { chartData: finalChartData, totalCost, year: yearToDisplay, chartConfig: dynamicChartConfig };
  }, [bills, equipment, meters, buildings]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);

  const COLORS = useMemo(() => Object.values(chartConfig).map(c => c.color), [chartConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Coûts Annuels</CardTitle>
        <CardDescription>Coûts par catégorie d'équipement pour l'année {year}.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
        <>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent formatter={(val) => formatCurrency(val as number)} />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Consommation en DT</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</p>
            </div>
        </>
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p>Aucune donnée de facturation pour l'année {year}.</p>
                <p className="text-xs">Ajoutez des factures pour voir le graphique.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
