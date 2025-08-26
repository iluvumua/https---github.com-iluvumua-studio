
"use client";

import React, { useMemo, useState } from "react";
import { File, Pencil, CheckSquare, MapPin, Search, Gauge, ChevronDown, ChevronRight, PlusCircle as PlusCircleIcon, TrendingUp, Calculator, Network, PlusCircle, Trash2, MoreHorizontal } from "lucide-react";
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
import type { Equipment } from "@/lib/types";
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

const indoorEquipmentTypes = ['MSI', 'EXC', 'OLT'];

const EquipmentTable = ({ equipment, openRow, setOpenRow }: { equipment: Equipment[], openRow: string | null, setOpenRow: (id: string | null) => void }) => {
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
    
    const getLocationLabel = (abbreviation?: string) => {
        if (!abbreviation) return "N/A";
        const location = locationsData.find(l => l.abbreviation === abbreviation);
        return location?.localite || abbreviation;
    }

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
            {equipment.map((item) => {
                const associatedMeter = meters.find(m => m.id === item.compteurId);
                const isExpanded = openRow === item.id;
                const isIndoor = item.buildingId && indoorEquipmentTypes.includes(item.type);
                const associatedBuilding = buildings.find(b => b.id === item.buildingId);
                
                const equipmentAverageCost = useMemo(() => {
                if (!associatedMeter) return null;
                
                const meterBills = bills.filter(b => b.meterId === associatedMeter.id);
                const annualBills = meterBills
                    .filter(b => b.nombreMois && b.nombreMois >= 12)
                    .sort((a, b) => b.id.localeCompare(a, b));

                if (annualBills.length > 0) {
                    const latestAnnualBill = annualBills[0];
                    return latestAnnualBill.amount / latestAnnualBill.nombreMois;
                }
                return null;
                }, [associatedMeter, bills]);

                return (
                <React.Fragment key={item.id}>
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
                            item.status === 'Résilié' && 'text-red-500 border-red-500/50 bg-red-500/10',
                            item.status === 'En cours' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                            item.status === 'En cours de résiliation' && 'text-orange-500 border-orange-500/50 bg-orange-500/10'
                        )}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="truncate whitespace-nowrap">{item.type}</TableCell>
                        <TableCell className="truncate whitespace-nowrap">{item.fournisseur}</TableCell>
                        <TableCell>{formatShortDate(item.dateMiseEnService)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
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
                                                    Ajouter Compteur
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
                                        {canResiliate && (
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                <ResiliationDialog item={item} itemType="equipment" />
                                            </DropdownMenuItem>
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
                                    <div><span className="font-medium text-muted-foreground">N° Compteur:</span> <span className="font-mono">{associatedMeter.id}</span></div>
                                    <div><span className="font-medium text-muted-foreground">N° Police:</span> <span className="font-mono">{associatedMeter.policeNumber}</span></div>
                                    <div><span className="font-medium text-muted-foreground">Type:</span> {associatedMeter.typeTension}</div>
                                    <div><span className="font-medium text-muted-foreground">État:</span> {associatedMeter.status}</div>
                                    <div><span className="font-medium text-muted-foreground">Date M.E.S:</span> {formatShortDate(associatedMeter.dateMiseEnService)}</div>
                                    <div><span className="font-medium text-muted-foreground">Dernière MAJ Compteur:</span> {formatShortDate(associatedMeter.lastUpdate)}</div>
                                    <div className="col-span-2 font-medium"><span className="text-muted-foreground">Coût Mensuel Moyen:</span> {equipmentAverageCost !== null ? formatCurrency(equipmentAverageCost) : 'N/A'}</div>
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
                )
            })}
            </TableBody>
        </Table>
    )
}

export default function EquipmentPage() {
    const { equipment } = useEquipmentStore();
    const [activeTab, setActiveTab] = useState("all");
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [openRow, setOpenRow] = useState<string | null>(null);

    const getFilteredEquipment = (status?: Equipment['status'] | 'all') => {
        return equipment.filter(item => {
            const query = searchTerm.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query) || (item.designation && item.designation.toLowerCase().includes(query));

            if (!matchesSearch) return false;
            if (status === 'all') return true;

            return item.status === status;
        });
    }

    const handleExport = () => {
        const dataToExport = getFilteredEquipment(activeTab as any).map(item => ({
            "Nom_MSAN": item.name,
            "État": item.status,
            "Type": item.type,
            "Fournisseur": item.fournisseur,
            "Date Mise en Service": item.dateMiseEnService ? format(new Date(item.dateMiseEnService), "dd/MM/yyyy") : 'N/A',
            "ID Compteur": item.compteurId || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Équipements");
        XLSX.writeFile(workbook, `equipements_${activeTab}.xlsx`);
    };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="en_service">En service</TabsTrigger>
          <TabsTrigger value="en_cours_resiliation">En cours de résiliation</TabsTrigger>
          <TabsTrigger value="resilie">Résilié</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher équipement..."
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
            {user.role === 'Technicien' && (
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
            <TabsContent value="all">
                <EquipmentTable equipment={getFilteredEquipment('all')} openRow={openRow} setOpenRow={setOpenRow} />
            </TabsContent>
            <TabsContent value="en_cours">
                 <EquipmentTable equipment={getFilteredEquipment('En cours')} openRow={openRow} setOpenRow={setOpenRow} />
            </TabsContent>
            <TabsContent value="en_service">
                 <EquipmentTable equipment={getFilteredEquipment('En service')} openRow={openRow} setOpenRow={setOpenRow} />
            </TabsContent>
            <TabsContent value="en_cours_resiliation">
                 <EquipmentTable equipment={getFilteredEquipment('En cours de résiliation')} openRow={openRow} setOpenRow={setOpenRow} />
            </TabsContent>
            <TabsContent value="resilie">
                 <EquipmentTable equipment={getFilteredEquipment('Résilié')} openRow={openRow} setOpenRow={setOpenRow} />
            </TabsContent>
          </CardContent>
        </Card>
    </Tabs>
    </div>
  );
}
