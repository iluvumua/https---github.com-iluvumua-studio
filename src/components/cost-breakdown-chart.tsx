
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

  const { chartData, totalCost } = useMemo(() => {
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
             if (!parentList.some(p => 'id' in p && p.id === e.id)) {
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
                
                costsByCategory[categoryKey] = (costsByCategory[categoryKey] || 0) + costPerParent;
            });
        } else {
            costsByCategory['Compteurs non-associés'] = (costsByCategory['Compteurs non-associés'] || 0) + bill.amount;
        }
    });

    const googleChartData = [
      ["Catégorie", "Coût"],
      ...Object.entries(costsByCategory).map(([name, value]) => [name, value])
    ];
    
    const totalCost = annualBills.reduce((acc, bill) => acc + bill.amount, 0);
    
    return { chartData: googleChartData, totalCost };
  }, [bills, equipment, meters, buildings, selectedYear]);

  const options = {
    title: `Répartition des Coûts pour ${selectedYear}`,
    is3D: true,
    backgroundColor: 'transparent',
    legend: {
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
    chartArea: {width: '100%', height: '80%'}
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(value);

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
