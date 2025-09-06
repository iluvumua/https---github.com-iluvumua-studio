
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
    ancien_index_jour: z.coerce.number().default(0),
    ancien_index_pointe: z.coerce.number().default(0),
    ancien_index_soir: z.coerce.number().default(0),
    ancien_index_nuit: z.coerce.number().default(0),
    nouveau_index_jour: z.coerce.number().default(0),
    nouveau_index_pointe: z.coerce.number().default(0),
    nouveau_index_soir: z.coerce.number().default(0),
    nouveau_index_nuit: z.coerce.number().default(0),
    
    coefficient_jour: z.coerce.number().optional(),
    coefficient_pointe: z.coerce.number().optional(),
    coefficient_soir: z.coerce.number().optional(),
    coefficient_nuit: z.coerce.number().optional(),

    prix_unitaire_jour: z.coerce.number().optional(),
    prix_unitaire_pointe: z.coerce.number().optional(),
    prix_unitaire_soir: z.coerce.number().optional(),
    prix_unitaire_nuit: z.coerce.number().optional(),

    prime_puissance_mth: z.coerce.number().default(0),
    depassement_puissance: z.coerce.number().default(0),
    location_materiel: z.coerce.number().default(0),
    frais_intervention: z.coerce.number().default(0),
    frais_relance: z.coerce.number().default(0),
    frais_retard: z.coerce.number().default(0),
    penalite_cos_phi: z.coerce.number().default(0),
    coefficient_k: z.coerce.number().default(0),

    tva_consommation: z.coerce.number().default(0),
    tva_redevance: z.coerce.number().default(0),
    contribution_rtt_mth: z.coerce.number().default(0),
    surtaxe_municipale_mth: z.coerce.number().default(0),
    avance_sur_consommation_mth: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

const calculateConsumptionWithRollover = (ancien?: number, nouveau?: number): number => {
    const numAncien = Number(ancien) || 0;
    const numNouveau = Number(nouveau) || 0;

    if (numNouveau >= numAncien) {
        return numNouveau - numAncien;
    }
    const ancienStr = String(numAncien);
    if (ancienStr.length === 0) return numNouveau;
    const maxValue = parseInt('9'.repeat(ancienStr.length), 10);
    return (maxValue - numAncien) + numNouveau + 1;
};

export function MoyenTensionForm() {
    const { settings } = useBillingSettingsStore();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...settings.moyenTensionHoraire,
            ancien_index_jour: 0,
            ancien_index_pointe: 0,
            ancien_index_soir: 0,
            ancien_index_nuit: 0,
            nouveau_index_jour: 0,
            nouveau_index_pointe: 0,
            nouveau_index_soir: 0,
            nouveau_index_nuit: 0,
            prime_puissance_mth: 0,
            depassement_puissance: 0,
            location_materiel: 0,
            frais_intervention: 0,
            frais_relance: 0,
            frais_retard: 0,
            penalite_cos_phi: 0,
            coefficient_k: 0,
            tva_consommation: 0,
            tva_redevance: 0,
            contribution_rtt_mth: 0,
            surtaxe_municipale_mth: 0,
            avance_sur_consommation_mth: 0,
        },
    });

    const watchedValues = useWatch({ control: form.control });
    
    const consommation_jour_calc = calculateConsumptionWithRollover(watchedValues.ancien_index_jour, watchedValues.nouveau_index_jour);
    const consommation_pointe_calc = calculateConsumptionWithRollover(watchedValues.ancien_index_pointe, watchedValues.nouveau_index_pointe);
    const consommation_soir_calc = calculateConsumptionWithRollover(watchedValues.ancien_index_soir, watchedValues.nouveau_index_soir);
    const consommation_nuit_calc = calculateConsumptionWithRollover(watchedValues.ancien_index_nuit, watchedValues.nouveau_index_nuit);

    const consommation_jour = consommation_jour_calc * (Number(watchedValues.coefficient_jour) || 1);
    const consommation_pointe = consommation_pointe_calc * (Number(watchedValues.coefficient_pointe) || 1);
    const consommation_soir = consommation_soir_calc * (Number(watchedValues.coefficient_soir) || 1);
    const consommation_nuit = consommation_nuit_calc * (Number(watchedValues.coefficient_nuit) || 1);

    const montant_jour = consommation_jour * (Number(watchedValues.prix_unitaire_jour) || 0);
    const montant_pointe = consommation_pointe * (Number(watchedValues.prix_unitaire_pointe) || 0);
    const montant_soir = consommation_soir * (Number(watchedValues.prix_unitaire_soir) || 0);
    const montant_nuit = consommation_nuit * (Number(watchedValues.prix_unitaire_nuit) || 0);
    
    const subtotal = montant_jour + montant_pointe + montant_soir + montant_nuit; 

    const group1Total = (Number(watchedValues.prime_puissance_mth) || 0) +
                        (Number(watchedValues.depassement_puissance) || 0) +
                        (Number(watchedValues.location_materiel) || 0) +
                        (Number(watchedValues.frais_intervention) || 0) +
                        (Number(watchedValues.frais_relance) || 0) +
                        (Number(watchedValues.frais_retard) || 0) +
                        (Number(watchedValues.penalite_cos_phi) || 0) +
                        (Number(watchedValues.coefficient_k) || 0);
    
    const group2Total = (Number(watchedValues.tva_consommation) || 0) +
                        (Number(watchedValues.tva_redevance) || 0) +
                        (Number(watchedValues.contribution_rtt_mth) || 0) +
                        (Number(watchedValues.surtaxe_municipale_mth) || 0);
    
    const finalAmount = subtotal + group1Total + group2Total + (Number(watchedValues.avance_sur_consommation_mth) || 0);
    const totalConsumption = consommation_jour + consommation_pointe + consommation_soir + consommation_nuit;

    function onSubmit(values: FormValues) {
        console.log(values);
    }
    
    const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);
    const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Index et Coefficients</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <h3 className="text-sm font-medium">Anc. Index</h3>
                                    <h3 className="text-sm font-medium">Nouv. Index</h3>
                                    <h3 className="text-sm font-medium">Coeff. K</h3>
                                    <h3 className="text-sm font-medium">P.U.</h3>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-x-4 gap-y-2 items-center">
                                    <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel>Jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="coefficient_jour" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="prix_unitaire_jour" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                
                                    <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Pointe</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="coefficient_pointe" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="prix_unitaire_pointe" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />

                                    <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel>Soir</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="coefficient_soir" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="prix_unitaire_soir" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                
                                    <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Nuit</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="coefficient_nuit" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="prix_unitaire_nuit" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Redevances et Frais</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="prime_puissance_mth" render={({ field }) => ( <FormItem><FormLabel>Prime Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="depassement_puissance" render={({ field }) => ( <FormItem><FormLabel>Dépassement</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="location_materiel" render={({ field }) => ( <FormItem><FormLabel>Location Matériel</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="frais_intervention" render={({ field }) => ( <FormItem><FormLabel>Intervention</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="frais_relance" render={({ field }) => ( <FormItem><FormLabel>Relance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="frais_retard" render={({ field }) => ( <FormItem><FormLabel>Retard</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="penalite_cos_phi" render={({ field }) => ( <FormItem><FormLabel>Pénalité Cos Φ</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="coefficient_k" render={({ field }) => ( <FormItem><FormLabel>Coefficient K</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Taxes et Avances</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="tva_consommation" render={({ field }) => ( <FormItem><FormLabel>TVA Conso.</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="tva_redevance" render={({ field }) => ( <FormItem><FormLabel>TVA Redev.</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="contribution_rtt_mth" render={({ field }) => ( <FormItem><FormLabel>Contr. RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="surtaxe_municipale_mth" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Mun.</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="avance_sur_consommation_mth" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Avance sur Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calcul de la Facture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Conso. Totale:</span>
                                <span className="font-mono">{formatKWh(totalConsumption)}</span>
                            </div>
                            <Separator/>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Montant Jour:</span>
                                <span className="font-mono">{formatDT(montant_jour)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Montant Pointe:</span>
                                <span className="font-mono">{formatDT(montant_pointe)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Montant Soir:</span>
                                <span className="font-mono">{formatDT(montant_soir)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Montant Nuit:</span>
                                <span className="font-mono">{formatDT(montant_nuit)}</span>
                            </div>
                             <Separator />
                              <div className="flex justify-between items-center font-medium">
                                <span className="text-muted-foreground">Sous-Total Consommation:</span>
                                <span className="font-mono">{formatDT(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-muted-foreground">Total Redevances & Frais:</span>
                                <span className="font-mono">{formatDT(group1Total)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-muted-foreground">Total Taxes:</span>
                                <span className="font-mono">{formatDT(group2Total)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-muted-foreground">Avance sur Conso:</span>
                                <span className="font-mono">{formatDT(watchedValues.avance_sur_consommation_mth || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-bold">Montant Total:</span>
                                <span className="font-bold font-mono">{formatDT(finalAmount)}</span>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Ceci est une estimation. Les P.U. et coefficients sont basés sur les paramètres.
                           </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Button type="submit">Enregistrer le Calcul</Button>
            </form>
        </Form>
    );
}

    
