
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
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Line, LineChart as RechartsLineChart } from "recharts";
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
  cost: {
    label: "Coût (TND)",
    color: "hsl(var(--chart-2))",
  },
  averageCost: {
    label: "Coût Moyen",
    color: "hsl(var(--chart-4))",
  },
};


const AnnualCostChart = ({ title, description, chartData }: { title: string, description: string, chartData: any[] }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
    const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
    
    const annualAverages = useMemo(() => {
        const totalCost = chartData.reduce((acc, data) => acc + data.Coût, 0);
        const monthsWithData = chartData.filter(d => d.Coût > 0).length || 1;
        return { averageCost: totalCost / monthsWithData };
    }, [chartData]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{...chartConfig, Coût: { label: "Coût", color: "hsl(var(--chart-2))" }}} className="min-h-[300px] w-full">
                    <RechartsLineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" formatter={(val) => formatCurrency(val as number)} />} />
                        <Legend />
                        <Line dataKey="Coût" type="monotone" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
                        <ReferenceLine y={annualAverages.averageCost} label="Moyenne" stroke="var(--color-averageCost)" strokeDasharray="3 3" />
                    </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

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

  const calculateAnnualChartData = (filteredBills: Bill[]) => {
    const yearBills = filteredBills.filter(bill => bill.month.endsWith(selectedYear));
    const monthlyData: { [key: string]: { cost: number } } = {};

    monthNames.forEach(month => {
        monthlyData[month] = { cost: 0 };
    });

    yearBills.forEach(bill => {
        const monthName = bill.month.split(' ')[0];
        if (monthlyData[monthName]) {
            monthlyData[monthName].cost += bill.amount;
        }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month.slice(0, 3),
      Coût: data.cost,
    }));
  };
  
  const allMetersChartData = useMemo(() => calculateAnnualChartData(bills), [bills, selectedYear]);

  const msanGsmChartData = useMemo(() => {
    const equipmentMeters = new Set<string>();
    equipment.forEach(e => {
        if (e.compteurId && (e.type.includes('MSAN') || e.type.includes('MSN') || e.type.includes('MSI') || e.type.includes('BTS'))) {
            equipmentMeters.add(e.compteurId);
        }
    });
    const filtered = bills.filter(bill => equipmentMeters.has(bill.meterId));
    return calculateAnnualChartData(filtered);
  }, [bills, equipment, selectedYear]);

  const mtEquipmentChartData = useMemo(() => {
    const mtMeters = new Set(meters.filter(m => m.typeTension.includes('Moyen Tension')).map(m => m.id));
    const equipmentMeters = new Set<string>();
    equipment.forEach(e => {
        if (e.compteurId && mtMeters.has(e.compteurId)) {
            equipmentMeters.add(e.compteurId);
        }
    });
    const filtered = bills.filter(bill => equipmentMeters.has(bill.meterId));
    return calculateAnnualChartData(filtered);
  }, [bills, equipment, meters, selectedYear]);
  
  const buildingOnlyChartData = useMemo(() => {
    const buildingMeterIds = new Set(buildings.map(b => b.meterId).filter(Boolean));
    const metersWithEquipment = new Set(equipment.map(e => e.compteurId).filter(Boolean));
    const buildingOnlyMeters = new Set<string>();
    buildingMeterIds.forEach(meterId => {
        if (!metersWithEquipment.has(meterId)) {
            buildingOnlyMeters.add(meterId as string);
        }
    });
    const filtered = bills.filter(bill => buildingOnlyMeters.has(bill.meterId));
    return calculateAnnualChartData(filtered);
  }, [bills, buildings, equipment, selectedYear]);


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
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnualCostChart 
                title="Coût Total (Tous les Compteurs)"
                description="Coût total de toutes les factures enregistrées."
                chartData={allMetersChartData}
            />
             <AnnualCostChart 
                title="Coût Équipement (MSAN & Site GSM)"
                description="Coût total pour les équipements de type MSAN, MSN, MSI, et BTS."
                chartData={msanGsmChartData}
            />
             <AnnualCostChart 
                title="Coût Équipement (Compteurs MT)"
                description="Coût total pour les équipements alimentés par des compteurs Moyenne Tension."
                chartData={mtEquipmentChartData}
            />
             <AnnualCostChart 
                title="Coût (Bâtiments Uniquement)"
                description="Coût pour les compteurs de bâtiments qui n'alimentent pas d'équipement spécifique."
                chartData={buildingOnlyChartData}
            />
        </div>
    </div>
  );
}
