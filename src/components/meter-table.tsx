
"use client";

import { Info, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Meter } from "@/lib/types";
import { Badge } from "./ui/badge";
import { FileText } from "lucide-react";

interface MeterTableProps {
    meters: (Meter & { associationName: string; averageMonthlyConsumption: number | null })[];
}

export const MeterTable = ({ meters }: MeterTableProps) => {
    if (meters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucun compteur trouvé</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Aucun compteur ne correspond aux critères actuels dans ce district.
                </p>
            </div>
        );
    }

    const formatKWh = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' kWh';
    }

    const getTensionDisplayName = (tension: Meter['typeTension']) => {
        if (tension === 'Moyen Tension Forfaitaire') return 'MT - Forfait';
        if (tension === 'Moyen Tension Tranche Horaire') return 'MT - Horaire';
        return tension;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Réf. Facteur</TableHead>
                    <TableHead>N° Compteur</TableHead>
                    <TableHead>Type de Tension</TableHead>
                    <TableHead>Associé à</TableHead>
                    <TableHead className="text-right">Consommation Mensuelle Moy.</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {meters.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.referenceFacteur}</TableCell>
                    <TableCell className="font-mono">{item.id}</TableCell>
                    <TableCell>
                        <Badge variant={item.typeTension === "Basse Tension" ? "outline" : "secondary"}>
                           {getTensionDisplayName(item.typeTension)}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.associationName}</TableCell>
                    <TableCell className="text-right font-medium">
                        {item.averageMonthlyConsumption !== null ? formatKWh(item.averageMonthlyConsumption) : 'N/A'}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/billing/${item.id}`}>
                                    Voir Factures
                                </Link>
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
