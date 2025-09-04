
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

const chartConfig = {
  msan_gsm: { label: "MSAN & GSM", color: "hsl(var(--chart-1))" },
  mt_equip: { label: "Équipements MT", color: "hsl(var(--chart-2))" },
  building_only: { label: "Bâtiments Seuls", color: "hsl(var(--chart-3))" },
  other: { label: "Autres", color: "hsl(var(--chart-4))" },
};

const COLORS = Object.values(chartConfig).map(c => c.color);

export function CostBreakdownChart() {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();

  const yearlyData = useMemo(() => {
    const latestYear = bills.reduce((maxYear, bill) => {
        const year = parseInt(bill.month.split(' ')[1]);
        return year > maxYear ? year : maxYear;
    }, 0);
    
    const yearToDisplay = latestYear > 0 ? latestYear : new Date().getFullYear();

    const annualBills = bills.filter(bill => bill.month.endsWith(yearToDisplay.toString()));

    let msanGsmCost = 0;
    let mtEquipCost = 0;
    let buildingOnlyCost = 0;
    let otherCost = 0;

    const metersById = new Map(meters.map(m => [m.id, m]));
    
    // Create sets for easy lookup
    const equipmentMeterIds = new Set(equipment.map(e => e.compteurId).filter(Boolean));
    const buildingMeterIds = new Set(buildings.map(b => b.meterId).filter(Boolean));
    const equipmentByMeter = new Map<string, string[]>();

    equipment.forEach(e => {
        if (e.compteurId) {
            if (!equipmentByMeter.has(e.compteurId)) {
                equipmentByMeter.set(e.compteurId, []);
            }
            equipmentByMeter.get(e.compteurId)!.push(e.type);
        }
    });

    const buildingOnlyMeters = new Set<string>();
    buildingMeterIds.forEach(meterId => {
        if (!equipmentMeterIds.has(meterId as string)) {
            buildingOnlyMeters.add(meterId as string);
        }
    });

    annualBills.forEach(bill => {
        const meter = metersById.get(bill.meterId);
        if (!meter) {
            otherCost += bill.amount;
            return;
        }

        const equipmentTypesOnMeter = equipmentByMeter.get(bill.meterId) || [];
        const isMsanGsm = equipmentTypesOnMeter.some(type => ['MSI', 'MSN', 'BTS'].includes(type));
        
        // Category 1: Équipements MT
        if (meter.typeTension.includes('Moyen Tension')) {
            mtEquipCost += bill.amount;
        } 
        // Category 2: MSAN & GSM (on BT)
        else if (isMsanGsm && meter.typeTension.includes('Basse Tension')) {
            msanGsmCost += bill.amount;
        }
        // Category 3: Bâtiments Seuls
        else if (buildingOnlyMeters.has(bill.meterId)) {
            buildingOnlyCost += bill.amount;
        }
        // Category 4: Autres
        else {
            otherCost += bill.amount;
        }
    });


    const chartData = [
      { name: 'MSAN & GSM', value: msanGsmCost },
      { name: 'Équipements MT', value: mtEquipCost },
      { name: 'Bâtiments Seuls', value: buildingOnlyCost },
      { name: 'Autres', value: otherCost },
    ].filter(d => d.value > 0);

    const totalCost = annualBills.reduce((acc, bill) => acc + bill.amount, 0);
    
    return { chartData, totalCost, year: yearToDisplay };
  }, [bills, equipment, meters, buildings]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);

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
                <p className="text-lg font-semibold">Consommation en DT</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(yearlyData.totalCost)}</p>
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
