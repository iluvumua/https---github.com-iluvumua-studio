import { Building2, Network, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyConsumptionChart } from "@/components/energy-consumption-chart";
import { buildingData, equipmentData, billingData } from "@/lib/data";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">{equipmentData.filter(e => e.status === 'Active').length}</div>
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
            <div className="text-2xl font-bold">{buildingData.length}</div>
            <p className="text-xs text-muted-foreground">
              Propriétés sous gestion énergétique
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures Impayées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.filter(b => b.status === 'Impayée').length}</div>
            <p className="text-xs text-muted-foreground">
              En attente de paiement ce cycle
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
        <div className="lg:col-span-7">
            <EnergyConsumptionChart />
        </div>
      </div>
    </div>
  );
}
