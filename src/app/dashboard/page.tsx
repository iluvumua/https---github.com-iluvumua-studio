import { Building2, Network, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyConsumptionChart } from "@/components/energy-consumption-chart";
import { AnomalyDetectorCard } from "@/components/anomaly-detector-card";
import { RecentAnomaliesTable } from "@/components/recent-anomalies-table";
import { buildingData, equipmentData, billingData } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Equipment
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentData.filter(e => e.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">
              Total network devices online
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Managed Buildings
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingData.length}</div>
            <p className="text-xs text-muted-foreground">
              Properties under energy management
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.filter(b => b.status === 'Unpaid').length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment this cycle
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
        <div className="lg:col-span-4">
            <EnergyConsumptionChart />
        </div>
        <div className="lg:col-span-3">
            <AnomalyDetectorCard />
        </div>
      </div>
      <div>
        <RecentAnomaliesTable />
      </div>
    </div>
  );
}
