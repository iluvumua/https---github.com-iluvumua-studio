
"use client";

import { useState, useMemo } from "react";
import { File, Building2, PlusCircle, Network, Pencil, Gauge, MoreHorizontal, Search } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { locationsData } from "@/lib/locations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BuildingsPage() {
    const { buildings } = useBuildingsStore();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [proprieteFilter, setProprieteFilter] = useState("all");


    const getLocationLabel = (abbreviation?: string) => {
        if (!abbreviation) return "N/A";
        const location = locationsData.find(l => l.abbreviation === abbreviation);
        return location?.localite || abbreviation;
    }
    
    const filteredBuildings = useMemo(() => {
        const query = searchTerm.toLowerCase();
        
        return buildings.filter(building => {
            const matchesSearch = !query || (
                building.code.toLowerCase().includes(query) ||
                building.name.toLowerCase().includes(query) ||
                building.commune.toLowerCase().includes(query) ||
                getLocationLabel(building.localisation).toLowerCase().includes(query) ||
                building.address.toLowerCase().includes(query)
            );

            const matchesPropriete = proprieteFilter === 'all' || building.propriete === proprieteFilter;

            return matchesSearch && matchesPropriete;
        });
    }, [buildings, searchTerm, proprieteFilter]);


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
        const dataToExport = filteredBuildings.map(building => ({
            "Code Bâtiment": building.code,
            "Nom du Site": building.name,
            "Commune": building.commune,
            "Localisation": getLocationLabel(building.localisation),
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

  const canEditBuildings = user.role === 'Moyen Bâtiment' || user.role === 'Admin';
  const canAddEquipment = user.role === 'Déploiement' || user.role === 'Etude et Planification' || user.role === 'Admin';
  const canManageMeters = user.role === "Déploiement" || user.role === 'Admin';

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
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher bâtiment..."
                        className="pl-8 sm:w-[200px] lg:w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={proprieteFilter} onValueChange={(value) => setProprieteFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrer par propriété" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les propriétés</SelectItem>
                        <SelectItem value="Propriété TT">Propriété TT</SelectItem>
                        <SelectItem value="Location, ETT">Location, ETT</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                {canEditBuildings && (
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
        {filteredBuildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucun bâtiment trouvé</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm ? `Aucun résultat pour "${searchTerm}".` : "Commencez par ajouter votre premier bâtiment pour le voir ici."}
                </p>
                 {canEditBuildings && !searchTerm && (
                    <div className="mt-6 w-full max-w-sm">
                         <Button className="w-full" asChild>
                            <Link href="/dashboard/buildings/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Bâtiment
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code Bâtiment</TableHead>
              <TableHead>Nom du Site</TableHead>
              <TableHead>Commune</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Propriété</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.code}</TableCell>
                <TableCell>{building.name}</TableCell>
                <TableCell>{building.commune}</TableCell>
                <TableCell>{getLocationLabel(building.localisation)}</TableCell>
                <TableCell>{getNatureLabel(building.nature)}</TableCell>
                 <TableCell>
                  <Badge variant={getProprieteBadgeVariant(building.propriete)}>
                    {building.propriete}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canAddEquipment && (
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/equipment/new?buildingId=${building.id}`}>
                                    <Network className="mr-2 h-4 w-4" />
                                    Ajouter équipement
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {canManageMeters && !building.meterId && (
                             <DropdownMenuItem asChild>
                                <Link href={`/dashboard/buildings/${building.id}/new-meter`}>
                                    <Gauge className="mr-2 h-4 w-4" />
                                    Gérer le compteur
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {canEditBuildings && (
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <EditBuildingForm building={building} />
                            </DropdownMenuItem>
                        )}
                        {!canEditBuildings && !canAddEquipment && !canManageMeters && (
                             <DropdownMenuItem disabled>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modification réservée
                            </DropdownMenuItem>
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
  );
}
