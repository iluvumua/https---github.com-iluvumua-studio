
"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import type { Equipment, Building } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Chart } from "react-google-charts";

interface CostBreakdownChartProps {
    displayMode: 'cost' | 'consumption';
}

export function CostBreakdownChart({ displayMode }: CostBreakdownChartProps) {
  const { bills } = useBillingStore();
  const { equipment } = useEquipmentStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();

  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);
  
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] || new Date().getFullYear().toString());

  const { chartData, totalValue } = useMemo(() => {
    const annualBills = bills.filter(bill => bill.month.endsWith(selectedYear.toString()));
    const dataByCategory: { [key: string]: number } = {};
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
             if (!parentList.some(p => 'id' in p && p.id === e.id)) {
                 parentList.push(e);
             }
        }
    });

    annualBills.forEach(bill => {
        const parents = meterToParents.get(bill.meterId);
        const meter = meters.find(m => m.id === bill.meterId);
        const valueToDistribute = displayMode === 'cost' ? bill.amount : bill.consumptionKWh;
        
        if (parents && parents.length > 0) {
            const valuePerParent = valueToDistribute / parents.length;
            parents.forEach(parent => {
                const tensionLabel = meter?.typeTension?.includes('Basse') ? 'BT' : 'MT';
                let categoryKey = 'Inconnu';

                if ('type' in parent) { // It's an Equipment
                    const type = parent.type;
                    const typeMap: { [key: string]: string } = {
                        'MSI': 'MSAN Indoor', 'MSN': 'MSAN Outdoor', 'BTS': 'BTS',
                        'EXC': 'Central Téléphonique', 'OLT': 'OLT',
                    };
                    const descriptiveType = typeMap[type] || type;
                    categoryKey = `${descriptiveType} (${tensionLabel})`;
                } else if ('code' in parent) { // It's a Building
                     const equipmentOnSameMeter = equipment.some(e => e.compteurId === parent.meterId && e.status !== 'switched off');
                     if (!equipmentOnSameMeter) {
                        categoryKey = 'Bâtiments Seuls';
                     } else {
                        return; 
                     }
                }
                
                dataByCategory[categoryKey] = (dataByCategory[categoryKey] || 0) + valuePerParent;
            });
        } else {
            dataByCategory['Compteurs non-associés'] = (dataByCategory['Compteurs non-associés'] || 0) + valueToDistribute;
        }
    });

    const googleChartData = [
      ["Catégorie", displayMode === 'cost' ? "Coût" : "Consommation"],
      ...Object.entries(dataByCategory).map(([name, value]) => [name, value])
    ];
    
    const total = annualBills.reduce((acc, bill) => acc + (displayMode === 'cost' ? bill.amount : bill.consumptionKWh), 0);
    
    return { chartData: googleChartData, totalValue: total };
  }, [bills, equipment, meters, buildings, selectedYear, displayMode]);

  const options = {
    title: ``,
    is3D: true,
    backgroundColor: 'transparent',
    legend: {
        position: 'right',
        alignment: 'center',
        textStyle: { color: 'hsl(var(--foreground))' }
    },
    titleTextStyle: {
        color: 'hsl(var(--foreground))'
    },
    pieSliceTextStyle: {
        color: 'black',
    },
    tooltip: {
        trigger: 'selection'
    },
    chartArea: {left: 20, top: 20, width: '90%', height: '90%'},
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(value);
  const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' kWh';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Répartition Annuelle des {displayMode === 'cost' ? "Coûts" : "Consommations"}</CardTitle>
                <CardDescription>Analyse par catégorie pour l'année {selectedYear}.</CardDescription>
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
        {chartData.length > 1 ? (
        <>
            <Chart
              chartType="PieChart"
              data={chartData}
              options={options}
              width={"100%"}
              height={"400px"}
            />
             <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Total {displayMode === 'cost' ? "Coûts" : "Consommation"}</p>
                <p className="text-2xl font-bold text-primary">
                    {displayMode === 'cost' ? formatCurrency(totalValue) : formatKWh(totalValue)}
                </p>
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
