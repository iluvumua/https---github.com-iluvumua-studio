
"use client";

import { File, Calculator, FileText } from "lucide-react";
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
import type { Bill } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BillingPage() {
  const { bills } = useBillingStore();
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

  const getCalculHref = (bill: Bill) => {
    let type = 'basse-tension';
    if (bill.typeTension === 'Moyen Tension Tranche Horaire') {
        type = 'moyen-tension-horaire';
    } else if (bill.typeTension === 'Moyen Tension Forfaitaire') {
        type = 'moyen-tension-forfait';
    }
    return `/dashboard/billing/calcul?type=${type}`;
  }

  return (
    <TooltipProvider>
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
        {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucune facture trouvée</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Commencez par ajouter votre première facture pour la voir ici.
                </p>
                <div className="mt-6">
                    <AddBillForm />
                </div>
            </div>
        ) : (
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
                  <Badge
                    variant="outline"
                    className={cn({
                      'text-blue-500 border-blue-500/50 bg-blue-500/10': bill.typeTension === 'Basse Tension',
                      'text-purple-500 border-purple-500/50 bg-purple-500/10': bill.typeTension === 'Moyen Tension Tranche Horaire',
                      'text-orange-500 border-orange-500/50 bg-orange-500/10': bill.typeTension === 'Moyen Tension Forfaitaire',
                    })}
                  >
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" asChild>
                            <Link href={getCalculHref(bill)}>
                                <Calculator className="h-4 w-4" />
                            </Link>
                         </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Calculer la facture</p>
                      </TooltipContent>
                    </Tooltip>
                    <EditBillForm bill={bill} />
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
