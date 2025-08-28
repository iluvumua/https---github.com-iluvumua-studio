
"use client";

import { useState, useMemo } from "react";
import { File, FileText, PlusCircle, Search, ChevronRight, Info, Replace, Bell, Check, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBillingStore } from "@/hooks/use-billing-store";
import Link from "next/link";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAnomaliesStore } from "@/hooks/use-anomalies-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Meter } from "@/lib/types";

const MeterTable = ({ meters }: { meters: (Meter & { associationName: string })[] }) => {
    if (meters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucun compteur à facturer</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Aucun compteur avec une référence de facturation n'a été trouvé dans ce district.
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Réf. Facteur</TableHead>
                <TableHead>N° Compteur</TableHead>
                <TableHead>Type de Tension</TableHead>
                <TableHead>District STEG</TableHead>
                <TableHead>Associé à</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {meters.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.referenceFacteur}</TableCell>
                    <TableCell className="font-mono">{item.id}</TableCell>
                    <TableCell>
                    <Badge variant={item.typeTension === "Moyenne Tension" ? "secondary" : "outline"}>
                        {item.typeTension}
                    </Badge>
                    </TableCell>
                    <TableCell>{item.districtSteg}</TableCell>
                    <TableCell className="font-medium">{item.associationName}</TableCell>
                    <TableCell>
                        <div className="flex items-center justify-end gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {item.description && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Info className="mr-2 h-4 w-4" />
                                                Détails
                                            </DropdownMenuItem>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <p className="text-sm">{item.description}</p>
                                        </PopoverContent>
                                    </Popover>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/billing/${item.id}`}>
                                            <ChevronRight className="mr-2 h-4 w-4" />
                                            Voir Factures
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


export default function BillingPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
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

  const meterBillingData = meters
    .filter(meter => meter.status !== 'Résilié' && meter.referenceFacteur)
    .map(meter => {
        return {
            ...meter,
            associationName: getAssociationName(meter.id),
            districtSteg: meter.districtSteg || "Non spécifié",
        }
    });
  
  const districts = useMemo(() => {
    const uniqueDistricts = new Set(meterBillingData.map(m => m.districtSteg));
    return ['Tous', ...Array.from(uniqueDistricts)];
  }, [meterBillingData]);

  const getFilteredData = (district: string) => {
     return meterBillingData.filter(item => {
      const query = searchTerm.toLowerCase();
      
      const matchesDistrict = district === 'Tous' || item.districtSteg === district;
      
      const matchesSearch = (
        item.id.toLowerCase().includes(query) ||
        item.associationName.toLowerCase().includes(query) ||
        (item.referenceFacteur && item.referenceFacteur.toLowerCase().includes(query)) ||
        (item.districtSteg && item.districtSteg.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );

      return matchesDistrict && matchesSearch;
    });
  }

  const handleExport = (district: string) => {
    const dataToExport = getFilteredData(district).map(item => ({
        "Réf. Facteur": item.referenceFacteur,
        "N° Compteur": item.id,
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
    
    <Tabs defaultValue="Tous">
         <div className="flex items-center mb-4">
             <TabsList>
                {districts.map(district => (
                    <TabsTrigger key={district} value={district}>{district}</TabsTrigger>
                ))}
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher compteur..."
                        className="pl-8 sm:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 {user.role === 'Financier' && (
                    <>
                    <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                         <Link href="/dashboard/billing/settings">
                            <Settings className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Paramètres
                            </span>
                        </Link>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/billing/add-reference">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Ajouter Référence
                            </span>
                        </Link>
                    </Button>
                    </>
                )}
            </div>
        </div>

        {districts.map(district => (
            <TabsContent key={district} value={district}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Suivi des Factures - {district}</CardTitle>
                                <CardDescription>
                                    Consultez les compteurs avec référence de facturation pour ce district.
                                </CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleExport(district)}>
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Exporter
                                </span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <MeterTable meters={getFilteredData(district)} />
                    </CardContent>
                </Card>
            </TabsContent>
        ))}

        {meterBillingData.length === 0 && (
             <Card>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-6 text-xl font-semibold">Aucun compteur à facturer</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Assurez-vous que les compteurs ont une référence de facturation pour les voir ici.
                        </p>
                        <div className="mt-6 w-full max-w-sm">
                        {user.role === 'Financier' && (
                                <Button className="w-full" asChild>
                                    <Link href="/dashboard/billing/add-reference">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Référence
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
    </Tabs>
    </div>
    </TooltipProvider>
  );
}

    