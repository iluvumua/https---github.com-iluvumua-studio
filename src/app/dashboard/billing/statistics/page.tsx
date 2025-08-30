
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";

export default function BillingStatisticsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques de Facturation</CardTitle>
          <CardDescription>
            Aperçu des données de facturation.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <BarChartIcon className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-6 text-xl font-semibold">Page en construction</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Les statistiques de facturation seront bientôt disponibles ici.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
