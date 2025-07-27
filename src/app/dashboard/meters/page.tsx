
"use client";

import { PlusCircle, File, Pencil, Trash2 } from "lucide-react";
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

export default function MetersPage() {
  const { meters } = useMetersStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Compteurs</CardTitle>
            <CardDescription>
              Suivez et gérez tous les compteurs d'énergie STEG.
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
            {meters.map((meter) => (
              <TableRow key={meter.id}>
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
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
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
