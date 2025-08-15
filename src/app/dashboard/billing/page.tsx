
"use client";

import { useState } from "react";
import { File, FileText, PlusCircle, Search, ChevronRight, Info } from "lucide-react";
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
import { useBillingStore } from "@/hooks/use-billing-store";
import Link from "next/link";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function BillingPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  const getAssociationName = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return "N/A";
    if (meter.buildingId) {
        const building = buildings.find(b => b.id === meter.buildingId);
        return building?.name || "Bâtiment Inconnu";
    }
    if (meter.equipmentId) {
        const eq = equipment.find(e => e.id === meter.equipmentId);
        return eq?.name || "Équipement Inconnu";
    }
    return "Non Associé";
  }

  const meterBillingData = meters.map(meter => {
    const meterBills = bills.filter(b => b.meterId === meter.id);
    const totalAmount = meterBills.reduce((acc, bill) => acc + bill.amount, 0);
    const unpaidBills = meterBills.filter(b => b.status === 'Impayée');
    const unpaidAmount = unpaidBills.reduce((acc, bill) => acc + bill.amount, 0);

    return {
        meterId: meter.id,
        associationName: getAssociationName(meter.id),
        billCount: meterBills.length,
        totalAmount,
        unpaidAmount,
        unpaidCount: unpaidBills.length,
        referenceFacteur: meter?.referenceFacteur || 'N/A',
        policeNumber: meter?.policeNumber || 'N/A',
        description: meter?.description || "",
    }
  });

  const filteredData = meterBillingData.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      item.meterId.toLowerCase().includes(query) ||
      item.associationName.toLowerCase().includes(query) ||
      item.referenceFacteur.toLowerCase().includes(query) ||
      item.policeNumber.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div>
                <CardTitle>Suivi des Factures d'Énergie</CardTitle>
                <CardDescription>
                Consultez les factures groupées par compteur.
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
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                 {user.role === 'Financier' && (
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/billing/add-reference">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Ajouter Référence
                            </span>
                        </Link>
                    </Button>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucune facture trouvée</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Commencez par ajouter votre première facture pour la voir ici.
                </p>
                 <div className="mt-6 w-full max-w-sm">
                   {user.role === 'Financier' && (
                        <Button className="w-full" asChild>
                            <Link href="/dashboard/billing/add-reference">
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Référence
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Réf. Facteur</TableHead>
              <TableHead>N° Compteur</TableHead>
              <TableHead>N° Police</TableHead>
              <TableHead>Associé à</TableHead>
              <TableHead className="text-center">Nombre de Factures</TableHead>
              <TableHead className="text-center">Factures Impayées</TableHead>
              <TableHead className="text-right">Montant Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.meterId}>
                <TableCell className="font-mono">{item.referenceFacteur}</TableCell>
                <TableCell className="font-mono">{item.meterId}</TableCell>
                <TableCell className="font-mono">{item.policeNumber}</TableCell>
                <TableCell className="font-medium">{item.associationName}</TableCell>
                <TableCell className="text-center">{item.billCount}</TableCell>
                <TableCell className="text-center">
                    {item.unpaidCount > 0 ? (
                        <span className="text-red-500 font-medium">
                            {item.unpaidCount} ({formatCurrency(item.unpaidAmount)})
                        </span>
                    ) : (
                        <span>0</span>
                    )}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        {item.description && (
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <p className="text-sm">{item.description}</p>
                                </PopoverContent>
                            </Popover>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/billing/${item.meterId}`}>
                                <ChevronRight className="h-4 w-4" />
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
    </TooltipProvider>
  );
}
