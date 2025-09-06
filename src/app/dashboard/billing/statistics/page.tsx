
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
import { RecapCard, RecapData } from "@/components/recap-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const meterColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff7300', 
    '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed', '#8a2be2'
];

export default function BillingStatisticsPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [recapYear, setRecapYear] = useState<string>(new Date().getFullYear().toString());
  const [recapMonth, setRecapMonth] = useState<string>(monthNames[new Date().getMonth()]);
  const [recapTension, setRecapTension] = useState<'all' | 'Basse Tension' | 'Moyen Tension Forfaitaire' | 'Moyen Tension Tranche Horaire'>('all');
  
  const [selectedMeters, setSelectedMeters] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<'cost' | 'consumption'>('cost');

  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);

  const recapDataByDistrict = useMemo(() => {
    const selectedMonthYear = `${recapMonth} ${recapYear}`;

    const filteredBills = bills.filter(bill => {
        const meter = meters.find(m => m.id === bill.meterId);
        if (!meter) return false;
        
        const matchesMonth = bill.month === selectedMonthYear;
        const matchesTension = recapTension === 'all' || meter.typeTension === recapTension;

        return matchesMonth && matchesTension;
    });

    const districtRecaps: { [key: string]: RecapData } = {};

    const metersByDistrict: { [key: string]: Meter[] } = meters.reduce((acc, meter) => {
        if (meter.districtSteg) {
            if (!acc[meter.districtSteg]) acc[meter.districtSteg] = [];
            acc[meter.districtSteg].push(meter);
        }
        return acc;
    }, {} as { [key: string]: Meter[] });

    for (const district in metersByDistrict) {
        const districtMeters = metersByDistrict[district];
        const relevantBills = filteredBills.filter(bill => districtMeters.some(m => m.id === bill.meterId));
        
        if (relevantBills.length > 0) {
            const facturesSaisie = relevantBills;
            const montantSaisie = facturesSaisie.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
            
            const facturesDiscordance = facturesSaisie.filter(b => !b.conformeSTEG);
            const montantDiscordance = facturesDiscordance.reduce((sum, bill) => sum + Math.abs((bill.montantSTEG ?? 0) - (bill.amount ?? 0)), 0);
            
            const facturesVerifiees = facturesSaisie.filter(b => b.conformeSTEG);
            const montantVerifiees = facturesVerifiees.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
            
            const litiges = facturesDiscordance.map(b => ({
                refFact: b.reference,
                litige: b.description || 'Discordance de montant',
                montantTTC: b.amount,
            }));

            districtRecaps[district] = {
                district,
                date: selectedMonthYear,
                nombreFacturesParvenue: facturesSaisie.length, // Placeholder logic
                montantTotalBordereau: montantSaisie + montantDiscordance, // Placeholder logic
                nombreFacturesSaisie: facturesSaisie.length,
                nombreFacturesNonBase: 0, // Placeholder logic
                montantFacturesSaisie: montantSaisie,
                montantFacturesNonBase: 0, // Placeholder logic
                montantFacturesDiscordance: montantDiscordance,
                montantFacturesVerifiees: montantVerifiees,
                litiges: litiges,
            };
        }
    }
    return Object.values(districtRecaps);
  }, [recapYear, recapMonth, recapTension, bills, meters]);
  

  const annualChartData = useMemo(() => {
    let yearBills = bills.filter(bill => bill.month.endsWith(selectedYear));
    if (selectedMeters.length > 0) {
        yearBills = yearBills.filter(bill => selectedMeters.includes(bill.meterId));
    }

    const monthlyData: { [key: string]: { [key: string]: number } } = {};

    monthNames.forEach(month => {
        monthlyData[month] = { total: 0 };
    });

    yearBills.forEach(bill => {
        const monthName = bill.month.split(' ')[0];
        if (monthlyData[monthName]) {
            const value = displayMode === 'cost' ? bill.amount : bill.consumptionKWh;
            monthlyData[monthName][bill.meterId] = (monthlyData[monthName][bill.meterId] || 0) + value;
        }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month.slice(0, 3),
      ...data
    }));
  }, [bills, selectedYear, selectedMeters, displayMode]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(value);
  const formatKWh = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} kWh`;
  const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
  
  const handleMeterSelection = (meterId: string) => {
    setSelectedMeters(prev => 
        prev.includes(meterId) 
        ? prev.filter(id => id !== meterId) 
        : [...prev, meterId]
    );
  };
  
  return (
    <div className="grid gap-6">
       <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Statistiques Annuelles par Compteur</CardTitle>
                        <CardDescription>
                            Aperçu {displayMode === 'cost' ? 'des coûts' : 'de la consommation'} pour les compteurs sélectionnés en {selectedYear}.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                            <Button variant={displayMode === 'cost' ? "secondary" : "ghost"} size="sm" onClick={() => setDisplayMode('cost')}>Coût (TND)</Button>
                            <Button variant={displayMode === 'consumption' ? "secondary" : "ghost"} size="sm" onClick={() => setDisplayMode('consumption')}>Conso. (kWh)</Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-[180px]">
                                    <ListFilter className="mr-2 h-4 w-4" /> 
                                    {selectedMeters.length > 0 ? `${selectedMeters.length} Compteur(s)` : "Filtrer Compteurs"}
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-80 overflow-y-auto">
                                {meters.map(meter => (
                                    <DropdownMenuCheckboxItem
                                        key={meter.id}
                                        checked={selectedMeters.includes(meter.id)}
                                        onCheckedChange={() => handleMeterSelection(meter.id)}
                                    >
                                        {meter.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={annualChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <Tooltip formatter={(value: number) => displayMode === 'cost' ? formatCurrency(value) : formatKWh(value)} contentStyle={{ backgroundColor: 'transparent', border: 'none' }} />
                        <Legend />
                        {selectedMeters.map((meterId, index) => (
                            <Line 
                                key={meterId} 
                                type="monotone" 
                                dataKey={meterId} 
                                name={meterId} 
                                stroke={meterColors[index % meterColors.length]} 
                            />
                        ))}
                        {selectedMeters.length === 0 && (
                             <Line type="monotone" dataKey="total" name="Total" stroke="#8884d8" strokeWidth={2} />
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
                        <CardDescription>Analyse détaillée des factures par district et type de tension.</CardDescription>
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
                         <Select value={recapTension} onValueChange={(v) => setRecapTension(v as any)}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes Tensions</SelectItem>
                                <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                                <SelectItem value="Moyen Tension Forfaitaire">MT - Forfaitaire</SelectItem>
                                <SelectItem value="Moyen Tension Tranche Horaire">MT - Tranche Horaire</SelectItem>
                            </SelectContent>
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

    

    