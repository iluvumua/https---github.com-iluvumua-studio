
"use client";

import { useState, useMemo } from "react";
import { Calculator, File, FileText, PlusCircle, Search, History, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
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
import type { Bill } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useMetersStore } from "@/hooks/use-meters-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MeterBillingPage() {
  const params = useParams();
  const initialMeterId = params.meterId as string;

  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { user } = useUser();
  
  const [selectedMeterId, setSelectedMeterId] = useState(initialMeterId);
  const [searchTerm, setSearchTerm] = useState("");
  const [convenableFilter, setConvenableFilter] = useState<"all" | "yes" | "no">("all");

  const currentMeterDetails = meters.find(m => m.id === selectedMeterId);

  const meterBills = bills.filter(b => b.meterId === selectedMeterId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount);
  }
   const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' kWh';
  }

  const filteredBills = meterBills.filter(bill => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      bill.reference.toLowerCase().includes(query) ||
      bill.typeTension.toLowerCase().includes(query)
    );

    const matchesConvenable = convenableFilter === 'all' || 
                             (convenableFilter === 'yes' && bill.convenableSTEG) || 
                             (convenableFilter === 'no' && !bill.convenableSTEG);

    return matchesSearch && matchesConvenable;
  });

  const handleExport = () => {
    const dataToExport = filteredBills.map(bill => ({
        "N° Facture": bill.reference,
        "Type": bill.typeTension,
        "Consommation (kWh)": bill.consumptionKWh,
        "Montant": bill.amount,
        "Convenable STEG": bill.convenableSTEG ? 'Oui' : 'Non',
        "Montant STEG": bill.montantSTEG,
        "Mois": bill.month,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Factures ${selectedMeterId}`);
    XLSX.writeFile(workbook, `factures_${selectedMeterId}.xlsx`);
  };

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div>
                <CardTitle>Factures pour le Compteur <span className="font-mono text-primary">{selectedMeterId}</span></CardTitle>
                <CardDescription>
                  Police: {currentMeterDetails?.policeNumber || 'N/A'} | Réf. Facteur: {currentMeterDetails?.referenceFacteur || 'N/A'} | Total Factures: {meterBills.length}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher facture..."
                        className="pl-8 sm:w-[200px] lg:w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Select value={convenableFilter} onValueChange={(value) => setConvenableFilter(value as any)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrer par convenance" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="yes">Convenable</SelectItem>
                        <SelectItem value="no">Non Convenable</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exporter
                    </span>
                </Button>
                 {user.role === 'Financier' && (
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href={`/dashboard/billing/new?meterId=${selectedMeterId}`}>
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
                            <Link href={`/dashboard/billing/new?meterId=${selectedMeterId}`}>
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
                  <div className="flex items-center gap-1">
                     {user.role === "Financier" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/billing/edit/${bill.id}`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Modifier la facture</p>
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
