
"use client"

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBillingSettingsStore } from '@/hooks/use-billing-settings-store';

const formSchema = z.object({
    ancien_index: z.coerce.number().default(0),
    nouveau_index: z.coerce.number().default(0),
    nombre_mois: z.coerce.number().min(1).default(1),
    tranche1_pu: z.coerce.number().optional(),
    tranche2_pu: z.coerce.number().optional(),
    tranche3_pu: z.coerce.number().optional(),
    tranche4_pu: z.coerce.number().optional(),
    surtaxe_municipale: z.coerce.number().optional(),
    frais_transition_energetique: z.coerce.number().optional(),
    redevances_fixes: z.coerce.number().default(28.000),
    tva_percent: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BasseTensionForm() {
    const { settings } = useBillingSettingsStore();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ancien_index: 328093,
            nouveau_index: 328093,
            nombre_mois: 1,
            tranche1_pu: settings.basseTension.tranche1,
            tranche2_pu: settings.basseTension.tranche2,
            tranche3_pu: settings.basseTension.tranche3,
            tranche4_pu: settings.basseTension.tranche4,
            surtaxe_municipale: settings.basseTension.surtaxe_municipale,
            frais_transition_energetique: settings.basseTension.frais_transition_energetique,
            redevances_fixes: settings.basseTension.redevances_fixes,
            tva_percent: settings.basseTension.tva_bt_percent,
        },
    });

    const watchedValues = useWatch({ control: form.control });

    const {
        ancien_index, nouveau_index, nombre_mois,
        tranche1_pu, tranche2_pu, tranche3_pu, tranche4_pu,
        surtaxe_municipale, frais_transition_energetique,
        redevances_fixes, tva_percent
    } = watchedValues;
    
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
    
    const conso_mensuelle = consommation / (nombre_mois || 1);

    let montant_tranche1 = 0, montant_tranche2 = 0, montant_tranche3 = 0, montant_tranche4 = 0;

    if (conso_mensuelle > 0) {
        const t1 = Math.min(conso_mensuelle, 200);
        montant_tranche1 = t1 * (tranche1_pu || 0);
    }
    if (conso_mensuelle > 200) {
        const t2 = Math.min(conso_mensuelle - 200, 100); // 300 - 200
        montant_tranche2 = t2 * (tranche2_pu || 0);
    }
    if (conso_mensuelle > 300) {
        const t3 = Math.min(conso_mensuelle - 300, 200); // 500 - 300
        montant_tranche3 = t3 * (tranche3_pu || 0);
    }
    if (conso_mensuelle > 500) {
        const t4 = conso_mensuelle - 500;
        montant_tranche4 = t4 * (tranche4_pu || 0);
    }

    const total_tranches = (montant_tranche1 + montant_tranche2 + montant_tranche3 + montant_tranche4) * (nombre_mois || 1);
    const montant_surtaxe = consommation * (surtaxe_municipale || 0);
    const montant_frais_transition = consommation * (frais_transition_energetique || 0);
    
    const sous_total = total_tranches + (redevances_fixes || 0) + montant_surtaxe + montant_frais_transition;
    const montant_tva = sous_total * ((tva_percent || 0) / 100);
    const montant_a_payer = sous_total + montant_tva;

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
                            <FormField control={form.control} name="nombre_mois" render={({ field }) => ( <FormItem><FormLabel>Nombre de Mois</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calcul de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation Totale (kWh):</span>
                                <span className="text-sm font-mono">{consommation.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Montant Tranches:</span>
                                <span className="text-sm font-mono">{formatDT(total_tranches)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-sm">Sous-Total:</span>
                                <span className="text-sm font-mono">{formatDT(sous_total)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-sm">TVA ({tva_percent || 0}%):</span>
                                <span className="text-sm font-mono">{formatDT(montant_tva)}</span>
                            </div>
                            <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-bold">Montant à Payer:</span>
                                <span className="font-bold font-mono">{formatDT(montant_a_payer)}</span>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Ceci est une estimation basée sur les tarifs non-résidentiels.
                           </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Button type="submit">Enregistrer le Calcul</Button>
            </form>
        </Form>
    );
}
