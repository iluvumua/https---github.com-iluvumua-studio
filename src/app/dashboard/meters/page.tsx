
"use client";

import { PlusCircle, File, Pencil, Trash2, Building, HardDrive } from "lucide-react";
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

export default function MetersPage() {
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Compteurs</CardTitle>
            <CardDescription>
              Suivez et gérez tous les compteurs d'énergie STEG. Cliquez sur une ligne pour voir les détails.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exporter
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Ajouter Compteur
                </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Compteur STEG</TableHead>
              <TableHead>Bâtiment Associé</TableHead>
              <TableHead>Type de Tension</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
           <TableBody>
            {meters.map((meter) => {
              const associatedBuilding = buildings.find(b => b.id === meter.buildingId);
              const associatedEquipment = equipment.filter(e => e.location === associatedBuilding?.code);

              return (
              <Collapsible asChild key={meter.id} tagName="tbody" className="border-b">
                <>
                  <CollapsibleTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-mono">{meter.id}</TableCell>
                      <TableCell className="font-medium">{meter.buildingName}</TableCell>
                      <TableCell>
                        <Badge variant={meter.typeTension === "Moyenne Tension" ? "secondary" : "outline"}>
                          {meter.typeTension}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            meter.status === 'Actif' ? 'text-green-500 border-green-500/50 bg-green-500/10' : 'text-red-500 border-red-500/50 bg-red-500/10'
                          )}
                        >
                          {meter.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <tr>
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-4 bg-muted/50">
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
                            {associatedEquipment.length > 0 && (
                               <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-base">
                                    <HardDrive className="h-5 w-5" /> Équipements Associés
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {associatedEquipment.map(eq => (
                                        <li key={eq.id}>{eq.name}</li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
