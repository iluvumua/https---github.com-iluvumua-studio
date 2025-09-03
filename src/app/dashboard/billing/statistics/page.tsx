
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
import { File, FileText, LineChart } from "lucide-react";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import * as XLSX from 'xlsx';
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Line, LineChart as RechartsLineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { ImporterButton } from "@/components/importer-button";
import type { Bill } from "@/lib/types";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const chartConfig = {
  cost: {
    label: "Coût (TND)",
    color: "hsl(var(--chart-2))",
  },
  averageCost: {
    label: "Coût Moyen",
    color: "hsl(var(--chart-4))",
  },
};

type FilterType = "all" | "msan_gsm" | "mt_equip" | "building_only";

export default function BillingStatisticsPage() {
  const { bills } = useBillingStore();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();

  const [selectedMonth, setSelectedMonth] = useState<string>(monthNames[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [filter, setFilter] = useState<FilterType>("all");
  
  const availableYears = useMemo(() => {
    const years = new Set(bills.map(b => b.month.split(' ')[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [bills]);

  const filteredBills = useMemo(() => {
    if (filter === "all") {
        return bills;
    }

    const equipmentMeters = new Set<string>();

    if (filter === 'msan_gsm') {
        equipment.forEach(e => {
            if (e.compteurId && (e.type.includes('MSAN') || e.type.includes('MSN') || e.type.includes('MSI') || e.type.includes('BTS'))) {
                equipmentMeters.add(e.compteurId);
            }
        });
    } else if (filter === 'mt_equip') {
        const mtMeters = new Set(meters.filter(m => m.typeTension.includes('Moyen Tension')).map(m => m.id));
        equipment.forEach(e => {
            if (e.compteurId && mtMeters.has(e.compteurId)) {
                equipmentMeters.add(e.compteurId);
            }
        });
    }
    
    if (filter === 'building_only') {
        const buildingMeterIds = new Set(buildings.map(b => b.meterId).filter(Boolean));
        const metersWithEquipment = new Set(equipment.map(e => e.compteurId).filter(Boolean));
        buildingMeterIds.forEach(meterId => {
            if (!metersWithEquipment.has(meterId)) {
                equipmentMeters.add(meterId as string);
            }
        });
    }
    
    return bills.filter(bill => equipmentMeters.has(bill.meterId));

  }, [filter, bills, equipment, meters, buildings]);
  
  const annualChartData = useMemo(() => {
    const yearBills = filteredBills.filter(bill => bill.month.endsWith(selectedYear));
    const monthlyData: { [key: string]: { cost: number } } = {};

    monthNames.forEach(month => {
        monthlyData[month] = { cost: 0 };
    });

    yearBills.forEach(bill => {
        const monthName = bill.month.split(' ')[0];
        if (monthlyData[monthName]) {
            monthlyData[monthName].cost += bill.amount;
        }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month.slice(0, 3),
      Coût: data.cost,
    }));
  }, [selectedYear, filteredBills]);
  
   const annualAverages = useMemo(() => {
    const totalCost = annualChartData.reduce((acc, data) => acc + data.Coût, 0);
    const monthsWithData = annualChartData.filter(d => d.Coût > 0).length || 1;
    
    return {
      averageCost: totalCost / monthsWithData,
    };
  }, [annualChartData]);


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

  const monthlyFilteredData = useMemo(() => {
    const selectedMonthYear = `${selectedMonth} ${selectedYear}`;
    
    return filteredBills
      .filter(bill => bill.month === selectedMonthYear)
      .map(bill => ({
        ...bill,
        cost: bill.amount,
        meterDetails: meters.find(m => m.id === bill.meterId),
        association: getAssociationName(bill.meterId)
      }));
  }, [selectedMonth, selectedYear, filteredBills, meters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount);
  }
  
  const handleExport = () => {
    const dataToExport = monthlyFilteredData.map(item => ({
        "N° Compteur": item.meterId,
        "Associé à": item.association,
        "Type Tension": item.typeTension,
        "Coût Total (TND)": item.amount,
        "Id Facture": item.reference,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Statistiques ${selectedMonth} ${selectedYear}`);
    XLSX.writeFile(workbook, `statistiques_${selectedMonth.toLowerCase()}_${selectedYear}.xlsx`);
  };
  
  const yAxisFormatter = (value: number) => `${new Intl.NumberFormat('fr-TN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`;
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const association = props.payload?.association || 'N/A';
    const formattedValue = formatCurrency(value);
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
                        <CardTitle>Statistiques Annuelles</CardTitle>
                        <CardDescription>Aperçu des coûts pour l'année {selectedYear}.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Filtrer par type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les compteurs</SelectItem>
                                <SelectItem value="msan_gsm">Équipement (MSAN & Site GSM)</SelectItem>
                                <SelectItem value="mt_equip">Équipement (Compteurs MT)</SelectItem>
                                <SelectItem value="building_only">Bâtiments uniquement</SelectItem>
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
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{...chartConfig, Coût: { label: "Coût", color: "hsl(var(--chart-2))" }}} className="min-h-[300px] w-full">
                    <RechartsLineChart data={annualChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" formatter={(val) => formatCurrency(val as number)} />} />
                        <Legend />
                        <Line dataKey="Coût" type="monotone" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
                        <ReferenceLine y={annualAverages.averageCost} label="Moyenne Coût" stroke="var(--color-averageCost)" strokeDasharray="3 3" />
                    </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Statistiques de Facturation Mensuelle</CardTitle>
              <CardDescription>
                Aperçu des coûts par compteur pour un mois donné.
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
                <ImporterButton />
                 <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport} disabled={monthlyFilteredData.length === 0}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exporter</span>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyFilteredData.length > 0 ? (
            <div className="grid gap-6">
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <RechartsLineChart data={monthlyFilteredData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
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
                  <YAxis
                    tickFormatter={yAxisFormatter}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        formatter={tooltipFormatter}
                        indicator="dot"
                    />}
                  />
                  <Line 
                    type="monotone"
                    dataKey="cost"
                    stroke={"var(--color-cost)"}
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "var(--background)",
                      stroke: "var(--color-cost)",
                    }}
                    name="Coût"
                    />
                </RechartsLineChart>
              </ChartContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Compteur</TableHead>
                    <TableHead>Associé à</TableHead>
                    <TableHead>Type Tension</TableHead>
                    <TableHead className="text-right">Coût Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyFilteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.meterId}</TableCell>
                      <TableCell className="font-medium">{item.association}</TableCell>
                      <TableCell>{item.typeTension}</TableCell>
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
                Aucune facture n'a été trouvée pour {selectedMonth} {selectedYear} avec le filtre appliqué.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
