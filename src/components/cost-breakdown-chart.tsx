
"use client";

import * as React from "react";
import { useMemo, useState } from "react";
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
import type { Equipment, Building } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type {Payload} from 'recharts/types/component/DefaultLegendContent';

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

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, outerRadius, percent, fill }: any) => {
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);

    return (
        <text
            x={x}
            y={y}
            fill={fill}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-sm font-bold"
        >
            {`${percentage}%`}
        </text>
    );
};


export function CostBreakdownChart() {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();

  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);
  
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] || new Date().getFullYear().toString());

  const { chartData, totalCost, chartConfig } = useMemo(() => {
    const annualBills = bills.filter(bill => bill.month.endsWith(selectedYear.toString()));

    const costsByCategory: { [key: string]: number } = {};
    
    const meterToParents = new Map<string, (Equipment | Building)[]>();
    
    buildings.forEach(b => {
        if (b.meterId) {
            if (!meterToParents.has(b.meterId)) meterToParents.set(b.meterId, []);
            meterToParents.get(b.meterId)!.push(b);
        }
    });

    equipment.forEach(e => {
        if (e.compteurId) {
             if (!meterToParents.has(e.compteurId)) meterToParents.set(e.compteurId, []);
             const parentList = meterToParents.get(e.compteurId)!;
             if (!parentList.some(p => 'id' in p && p.id === e.id)) { // Check if it's already added
                 parentList.push(e);
             }
        }
    });


    annualBills.forEach(bill => {
        const parents = meterToParents.get(bill.meterId);
        const meter = meters.find(m => m.id === bill.meterId);
        
        if (parents && parents.length > 0) {
            const costPerParent = bill.amount / parents.length;
            parents.forEach(parent => {
                const tensionLabel = meter?.typeTension?.includes('Basse') ? 'BT' : 'MT';
                 let categoryKey = 'Inconnu';

                if ('type' in parent) { // It's an Equipment
                    const type = parent.type;
                    const typeMap: { [key: string]: string } = {
                        'MSI': 'MSAN Indoor',
                        'MSN': 'MSAN Outdoor',
                        'BTS': 'BTS',
                        'EXC': 'Central Téléphonique',
                        'OLT': 'OLT',
                    };
                    const descriptiveType = typeMap[type] || type;
                    categoryKey = `${descriptiveType} (${tensionLabel})`;
                } else if ('code' in parent) { // It's a Building
                     const equipmentOnSameMeter = equipment.some(e => e.compteurId === parent.meterId && e.status !== 'switched off');
                     if (!equipmentOnSameMeter) {
                        categoryKey = 'Bâtiments Seuls';
                     } else {
                        // This cost is already distributed among equipment on the same meter.
                        return; 
                     }
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
    
    return { chartData: finalChartData, totalCost, chartConfig: dynamicChartConfig };
  }, [bills, equipment, meters, buildings, selectedYear]);

  const COLORS = useMemo(() => Object.values(chartConfig).map(c => c.color), [chartConfig]);
  
  const ChartLegendContent = React.useCallback(
    (props: { payload?: Payload[] }) => {
      return (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs">
          {props.payload?.map((item) => {
             const { value, color, payload } = item;
             const cost = (payload as any)?.value;
            return (
              <div key={value} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 space-x-1">
                    <span>{value}</span>
                    <span className="font-medium text-muted-foreground">{formatCurrency(cost)}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Répartition des Coûts Annuels</CardTitle>
                <CardDescription>Coûts par catégorie d'équipement pour l'année {selectedYear}.</CardDescription>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
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
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent formatter={(val) => formatCurrency(val as number)} />} />
                        <Legend content={<ChartLegendContent />} />
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
                <p>Aucune donnée de facturation pour l'année {selectedYear}.</p>
                <p className="text-xs">Ajoutez des factures pour voir le graphique.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
