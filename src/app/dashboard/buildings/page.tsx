
"use client";

import { File, Building2, PlusCircle, Network, Pencil, Gauge } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import type { Building } from "@/lib/types";
import { EditBuildingForm } from "@/components/edit-building-form";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BuildingsPage() {
    const { buildings } = useBuildingsStore();
    const { user } = useUser();

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

    const handleExport = () => {
        const dataToExport = buildings.map(building => ({
            "Code Bâtiment": building.code,
            "Nom du Site": building.name,
            "Commune": building.commune,
            "Délégation": building.delegation,
            "Nature": getNatureLabel(building.nature),
            "Propriété": building.propriete,
            "ID Compteur": building.meterId || 'N/A',
            "Adresse": building.address,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bâtiments");
        XLSX.writeFile(workbook, `batiments.xlsx`);
    };

  return (
    <TooltipProvider>
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
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                {user.role === 'Moyen Bâtiment' && (
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/buildings/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Ajouter Bâtiment
                            </span>
                        </Link>
                    </Button>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {buildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucun bâtiment trouvé</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Commencez par ajouter votre premier bâtiment pour le voir ici.
                </p>
                <div className="mt-6 w-full max-w-sm">
                    {user.role === 'Moyen Bâtiment' && (
                         <Button className="w-full" asChild>
                            <Link href="/dashboard/buildings/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Bâtiment
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        ) : (
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
                  <div className="flex items-center gap-1">
                    {user.role === 'Technicien' && (
                        <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/equipment/new?buildingId=${building.id}`}>
                                        <Network className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ajouter un équipement</p>
                            </TooltipContent>
                        </Tooltip>
                        </>
                    )}
                    {user.role === "Moyen Bâtiment" && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/buildings/${building.id}/new-meter`}>
                                        <Gauge className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Gérer le compteur</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {user.role === "Moyen Bâtiment" && (
                         <EditBuildingForm building={building} />
                    )}
                    {user.role !== "Moyen Bâtiment" && (
                       <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Modification réservée</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
