
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

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
            <tspan x={x} dy="-0.5em">{payload.name}</tspan>
            <tspan x={x} dy="1.2em" className="font-semibold">{formatCurrency(payload.value)}</tspan>
        </text>
    );
};


export function CostBreakdownChart() {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();

  const { chartData, totalCost, year, chartConfig } = useMemo(() => {
    const latestYear = bills.reduce((maxYear, bill) => {
        const yearMatch = bill.month.match(/\d{4}$/);
        const year = yearMatch ? parseInt(yearMatch[0]) : 0;
        return isNaN(year) ? maxYear : Math.max(maxYear, year);
    }, 0);
    
    const yearToDisplay = latestYear > 0 ? latestYear : new Date().getFullYear();
    const annualBills = bills.filter(bill => bill.month.endsWith(yearToDisplay.toString()));

    const costsByCategory: { [key: string]: number } = {};
    const metersById = new Map(meters.map(m => [m.id, m]));
    const equipmentById = new Map(equipment.map(e => [e.id, e]));
    const buildingsById = new Map(buildings.map(b => [b.id, b]));

    const meterToParents = new Map<string, string[]>();
    equipment.forEach(e => {
        if (e.compteurId) {
            if (!meterToParents.has(e.compteurId)) meterToParents.set(e.compteurId, []);
            meterToParents.get(e.compteurId)!.push(e.id);
        }
    });
    buildings.forEach(b => {
        if (b.meterId) {
            if (!meterToParents.has(b.meterId)) meterToParents.set(b.meterId, []);
            meterToParents.get(b.meterId)!.push(b.id);
        }
    });

    annualBills.forEach(bill => {
        const parentsIds = meterToParents.get(bill.meterId);
        const meter = metersById.get(bill.meterId);
        const tensionLabel = meter?.typeTension?.includes('Basse') ? 'BT' : 'MT';

        if (parentsIds && parentsIds.length > 0) {
            const costPerParent = bill.amount / parentsIds.length;
            parentsIds.forEach(parentId => {
                const parentEq = equipmentById.get(parentId);
                const parentBldg = buildingsById.get(parentId);
                
                let categoryKey = 'Inconnu';
                if(parentEq) {
                    const typeMap: { [key: string]: string } = {
                        'MSI': 'MSAN Indoor',
                        'MSN': 'MSAN Outdoor',
                        'BTS': 'BTS',
                        'EXC': 'Central Téléphonique',
                        'OLT': 'OLT',
                    };
                    const descriptiveType = typeMap[parentEq.type] || parentEq.type;
                    categoryKey = `${descriptiveType} (${tensionLabel})`;
                } else if(parentBldg) {
                     categoryKey = 'Bâtiments Seuls';
                }
                
                costsByCategory[categoryKey] = (costsByCategory[categoryKey] || 0) + costPerParent;
            });
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
                            label={<CustomLabel />}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
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

