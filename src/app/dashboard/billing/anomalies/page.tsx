
"use client";

import { useAnomaliesStore } from "@/hooks/use-anomalies-store";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export default function AnomaliesPage() {
  const { anomalies, markAsRead } = useAnomaliesStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalies de Facturation</CardTitle>
        <CardDescription>
          Liste de toutes les anomalies de facturation détectées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-6 text-xl font-semibold">
              Aucune anomalie détectée
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Toutes les factures sont dans les limites attendues.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Compteur</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((anomaly) => (
                <TableRow key={anomaly.id}>
                  <TableCell>{format(new Date(anomaly.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-mono">{anomaly.meterId}</TableCell>
                  <TableCell>{anomaly.message}</TableCell>
                  <TableCell>
                    <Badge variant={anomaly.isRead ? "secondary" : "destructive"}>
                      {anomaly.isRead ? "Lue" : "Non lue"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                             <Link href={`/dashboard/billing/${anomaly.meterId}`}>
                                <Eye className="mr-2 h-4 w-4" /> Voir Compteur
                            </Link>
                        </Button>
                        {!anomaly.isRead && (
                            <Button size="sm" onClick={() => markAsRead(anomaly.id)}>
                                <Check className="mr-2 h-4 w-4" /> Marquer comme lu
                            </Button>
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
  );
}
