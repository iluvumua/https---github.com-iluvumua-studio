
"use client";

import { useState } from "react";
import { File, Sheet } from "lucide-react";
import * as XLSX from "xlsx";

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
import { AddEquipmentForm } from "@/components/add-equipment-form";
import type { Equipment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function EquipmentPage() {
    const { equipment, addEquipment } = useEquipmentStore();
    const [activeTab, setActiveTab] = useState("all");
    const { toast } = useToast();

    const statusTranslations: { [key: string]: string } = {
    "Active": "Actif",
    "Inactive": "Inactif",
    "Maintenance": "Maintenance",
    };
    
    const getStatusFromString = (status: string): "Active" | "Inactive" | "Maintenance" => {
        if (!status) return "Inactive";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes("actif") || lowerStatus.includes("active")) return "Active";
        if (lowerStatus.includes("inactif") || lowerStatus.includes("inactive")) return "Inactive";
        if (lowerStatus.includes("maintenance")) return "Maintenance";
        return "Inactive";
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                const newEquipments: Equipment[] = json.map((row, index) => ({
                    id: `EQP-${Date.now()}-${index}`,
                    name: row["Nom"] || row["name"] || "N/A",
                    type: row["Type"] || row["type"] || "N/A",
                    location: row["Emplacement"] || row["location"] || "N/A",
                    status: getStatusFromString(row["État"] || row["status"]),
                    lastUpdate: new Date().toISOString().split('T')[0],
                    fournisseur: row["Fournisseur"] || row["supplier"] || "N/A",
                }));

                newEquipments.forEach(addEquipment);

                toast({
                    title: "Importation Réussie",
                    description: `${newEquipments.length} équipements ont été importés avec succès.`,
                });

            };
            reader.readAsArrayBuffer(file);
             // Reset file input to allow re-uploading the same file
            event.target.value = '';
        }
    };

    const filteredEquipment = equipment.filter(item => {
        if (activeTab === 'all') return true;
        return item.status.toLowerCase() === activeTab;
    });

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="active">Actif</TabsTrigger>
          <TabsTrigger value="inactive">Inactif</TabsTrigger>
           <TabsTrigger value="maintenance" className="hidden sm:flex">Maintenance</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
           <label htmlFor="import-file">
              <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                <span className="cursor-pointer">
                    <Sheet className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Importer
                    </span>
                </span>
              </Button>
            </label>
            <input type="file" id="import-file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} />

          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
          <AddEquipmentForm />
        </div>
      </div>
      <TabsContent value={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Équipement Réseau</CardTitle>
            <CardDescription>
              Gérer et suivre tous les équipements réseau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Fournisseur</TableHead>
                  <TableHead className="hidden md:table-cell">Emplacement</TableHead>
                  <TableHead className="text-right">Dernière Mise à Jour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        item.status === 'Active' && 'text-green-500 border-green-500/50 bg-green-500/10',
                        item.status === 'Inactive' && 'text-gray-500 border-gray-500/50 bg-gray-500/10',
                        item.status === 'Maintenance' && 'text-amber-500 border-amber-500/50 bg-amber-500/10',
                      )}>{statusTranslations[item.status] || item.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.type}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.fournisseur}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.location}</TableCell>
                    <TableCell className="text-right">{item.lastUpdate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
