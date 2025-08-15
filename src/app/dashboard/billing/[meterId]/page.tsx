
"use client";

import { useState } from "react";
import { Calculator, File, FileText, PlusCircle, Search } from "lucide-react";
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
import Link from "next/link";
import { EditBillForm } from "@/components/edit-bill-form";
import type { Bill } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useMetersStore } from "@/hooks/use-meters-store";

export default function MeterBillingPage() {
  const params = useParams();
  const meterId = params.meterId as string;

  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const meter = meters.find(m => m.id === meterId);
  const meterBills = bills.filter(b => b.meterId === meterId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount);
  }
   const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' kWh';
  }
  const statusTranslations: { [key: string]: string } = {
    "Payée": "Payée",
    "Impayée": "Impayée",
  };

  const getCalculHref = (bill: Bill) => {
    let type = 'basse-tension';
    if (bill.typeTension === 'Moyen Tension Tranche Horaire') {
        type = 'moyen-tension-horaire';
    } else if (bill.typeTension === 'Moyen Tension Forfaitaire') {
        type = 'moyen-tension-forfait';
    }
    return `/dashboard/billing/calcul?type=${type}`;
  }

  const filteredBills = meterBills.filter(bill => {
    const query = searchTerm.toLowerCase();
    return (
      bill.reference.toLowerCase().includes(query) ||
      bill.typeTension.toLowerCase().includes(query) ||
      bill.status.toLowerCase().includes(query)
    );
  });

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div>
                <CardTitle>Factures pour le Compteur <span className="font-mono text-primary">{meterId}</span></CardTitle>
                <CardDescription>
                  Police: {meter?.policeNumber || 'N/A'} | Réf. Facteur: {meter?.referenceFacteur || 'N/A'}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher facture..."
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
                        <Link href={`/dashboard/billing/new?meterId=${meterId}`}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Ajouter Facture
                            </span>
                        </Link>
                    </Button>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Aucune facture trouvée pour ce compteur</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Commencez par ajouter votre première facture pour la voir ici.
                </p>
                <div className="mt-6 w-full max-w-sm">
                   {user.role === 'Financier' && (
                        <Button className="w-full" asChild>
                            <Link href={`/dashboard/billing/new?meterId=${meterId}`}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Facture
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facture Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Consommation</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id} onClick={(e) => e.stopPropagation()}>
                <TableCell className="font-mono">{bill.reference}</TableCell>
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
                <TableCell className="text-right font-medium">
                  {formatCurrency(bill.amount)}
                  {!bill.convenableSTEG && typeof bill.montantSTEG === 'number' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      STEG: {formatCurrency(bill.montantSTEG)}
                      <br />
                      <span className={cn(
                        'font-semibold',
                        (bill.montantSTEG - bill.amount) !== 0 ? 'text-destructive' : ''
                      )}>
                        Diff: {formatCurrency(bill.montantSTEG - bill.amount)}
                      </span>
                    </div>
                  )}
                </TableCell>
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
