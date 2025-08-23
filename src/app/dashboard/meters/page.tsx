
"use client";

import { Building, HardDrive, Pencil, Gauge, Search, PlusCircle, Info } from "lucide-react";
import React, { Suspense } from "react";
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

function MetersPageComponent() {
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || "";
  
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [activeTab, setActiveTab] = React.useState("all");

  const getAssociationName = (meter: (typeof meters)[0]) => {
     if (meter.buildingId) {
      const building = buildings.find(b => b.id === meter.buildingId);
      return building?.name || `Bâtiment ID: ${meter.buildingId}`;
    }
    if (meter.equipmentId) {
      const eq = equipment.find(e => e.id === meter.equipmentId);
      return eq?.name || `Équipement ID: ${meter.equipmentId}`;
    }
    return "Non Associé";
  }
  
   const formatShortDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  }

  const filteredMeters = meters.filter(meter => {
      const associationName = getAssociationName(meter).toLowerCase();
      const meterId = meter.id.toLowerCase();
      const policeNumber = meter.policeNumber?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      const matchesSearch = meterId.includes(query) || associationName.includes(query) || policeNumber.includes(query);

      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
        
      const statusMap: { [key: string]: Meter['status'][] } = {
          'en_cours': ['En cours'],
          'en_service': ['En service'],
          'resilie': ['Résilié'],
          'substitue': ['Substitué'],
      };
      const statuses = statusMap[activeTab];

      return statuses ? statuses.includes(meter.status) : false;
  });

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="en_service">En service</TabsTrigger>
          <TabsTrigger value="resilie">Résilié</TabsTrigger>
          <TabsTrigger value="substitue">Substitué</TabsTrigger>
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
          </div>
      </div>
      <TabsContent value={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Compteurs</CardTitle>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeters.map((meter) => (
                    <TableRow key={meter.id}>
                        <TableCell className="font-mono">{meter.id}</TableCell>
                        <TableCell className="font-mono">{meter.policeNumber}</TableCell>
                        <TableCell className="font-medium">{getAssociationName(meter)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{meter.description}</TableCell>
                        <TableCell>
                        <Badge variant={meter.typeTension === "Moyenne Tension" ? "secondary" : "outline"}>
                            {meter.typeTension}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant="outline"
                            className={cn(
                                "whitespace-nowrap",
                                meter.status === 'En service' && 'text-green-500 border-green-500/50 bg-green-500/10',
                                meter.status === 'Résilié' && 'text-red-500 border-red-500/50 bg-red-500/10',
                                meter.status === 'En cours' && 'text-blue-500 border-blue-500/50 bg-blue-500/10',
                                meter.status === 'Substitué' && 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10'
                            )}
                        >
                            {meter.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatShortDate(meter.lastUpdate)}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/meters/${meter.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
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
  );
}

export default function MetersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MetersPageComponent />
        </Suspense>
    )
}
