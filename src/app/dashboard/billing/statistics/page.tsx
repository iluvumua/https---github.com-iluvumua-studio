
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

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
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
            
            const facturesDiscordance = facturesSaisie.filter(b => !b.convenableSTEG);
            const montantDiscordance = facturesDiscordance.reduce((sum, bill) => sum + Math.abs((bill.montantSTEG ?? 0) - (bill.amount ?? 0)), 0);
            
            const facturesVerifiees = facturesSaisie.filter(b => b.convenableSTEG);
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
    const yearBills = bills.filter(bill => bill.month.endsWith(selectedYear));
    const monthlyData: { [key: string]: { [key: string]: number } } = {};

    monthNames.forEach(month => {
        monthlyData[month] = { total: 0, "MSAN & GSM": 0, "Équipements MT": 0, "Bâtiments Seuls": 0 };
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
                monthlyData[monthName]["MSAN & GSM"] += bill.amount;
            }
            if (equipmentMetersMT.has(bill.meterId)) {
                monthlyData[monthName]["Équipements MT"] += bill.amount;
            }
            if (buildingOnlyMeters.has(bill.meterId)) {
                monthlyData[monthName]["Bâtiments Seuls"] += bill.amount;
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
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={annualChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                        <Line type="monotone" dataKey="MSAN & GSM" stroke="#82ca9d" name="MSAN & GSM" />
                        <Line type="monotone" dataKey="Équipements MT" stroke="#ffc658" name="Équipements MT" />
                        <Line type="monotone" dataKey="Bâtiments Seuls" stroke="#ff8042" name="Bâtiments Seuls" />
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

    