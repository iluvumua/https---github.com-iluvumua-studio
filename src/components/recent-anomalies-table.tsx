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

export function RecentAnomaliesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Anomalies</CardTitle>
        <CardDescription>
          Recent AI-detected energy consumption anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Building</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
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
                    {anomaly.severity}
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
