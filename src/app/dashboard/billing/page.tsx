
"use client";

import { File, Calculator, Trash2 } from "lucide-react";
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
import { useBillingStore } from "@/hooks/use-billing-store";
import { cn } from "@/lib/utils";
import { AddBillForm } from "@/components/add-bill-form";
import Link from "next/link";
import { EditBillForm } from "@/components/edit-bill-form";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import type { Bill } from "@/lib/types";

export default function BillingPage() {
  const { bills, deleteBill } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }
   const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' kWh';
  }
  const statusTranslations: { [key: string]: string } = {
    "Payée": "Payée",
    "Impayée": "Impayée",
  };

  const getTypeTensionVariant = (typeTension: Bill['typeTension']) => {
    switch (typeTension) {
        case 'Basse Tension':
            return 'outline';
        case 'Moyen Tension Tranche Horaire':
            return 'secondary';
        case 'Moyen Tension Forfaitaire':
            return 'default';
        default:
            return 'outline';
    }
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

  return (
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div>
                <CardTitle>Suivi des Factures d'Énergie</CardTitle>
                <CardDescription>
                Suivez les factures de consommation d'énergie STEG liées aux équipements et bâtiments.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                   <Link href="/dashboard/billing/calcul">
                    <Calculator className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Calcul de Facture
                    </span>
                   </Link>
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                <AddBillForm />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture STEG</TableHead>
              <TableHead>N° Compteur</TableHead>
              <TableHead>Associé à</TableHead>
              <TableHead>Mois</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Consommation</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono">{bill.reference}</TableCell>
                <TableCell className="font-mono">{bill.meterId}</TableCell>
                <TableCell className="font-medium">{getAssociationName(bill.meterId)}</TableCell>
                <TableCell>{bill.month}</TableCell>
                <TableCell>
                  <Badge variant={getTypeTensionVariant(bill.typeTension)}>
                    {bill.typeTension}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      bill.status === 'Payée' ? 'text-green-500 border-green-500/50 bg-green-500/10' : 'text-red-500 border-red-500/50 bg-red-500/10'
                    )}
                  >
                    {statusTranslations[bill.status] || bill.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatKWh(bill.consumptionKWh)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(bill.amount)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditBillForm bill={bill} />
                    <DeleteConfirmationDialog 
                        onConfirm={() => deleteBill(bill.id)}
                        itemName={`la facture N° ${bill.reference}`}
                    />
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
