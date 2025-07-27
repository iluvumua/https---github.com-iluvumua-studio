
"use client";

import { File, Trash2 } from "lucide-react";
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
import { AddBuildingForm } from "@/components/add-building-form";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import type { Building } from "@/lib/types";
import { EditBuildingForm } from "@/components/edit-building-form";

export default function BuildingsPage() {
    const { buildings } = useBuildingsStore();

    const getNatureLabel = (nature: string[]) => {
        const labels = [];
        if (nature.includes('A')) labels.push('Adm');
        if (nature.includes('T')) labels.push('Tech');
        if (nature.includes('C')) labels.push('Comm');
        if (nature.includes('D')) labels.push('Dépôt');
        return labels.join(' + ');
    };

    const getProprieteBadgeVariant = (propriete: Building['propriete']) => {
        if (propriete.startsWith('Propriété')) return 'default';
        if (propriete.startsWith('Location')) return 'secondary';
        return 'outline';
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gestion des Bâtiments</CardTitle>
                <CardDescription>
                Gérer les informations sur les bâtiments possédés et loués.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                <AddBuildingForm />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code Bâtiment</TableHead>
              <TableHead>Nom du Site</TableHead>
              <TableHead>Commune</TableHead>
              <TableHead>Délégation</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Propriété</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.code}</TableCell>
                <TableCell>{building.name}</TableCell>
                <TableCell>{building.commune}</TableCell>
                <TableCell>{building.delegation}</TableCell>
                <TableCell>{getNatureLabel(building.nature)}</TableCell>
                 <TableCell>
                  <Badge variant={getProprieteBadgeVariant(building.propriete)}>
                    {building.propriete}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditBuildingForm building={building} />
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
