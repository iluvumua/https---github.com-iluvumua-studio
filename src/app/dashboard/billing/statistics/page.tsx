

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
import type { Bill, Meter } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/combobox";
import { subYears, parse, format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { RecapCard, type RecapData } from "@/components/recap-card";


const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const meterColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff7300', 
    '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed', '#8a2be2'
];

const parseBillMonth = (monthString: string): Date | null => {
    try {
        const date = parse(monthString, "LLLL yyyy", new Date(), { locale: fr });
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

export default function BillingStatisticsPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const [timeRange, setTimeRange] = useState<DateRange | undefined>({
    from: subYears(new Date(), 1),
    to: new Date(),
  });

  const [recapYear, setRecapYear] = useState<string>(new Date().getFullYear().toString());
  const [recapMonth, setRecapMonth] = useState<string>(monthNames[new Date().getMonth()]);
  
  const [selectedMeterId, setSelectedMeterId] = useState<string>("");
  const [displayMode, setDisplayMode] = useState<'cost' | 'consumption'>('cost');

  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);

  const getAssociationName = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return "N/A";
    if (meter.buildingId) {
        const building = buildings.find(b => b.id === meter.buildingId);
        return building?.name || `Bâtiment ID: ${meter.buildingId}`;
    }
    const associatedEquipment = equipment.filter(e => e.compteurId === meterId);
    if (associatedEquipment.length > 0) {
        return associatedEquipment.map(e => e.name).join(', ');
    }
    return "Non Associé";
  };

  const meterOptions = useMemo(() => {
    return meters.map(meter => ({
        value: meter.id,
        label: `${meter.id} (${getAssociationName(meter.id)})`
    }));
  }, [meters, buildings, equipment]);

  const recapDataByDistrict = useMemo(() => {
    const selectedMonthYear = `${recapMonth} ${recapYear}`;
    const filteredBills = bills.filter(b => b.month === selectedMonthYear);
    
    const districtRecaps: { [key: string]: RecapData } = {};

    filteredBills.forEach(bill => {
        const meter = meters.find(m => m.id === bill.meterId);
        if (!meter?.districtSteg) return;
        
        if (!districtRecaps[meter.districtSteg]) {
            districtRecaps[meter.districtSteg] = {
                district: meter.districtSteg,
                date: selectedMonthYear,
                nombreFacturesParvenue: 0,
                montantTotalBordereau: 0,
                nombreFacturesSaisie: 0,
                nombreFacturesNonBase: 0,
                montantFacturesSaisie: 0,
                montantFacturesNonBase: 0,
                montantFacturesDiscordance: 0,
                montantFacturesVerifiees: 0,
                litiges: [],
            };
        }
        
        const recap = districtRecaps[meter.districtSteg];
        recap.nombreFacturesParvenue += 1;
        
        if(bill.conformeSTEG) {
             recap.montantFacturesVerifiees += bill.amount;
        } else {
            if (bill.montantSTEG) {
                const difference = bill.amount - bill.montantSTEG;
                recap.montantFacturesDiscordance += Math.abs(difference);
                
                if (difference > 0) {
                    recap.litiges.push({ refFact: bill.id, litige: "Montant calculé supérieur", montantTTC: difference });
                } else {
                    recap.litiges.push({ refFact: bill.id, litige: "Montant STEG supérieur", montantTTC: Math.abs(difference) });
                }
            }
        }
        recap.montantFacturesSaisie += bill.amount;
        recap.nombreFacturesSaisie += 1;
    });

    return Object.values(districtRecaps);

  }, [recapYear, recapMonth, bills, meters]);
  

  const annualChartData = useMemo(() => {
    if (!timeRange?.from) return [];
    
    const fromDate = startOfMonth(timeRange.from);
    const toDate = endOfMonth(timeRange.to || timeRange.from);

    let filteredBills = bills.filter(bill => {
        const billDate = parseBillMonth(bill.month);
        if (!billDate) return false;
        return billDate >= fromDate && billDate <= toDate;
    });

    if (selectedMeterId) {
        filteredBills = filteredBills.filter(bill => bill.meterId === selectedMeterId);
    }
    
    const monthlyData: { [key: string]: { [meter: string]: number } } = {};

    filteredBills.forEach(bill => {
        const monthKey = format(parseBillMonth(bill.month)!, 'yyyy-MM');
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
        }

        const value = displayMode === 'cost' ? bill.amount : bill.consumptionKWh;
        const key = selectedMeterId || 'total';
        monthlyData[monthKey][key] = (monthlyData[monthKey][key] || 0) + value;
    });
    
    return Object.entries(monthlyData)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, data]) => ({
            month: format(parse(key, 'yyyy-MM', new Date()), 'MMM yy', { locale: fr }),
            ...data
        }));

  }, [bills, timeRange, selectedMeterId, displayMode]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
  const formatKWh = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} kWh`;
  const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
  
  const handleMeterSelection = (meterId: string) => {
    setSelectedMeterId(meterId);
  };
  
  return (
    <div className="grid gap-6">
       <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Statistiques Annuelles par Compteur</CardTitle>
                        <CardDescription>
                            Aperçu {displayMode === 'cost' ? 'des coûts' : 'de la consommation'}.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                            <Button variant={displayMode === 'cost' ? "secondary" : "ghost"} size="sm" onClick={() => setDisplayMode('cost')}>Coût (TND)</Button>
                            <Button variant={displayMode === 'consumption' ? "secondary" : "ghost"} size="sm" onClick={() => setDisplayMode('consumption')}>Conso. (kWh)</Button>
                        </div>
                        <Combobox
                            options={meterOptions}
                            value={selectedMeterId}
                            onChange={handleMeterSelection}
                            placeholder="Filtrer par Compteur..."
                            className="w-[250px]"
                        />
                         <DateRangePicker date={timeRange} onDateChange={setTimeRange} />
                     </div>
                </div>
            </CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={annualChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <Tooltip formatter={(value: number) => displayMode === 'cost' ? formatCurrency(value) : formatKWh(value)} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} />
                        <Legend />
                         {selectedMeterId ? (
                             <Line 
                                key={selectedMeterId} 
                                type="monotone" 
                                dataKey={selectedMeterId} 
                                name={getAssociationName(selectedMeterId)}
                                stroke={meterColors[0]}
                                strokeWidth={2}
                            />
                         ) : (
                             <Line type="monotone" dataKey="total" name="Total (Tous Compteurs)" stroke="#8884d8" strokeWidth={2} />
                         )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Separator />

        <Card>
            <CardHeader>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Récapitulatif de Facturation Mensuelle</CardTitle>
                        <CardDescription>Analyse des factures par district pour un mois donné.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Select value={recapMonth} onValueChange={setRecapMonth}>
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{monthNames.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={recapYear} onValueChange={setRecapYear}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                {recapDataByDistrict.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {recapDataByDistrict.map(recap => <RecapCard key={recap.district} data={recap} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Aucune donnée de facturation trouvée pour la sélection actuelle.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
