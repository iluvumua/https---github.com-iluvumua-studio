
"use client"

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    ancien_index: z.coerce.number().default(1483440),
    nouveau_index: z.coerce.number().default(1489924),
    coefficient_multiplicateur: z.coerce.number().default(1.0),
    perte_en_charge: z.coerce.number().default(0), // Will be calculated
    perte_a_vide: z.coerce.number().default(260),
    pu_consommation: z.coerce.number().default(0.291),
    prime_puissance: z.coerce.number().default(250.000),
    tva_consommation_percent: z.coerce.number().default(19), // 361.060 / 1900.317 = 0.19
    tva_redevance_percent: z.coerce.number().default(19), // 47.500 / 250.000 = 0.19
    contribution_rtt: z.coerce.number().default(3.500),
    surtaxe_municipale: z.coerce.number().default(68.740),
    avance_consommation: z.coerce.number().default(31.134),
    frais_location_mtf: z.coerce.number().default(0),
    frais_intervention_mtf: z.coerce.number().default(0),
    frais_relance_mtf: z.coerce.number().default(0),
    frais_retard_mtf: z.coerce.number().default(0),
    cos_phi: z.coerce.number().default(0.8),
    coefficient_k: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function MoyenTensionForfaitForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ancien_index: 1483440,
            nouveau_index: 1489924,
            coefficient_multiplicateur: 1.0,
            perte_en_charge: 0,
            perte_a_vide: 260,
            pu_consommation: 0.291,
            prime_puissance: 250.000,
            tva_consommation_percent: 19,
            tva_redevance_percent: 19,
            contribution_rtt: 3.500,
            surtaxe_municipale: 68.740,
            avance_consommation: 31.134,
            frais_location_mtf: 0,
            frais_intervention_mtf: 0,
            frais_relance_mtf: 0,
            frais_retard_mtf: 0,
            cos_phi: 0.8,
            coefficient_k: 0,
        },
    });

    const watchedValues = useWatch({ control: form.control });

    const ancien_index = parseFloat(String(watchedValues.ancien_index)) || 0;
    const nouveau_index = parseFloat(String(watchedValues.nouveau_index)) || 0;
    const coefficient_multiplicateur = parseFloat(String(watchedValues.coefficient_multiplicateur)) || 0;
    const perte_a_vide = parseFloat(String(watchedValues.perte_a_vide)) || 0;
    const pu_consommation = parseFloat(String(watchedValues.pu_consommation)) || 0;
    const prime_puissance = parseFloat(String(watchedValues.prime_puissance)) || 0;
    const tva_consommation_percent = parseFloat(String(watchedValues.tva_consommation_percent)) || 0;
    const tva_redevance_percent = parseFloat(String(watchedValues.tva_redevance_percent)) || 0;
    const contribution_rtt = parseFloat(String(watchedValues.contribution_rtt)) || 0;
    const surtaxe_municipale = parseFloat(String(watchedValues.surtaxe_municipale)) || 0;
    const avance_consommation = parseFloat(String(watchedValues.avance_consommation)) || 0;
    const frais_location_mtf = parseFloat(String(watchedValues.frais_location_mtf)) || 0;
    const frais_intervention_mtf = parseFloat(String(watchedValues.frais_intervention_mtf)) || 0;
    const frais_relance_mtf = parseFloat(String(watchedValues.frais_relance_mtf)) || 0;
    const frais_retard_mtf = parseFloat(String(watchedValues.frais_retard_mtf)) || 0;
    const cos_phi = parseFloat(String(watchedValues.cos_phi)) || 0;
    const coefficient_k = parseFloat(String(watchedValues.coefficient_k)) || 0;
    

    // Calculations
    const indexDifference = Math.max(0, nouveau_index - ancien_index);
    const perte_en_charge = Math.round(indexDifference * 0.02);

    const energie_enregistree = indexDifference * coefficient_multiplicateur;
    const consommation_a_facturer = energie_enregistree + perte_en_charge + perte_a_vide;
    const montant_consommation = consommation_a_facturer * pu_consommation;
    const sous_total_consommation = montant_consommation;

    const bonification_calc = (cos_phi > 0.8)
        ? -1 * coefficient_k * montant_consommation
        : coefficient_k * montant_consommation;

    const totalFraisDivers = prime_puissance + frais_location_mtf + frais_intervention_mtf + frais_relance_mtf + frais_retard_mtf;
    
    const total_1 = sous_total_consommation + bonification_calc;
    const total_2 = total_1 + totalFraisDivers;
    
    const tva_consommation = total_1 * (tva_consommation_percent / 100);
    const tva_redevance = totalFraisDivers * (tva_redevance_percent / 100);

    const total_3 = total_2 + tva_consommation + tva_redevance + contribution_rtt + surtaxe_municipale;
    
    const net_a_payer = total_3 + avance_consommation;


    function onSubmit(values: FormValues) {
        console.log({ ...values, perte_en_charge });
    }
    
    const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);
    const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Données de Consommation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="ancien_index" render={({ field }) => ( <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="coefficient_multiplicateur" render={({ field }) => ( <FormItem><FormLabel>Coeff. Multiplicateur</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="perte_a_vide" render={({ field }) => ( <FormItem><FormLabel>Perte à Vide (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tarifs et Frais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="pu_consommation" render={({ field }) => ( <FormItem><FormLabel>P.U. Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="prime_puissance" render={({ field }) => ( <FormItem><FormLabel>Prime de Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="cos_phi" render={({ field }) => ( <FormItem><FormLabel>Cos Φ</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="coefficient_k" render={({ field }) => ( <FormItem><FormLabel>Coefficient K</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="contribution_rtt" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="surtaxe_municipale" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                             <FormField control={form.control} name="frais_location_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Location</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_intervention_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Intervention</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_relance_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Relance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_retard_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Retard</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="avance_consommation" render={({ field }) => ( <FormItem><FormLabel>Avance / Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Calcul de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                             <div className="flex justify-between items-center"><span>Perte en Charge Calculée:</span><span className="font-mono">{formatKWh(perte_en_charge)} kWh</span></div>
                             <div className="flex justify-between items-center"><span>Consommation à Facturer:</span><span className="font-mono">{formatKWh(consommation_a_facturer)} kWh</span></div>
                             <div className="flex justify-between items-center"><span>Montant Consommation:</span><span className="font-mono">{formatDT(montant_consommation)}</span></div>
                             <div className="flex justify-between items-center"><span>Bonification/Pénalité:</span><span className="font-mono">{formatDT(bonification_calc)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 1:</span><span className="font-mono">{formatDT(total_1)}</span></div>
                             <div className="flex justify-between items-center"><span>Total Frais Divers:</span><span className="font-mono">{formatDT(totalFraisDivers)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 2:</span><span className="font-mono">{formatDT(total_2)}</span></div>
                             <div className="flex justify-between items-center"><span>TVA/Consommation:</span><span className="font-mono">{formatDT(tva_consommation)}</span></div>
                             <div className="flex justify-between items-center"><span>TVA/Redevance:</span><span className="font-mono">{formatDT(tva_redevance)}</span></div>
                             <div className="flex justify-between items-center"><span>Contribution RTT:</span><span className="font-mono">{formatDT(contribution_rtt)}</span></div>
                             <div className="flex justify-between items-center"><span>Surtaxe Municipale:</span><span className="font-mono">{formatDT(surtaxe_municipale)}</span></div>
                            <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 3:</span><span className="font-mono">{formatDT(total_3)}</span></div>
                             <div className="flex justify-between items-center"><span>Avance/Consom.:</span><span className="font-mono">{formatDT(avance_consommation)}</span></div>
                             <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-bold">Net à Payer:</span>
                                <span className="font-bold font-mono">{formatDT(net_a_payer)}</span>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Ceci est une estimation basée sur les données entrées.
                           </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Button type="submit">Enregistrer le Calcul</Button>
            </form>
        </Form>
    );
}
