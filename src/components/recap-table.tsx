
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface BillRecap {
    reference: string;
    montantHT: number;
    TVA: number;
    TTC: number;
}

export interface RecapData {
    district: string;
    date: string;
    bills: BillRecap[];
}

interface RecapTableProps {
    data: RecapData;
}

const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'decimal',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).format(value);
}

export function RecapTable({ data }: RecapTableProps) {
    const totalHT = data.bills.reduce((sum, bill) => sum + bill.montantHT, 0);
    const totalTVA = data.bills.reduce((sum, bill) => sum + bill.TVA, 0);
    const totalTTC = data.bills.reduce((sum, bill) => sum + bill.TTC, 0);

    return (
        <Card>
            <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{data.district}</CardTitle>
                    <div className="text-sm font-semibold px-2 py-1 bg-primary text-primary-foreground rounded-md">{data.date}</div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead className="text-right">Montant HT</TableHead>
                            <TableHead className="text-right">TVA</TableHead>
                            <TableHead className="text-right">Montant TTC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.bills.map((bill, index) => (
                             <TableRow key={index}>
                                <TableCell className="font-mono">{bill.reference}</TableCell>
                                <TableCell className="text-right font-mono">{formatAmount(bill.montantHT)}</TableCell>
                                <TableCell className="text-right font-mono">{formatAmount(bill.TVA)}</TableCell>
                                <TableCell className="text-right font-mono">{formatAmount(bill.TTC)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right font-mono">{formatAmount(totalHT)}</TableCell>
                            <TableCell className="text-right font-mono">{formatAmount(totalTVA)}</TableCell>
                            <TableCell className="text-right font-mono">{formatAmount(totalTTC)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
