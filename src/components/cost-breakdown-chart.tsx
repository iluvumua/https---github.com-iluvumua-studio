
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

    const equipmentMetersMSAN = new Set<string>();
    equipment.forEach(e => {
        if (e.compteurId && (e.type.includes('MSAN') || e.type.includes('MSN') || e.type.includes('MSI') || e.type.includes('BTS'))) {
            equipmentMetersMSAN.add(e.compteurId);
        }
    });

    const mtMeters = new Set(meters.filter(m => m.typeTension.includes('Moyen Tension')).map(m => m.id));
    const equipmentMetersMT = new Set<string>();
    equipment.forEach(e => {
        if (e.compteurId && mtMeters.has(e.compteurId)) {
            equipmentMetersMT.add(e.compteurId);
        }
    });
    
    const buildingMeterIds = new Set(buildings.map(b => b.meterId).filter(Boolean));
    const metersWithEquipment = new Set(equipment.map(e => e.compteurId).filter(Boolean));
    const buildingOnlyMeters = new Set<string>();
    buildingMeterIds.forEach(meterId => {
        if (!metersWithEquipment.has(meterId as string)) {
            buildingOnlyMeters.add(meterId as string);
        }
    });
    
    annualBills.forEach(bill => {
      let categorized = false;
      if (equipmentMetersMSAN.has(bill.meterId)) {
        msanGsmCost += bill.amount;
        categorized = true;
      }
      // Use else-if to avoid double counting for equipment that is both MSAN/GSM and MT
      else if (equipmentMetersMT.has(bill.meterId)) {
        mtEquipCost += bill.amount;
        categorized = true;
      }
      else if (buildingOnlyMeters.has(bill.meterId)) {
        buildingOnlyCost += bill.amount;
        categorized = true;
      }
      
      if (!categorized) {
        otherCost += bill.amount;
      }
    });

    const chartData = [
      { name: 'MSAN & GSM', value: msanGsmCost },
      { name: 'Équipements MT', value: mtEquipCost },
      { name: 'Bâtiments Seuls', value: buildingOnlyCost },
      { name: 'Autres', value: otherCost },
    ].filter(d => d.value > 0);

    const totalConsumption = annualBills.reduce((acc, bill) => acc + bill.consumptionKWh, 0);
    
    return { chartData, totalConsumption, year: yearToDisplay };
  }, [bills, equipment, meters, buildings]);

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
                <p className="text-lg font-semibold">Consommation en DT</p>
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
