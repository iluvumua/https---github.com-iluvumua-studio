

"use client";

import { Building, HardDrive, Pencil, Gauge, Search, PlusCircle, Info, Trash2, MoreHorizontal, History, AlertCircle, FileText } from "lucide-react";
import React, { Suspense, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useMetersStore } from "@/hooks/use-meters-store";
import { cn } from "@/lib/utils";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Meter } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useUser } from "@/hooks/use-user";
import { ResiliationDialog } from "@/components/resiliation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBillingStore } from "@/hooks/use-billing-store";

function MetersPageComponent() {
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { bills } = useBillingStore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || "";
  const { user } = useUser();
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState("all");
  const [alertFilter, setAlertFilter] = useState<'all' | 'alert' | 'no_alert'>('all');
  const [refFilter, setRefFilter] = useState<'all' | 'withRefNoBill' | 'noRef'>('all');


  const canResiliate = user.role === 'Responsable Énergie et Environnement';

  const getAssociationName = (meter: (typeof meters)[0]) => {
     if (meter.buildingId) {
      const building = buildings.find(b => b.id === meter.buildingId);
      return building?.name || `Bâtiment ID: ${meter.buildingId}`;
    }
    
    const associatedEquipment = equipment.filter(e => e.compteurId === meter.id);
    if (associatedEquipment.length > 0) {
      return associatedEquipment.map(e => e.name).join(', ');
    }
    
    return "Non Associé";
  }
  
   const formatShortDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  }
  
  const metersWithAlerts = useMemo(() => {
    return meters.map(meter => {
      const associatedEquipment = equipment.filter(e => e.compteurId === meter.id);
      const hasSwitchedOffEquipment = meter.status !== 'switched off' && associatedEquipment.some(e => e.status === 'switched off');
      return { ...meter, hasSwitchedOffEquipment };
    });
  }, [meters, equipment]);
  
  const alertCount = useMemo(() => {
    return metersWithAlerts.filter(m => m.hasSwitchedOffEquipment).length;
  }, [metersWithAlerts]);


  const filteredMeters = useMemo(() => {
    let results = metersWithAlerts;

    const statusMap: { [key: string]: Meter['status'] } = {
      'en_cours': 'En cours',
      'en_service': 'En service',
      'switched_off_en_cours': 'switched off en cours',
      'switched_off': 'switched off',
    };
    
    // Status filter from tabs
    if (activeTab !== 'all') {
      const statusToFilter = statusMap[activeTab];
      if (statusToFilter) {
        results = results.filter(meter => meter.status === statusToFilter);
      }
    }
    
    // Alert filter
    if (alertFilter === 'alert') {
        results = results.filter(meter => meter.hasSwitchedOffEquipment);
    } else if (alertFilter === 'no_alert') {
        results = results.filter(meter => !meter.hasSwitchedOffEquipment);
    }
    
    // Reference filter
    if (refFilter === 'withRefNoBill') {
        results = results.filter(meter => meter.referenceFacteur && !bills.some(b => b.meterId === meter.id));
    } else if (refFilter === 'noRef') {
        results = results.filter(meter => !meter.referenceFacteur);
    }

    // Search filter
    const query = searchTerm.toLowerCase();
    if (query) {
      results = results.filter(meter => {
        return (
          (meter.id && meter.id.toLowerCase().includes(query)) ||
          getAssociationName(meter).toLowerCase().includes(query) || 
          (meter.policeNumber || '').toLowerCase().includes(query) ||
          (meter.description || '').toLowerCase().includes(query)
        );
      });
    }

    return results;
  }, [metersWithAlerts, activeTab, alertFilter, refFilter, searchTerm, buildings, equipment, bills]);


  const getTensionBadgeVariant = (tension: Meter['typeTension']) => {
    if (tension === 'Basse Tension') return 'outline';
    if (tension === 'Moyen Tension Forfaitaire') return 'secondary';
    if (tension === 'Moyen Tension Tranche Horaire') return 'default';
    return 'secondary';
  }

  const getTensionDisplayName = (tension: Meter['typeTension']) => {
    if (tension === 'Moyen Tension Forfaitaire') return 'MT Forfait';
    if (tension === 'Moyen Tension Tranche Horaire') return 'MT Horaire';
    return tension;
  }

  return (
    <TooltipProvider>
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex flex-col md:flex-row items-start md:items-center mb-4 gap-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="en_service">En service</TabsTrigger>
          <TabsTrigger value="switched_off_en_cours">Switched Off En Cours</TabsTrigger>
          <TabsTrigger value="switched_off">Switched Off</TabsTrigger>
        </TabsList>
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
             <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher compteur..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={alertFilter} onValueChange={(value) => setAlertFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par alerte" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes alertes</SelectItem>
                    <SelectItem value="alert">Avec Alerte</SelectItem>
                    <SelectItem value="no_alert">Sans Alerte</SelectItem>
                </SelectContent>
            </Select>
            <Select value={refFilter} onValueChange={(value) => setRefFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filtrer par référence" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes références</SelectItem>
                    <SelectItem value="withRefNoBill">Avec Réf. Sans Facture</SelectItem>
                    <SelectItem value="noRef">Sans Réf.</SelectItem>
                </SelectContent>
            </Select>
          </div>
      </div>
      <TabsContent value={activeTab}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Gestion des Compteurs</CardTitle>
                {alertCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {alertCount} {alertCount > 1 ? 'Compteurs' : 'Compteur'} avec alerte
                    </Badge>
                )}
            </div>
            <CardDescription>
              Suivez et gérez tous les compteurs d'énergie STEG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMeters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Gauge className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-6 text-xl font-semibold">Aucun compteur trouvé</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Essayez un autre terme de recherche ou ajoutez un nouveau compteur.
                    </p>
                    <div className="mt-6 w-full max-w-sm">
                        <Button className="w-full" asChild>
                            <Link href="/dashboard/equipment/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Équipement
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Compteur STEG</TableHead>
                  <TableHead>N° Police</TableHead>
                  <TableHead>Associé à</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type de Tension</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Dernière MAJ</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeters.map((meter, index) => (
                    <TableRow key={meter.id || `meter-${index}`}>
                        <TableCell className="font-mono">
                           <div className="flex items-center gap-2">
                             <span>{meter.id}</span>
                             {meter.hasSwitchedOffEquipment && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Ce compteur est associé à un équipement "switched off".</p>
                                    </TooltipContent>
                                </Tooltip>
                             )}
                           </div>
                        </TableCell>
                        <TableCell className="font-mono">{meter.policeNumber}</TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate">{getAssociationName(meter)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{meter.description}</TableCell>
                        <TableCell>
                        <Badge variant={getTensionBadgeVariant(meter.typeTension)}>
                           {getTensionDisplayName(meter.typeTension)}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant="outline"
                            className={cn(
                                "whitespace-nowrap",
                                meter.status === 'En service' && 'text-green-500 border-green-500/50 bg-green-500/10',
                                meter.status === 'switched off' && 'text-red-500 border-red-500/50 bg-red-500/10',
                                meter.status === 'En cours' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                                meter.status === 'switched off en cours' && 'text-orange-500 border-orange-500/50 bg-orange-500/10',
                            )}
                        >
                            {meter.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatShortDate(meter.lastUpdate)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-1">
                                {canResiliate && (
                                    <ResiliationDialog item={meter} itemType="meter" />
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                         <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/billing/${meter.id}`}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Voir Factures
                                            </Link>
                                        </DropdownMenuItem>
                                        {meter.description && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Détails
                                                    </DropdownMenuItem>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <p className="text-sm">{meter.description}</p>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/meters/${meter.id}/edit`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Modifier
                                            </Link>
                                        </DropdownMenuItem>
                                        {meter.status === 'switched off' && meter.associationHistory && meter.associationHistory.length > 0 && (
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
                                                            {meter.associationHistory.map((entry, idx) => (
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
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </TooltipProvider>
  );
}

export default function MetersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MetersPageComponent />
        </Suspense>
    )
}

    
