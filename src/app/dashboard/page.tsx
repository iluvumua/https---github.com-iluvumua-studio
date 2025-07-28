
"use client";

import { Building2, Network, FileText, Gauge, FileWarning, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyConsumptionChart } from "@/components/energy-consumption-chart";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { equipment } = useEquipmentStore();
  const { buildings } = useBuildingsStore();
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();

  const activeEquipmentCount = equipment.filter(e => e.status === 'Active').length;
  const buildingsCount = buildings.length;
  const unpaidBills = bills.filter(b => b.status === 'Impayée');
  const unpaidBillsCount = unpaidBills.length;
  const metersCount = meters.length;

  const totalUnpaidAmount = unpaidBills.reduce((acc, bill) => acc + bill.amount, 0);
  const totalConsumption = bills.reduce((acc, bill) => acc + bill.consumptionKWh, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' kWh';
  }

  const recentBills = [...bills].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Équipement Actif
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEquipmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Total des appareils réseau en ligne
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bâtiments Gérés
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingsCount}</div>
            <p className="text-xs text-muted-foreground">
              Propriétés sous gestion énergétique
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compteurs Installés</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metersCount}</div>
            <p className="text-xs text-muted-foreground">
              Total des compteurs enregistrés
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures Impayées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidBillsCount}</div>
             <p className="text-xs text-muted-foreground">
              Total de {formatCurrency(totalUnpaidAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommation Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKWh(totalConsumption)}</div>
            <p className="text-xs text-muted-foreground">
              Basé sur toutes les factures enregistrées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Potentielles</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aucune anomalie détectée ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
        <div className="lg:col-span-4">
            <EnergyConsumptionChart />
        </div>
         <div className="lg:col-span-3">
             <Card>
                <CardHeader>
                    <CardTitle>Activité Récente des Factures</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° Facture</TableHead>
                                <TableHead>Mois</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-mono text-xs">{bill.reference}</TableCell>
                                    <TableCell className="text-xs">{bill.month}</TableCell>
                                    <TableCell className="text-right font-medium text-xs">{formatCurrency(bill.amount)}</TableCell>
                                    <TableCell className="text-center">
                                         <Badge
                                            variant="outline"
                                            className={cn("text-xs",
                                            bill.status === 'Payée' ? 'text-green-500 border-green-500/50 bg-green-500/10' : 'text-red-500 border-red-500/50 bg-red-500/10'
                                            )}
                                        >
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
