
"use client";

import { useState, useMemo } from "react";
import { Calculator, File, FileText, PlusCircle, Search, History, Pencil, MoreHorizontal } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
   const formatIndex = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  }

  const filteredBills = meterBills.filter(bill => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      bill.reference.toLowerCase().includes(query) ||
      bill.month.toLowerCase().includes(query)
    );

    const matchesConvenable = convenableFilter === 'all' || 
                             (convenableFilter === 'yes' && bill.convenableSTEG) || 
                             (convenableFilter === 'no' && !bill.convenableSTEG);

    return matchesSearch && matchesConvenable;
  });

  const handleExport = () => {
    const dataToExport = filteredBills.map(bill => ({
        "N° Facture": bill.reference,
        "Mois": bill.month,
        "Ancien Index": bill.ancienIndex ?? 'N/A',
        "Nouveau Index": bill.nouveauIndex ?? 'N/A',
        "Consommation (kWh)": bill.consumptionKWh,
        "Montant Calculé": bill.amount,
        "Convenable STEG": bill.convenableSTEG ? 'Oui' : 'Non',
        "Montant STEG": bill.convenableSTEG ? '' : bill.montantSTEG,
        "Différence": bill.convenableSTEG ? '' : (bill.montantSTEG || 0) - bill.amount,
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
              <TableHead>Mois</TableHead>
              <TableHead className="text-right">Ancien Index</TableHead>
              <TableHead className="text-right">Nouveau Index</TableHead>
              <TableHead className="text-right">Consommation</TableHead>
              <TableHead className="text-right">Montant Calculé</TableHead>
              <TableHead className="text-right">Montant STEG</TableHead>
              <TableHead className="text-right">Différence</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id} onClick={(e) => e.stopPropagation()}>
                <TableCell className="font-mono">{bill.reference}</TableCell>
                <TableCell>{bill.month}</TableCell>
                <TableCell className="text-right font-mono">{bill.ancienIndex ? formatIndex(bill.ancienIndex) : '-'}</TableCell>
                <TableCell className="text-right font-mono">{bill.nouveauIndex ? formatIndex(bill.nouveauIndex) : '-'}</TableCell>
                <TableCell className="text-right">{formatKWh(bill.consumptionKWh)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(bill.amount)}
                </TableCell>
                 <TableCell className="text-right">
                   {!bill.convenableSTEG && typeof bill.montantSTEG === 'number' ? (
                       formatCurrency(bill.montantSTEG)
                   ) : (
                    <span className="text-muted-foreground">-</span>
                   )}
                </TableCell>
                 <TableCell className={cn(
                     "text-right font-semibold",
                     !bill.convenableSTEG && (bill.montantSTEG || 0) - bill.amount !== 0 ? 'text-destructive' : ''
                 )}>
                   {!bill.convenableSTEG && typeof bill.montantSTEG === 'number' ? (
                       formatCurrency(bill.montantSTEG - bill.amount)
                   ) : (
                    <span className="text-muted-foreground">-</span>
                   )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                     {user.role === "Financier" && (
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/dashboard/billing/edit/${bill.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
