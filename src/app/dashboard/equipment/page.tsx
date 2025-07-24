
"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { cn } from "@/lib/utils";
import { AddEquipmentForm } from "@/components/add-equipment-form";
import type { Equipment } from "@/lib/types";

export default function EquipmentPage() {
    const { equipment } = useEquipmentStore();
    const [activeTab, setActiveTab] = useState("all");

    const statusTranslations: { [key: string]: string } = {
    "Active": "Actif",
    "Inactive": "Inactif",
    "Maintenance": "Maintenance",
    };
    
    const getStatusFromString = (status: string): "Active" | "Inactive" | "Maintenance" => {
        switch (status.toLowerCase()) {
            case "active":
            case "actif":
                return "Active";
            case "inactive":
            case "inactif":
                return "Inactive";
            case "maintenance":
                return "Maintenance";
            default:
                return "Inactive";
        }
    }

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
