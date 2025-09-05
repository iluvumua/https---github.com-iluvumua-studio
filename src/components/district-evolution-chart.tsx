
"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { parse } from "date-fns";
import { fr } from 'date-fns/locale';

const getMonthNumber = (monthName: string) => {
    try {
        const date = parse(monthName, "LLLL yyyy", new Date(), { locale: fr });
        if (!isNaN(date.getTime())) {
            return date.getFullYear() * 100 + date.getMonth();
        }
    } catch(e) {}
    return 0;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
const formatKWh = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} kWh`;
const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;


export function DistrictEvolutionChart() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  
  const districtColors = {
    'SOUSSE NORD': '#8884d8',
    'SOUSSE CENTRE': '#82ca9d',
    'ENFIDHA': '#ffc658',
    'MSAKEN': '#ff8042',
  };

  const chartData = useMemo(() => {
    const dataByMonth: { [month: string]: { month: string, monthNum: number, cost: { [district: string]: number }, consumption: { [district: string]: number } } } = {};
    const districts = new Set<string>();

    bills.forEach(bill => {
      const meter = meters.find(m => m.id === bill.meterId);
      const district = meter?.districtSteg;
      if (!district) return;
      
      districts.add(district);
      
      if (!dataByMonth[bill.month]) {
        dataByMonth[bill.month] = {
            month: bill.month,
            monthNum: getMonthNumber(bill.month),
            cost: {},
            consumption: {},
        };
      }
      
      dataByMonth[bill.month].cost[district] = (dataByMonth[bill.month].cost[district] || 0) + bill.amount;
      dataByMonth[bill.month].consumption[district] = (dataByMonth[bill.month].consumption[district] || 0) + bill.consumptionKWh;
    });
    
    const sortedData = Object.values(dataByMonth).sort((a, b) => a.monthNum - b.monthNum);
    const allDistricts = Array.from(districts);
    
    const formattedData = sortedData.map(d => {
        const monthData: any = { month: d.month.split(' ')[0].slice(0, 3) };
        allDistricts.forEach(dist => {
            monthData[`cost_${dist}`] = d.cost[dist] || 0;
            monthData[`consumption_${dist}`] = d.consumption[dist] || 0;
        });
        return monthData;
    });

    return { data: formattedData, districts: allDistricts };

  }, [bills, meters]);

  return (
     <Card>
      <CardHeader>
        <CardTitle>Évolution par District</CardTitle>
        <CardDescription>Évolution mensuelle des coûts et de la consommation pour chaque district.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
            <h4 className="text-center font-semibold mb-4">Évolution des Coûts (TND)</h4>
             {chartData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        {chartData.districts.map(district => (
                            <Line key={district} type="monotone" dataKey={`cost_${district}`} name={district} stroke={(districtColors as any)[district] || '#000000'} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                 <div className="flex items-center justify-center h-[400px] text-muted-foreground">Aucune donnée à afficher.</div>
            )}
        </div>
         <div>
            <h4 className="text-center font-semibold mb-4">Évolution de la Consommation (kWh)</h4>
            {chartData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={yAxisFormatter}/>
                    <Tooltip formatter={(value: number) => formatKWh(value)} />
                    <Legend />
                    {chartData.districts.map(district => (
                        <Line key={district} type="monotone" dataKey={`consumption_${district}`} name={district} stroke={(districtColors as any)[district] || '#000000'} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">Aucune donnée à afficher.</div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
