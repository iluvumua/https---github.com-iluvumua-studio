
"use client";

import { Building2, Network, Gauge, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useMemo } from "react";
import { CostBreakdownChart } from "@/components/cost-breakdown-chart";
import { DistrictEvolutionChart } from "@/components/district-evolution-chart";

export default function DashboardPage() {
  const { equipment } = useEquipmentStore();
  const { buildings } = useBuildingsStore();
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();

  const activeEquipment = useMemo(() => equipment.filter(e => e.status === 'En service'), [equipment]);

  const equipmentTypeCounts = useMemo(() => {
    return activeEquipment.reduce((acc, eq) => {
        acc[eq.type] = (acc[eq.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  }, [activeEquipment]);

  const buildingsCount = buildings.length;
  const metersCount = meters.length;

  const totalConsumption = bills.reduce((acc, bill) => acc + bill.consumptionKWh, 0);

  const averageMonthlyCost = useMemo(() => {
    const annualBills = bills
      .filter(b => b.nombreMois && b.nombreMois >= 12)
      .sort((a, b) => b.id.localeCompare(a.id));

    if (annualBills.length > 0) {
      const latestAnnualBill = annualBills[0];
      return latestAnnualBill.amount / latestAnnualBill.nombreMois;
    }
    return null;
  }, [bills]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' kWh';
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-2 shadow-lg transition-transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipement Actif</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{activeEquipment.length}</div>
             <div className="text-xs text-muted-foreground">
                {Object.entries(equipmentTypeCounts).map(([type, count]) => `${type}: ${count}`).join(' | ')}
             </div>
          </CardContent>
        </Card>
         <Card className="lg:col-span-3 shadow-lg transition-transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Mensuel Moyen (Annuel)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">
                {averageMonthlyCost !== null ? formatCurrency(averageMonthlyCost) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Basé sur les factures de 12 mois et plus</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg transition-transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bâtiments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingsCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg transition-transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compteurs</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metersCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
        <div className="lg:col-span-7">
            <CostBreakdownChart />
        </div>
      </div>
       <div className="grid grid-cols-1 gap-4 md:gap-8">
            <DistrictEvolutionChart />
       </div>
    </div>
  );
}
