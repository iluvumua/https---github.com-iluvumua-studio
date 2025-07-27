
"use client"

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    ancien_index_jour: z.coerce.number().default(0),
    ancien_index_pointe: z.coerce.number().default(0),
    ancien_index_soir: z.coerce.number().default(0),
    ancien_index_nuit: z.coerce.number().default(0),
    ancien_index_reactif: z.coerce.number().default(0),
    nouveau_index_jour: z.coerce.number().default(0),
    nouveau_index_pointe: z.coerce.number().default(0),
    nouveau_index_soir: z.coerce.number().default(0),
    nouveau_index_nuit: z.coerce.number().default(0),
    nouveau_index_reactif: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

const pu = {
    jour: 0.290,
    pointe_soir: 0.377,
    pointe_ete: 0.417,
    nuit: 0.222,
}

export function MoyenTensionForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ancien_index_jour: 0,
            ancien_index_pointe: 0,
            ancien_index_soir: 0,
            ancien_index_nuit: 0,
            ancien_index_reactif: 0,
            nouveau_index_jour: 0,
            nouveau_index_pointe: 0,
            nouveau_index_soir: 0,
            nouveau_index_nuit: 0,
            nouveau_index_reactif: 0,
        },
    });

    const watch = useWatch({ control: form.control });

    const consommation_jour = Math.max(0, watch.nouveau_index_jour - watch.ancien_index_jour);
    const consommation_pointe = Math.max(0, watch.nouveau_index_pointe - watch.ancien_index_pointe);
    const consommation_soir = Math.max(0, watch.nouveau_index_soir - watch.ancien_index_soir);
    const consommation_nuit = Math.max(0, watch.nouveau_index_nuit - watch.ancien_index_nuit);
    
    const montant_jour = consommation_jour * pu.jour;
    const montant_pointe = consommation_pointe * pu.pointe_ete;
    const montant_soir = consommation_soir * 0; // pu.pointe_soir is not used in the sample calculation for soir
    const montant_nuit = consommation_nuit * pu.nuit;
    const subtotal = montant_jour + montant_pointe + montant_soir + montant_nuit;

    function onSubmit(values: FormValues) {
        console.log(values);
        // Here you would typically send the data to a server
    }
    
    const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(value);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Index du Compteur</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <h3 className="text-sm font-medium">Ancien Index</h3>
                                <h3 className="text-sm font-medium">Nouveau Index</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel>Jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel>Jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Pointe</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Pointe</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                             <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel>Soir</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel>Soir</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                             <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Nuit</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Nuit</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                               <FormField control={form.control} name="ancien_index_reactif" render={({ field }) => ( <FormItem><FormLabel>Réactif</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                               <FormField control={form.control} name="nouveau_index_reactif" render={({ field }) => ( <FormItem><FormLabel>Réactif</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calcul de la Consommation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation Jour:</span>
                                <span className="text-sm font-mono">{consommation_jour.toLocaleString()} kWh</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation Pointe:</span>
                                <span className="text-sm font-mono">{consommation_pointe.toLocaleString()} kWh</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation Soir:</span>
                                <span className="text-sm font-mono">{consommation_soir.toLocaleString()} kWh</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Consommation Nuit:</span>
                                <span className="text-sm font-mono">{consommation_nuit.toLocaleString()} kWh</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Montant Jour:</span>
                                <span className="text-sm font-mono font-semibold">{formatDT(montant_jour)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Montant Pointe:</span>
                                <span className="text-sm font-mono font-semibold">{formatDT(montant_pointe)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Montant Soir:</span>
                                <span className="text-sm font-mono font-semibold">{formatDT(montant_soir)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Montant Nuit:</span>
                                <span className="text-sm font-mono font-semibold">{formatDT(montant_nuit)}</span>
                            </div>
                             <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-bold">Sous-Total:</span>
                                <span className="font-bold font-mono">{formatDT(subtotal)}</span>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Ceci est une estimation. D'autres frais (prime, taxes) s'appliqueront.
                           </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Button type="submit">Enregistrer et Calculer le Total</Button>
            </form>
        </Form>
    );
}

