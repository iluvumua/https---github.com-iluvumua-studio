
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
    perte_en_charge: z.coerce.number().default(130),
    perte_a_vide: z.coerce.number().default(260),
    pu_consommation: z.coerce.number().default(0.291),
    prime_puissance: z.coerce.number().default(250.000),
    tva_consommation_percent: z.coerce.number().default(19), // 361.060 / 1900.317 = 0.19
    tva_redevance_percent: z.coerce.number().default(19), // 47.500 / 250.000 = 0.19
    contribution_rtt: z.coerce.number().default(3.500),
    surtaxe_municipale: z.coerce.number().default(68.740),
    avance_consommation: z.coerce.number().default(31.134),
    bonification: z.coerce.number().default(100.017),
});

type FormValues = z.infer<typeof formSchema>;

export function MoyenTensionForfaitForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const watch = useWatch({ control: form.control });

    // Calculations
    const energie_enregistree = Math.max(0, watch.nouveau_index - watch.ancien_index) * watch.coefficient_multiplicateur;
    const consommation_a_facturer = energie_enregistree + watch.perte_en_charge + watch.perte_a_vide;
    const montant_consommation = consommation_a_facturer * watch.pu_consommation;
    const sous_total_consommation = montant_consommation; // In this bill, it's just the consumption amount
    
    const total_1 = sous_total_consommation - watch.bonification;
    const total_2 = total_1 + watch.prime_puissance;
    
    const tva_consommation = total_1 * (watch.tva_consommation_percent / 100);
    const tva_redevance = watch.prime_puissance * (watch.tva_redevance_percent / 100);

    const total_3 = total_2 + tva_consommation + tva_redevance + watch.contribution_rtt + watch.surtaxe_municipale;
    
    const net_a_payer = total_3 + watch.avance_consommation;


    function onSubmit(values: FormValues) {
        console.log(values);
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
                            <FormField control={form.control} name="perte_en_charge" render={({ field }) => ( <FormItem><FormLabel>Perte en Charge (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
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
                            <FormField control={form.control} name="bonification" render={({ field }) => ( <FormItem><FormLabel>Bonification</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="contribution_rtt" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="surtaxe_municipale" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="avance_consommation" render={({ field }) => ( <FormItem><FormLabel>Avance / Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Calcul de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                             <div className="flex justify-between items-center"><span>Consommation à Facturer:</span><span className="font-mono">{formatKWh(consommation_a_facturer)} kWh</span></div>
                             <div className="flex justify-between items-center"><span>Montant Consommation:</span><span className="font-mono">{formatDT(montant_consommation)}</span></div>
                             <div className="flex justify-between items-center"><span>Bonification:</span><span className="font-mono text-green-500">-{formatDT(watch.bonification)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 1:</span><span className="font-mono">{formatDT(total_1)}</span></div>
                             <div className="flex justify-between items-center"><span>Prime de Puissance:</span><span className="font-mono">{formatDT(watch.prime_puissance)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 2:</span><span className="font-mono">{formatDT(total_2)}</span></div>
                             <div className="flex justify-between items-center"><span>TVA/Consommation:</span><span className="font-mono">{formatDT(tva_consommation)}</span></div>
                             <div className="flex justify-between items-center"><span>TVA/Redevance:</span><span className="font-mono">{formatDT(tva_redevance)}</span></div>
                             <div className="flex justify-between items-center"><span>Contribution RTT:</span><span className="font-mono">{formatDT(watch.contribution_rtt)}</span></div>
                             <div className="flex justify-between items-center"><span>Surtaxe Municipale:</span><span className="font-mono">{formatDT(watch.surtaxe_municipale)}</span></div>
                            <Separator />
                             <div className="flex justify-between items-center font-medium"><span>Total 3:</span><span className="font-mono">{formatDT(total_3)}</span></div>
                             <div className="flex justify-between items-center"><span>Avance/Consom.:</span><span className="font-mono">{formatDT(watch.avance_consommation)}</span></div>
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
