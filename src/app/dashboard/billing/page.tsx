
"use client";

import { useState, useMemo } from "react";
import { File, FileText, PlusCircle, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MeterTable } from "@/components/meter-table"; 
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnomaliesStore } from "@/hooks/use-anomalies-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import type { Meter } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BillingPage() {
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [tensionFilter, setTensionFilter] = useState<"all" | "Basse Tension" | "Moyenne Tension">("all");
  const { anomalies, markAsRead } = useAnomaliesStore();

  const unreadAnomalies = anomalies.filter(a => !a.isRead);

  const getAssociationName = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return "N/A";

    const associatedEquipment = equipment.filter(e => e.compteurId === meter.id);
    if (associatedEquipment.length > 0) {
      return associatedEquipment.map(e => e.name).join(', ');
    }

    if (meter.buildingId) {
        const building = buildings.find(b => b.id === meter.buildingId);
        return building?.name || "Bâtiment Inconnu";
    }

    return "Non Associé";
  }

  const meterBillingData = useMemo(() => meters
    .filter(meter => meter.status !== 'Résilié' && meter.referenceFacteur)
    .map(meter => {
        return {
            ...meter,
            associationName: getAssociationName(meter.id),
            districtSteg: meter.districtSteg || "Non spécifié",
        }
    }), [meters, buildings, equipment]);
  
  const districts = useMemo(() => {
    const uniqueDistricts = new Set(meterBillingData.map(m => m.districtSteg));
    return Array.from(uniqueDistricts);
  }, [meterBillingData]);

  const filteredMeters = useMemo(() => {
    return meterBillingData.filter(item => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            item.id.toLowerCase().includes(query) ||
            item.associationName.toLowerCase().includes(query) ||
            (item.referenceFacteur && item.referenceFacteur.toLowerCase().includes(query)) ||
            (item.districtSteg && item.districtSteg.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query));

        const matchesTension = tensionFilter === 'all' || item.typeTension === tensionFilter;
        
        return matchesSearch && matchesTension;
    });
  }, [searchTerm, tensionFilter, meterBillingData]);
  
  const getMetersByDistrict = (district: string) => {
    return filteredMeters.filter(m => m.districtSteg === district);
  }

  const handleExport = (district: string) => {
    const dataToExport = getMetersByDistrict(district).map(item => ({
        "Réf. Facteur": item.referenceFacteur,
        "N° Compteur": item.id,
        "Type de Tension": item.typeTension,
        "District STEG": item.districtSteg,
        "Associé à": item.associationName,
        "Description": item.description,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Facturation ${district}`);
    XLSX.writeFile(workbook, `facturation_compteurs_${district.toLowerCase().replace(/ /g, '_')}.xlsx`);
  };

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-4">
        {unreadAnomalies.length > 0 && (
            <Alert variant="destructive">
                <Bell className="h-4 w-4" />
                <AlertTitle>Anomalies de Facturation Détectées!</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                    {unreadAnomalies.map(anomaly => (
                        <li key={anomaly.id} className="flex justify-between items-center">
                            <span>
                                {anomaly.message}
                                <Link href={`/dashboard/billing/${anomaly.meterId}`} className="ml-2 text-xs font-semibold underline">Voir Compteur</Link>
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(anomaly.id)}><Check className="mr-2 h-4 w-4" /> Marquer comme lu</Button>
                        </li>
                    ))}
                    </ul>
                </AlertDescription>
            </Alert>
        )}
        
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Suivi des Factures par District</CardTitle>
                        <CardDescription>Consultez les compteurs avec référence de facturation pour chaque district.</CardDescription>
                    </div>
                     <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher compteur..."
                                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={tensionFilter} onValueChange={(value) => setTensionFilter(value as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrer par tension" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes tensions</SelectItem>
                                <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                                <SelectItem value="Moyenne Tension">Moyenne Tension</SelectItem>
                            </SelectContent>
                        </Select>
                        {user.role === 'Financier' && (
                            <>
                            <Button size="sm" variant="outline" className="h-9 gap-1" asChild>
                                <Link href="/dashboard/billing/settings">
                                    <Settings className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Paramètres</span>
                                </Link>
                            </Button>
                            <Button size="sm" className="h-9 gap-1" asChild>
                                <Link href="/dashboard/billing/add-reference">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Ajouter Réf.</span>
                                </Link>
                            </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
        </Card>

        {meterBillingData.length === 0 ? (
             <Card>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-6 text-xl font-semibold">Aucun compteur à facturer</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Assurez-vous que les compteurs ont une référence de facturation pour les voir ici.</p>
                        {user.role === 'Financier' && (
                            <div className="mt-6 w-full max-w-sm">
                                <Button className="w-full" asChild>
                                    <Link href="/dashboard/billing/add-reference">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Référence
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {districts.map(district => {
                    const districtMeters = getMetersByDistrict(district);
                    if (districtMeters.length === 0 && (searchTerm || tensionFilter !== 'all')) return null;

                    return (
                        <Card key={district}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{district}</CardTitle>
                                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleExport(district)}>
                                        <File className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exporter</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <MeterTable meters={districtMeters} />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )}
    </div>
    </TooltipProvider>
  );
}
