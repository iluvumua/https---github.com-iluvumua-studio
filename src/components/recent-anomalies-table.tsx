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
import { recentAnomaliesData } from "@/lib/data";
import { cn } from "@/lib/utils";

const severityTranslations: { [key: string]: string } = {
    "High": "Élevée",
    "Medium": "Moyenne",
    "Low": "Faible",
};

export function RecentAnomaliesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalies Récentes</CardTitle>
        <CardDescription>
          Anomalies de consommation d'énergie récemment détectées par l'IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bâtiment</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead className="text-right">Horodatage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAnomaliesData.map((anomaly) => (
              <TableRow key={anomaly.id}>
                <TableCell className="font-medium">{anomaly.building}</TableCell>
                <TableCell>{anomaly.description}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      anomaly.severity === "High" &&
                        "border-red-500/50 text-red-500 bg-red-500/10",
                      anomaly.severity === "Medium" &&
                        "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
                       anomaly.severity === "Low" &&
                        "border-blue-500/50 text-blue-500 bg-blue-500/10"
                    )}
                  >
                    {severityTranslations[anomaly.severity] || anomaly.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{anomaly.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
