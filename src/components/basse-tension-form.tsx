
"use client"

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    ancien_index: z.coerce.number().default(0),
    nouveau_index: z.coerce.number().default(0),
    redevances_fixes: z.coerce.number().default(28.000),
    contr_ertt: z.coerce.number().default(0.000),
    tva: z.coerce.number().default(5.320),
});

type FormValues = z.infer<typeof formSchema>;

const pu = {
    tranche1: 0.195, // Jusqu'à 50 kWh
    tranche2: 0.239, // 51 à 100 kWh
    tranche3: 0.330, // 101 à 200 kWh
    tranche4: 0.408, // au-delà de 200 kWh
}

export function BasseTensionForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ancien_index: 328093,
            nouveau_index: 328093,
            redevances_fixes: 28.000,
            contr_ertt: 0.000,
            tva: 5.320,
        },
    });

    const watch = useWatch({ control: form.control });

    let consommation = 0;
    if (watch.nouveau_index >= watch.ancien_index) {
        consommation = watch.nouveau_index - watch.ancien_index;
    } else {
        // Handle meter rollover (e.g., from 99999 to 0)
        const indexLength = String(watch.ancien_index).length;
        if (indexLength > 0) {
            const maxValue = Number('9'.repeat(indexLength));
            consommation = (maxValue - watch.ancien_index) + watch.nouveau_index + 1;
        } else {
            consommation = watch.nouveau_index; // Should not happen with valid data
        }
    }

    const calculateMontantConsommation = (cons: number) => {
        let montant = 0;
        let rest = cons;

        if (rest > 0) {
            const t4 = Math.max(0, rest - 200);
            montant += t4 * pu.tranche4;
            rest -= t4;
        }
        if (rest > 0) {
            const t3 = Math.max(0, rest - 100);
            montant += t3 * pu.tranche3;
            rest -= t3;
        }
        if (rest > 0) {
            const t2 = Math.max(0, rest - 50);
            montant += t2 * pu.tranche2;
            rest -= t2;
        }
        if (rest > 0) {
            montant += rest * pu.tranche1;
        }

        return montant;
    }

    const montant_consommation = calculateMontantConsommation(consommation);
    const total_consommation = montant_consommation + watch.redevances_fixes;
    const total_taxes = watch.contr_ertt + watch.tva;
    const montant_a_payer = total_consommation + total_taxes;

    function onSubmit(values: FormValues) {
        console.log(values);
    }
    
    const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Données de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index" render={({ field }) => ( <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                            <FormField control={form.control} name="redevances_fixes" render={({ field }) => ( <FormItem><FormLabel>Redevances Fixes</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="contr_ertt" render={({ field }) => ( <FormItem><FormLabel>Contr. ERTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="tva" render={({ field }) => ( <FormItem><FormLabel>TVA</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calcul de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation (kWh):</span>
                                <span className="text-sm font-mono">{consommation.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Montant Consommation:</span>
                                <span className="text-sm font-mono">{formatDT(montant_consommation)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-sm">Total Consommation:</span>
                                <span className="text-sm font-mono">{formatDT(total_consommation)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-sm">Total Taxes:</span>
                                <span className="text-sm font-mono">{formatDT(total_taxes)}</span>
                            </div>
                            <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-bold">Montant à Payer:</span>
                                <span className="font-bold font-mono">{formatDT(montant_a_payer)}</span>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Ceci est une estimation basée sur les tarifs standards.
                           </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Button type="submit">Enregistrer le Calcul</Button>
            </form>
        </Form>
    );
}
