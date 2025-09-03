
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, LineChart as RechartsLineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Bill } from "@/lib/types";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const chartConfig = {
  total: { label: "Total", color: "hsl(var(--chart-1))" },
  msan_gsm: { label: "MSAN & GSM", color: "hsl(var(--chart-2))" },
  mt_equip: { label: "Équipements MT", color: "hsl(var(--chart-3))" },
  building_only: { label: "Bâtiments Seuls", color: "hsl(var(--chart-4))" },
};


export default function BillingStatisticsPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);

  const annualChartData = useMemo(() => {
    const yearBills = bills.filter(bill => bill.month.endsWith(selectedYear));
    const monthlyData: { [key: string]: { [key in keyof typeof chartConfig]: number } } = {};

    monthNames.forEach(month => {
        monthlyData[month] = { total: 0, msan_gsm: 0, mt_equip: 0, building_only: 0 };
    });
    
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
        if (!metersWithEquipment.has(meterId)) {
            buildingOnlyMeters.add(meterId as string);
        }
    });


    yearBills.forEach(bill => {
        const monthName = bill.month.split(' ')[0];
        if (monthlyData[monthName]) {
            monthlyData[monthName].total += bill.amount;
            if (equipmentMetersMSAN.has(bill.meterId)) {
                monthlyData[monthName].msan_gsm += bill.amount;
            }
            if (equipmentMetersMT.has(bill.meterId)) {
                monthlyData[monthName].mt_equip += bill.amount;
            }
            if (buildingOnlyMeters.has(bill.meterId)) {
                monthlyData[monthName].building_only += bill.amount;
            }
        }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month.slice(0, 3),
      ...data
    }));
  }, [bills, equipment, meters, buildings, selectedYear]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
  const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
  
  return (
    <div className="grid gap-6">
       <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Statistiques Annuelles des Coûts</CardTitle>
                        <CardDescription>Aperçu des coûts par catégorie pour l'année {selectedYear}.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
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
                </div>
            </CardHeader>
             <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <RechartsLineChart data={annualChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" formatter={(val) => formatCurrency(val as number)} />} />
                        <Legend />
                        <Line dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={2} dot={false} name="Total"/>
                        <Line dataKey="msan_gsm" type="monotone" stroke="var(--color-msan_gsm)" strokeWidth={2} dot={false} name="MSAN & GSM" />
                        <Line dataKey="mt_equip" type="monotone" stroke="var(--color-mt_equip)" strokeWidth={2} dot={false} name="Équipements MT" />
                        <Line dataKey="building_only" type="monotone" stroke="var(--color-building_only)" strokeWidth={2} dot={false} name="Bâtiments Seuls" />
                    </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
