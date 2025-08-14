
"use client";

import { Building, HardDrive, Pencil, Gauge, Search } from "lucide-react";
import React from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { AddMeterForm } from "@/components/add-meter-form";
import { EditMeterForm } from "@/components/edit-meter-form";
import { Input } from "@/components/ui/input";


export default function MetersPage() {
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const [searchTerm, setSearchTerm] = React.useState("");

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

  const filteredMeters = meters.filter(meter => {
      const associationName = getAssociationName(meter).toLowerCase();
      const meterId = meter.id.toLowerCase();
      const query = searchTerm.toLowerCase();
      return meterId.includes(query) || associationName.includes(query);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Gestion des Compteurs</CardTitle>
            <CardDescription>
              Suivez et gérez tous les compteurs d'énergie STEG.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
            <AddMeterForm />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMeters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Gauge className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucun compteur trouvé</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Essayez un autre terme de recherche ou ajoutez un nouveau compteur.
                </p>
                <div className="mt-6">
                    <AddMeterForm />
                </div>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Compteur STEG</TableHead>
              <TableHead>Associé à</TableHead>
              <TableHead>Type de Tension</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMeters.map((meter) => {
              const associatedBuilding = meter.buildingId ? buildings.find(b => b.id === meter.buildingId) : null;
              const associatedEquipment = meter.equipmentId ? equipment.filter(e => e.id === meter.equipmentId) : [];
              const equipmentInBuilding = associatedBuilding ? equipment.filter(e => e.location === associatedBuilding.code) : [];
              
              const allAssociatedEquipment = [...new Set([...associatedEquipment, ...equipmentInBuilding])];

              return (
                <Collapsible asChild key={meter.id} tagName="tbody" className="border-b">
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell className="font-mono">{meter.id}</TableCell>
                        <TableCell className="font-medium">{getAssociationName(meter)}</TableCell>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EditMeterForm meter={meter} />
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                        <tr className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={5} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {associatedBuilding && (
                                <Card>
                                    <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building className="h-5 w-5" /> Bâtiment Associé
                                    </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-1">
                                    <p><strong>Code:</strong> {associatedBuilding.code}</p>
                                    <p><strong>Nom:</strong> {associatedBuilding.name}</p>
                                    <p><strong>Adresse:</strong> {associatedBuilding.address}</p>
                                    <p><strong>Commune:</strong> {associatedBuilding.commune}</p>
                                    </CardContent>
                                </Card>
                                )}
                                {allAssociatedEquipment.length > 0 && (
                                <Card>
                                    <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <HardDrive className="h-5 w-5" /> Équipements Associés
                                    </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {allAssociatedEquipment.map(eq => (
                                            <li key={eq.id}>{eq.name} ({eq.type})</li>
                                        ))}
                                    </ul>
                                    </CardContent>
                                </Card>
                                )}
                            </div>
                        </TableCell>
                        </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
            )})}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
