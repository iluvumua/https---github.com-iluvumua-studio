
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "./ui/separator";

interface Litige {
    refFact: string;
    litige: string;
    montantTTC: number;
}

export interface RecapData {
    district: string;
    date: string;
    nombreFacturesParvenue: number;
    montantTotalBordereau: number;
    nombreFacturesSaisie: number;
    nombreFacturesNonBase: number;
    montantFacturesSaisie: number;
    montantFacturesNonBase: number;
    montantFacturesDiscordance: number;
    montantFacturesVerifiees: number;
    litiges: Litige[];
}

interface RecapCardProps {
    data: RecapData;
}

export function RecapCard({ data }: RecapCardProps) {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-TN', {
            style: 'decimal',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(value);
    }
    
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
                    <TableBody>
                        <TableRow><TableCell className="font-medium">Nombre de Factures parvenue</TableCell><TableCell className="text-right font-mono">{data.nombreFacturesParvenue}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Montant total du bordereau steg</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.montantTotalBordereau)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Nombre de Factures saisie dans la base</TableCell><TableCell className="text-right font-mono">{data.nombreFacturesSaisie}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Nombre de facture n'appartenant pas à la base</TableCell><TableCell className="text-right font-mono">{data.nombreFacturesNonBase}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Montant des factures saisie dans la base</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.montantFacturesSaisie)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Montant des factures n'appartenant pas à la base</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.montantFacturesNonBase)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">montant des discordances des factures</TableCell><TableCell className="text-right font-mono text-destructive">{formatCurrency(data.montantFacturesDiscordance)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Montant des factures vérifiées</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.montantFacturesVerifiees)}</TableCell></TableRow>
                    </TableBody>
                </Table>
                
                {data.litiges.length > 0 && (
                    <>
                        <div className="p-4">
                             <div className="w-full py-2 my-2 bg-purple-600 rounded-md"></div>
                        </div>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Réf Fact</TableHead>
                                    <TableHead>Litige</TableHead>
                                    <TableHead className="text-right">Montant TTC</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.litiges.map((litige, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono">{litige.refFact}</TableCell>
                                        <TableCell>{litige.litige}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(litige.montantTTC)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
