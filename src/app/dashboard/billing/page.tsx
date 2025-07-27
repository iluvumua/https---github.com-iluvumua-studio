import { File, Calculator } from "lucide-react";
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
import { billingData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AddBillForm } from "@/components/add-bill-form";
import Link from "next/link";

export default function BillingPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }
   const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' kWh';
  }
  const statusTranslations: { [key: string]: string } = {
    "Paid": "Payée",
    "Unpaid": "Impayée",
  };

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
              <TableHead>Bâtiment</TableHead>
              <TableHead>Mois</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Consommation</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingData.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono">{bill.reference}</TableCell>
                <TableCell className="font-mono">{bill.compteur}</TableCell>
                <TableCell className="font-medium">{bill.buildingName}</TableCell>
                <TableCell>{bill.month}</TableCell>
                <TableCell>
                  <Badge variant={bill.typeTension === "Moyenne Tension" ? 'secondary' : 'outline'}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
