
"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart as BarChartIcon, File, FileText } from "lucide-react";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import * as XLSX from 'xlsx';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const chartConfig = {
  consumption: {
    label: "Consommation (kWh)",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "Coût Total (TND)",
    color: "hsl(var(--chart-2))",
  }
};

export default function BillingStatisticsPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const [selectedMonth, setSelectedMonth] = useState<string>(monthNames[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [chartMetric, setChartMetric] = useState<"consumption" | "cost">("consumption");
  
  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);

  const getAssociationName = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return "N/A";

    const associatedEquipment = equipment.filter(e => e.compteurId === meter.id);
    if (associatedEquipment.length > 0) {
      return associatedEquipment.map(e => e.name).join(', ');
    }

    if (meter.buildingId) {
        const building = buildings.find(b => b.id === meter.buildingId);
        return building?.name || "Bâtiment Inconnu";
    }

    return "Non Associé";
  }

  const filteredData = useMemo(() => {
    const selectedMonthYear = `${selectedMonth} ${selectedYear}`;
    
    return bills
      .filter(bill => bill.month === selectedMonthYear)
      .map(bill => ({
        ...bill,
        consumption: bill.consumptionKWh,
        cost: bill.amount,
        meterDetails: meters.find(m => m.id === bill.meterId),
        association: getAssociationName(bill.meterId)
      }));
  }, [selectedMonth, selectedYear, bills, meters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount);
  }

  const formatKWh = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' kWh';
  }
  
  const handleExport = () => {
    const dataToExport = filteredData.map(item => ({
        "N° Compteur": item.meterId,
        "Associé à": item.association,
        "Type Tension": item.typeTension,
        "Consommation (kWh)": item.consumptionKWh,
        "Coût Total (TND)": item.amount,
        "N° Facture": item.reference,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Statistiques ${selectedMonth} ${selectedYear}`);
    XLSX.writeFile(workbook, `statistiques_${selectedMonth.toLowerCase()}_${selectedYear}.xlsx`);
  };
  
  const activeChartConfig = chartMetric === 'consumption' ? { consumption: chartConfig.consumption } : { cost: chartConfig.cost };
  const yAxisFormatter = chartMetric === 'consumption'
    ? (value: number) => `${value / 1000}k`
    : (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const association = props.payload?.association || 'N/A';
    const formattedValue = chartMetric === 'consumption' ? formatKWh(value) : formatCurrency(value);
    return (
        <div className="flex flex-col">
            <span>{`${association}: ${formattedValue}`}</span>
        </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Statistiques de Facturation Mensuelle</CardTitle>
              <CardDescription>
                Aperçu de la consommation et des coûts par compteur pour un mois donné.
              </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Mois" />
                    </SelectTrigger>
                    <SelectContent>
                       {monthNames.map(month => (
                         <SelectItem key={month} value={month}>{month}</SelectItem>
                       ))}
                    </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                           <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport} disabled={filteredData.length === 0}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exporter</span>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="grid gap-6">
               <div className="flex justify-end">
                    <Select value={chartMetric} onValueChange={(value) => setChartMetric(value as any)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Afficher métrique" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="consumption">Consommation (kWh)</SelectItem>
                            <SelectItem value="cost">Coût Total (TND)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              <ChartContainer config={activeChartConfig} className="min-h-[300px] w-full">
                <BarChart data={filteredData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="meterId"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8"
                    tickFormatter={yAxisFormatter}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        formatter={tooltipFormatter}
                        indicator="dot"
                    />}
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey={chartMetric}
                    fill={chartMetric === 'consumption' ? "var(--color-consumption)" : "var(--color-cost)"}
                    radius={[4, 4, 0, 0]} 
                    name={chartMetric === 'consumption' ? "Consommation" : "Coût"}
                    />
                </BarChart>
              </ChartContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Compteur</TableHead>
                    <TableHead>Associé à</TableHead>
                    <TableHead>Type Tension</TableHead>
                    <TableHead className="text-right">Consommation</TableHead>
                    <TableHead className="text-right">Coût Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.meterId}</TableCell>
                      <TableCell className="font-medium">{item.association}</TableCell>
                      <TableCell>{item.typeTension}</TableCell>
                      <TableCell className="text-right">{formatKWh(item.consumptionKWh)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-xl font-semibold">Aucune donnée de facturation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune facture n'a été trouvée pour le mois de {selectedMonth} {selectedYear}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

