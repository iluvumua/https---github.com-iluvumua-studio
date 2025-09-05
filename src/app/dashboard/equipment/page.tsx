

"use client";

import React, { useMemo, useState } from "react";
import { File, Pencil, CheckSquare, MapPin, Search, Gauge, ChevronDown, ChevronRight, PlusCircle as PlusCircleIcon, TrendingUp, Calculator, Network, PlusCircle, Trash2, MoreHorizontal, History, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { cn } from "@/lib/utils";
import type { Equipment, Meter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import { locationsData } from "@/lib/locations";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { Separator } from "@/components/ui/separator";
import { ResiliationDialog } from "@/components/resiliation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ImporterButton } from "@/components/importer-button";

const indoorEquipmentTypes = ['MSI', 'EXC', 'OLT'];

const EquipmentTableRow = ({ item, openRow, setOpenRow }: { item: Equipment, openRow: string | null, setOpenRow: (id: string | null) => void }) => {
    const { meters } = useMetersStore();
    const { bills } = useBillingStore();
    const { buildings } = useBuildingsStore();
    const { user } = useUser();

    const canResiliate = user.role === 'Responsable Énergie et Environnement';

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return format(new Date(dateString), "dd/MM/yyyy");
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
    }
    
    const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    
    const getLocationLabel = (abbreviation?: string) => {
        if (!abbreviation) return "N/A";
        const location = locationsData.find(l => l.abbreviation === abbreviation);
        return location?.localite || abbreviation;
    }

    const associatedMeter = meters.find(m => m.id === item.compteurId);
    const isExpanded = openRow === item.id;
    const isIndoor = item.buildingId && indoorEquipmentTypes.includes(item.type);
    const associatedBuilding = buildings.find(b => b.id === item.buildingId);
    
    const equipmentMetrics = useMemo(() => {
    if (!associatedMeter) return { averageCost: null, averageConsumption: null };
    
    const meterBills = bills.filter(b => b.meterId === associatedMeter.id);
    const annualBills = meterBills
        .filter(b => b.nombreMois && b.nombreMois >= 12)
        .sort((a, b) => b.id.localeCompare(a.id));

    if (annualBills.length > 0) {
        const latestAnnualBill = annualBills[0];
        const averageCost = latestAnnualBill.amount / latestAnnualBill.nombreMois;
        const averageConsumption = latestAnnualBill.consumptionKWh / latestAnnualBill.nombreMois;
        return { averageCost, averageConsumption };
    }
    return { averageCost: null, averageConsumption: null };
    }, [associatedMeter, bills]);

    const renderMeterIndex = (meter: Meter) => {
        if (meter.typeTension === 'Basse Tension' || meter.typeTension === 'Moyen Tension Forfaitaire') {
            return <div><span className="font-medium text-muted-foreground">Index Départ:</span> {meter.indexDepart ?? 'N/A'}</div>;
        }
        if (meter.typeTension === 'Moyen Tension Tranche Horaire') {
            return (
                <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">Index de Départ:</span>
                    <div className="grid grid-cols-2 text-xs pl-2">
                        <span>Jour: {meter.indexDepartJour ?? 'N/A'}</span>
                        <span>Pointe: {meter.indexDepartPointe ?? 'N/A'}</span>
                        <span>Soir: {meter.indexDepartSoir ?? 'N/A'}</span>
                        <span>Nuit: {meter.indexDepartNuit ?? 'N/A'}</span>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <React.Fragment>
            <TableRow>
                <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setOpenRow(isExpanded ? null : item.id)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                </TableCell>
                <TableCell className="font-medium truncate whitespace-nowrap">{item.name}</TableCell>
                <TableCell>
                <Badge variant="outline" className={cn(
                    "whitespace-nowrap",
                    item.status === 'En service' && 'text-green-500 border-green-500/50 bg-green-500/10',
                    item.status === 'switched off' && 'text-red-500 border-red-500/50 bg-red-500/10',
                    item.status === 'En cours' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                    item.status === 'switched off en cours' && 'text-orange-500 border-orange-500/50 bg-orange-500/10'
                )}>{item.status}</Badge>
                </TableCell>
                <TableCell className="truncate whitespace-nowrap">{item.type}</TableCell>
                <TableCell className="truncate whitespace-nowrap">{item.fournisseur}</TableCell>
                <TableCell>{formatShortDate(item.dateMiseEnService)}</TableCell>
                <TableCell>
                    <div className="flex items-center justify-end gap-1">
                        {canResiliate && (
                            <ResiliationDialog item={item} itemType="equipment" />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {item.status === 'En cours' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/equipment/${item.id}/new-meter`}>
                                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                                            mise a jour equipement
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {item.coordX && item.coordY && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`https://www.openstreetmap.org/?mlat=${item.coordY}&mlon=${item.coordX}#map=18/${item.coordY}/${item.coordX}`} target="_blank">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Voir sur la carte
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {item.compteurId && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/meters?search=${item.compteurId}`}>
                                            <Gauge className="mr-2 h-4 w-4" />
                                            Voir Compteur
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/equipment/${item.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                </DropdownMenuItem>
                                {item.status === 'switched off' && item.associationHistory && item.associationHistory.length > 0 && (
                                     <Popover>
                                        <PopoverTrigger asChild>
                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <History className="mr-2 h-4 w-4" />
                                                Historique
                                            </DropdownMenuItem>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm">Historique d'Association</h4>
                                                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                                    {item.associationHistory.map((entry, idx) => (
                                                        <li key={idx}>{entry}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow>
                <TableCell colSpan={7} className="p-0">
                    <div className="p-4 bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Informations sur l'Équipement</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="col-span-2"><span className="font-medium text-muted-foreground">Désignation:</span> {item.designation || 'N/A'}</div>
                        <div className="col-span-2"><span className="font-medium text-muted-foreground">Châssis:</span> {item.typeChassis}</div>
                        <div className="col-span-2"><span className="font-medium text-muted-foreground">Description:</span> {item.description || 'N/A'}</div>
                        <div><span className="font-medium text-muted-foreground">Dernière MAJ Équip.:</span> {formatShortDate(item.lastUpdate)}</div>
                        {item.verifiedBy && <div><span className="font-medium text-muted-foreground">Vérifié par:</span> {item.verifiedBy}</div>}
                        {item.dateDemandeResiliation && <div><span className="font-medium text-muted-foreground">Demande Résil.:</span> {formatShortDate(item.dateDemandeResiliation)}</div>}
                        {item.dateResiliationEquipement && <div><span className="font-medium text-muted-foreground">Date Résil. Équipement:</span> {formatShortDate(item.dateResiliationEquipement)}</div>}
                        </div>
                        {isIndoor && associatedBuilding && (
                            <>
                            <Separator className="my-2" />
                            <h5 className="font-semibold text-sm">Informations sur le Bâtiment</h5>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div className="col-span-2"><span className="font-medium text-muted-foreground">Nom:</span> {associatedBuilding.name} ({associatedBuilding.code})</div>
                                    <div className="col-span-2"><span className="font-medium text-muted-foreground">Adresse:</span> {associatedBuilding.address}</div>
                                </div>
                            </>
                        )}
                        <Separator className="my-2" />
                        <h5 className="font-semibold text-sm">Coordonnées & Localisation</h5>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div><span className="font-medium text-muted-foreground">Localisation:</span> {getLocationLabel(item.location)}</div>
                            {item.coordX && item.coordY && <div><span className="font-medium text-muted-foreground">Coords:</span> {item.coordY}, {item.coordX}</div>}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Informations sur le Compteur Associé</h4>
                        {associatedMeter ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                                <span className="font-medium text-muted-foreground">N° Compteur: </span>
                                <span className="font-mono">{associatedMeter.id}</span>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">N° Police: </span>
                                <span className="font-mono">{associatedMeter.policeNumber}</span>
                            </div>
                            <div><span className="font-medium text-muted-foreground">Type:</span> {associatedMeter.typeTension}</div>
                            <div><span className="font-medium text-muted-foreground">État:</span> {associatedMeter.status}</div>
                            <div><span className="font-medium text-muted-foreground">Date M.E.S:</span> {formatShortDate(associatedMeter.dateMiseEnService)}</div>
                            <div><span className="font-medium text-muted-foreground">Dernière MAJ Compteur:</span> {formatShortDate(associatedMeter.lastUpdate)}</div>
                            {renderMeterIndex(associatedMeter)}
                            <div className="font-medium"><span className="text-muted-foreground">Coût Mensuel Moy:</span> {equipmentMetrics.averageCost !== null ? formatCurrency(equipmentMetrics.averageCost) : 'N/A'}</div>
                            <div className="font-medium"><span className="font-medium text-muted-foreground">Conso. Mensuelle Moy:</span> {equipmentMetrics.averageConsumption !== null ? `${formatKWh(equipmentMetrics.averageConsumption)} kWh` : 'N/A'}</div>
                            <div className="col-span-2"><span className="font-medium text-muted-foreground">Description:</span> {associatedMeter.description || 'N/A'}</div>
                            <div className="col-span-full mt-2">
                            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                <Link href={`/dashboard/billing/${associatedMeter.id}`}>
                                Voir toutes les factures de ce compteur
                                </Link>
                            </Button>
                            </div>
                        </div>
                        ) : (
                        <div className="text-center text-muted-foreground text-sm py-4">
                            Aucun compteur n'est associé à cet équipement.
                        </div>
                        )}
                    </div>
                    </div>
                </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}

const EquipmentTable = ({ equipment, openRow, setOpenRow }: { equipment: Equipment[], openRow: string | null, setOpenRow: (id: string | null) => void }) => {
    if (equipment.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Network className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucun équipement trouvé</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Aucun équipement ne correspond à ce filtre.
                </p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-1/4">Nom_MSAN</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Date Mise en Service Équip.</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {equipment.map((item) => (
                    <EquipmentTableRow key={item.id} item={item} openRow={openRow} setOpenRow={setOpenRow} />
                ))}
            </TableBody>
        </Table>
    )
}

const equipmentTypes = ["BTS", "MSI", "MSN", "EXC", "OLT"];

export default function EquipmentPage() {
    const { equipment } = useEquipmentStore();
    const { meters } = useMetersStore();
    const [activeStatusTab, setActiveStatusTab] = useState("all");
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [openRow, setOpenRow] = useState<string | null>(null);

    const getFilteredEquipment = (status: string) => {
        return equipment.filter(item => {
            const query = searchTerm.toLowerCase();
            
            // Find associated meter
            const associatedMeter = meters.find(m => m.id === item.compteurId);

            const matchesSearch = 
                item.name.toLowerCase().includes(query) || 
                item.type.toLowerCase().includes(query) || 
                (item.designation && item.designation.toLowerCase().includes(query)) ||
                (item.fournisseur && item.fournisseur.toLowerCase().includes(query)) ||
                (item.compteurId && item.compteurId.toLowerCase().includes(query)) ||
                (associatedMeter && associatedMeter.description && associatedMeter.description.toLowerCase().includes(query)) ||
                (associatedMeter && associatedMeter.typeTension.toLowerCase().includes(query)) ||
                (associatedMeter && associatedMeter.policeNumber && associatedMeter.policeNumber.toLowerCase().includes(query));

            if (!matchesSearch) return false;
            
            if (status === 'all') return true;

            const statusMap: { [key: string]: Equipment['status'] } = {
                'en_cours': 'En cours',
                'en_service': 'En service',
                'switched_off_en_cours': 'switched off en cours',
                'switched_off': 'switched off',
            };

            const statusToFilter = statusMap[status];

            if (statusToFilter) {
                return item.status === statusToFilter;
            }

            return false;
        });
    }
    
    const filteredEquipment = getFilteredEquipment(activeStatusTab);

    const handleExport = () => {
        const dataToExport = filteredEquipment.map(item => ({
            "Nom_MSAN": item.name,
            "État": item.status,
            "Type": item.type,
            "Fournisseur": item.fournisseur,
            "Date Mise en Service": item.dateMiseEnService ? format(new Date(item.dateMiseEnService), "dd/MM/yyyy") : 'N/A',
            "ID Compteur": item.compteurId || 'N/A',
        }));
        const worksheet = XLSX.utils.sheet_to_json(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Équipements");
        XLSX.writeFile(workbook, `equipements_${activeStatusTab}.xlsx`);
    };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
    <Tabs defaultValue="all" value={activeStatusTab} onValueChange={setActiveStatusTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Tous les États</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="en_service">En service</TabsTrigger>
          <TabsTrigger value="switched_off_en_cours">Switched Off En Cours</TabsTrigger>
          <TabsTrigger value="switched_off">Switched Off</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8 sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
            {user.role === 'Etude et Planification' && (
                <Button size="sm" className="h-8 gap-1" asChild>
                    <Link href="/dashboard/equipment/new">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Ajouter Équipement
                        </span>
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Gestion des équipement</CardTitle>
            <CardDescription>
              Gérer et suivre tous les équipements réseau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EquipmentTable equipment={filteredEquipment} openRow={openRow} setOpenRow={setOpenRow} />
          </CardContent>
        </Card>
    </Tabs>
    </div>
  );
}





