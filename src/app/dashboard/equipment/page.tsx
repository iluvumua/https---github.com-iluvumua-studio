
"use client";

import React, { useMemo, useState } from "react";
import { File, Pencil, CheckSquare, MapPin, Search, Gauge, ChevronDown, ChevronRight, PlusCircle as PlusCircleIcon, TrendingUp, Calculator } from "lucide-react";
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
import { Network, PlusCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMetersStore } from "@/hooks/use-meters-store";
import { Separator } from "@/components/ui/separator";
import { useBillingStore } from "@/hooks/use-billing-store";
import { locationsData } from "@/lib/locations";

function VerifyEquipmentButton({ equipment }: { equipment: Equipment }) {
    const { user } = useUser();
    const { updateEquipment } = useEquipmentStore();
    const { toast } = useToast();

    if (equipment.status !== 'En cours') {
        return null;
    }

    const handleVerify = () => {
        updateEquipment({ 
            ...equipment, 
            status: 'En cours', // Stays 'En cours' but now verified conceptually
            verifiedBy: user.name,
            lastUpdate: new Date().toISOString().split('T')[0]
        });
        toast({
            title: "Équipement Vérifié",
            description: `${equipment.name} a été vérifié et est prêt pour l'installation.`
        })
    }
    return (
         <Button variant="outline" size="icon" onClick={handleVerify} disabled={!!equipment.verifiedBy}>
            <CheckSquare className="h-4 w-4" />
         </Button>
    )
}


export default function EquipmentPage() {
    const { equipment } = useEquipmentStore();
    const { meters } = useMetersStore();
    const { bills } = useBillingStore();
    const [activeTab, setActiveTab] = useState("all");
    const { toast } = useToast();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [openRow, setOpenRow] = useState<string | null>(null);

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

    const filteredEquipment = equipment.filter(item => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        
        // Map status to tab values
        const statusMap: { [key: string]: Equipment['status'][] } = {
            'en_cours': ['En cours'],
            'en_service': ['En service'],
            'resilie': ['Résilié']
        };
        const statuses = statusMap[activeTab];

        return statuses ? statuses.includes(item.status) : false;
    });

    const handleExport = () => {
        const dataToExport = filteredEquipment.map(item => ({
            "Nom_MSAN": item.name,
            "État": item.status,
            "Type": item.type,
            "Fournisseur": item.fournisseur,
            "Date Mise en Service": item.dateMiseEnService ? formatShortDate(item.dateMiseEnService) : 'N/A',
            "ID Compteur": item.compteurId || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Équipements");
        XLSX.writeFile(workbook, `equipements_${activeTab}.xlsx`);
    };

    const equipmentStatusCounts = useMemo(() => {
        return equipment.reduce((acc, eq) => {
            acc[eq.status] = (acc[eq.status] || 0) + 1;
            return acc;
        }, {} as Record<Equipment['status'], number>);
    }, [equipment]);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="en_service">En service</TabsTrigger>
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
      <TabsContent value={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Gestion des équipement</CardTitle>
            <CardDescription>
              Gérer et suivre tous les équipements réseau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEquipment.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Network className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-6 text-xl font-semibold">Aucun équipement trouvé</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Commencez par importer ou ajouter un nouvel équipement.
                    </p>
                     {user.role === 'Technicien' && (
                        <div className="mt-6 w-full max-w-sm">
                            <Button className="w-full" asChild>
                               <Link href="/dashboard/equipment/new">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Équipement
                               </Link>
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-1/4">Nom_MSAN</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date Mise en Service Équip.</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => {
                  const associatedMeter = meters.find(m => m.id === item.compteurId);
                  const isExpanded = openRow === item.id;
                  
                  const equipmentAverageCost = useMemo(() => {
                    if (!associatedMeter) return null;
                    
                    const meterBills = bills.filter(b => b.meterId === associatedMeter.id);
                    const annualBills = meterBills
                      .filter(b => b.nombreMois && b.nombreMois >= 12)
                      .sort((a, b) => b.id.localeCompare(a.id));

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
                           <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setOpenRow(isExpanded ? null : item.id)}>
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium truncate whitespace-nowrap">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "whitespace-nowrap",
                            item.status === 'En service' && 'text-green-500 border-green-500/50 bg-green-500/10',
                            item.status === 'Résilié' && 'text-red-500 border-red-500/50 bg-red-500/10',
                            item.status === 'En cours' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                          )}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="truncate whitespace-nowrap">{item.type}</TableCell>
                        <TableCell className="truncate whitespace-nowrap">{item.fournisseur}</TableCell>
                        <TableCell>{formatShortDate(item.dateMiseEnService)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.status === 'En cours' && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/equipment/${item.id}/new-meter`}>
                                  <PlusCircleIcon className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {item.coordX && item.coordY && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`https://www.openstreetmap.org/?mlat=${item.coordY}&mlon=${item.coordX}#map=18/${item.coordY}/${item.coordX}`} target="_blank">
                                  <MapPin className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {item.compteurId && (
                              <>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/dashboard/meters?search=${item.compteurId}`}>
                                    <Gauge className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/equipment/${item.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <CollapsibleContent>
                            <div className="p-4 bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Informations sur l'Équipement</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                  <div><span className="font-medium text-muted-foreground">Localisation:</span> {getLocationLabel(item.location)}</div>
                                  <div><span className="font-medium text-muted-foreground">Châssis:</span> {item.typeChassis}</div>
                                  {item.verifiedBy && <div><span className="font-medium text-muted-foreground">Vérifié par:</span> {item.verifiedBy}</div>}
                                  {item.coordX && item.coordY && <div className="col-span-2"><span className="font-medium text-muted-foreground">Coordonnées:</span> {item.coordY}, {item.coordX}</div>}
                                  <div className="col-span-2"><span className="font-medium text-muted-foreground">Désignation:</span> {item.designation || 'N/A'}</div>
                                  <div><span className="font-medium text-muted-foreground">Dernière MAJ Équip.:</span> {formatShortDate(item.lastUpdate)}</div>
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
                            </CollapsibleContent>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  );
}

    