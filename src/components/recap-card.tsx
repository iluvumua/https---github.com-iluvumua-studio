

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { useState } from "react";
import { Button } from "./ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

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
    const [nombreFacturesNonBase, setNombreFacturesNonBase] = useState(data.nombreFacturesNonBase);
    const [montantFacturesNonBase, setMontantFacturesNonBase] = useState(data.montantFacturesNonBase);

    const [facturesExternes, setFacturesExternes] = useState<Litige[]>([]);
    const [newRefFact, setNewRefFact] = useState("");
    const [newMotif, setNewMotif] = useState("");
    const [newMontant, setNewMontant] = useState("");
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-TN', {
            style: 'decimal',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(value);
    }
    
    const montantTotalBordereau = data.montantFacturesSaisie + montantFacturesNonBase;
    
    const handleAddFactureExterne = () => {
        if (newRefFact && newMotif && newMontant) {
            setFacturesExternes([
                ...facturesExternes,
                {
                    refFact: newRefFact,
                    litige: newMotif,
                    montantTTC: parseFloat(newMontant),
                }
            ]);
            setNewRefFact("");
            setNewMotif("");
            setNewMontant("");
        }
    };

    const handleRemoveFactureExterne = (index: number) => {
        setFacturesExternes(facturesExternes.filter((_, i) => i !== index));
    };

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
                        <TableRow><TableCell className="font-medium">Montant total du bordereau steg</TableCell><TableCell className="text-right font-mono">{formatCurrency(montantTotalBordereau)}</TableCell></TableRow>
                        <TableRow><TableCell className="font-medium">Nombre de Factures saisie dans la base</TableCell><TableCell className="text-right font-mono">{data.nombreFacturesSaisie}</TableCell></TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Nombre de facture n'appartenant pas à la base</TableCell>
                            <TableCell className="text-right font-mono">
                                <Input 
                                    type="number" 
                                    className="h-8 text-right"
                                    value={nombreFacturesNonBase}
                                    onChange={(e) => setNombreFacturesNonBase(Number(e.target.value) || 0)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow><TableCell className="font-medium">Montant des factures saisie dans la base</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.montantFacturesSaisie)}</TableCell></TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Montant des factures n'appartenant pas à la base</TableCell>
                            <TableCell className="text-right font-mono">
                                <Input 
                                    type="number" 
                                    step="0.001"
                                    className="h-8 text-right"
                                    value={montantFacturesNonBase}
                                    onChange={(e) => setMontantFacturesNonBase(Number(e.target.value) || 0)}
                                />
                            </TableCell>
                        </TableRow>
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

                <div className="p-4 space-y-4">
                    <h4 className="font-medium">Factures non trouvées dans la base</h4>
                    <div className="grid grid-cols-4 gap-2">
                        <Input placeholder="Réf Facture" value={newRefFact} onChange={(e) => setNewRefFact(e.target.value)} />
                        <Input placeholder="Motif" value={newMotif} onChange={(e) => setNewMotif(e.target.value)} />
                        <Input placeholder="Montant" type="number" value={newMontant} onChange={(e) => setNewMontant(e.target.value)} />
                        <Button size="sm" onClick={handleAddFactureExterne}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                        </Button>
                    </div>

                    {facturesExternes.length > 0 && (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Réf Facture</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {facturesExternes.map((facture, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono">{facture.refFact}</TableCell>
                                        <TableCell>{facture.litige}</TableCell>
                                        <TableCell className="font-mono">{formatCurrency(facture.montantTTC)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFactureExterne(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
