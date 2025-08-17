
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
    ancien_index: z.coerce.number().default(0),
    nouveau_index: z.coerce.number().default(0),
    prix_unitaire: z.coerce.number().default(0.250),
    redevances_fixes: z.coerce.number().default(28.000),
    contr_ertt: z.coerce.number().default(0.000),
    tva: z.coerce.number().default(5.320),
});

type FormValues = z.infer<typeof formSchema>;

export function BasseTensionForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ancien_index: 328093,
            nouveau_index: 328093,
            prix_unitaire: 0.250,
            redevances_fixes: 28.000,
            contr_ertt: 0.000,
            tva: 5.320,
        },
    });

    const watchedValues = useWatch({ control: form.control });

    const ancien_index = parseFloat(String(watchedValues.ancien_index)) || 0;
    const nouveau_index = parseFloat(String(watchedValues.nouveau_index)) || 0;
    const prix_unitaire = parseFloat(String(watchedValues.prix_unitaire)) || 0;
    const redevances_fixes = parseFloat(String(watchedValues.redevances_fixes)) || 0;
    const contr_ertt = parseFloat(String(watchedValues.contr_ertt)) || 0;
    const tva = parseFloat(String(watchedValues.tva)) || 0;

    let consommation = 0;
    if (nouveau_index >= ancien_index) {
        consommation = nouveau_index - ancien_index;
    } else {
        const indexLength = String(ancien_index).length;
        if (indexLength > 0) {
            const maxValue = Number('9'.repeat(indexLength));
            consommation = (maxValue - ancien_index) + nouveau_index + 1;
        } else {
            consommation = nouveau_index;
        }
    }

    const montant_consommation = consommation * prix_unitaire;
    const total_consommation = montant_consommation + redevances_fixes;
    const total_taxes = contr_ertt + tva;
    const montant_a_payer = total_consommation + total_taxes;

    function onSubmit(values: FormValues) {
        console.log(values);
    }
    
    const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Données de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FormField control={form.control} name="ancien_index" render={({ field }) => ( <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="prix_unitaire" render={({ field }) => ( <FormItem><FormLabel>Prix Unitaire (kWh)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
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
