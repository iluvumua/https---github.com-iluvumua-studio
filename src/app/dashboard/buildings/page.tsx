import { File } from "lucide-react";
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
import { buildingData } from "@/lib/data";
import { AddBuildingForm } from "@/components/add-building-form";

export default function BuildingsPage() {
    const typeTranslations: { [key: string]: string } = {
        "Owned": "Propriété",
        "Rented": "Loué",
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
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-right">Responsable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildingData.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.name}</TableCell>
                <TableCell>
                  <Badge variant={building.type === 'Owned' ? 'default' : 'secondary'}>
                    {typeTranslations[building.type] || building.type}
                  </Badge>
                </TableCell>
                <TableCell>{building.address}</TableCell>
                <TableCell className="text-right">{building.energyManager}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
