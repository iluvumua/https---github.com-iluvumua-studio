
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
    const latestYear = bills.reduce((maxYear, bill) => {
        const year = parseInt(bill.month.split(' ')[1]);
        return year > maxYear ? year : maxYear;
    }, 0);
    
    const yearToDisplay = latestYear > 0 ? latestYear : new Date().getFullYear();

    const annualBills = bills.filter(bill => bill.month.endsWith(yearToDisplay.toString()));

    let msanCost = 0;
    let gsmCost = 0;
    let mtCost = 0;
    let otherCost = 0;

    const msanMeterIds = new Set(equipment.filter(e => e.type === 'MSI' || e.type === 'MSN').map(e => e.compteurId));
    const gsmMeterIds = new Set(equipment.filter(e => e.type === 'BTS').map(e => e.compteurId));
    const mtMeterIds = new Set(meters.filter(m => m.typeTension.includes('Moyen Tension')).map(m => m.id));
    
    annualBills.forEach(bill => {
      let categorized = false;
      if (msanMeterIds.has(bill.meterId)) {
        msanCost += bill.amount;
        categorized = true;
      }
      if (gsmMeterIds.has(bill.meterId)) {
        gsmCost += bill.amount;
        categorized = true;
      }
      // A meter can be MT and also be associated with MSAN/GSM, avoid double counting.
      if (mtMeterIds.has(bill.meterId) && !categorized) {
        mtCost += bill.amount;
        categorized = true;
      }
      if (!categorized) {
        otherCost += bill.amount;
      }
    });

    const chartData = [
      { name: 'MSAN', value: msanCost },
      { name: 'GSM', value: gsmCost },
      { name: 'MT', value: mtCost },
      { name: 'Autres', value: otherCost },
    ].filter(d => d.value > 0);

    const totalConsumption = annualBills.reduce((acc, bill) => acc + bill.consumptionKWh, 0);
    
    return { chartData, totalConsumption, year: yearToDisplay };
  }, [bills, equipment, meters]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
  const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' kWh';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Coûts Annuels</CardTitle>
        <CardDescription>Coûts par catégorie d'équipement pour l'année {yearlyData.year}.</CardDescription>
      </CardHeader>
      <CardContent>
        {yearlyData.chartData.length > 0 ? (
        <>
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
        </>
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p>Aucune donnée de facturation pour l'année {yearlyData.year}.</p>
                <p className="text-xs">Ajoutez des factures pour voir le graphique.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
