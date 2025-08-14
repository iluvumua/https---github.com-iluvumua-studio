
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import type { Bill } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  reference: z.string().min(1, "La référence est requise."),
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  month: z.string().min(1, "Le mois est requis."),
  consumptionKWh: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"]),
  status: z.enum(["Payée", "Impayée"]),
  
  // Basse Tension
  ancienIndex: z.coerce.number().optional(),
  nouveauIndex: z.coerce.number().optional(),
  
  // Moyen Tension Horaire
  ancien_index_jour: z.coerce.number().optional(),
  nouveau_index_jour: z.coerce.number().optional(),
  ancien_index_pointe: z.coerce.number().optional(),
  nouveau_index_pointe: z.coerce.number().optional(),
  ancien_index_soir: z.coerce.number().optional(),
  nouveau_index_soir: z.coerce.number().optional(),
  ancien_index_nuit: z.coerce.number().optional(),
  nouveau_index_nuit: z.coerce.number().optional(),
}).refine(data => {
    if (data.typeTension === "Moyen Tension Forfaitaire" && data.amount === undefined) return false;
    return true;
}, {
    message: "Le montant est requis pour le type Forfaitaire.",
    path: ["amount"],
});

type FormValues = z.infer<typeof formSchema>;

// Calculation constants
const bt_pu = {
    tranche1: 0.195,
    tranche2: 0.239,
    tranche3: 0.330,
    tranche4: 0.408,
}
const bt_redevances_fixes = 28.000;
const bt_tva = 5.320;
const bt_contr_ertt = 0.000;

const mt_pu = {
    jour: 0.290,
    pointe_ete: 0.417,
    nuit: 0.222,
}

const calculateBasseTension = (ancienIndex: number = 0, nouveauIndex: number = 0) => {
    const consommation = Math.max(0, nouveauIndex - ancienIndex);
    let montant = 0;
    let rest = consommation;
    if (rest > 0) { const t4 = Math.max(0, rest - 200); montant += t4 * bt_pu.tranche4; rest -= t4; }
    if (rest > 0) { const t3 = Math.max(0, rest - 100); montant += t3 * bt_pu.tranche3; rest -= t3; }
    if (rest > 0) { const t2 = Math.max(0, rest - 50); montant += t2 * bt_pu.tranche2; rest -= t2; }
    if (rest > 0) { montant += rest * bt_pu.tranche1; }
    
    const total_consommation = montant + bt_redevances_fixes;
    const total_taxes = bt_contr_ertt + bt_tva;
    const montant_a_payer = total_consommation + total_taxes;
    
    return { consommation, montant: parseFloat(montant_a_payer.toFixed(3)) };
}

const calculateMoyenTensionHoraire = (values: FormValues) => {
    const consommation_jour = Math.max(0, (values.nouveau_index_jour || 0) - (values.ancien_index_jour || 0));
    const consommation_pointe = Math.max(0, (values.nouveau_index_pointe || 0) - (values.ancien_index_pointe || 0));
    const consommation_soir = Math.max(0, (values.nouveau_index_soir || 0) - (values.ancien_index_soir || 0));
    const consommation_nuit = Math.max(0, (values.nouveau_index_nuit || 0) - (values.ancien_index_nuit || 0));

    const totalConsumption = consommation_jour + consommation_pointe + consommation_soir + consommation_nuit;

    const montant_jour = consommation_jour * mt_pu.jour;
    const montant_pointe = consommation_pointe * mt_pu.pointe_ete;
    const montant_soir = 0; // Assumption for now
    const montant_nuit = consommation_nuit * mt_pu.nuit;
    
    // This is a simplified subtotal. A real bill has more fees.
    const subtotal = montant_jour + montant_pointe + montant_soir + montant_nuit; 

    return { consommation: totalConsumption, montant: parseFloat(subtotal.toFixed(3)) };
}


export function BillForm() {
  const { meters } = useMetersStore();
  const { addBill } = useBillingStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        reference: "",
        meterId: "",
        month: "",
        typeTension: "Basse Tension",
        status: "Impayée",
    }
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (watchedValues.typeTension === "Basse Tension") {
        const { consommation, montant } = calculateBasseTension(watchedValues.ancienIndex, watchedValues.nouveauIndex);
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", montant);
    } else if (watchedValues.typeTension === "Moyen Tension Tranche Horaire") {
        const { consommation, montant } = calculateMoyenTensionHoraire(watchedValues);
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", montant);
    }
  }, [
    watchedValues.typeTension,
    watchedValues.ancienIndex,
    watchedValues.nouveauIndex,
    watchedValues.ancien_index_jour,
    watchedValues.nouveau_index_jour,
    watchedValues.ancien_index_pointe,
    watchedValues.nouveau_index_pointe,
    watchedValues.ancien_index_soir,
    watchedValues.nouveau_index_soir,
    watchedValues.ancien_index_nuit,
    watchedValues.nouveau_index_nuit,
    form.setValue,
    form
  ]);


  const onSubmit = (values: FormValues) => {
    const newBill: Bill = {
        id: `BILL-${Date.now()}`,
        reference: values.reference,
        meterId: values.meterId,
        month: values.month,
        status: values.status,
        typeTension: values.typeTension,
        consumptionKWh: values.consumptionKWh,
        amount: values.amount,
        ancienIndex: values.typeTension === "Basse Tension" ? values.ancienIndex : undefined,
        nouveauIndex: values.typeTension === "Basse Tension" ? values.nouveauIndex : undefined,
        ancien_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_jour : undefined,
        nouveau_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_jour : undefined,
        ancien_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_pointe : undefined,
        nouveau_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_pointe : undefined,
        ancien_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_soir : undefined,
        nouveau_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_soir : undefined,
        ancien_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_nuit : undefined,
        nouveau_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_nuit : undefined,
    };
    addBill(newBill);
    toast({ title: "Facture ajoutée", description: "La nouvelle facture a été enregistrée avec succès." });
    router.push('/dashboard/billing');
  }
  
  const isCalculated = watchedValues.typeTension === 'Basse Tension' || watchedValues.typeTension === 'Moyen Tension Tranche Horaire';
  const isForfait = watchedValues.typeTension === 'Moyen Tension Forfaitaire';

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
            <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>N° Facture</FormLabel><FormControl><Input placeholder="ex: 552200-AUG23" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="meterId" render={({ field }) => (
                <FormItem><FormLabel>N° Compteur</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un compteur" /></SelectTrigger></FormControl>
                        <SelectContent>{meters.map(meter => (<SelectItem key={meter.id} value={meter.id}>{meter.id}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="month" render={({ field }) => (
                <FormItem><FormLabel>Mois</FormLabel><FormControl><Input placeholder="ex: Août 2023" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="typeTension" render={({ field }) => (
                <FormItem><FormLabel>Type Tension</FormLabel>
                    <Select onValueChange={(value) => {
                        form.setValue('typeTension', value as any);
                        form.reset({
                            ...form.getValues(),
                            typeTension: value as any,
                            consumptionKWh: 0,
                            amount: 0,
                            ancienIndex: undefined,
                            nouveauIndex: undefined,
                            ancien_index_jour: undefined,
                            nouveau_index_jour: undefined,
                            ancien_index_pointe: undefined,
                            nouveau_index_pointe: undefined,
                            ancien_index_soir: undefined,
                            nouveau_index_soir: undefined,
                            ancien_index_nuit: undefined,
                            nouveau_index_nuit: undefined,
                        });
                    }} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                            <SelectItem value="Moyen Tension Forfaitaire">Moyen Tension Forfaitaire</SelectItem>
                            <SelectItem value="Moyen Tension Tranche Horaire">Moyen Tension Tranche Horaire</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            {watchedValues.typeTension === 'Basse Tension' && (
                <div className="grid grid-cols-2 gap-4 rounded-md border p-4 md:col-span-2">
                    <FormField control={form.control} name="ancienIndex" render={({ field }) => (
                        <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="nouveauIndex" render={({ field }) => (
                        <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            )}

            {watchedValues.typeTension === 'Moyen Tension Tranche Horaire' && (
                <div className="space-y-4 rounded-md border p-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Soir</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Soir</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}
            
            <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                <FormItem><FormLabel>Consommation (kWh)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} readOnly={isCalculated} disabled={isForfait} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Montant (TND)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.001" {...field} readOnly={isCalculated}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                           <SelectItem value="Impayée">Impayée</SelectItem>
                           <SelectItem value="Payée">Payée</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/billing"><X className="mr-2" /> Annuler</Link>
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2" /> Enregistrer
                </Button>
            </div>
        </form>
    </Form>
  );
}
