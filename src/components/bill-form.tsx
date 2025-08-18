
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import type { Bill } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  reference: z.string().length(13, "Le numéro de facture doit comporter 13 chiffres."),
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  month: z.string().min(1, "Le mois est requis."),
  consumptionKWh: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"]),
  status: z.enum(["Payée", "Impayée"]),
  convenableSTEG: z.boolean().default(false),
  montantSTEG: z.coerce.number().optional(),
  
  // Basse Tension
  ancienIndex: z.coerce.number().optional(),
  nouveauIndex: z.coerce.number().optional(),
  prix_unitaire_bt: z.coerce.number().optional(),
  
  // Moyen Tension Horaire
  ancien_index_jour: z.coerce.number().optional(),
  nouveau_index_jour: z.coerce.number().optional(),
  ancien_index_pointe: z.coerce.number().optional(),
  nouveau_index_pointe: z.coerce.number().optional(),
  ancien_index_soir: z.coerce.number().optional(),
  nouveau_index_soir: z.coerce.number().optional(),
  ancien_index_nuit: z.coerce.number().optional(),
  nouveau_index_nuit: z.coerce.number().optional(),

  // Moyen Tension Forfaitaire
  mtf_ancien_index: z.coerce.number().optional(),
  mtf_nouveau_index: z.coerce.number().optional(),
  coefficient_multiplicateur: z.coerce.number().optional(),
  perte_en_charge: z.coerce.number().optional(),
  perte_a_vide: z.coerce.number().optional(),
  pu_consommation: z.coerce.number().optional(),
  prime_puissance: z.coerce.number().optional(),
  tva_consommation_percent: z.coerce.number().optional(),
  tva_redevance_percent: z.coerce.number().optional(),
  contribution_rtt: z.coerce.number().optional(),
  surtaxe_municipale: z.coerce.number().optional(),
  avance_consommation: z.coerce.number().optional(),
  bonification: z.coerce.number().optional(),

}).refine(data => {
    if (data.typeTension === "Moyen Tension Forfaitaire" && data.amount === undefined && !data.pu_consommation) return false;
    return true;
}, {
    message: "Le montant est requis pour le type Forfaitaire.",
    path: ["amount"],
}).refine(data => {
    if (!data.convenableSTEG && data.montantSTEG === undefined) return false;
    return true;
}, {
    message: "Le montant STEG est requis si la facture n'est pas convenable.",
    path: ["montantSTEG"],
});

type FormValues = z.infer<typeof formSchema>;

// Calculation constants
const bt_redevances_fixes = 28.000;
const bt_tva = 5.320;
const bt_contr_ertt = 0.000;

const mt_pu = {
    jour: 0.290,
    pointe_ete: 0.417,
    nuit: 0.222,
}

const calculateBasseTension = (ancienIndex: number = 0, nouveauIndex: number = 0, prixUnitaire: number = 0) => {
    let consommation = 0;
    const numAncienIndex = Number(ancienIndex);
    const numNouveauIndex = Number(nouveauIndex);

    if (numNouveauIndex >= numAncienIndex) {
        consommation = numNouveauIndex - numAncienIndex;
    } else {
        const indexLength = String(numAncienIndex).length;
        if (indexLength > 0) {
            const maxValue = Math.pow(10, indexLength) -1;
            consommation = (maxValue - numAncienIndex) + numNouveauIndex + 1;
        } else {
            consommation = numNouveauIndex;
        }
    }
    
    const montant = consommation * Number(prixUnitaire);
    
    const total_consommation = montant + bt_redevances_fixes;
    const total_taxes = bt_contr_ertt + bt_tva;
    const montant_a_payer = total_consommation + total_taxes;
    
    return { consommation, montant: parseFloat(montant_a_payer.toFixed(3)) };
}

const calculateMoyenTensionHoraire = (values: FormValues) => {
    const consommation_jour = Math.max(0, (Number(values.nouveau_index_jour) || 0) - (Number(values.ancien_index_jour) || 0));
    const consommation_pointe = Math.max(0, (Number(values.nouveau_index_pointe) || 0) - (Number(values.ancien_index_pointe) || 0));
    const consommation_soir = Math.max(0, (Number(values.nouveau_index_soir) || 0) - (Number(values.ancien_index_soir) || 0));
    const consommation_nuit = Math.max(0, (Number(values.nouveau_index_nuit) || 0) - (Number(values.ancien_index_nuit) || 0));

    const totalConsumption = consommation_jour + consommation_pointe + consommation_soir + consommation_nuit;

    const montant_jour = consommation_jour * mt_pu.jour;
    const montant_pointe = consommation_pointe * mt_pu.pointe_ete;
    const montant_soir = 0; // Assumption for now
    const montant_nuit = consommation_nuit * mt_pu.nuit;
    
    // This is a simplified subtotal. A real bill has more fees.
    const subtotal = montant_jour + montant_pointe + montant_soir + montant_nuit; 

    return { consommation: totalConsumption, montant: parseFloat(subtotal.toFixed(3)) };
}

const calculateMoyenTensionForfait = (values: FormValues) => {
    const ancien_index = Number(values.mtf_ancien_index) || 0;
    const nouveau_index = Number(values.mtf_nouveau_index) || 0;
    const coefficient_multiplicateur = Number(values.coefficient_multiplicateur) || 0;
    const perte_en_charge = Number(values.perte_en_charge) || 0;
    const perte_a_vide = Number(values.perte_a_vide) || 0;
    const pu_consommation = Number(values.pu_consommation) || 0;
    const prime_puissance = Number(values.prime_puissance) || 0;
    const tva_consommation_percent = Number(values.tva_consommation_percent) || 0;
    const tva_redevance_percent = Number(values.tva_redevance_percent) || 0;
    const contribution_rtt = Number(values.contribution_rtt) || 0;
    const surtaxe_municipale = Number(values.surtaxe_municipale) || 0;
    const avance_consommation = Number(values.avance_consommation) || 0;
    const bonification = Number(values.bonification) || 0;

    const energie_enregistree = Math.max(0, nouveau_index - ancien_index) * coefficient_multiplicateur;
    const consommation_a_facturer = energie_enregistree + perte_en_charge + perte_a_vide;
    const montant_consommation = consommation_a_facturer * pu_consommation;
    const sous_total_consommation = montant_consommation;
    const total_1 = sous_total_consommation - bonification;
    const total_2 = total_1 + prime_puissance;
    const tva_consommation = total_1 * (tva_consommation_percent / 100);
    const tva_redevance = prime_puissance * (tva_redevance_percent / 100);
    const total_3 = total_2 + tva_consommation + tva_redevance + contribution_rtt + surtaxe_municipale;
    const net_a_payer = total_3 + avance_consommation;

    return { consommation: consommation_a_facturer, montant: parseFloat(net_a_payer.toFixed(3)) };
}


interface BillFormProps {
    meterId?: string;
}

export function BillForm({ meterId }: BillFormProps) {
  const { meters } = useMetersStore();
  const { addBill } = useBillingStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        reference: "",
        meterId: meterId || "",
        month: "",
        typeTension: "Basse Tension",
        status: "Impayée",
        convenableSTEG: true,
        consumptionKWh: 0,
        amount: 0,
        montantSTEG: 0,
        // BT
        ancienIndex: 0,
        nouveauIndex: 0,
        prix_unitaire_bt: 0.250,
        // MT Horaire
        ancien_index_jour: 0,
        nouveau_index_jour: 0,
        ancien_index_pointe: 0,
        nouveau_index_pointe: 0,
        ancien_index_soir: 0,
        nouveau_index_soir: 0,
        ancien_index_nuit: 0,
        nouveau_index_nuit: 0,
        // MT Forfait
        mtf_ancien_index: 1483440,
        mtf_nouveau_index: 1489924,
        coefficient_multiplicateur: 1.0,
        perte_en_charge: 130,
        perte_a_vide: 260,
        pu_consommation: 0.291,
        prime_puissance: 250.000,
        tva_consommation_percent: 19,
        tva_redevance_percent: 19,
        contribution_rtt: 3.500,
        surtaxe_municipale: 68.740,
        avance_consommation: 31.134,
        bonification: 100.017,
    }
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (watchedValues.typeTension === "Basse Tension") {
        const { consommation, montant } = calculateBasseTension(Number(watchedValues.ancienIndex) || 0, Number(watchedValues.nouveauIndex) || 0, Number(watchedValues.prix_unitaire_bt) || 0);
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", montant);
    } else if (watchedValues.typeTension === "Moyen Tension Tranche Horaire") {
        const { consommation, montant } = calculateMoyenTensionHoraire(watchedValues);
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", montant);
    } else if (watchedValues.typeTension === "Moyen Tension Forfaitaire") {
        const { consommation, montant } = calculateMoyenTensionForfait(watchedValues);
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", montant);
    }
  }, [
    watchedValues.typeTension,
    // BT
    watchedValues.ancienIndex,
    watchedValues.nouveauIndex,
    watchedValues.prix_unitaire_bt,
    // MT Horaire
    watchedValues.ancien_index_jour,
    watchedValues.nouveau_index_jour,
    watchedValues.ancien_index_pointe,
    watchedValues.nouveau_index_pointe,
    watchedValues.ancien_index_soir,
    watchedValues.nouveau_index_soir,
    watchedValues.ancien_index_nuit,
    watchedValues.nouveau_index_nuit,
    // MT Forfait
    watchedValues.mtf_ancien_index,
    watchedValues.mtf_nouveau_index,
    watchedValues.coefficient_multiplicateur,
    watchedValues.perte_en_charge,
    watchedValues.perte_a_vide,
    watchedValues.pu_consommation,
    watchedValues.prime_puissance,
    watchedValues.tva_consommation_percent,
    watchedValues.tva_redevance_percent,
    watchedValues.contribution_rtt,
    watchedValues.surtaxe_municipale,
    watchedValues.avance_consommation,
    watchedValues.bonification,
    form.setValue,
  ]);


  const onSubmit = (values: FormValues) => {
    const newBill: Bill = {
        id: `BILL-${Date.now()}`,
        reference: values.reference,
        meterId: values.meterId,
        month: values.month,
        status: values.status,
        typeTension: values.typeTension,
        consumptionKWh: values.consumptionKWh ?? 0,
        amount: values.amount ?? 0,
        convenableSTEG: values.convenableSTEG,
        montantSTEG: values.montantSTEG,
        
        // BT
        ancienIndex: values.typeTension === "Basse Tension" ? values.ancienIndex : undefined,
        nouveauIndex: values.typeTension === "Basse Tension" ? values.nouveauIndex : undefined,
        
        // MT Horaire
        ancien_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_jour : undefined,
        nouveau_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_jour : undefined,
        ancien_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_pointe : undefined,
        nouveau_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_pointe : undefined,
        ancien_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_soir : undefined,
        nouveau_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_soir : undefined,
        ancien_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_nuit : undefined,
        nouveau_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_nuit : undefined,
        
        // MT Forfait
        mtf_ancien_index: values.typeTension === "Moyen Tension Forfaitaire" ? values.mtf_ancien_index : undefined,
        mtf_nouveau_index: values.typeTension === "Moyen Tension Forfaitaire" ? values.mtf_nouveau_index : undefined,
        coefficient_multiplicateur: values.typeTension === "Moyen Tension Forfaitaire" ? values.coefficient_multiplicateur : undefined,
        perte_en_charge: values.typeTension === "Moyen Tension Forfaitaire" ? values.perte_en_charge : undefined,
        perte_a_vide: values.typeTension === "Moyen Tension Forfaitaire" ? values.perte_a_vide : undefined,
        pu_consommation: values.typeTension === "Moyen Tension Forfaitaire" ? values.pu_consommation : undefined,
        prime_puissance: values.typeTension === "Moyen Tension Forfaitaire" ? values.prime_puissance : undefined,
        tva_consommation_percent: values.typeTension === "Moyen Tension Forfaitaire" ? values.tva_consommation_percent : undefined,
        tva_redevance_percent: values.typeTension === "Moyen Tension Forfaitaire" ? values.tva_redevance_percent : undefined,
        contribution_rtt: values.typeTension === "Moyen Tension Forfaitaire" ? values.contribution_rtt : undefined,
        surtaxe_municipale: values.typeTension === "Moyen Tension Forfaitaire" ? values.surtaxe_municipale : undefined,
        avance_consommation: values.typeTension === "Moyen Tension Forfaitaire" ? values.avance_consommation : undefined,
        bonification: values.typeTension === "Moyen Tension Forfaitaire" ? values.bonification : undefined,
    };
    addBill(newBill);
    toast({ title: "Facture ajoutée", description: "La nouvelle facture a été enregistrée avec succès." });
    router.push(`/dashboard/billing/${values.meterId}`);
  }
  
  const isCalculated = watchedValues.typeTension === 'Basse Tension' || watchedValues.typeTension === 'Moyen Tension Tranche Horaire' || watchedValues.typeTension === 'Moyen Tension Forfaitaire';
  const cancelHref = meterId ? `/dashboard/billing/${meterId}` : '/dashboard/billing';
  
  const difference = (Number(watchedValues.montantSTEG) || 0) - (Number(watchedValues.amount) || 0);
  
  const availableMeters = meters.filter(m => m.status === 'En service');

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
            <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>N° Facture (13 chiffres)</FormLabel><FormControl><Input placeholder="ex: 2023080123456" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="meterId" render={({ field }) => (
                <FormItem><FormLabel>N° Compteur</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!meterId}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un compteur" /></SelectTrigger></FormControl>
                        <SelectContent>{availableMeters.map(meter => (<SelectItem key={meter.id} value={meter.id}>{meter.id}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
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
                        <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="nouveauIndex" render={({ field }) => (
                        <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="prix_unitaire_bt" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Prix Unitaire (kWh)</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            )}

            {watchedValues.typeTension === 'Moyen Tension Tranche Horaire' && (
                <div className="space-y-4 rounded-md border p-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Jour</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Jour</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Soir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Soir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Anc. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel>Nouv. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}
            
            {watchedValues.typeTension === 'Moyen Tension Forfaitaire' && (
                <div className="md:col-span-2 space-y-4 rounded-md border p-4">
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="mtf_ancien_index" render={({ field }) => ( <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="mtf_nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="coefficient_multiplicateur" render={({ field }) => ( <FormItem><FormLabel>Coeff. Multiplicateur</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="perte_en_charge" render={({ field }) => ( <FormItem><FormLabel>Perte en Charge (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="perte_a_vide" render={({ field }) => ( <FormItem><FormLabel>Perte à Vide (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="pu_consommation" render={({ field }) => ( <FormItem><FormLabel>P.U. Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="prime_puissance" render={({ field }) => ( <FormItem><FormLabel>Prime de Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="bonification" render={({ field }) => ( <FormItem><FormLabel>Bonification</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="contribution_rtt" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="surtaxe_municipale" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="avance_consommation" render={({ field }) => ( <FormItem><FormLabel>Avance / Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                     </div>
                     <Separator />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="tva_consommation_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Consommation (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="tva_redevance_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Redevance (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}


            <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                <FormItem><FormLabel>Consommation (kWh)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value ?? 0} readOnly={isCalculated} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Montant Calculé (TND)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.001" {...field} value={field.value ?? 0} readOnly={isCalculated}/>
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

             <FormField control={form.control} name="month" render={({ field }) => (
                <FormItem><FormLabel>Mois Facture</FormLabel><FormControl><Input placeholder="ex: Août 2023" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

             <FormField
                control={form.control}
                name="convenableSTEG"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                    <div className="space-y-0.5">
                        <FormLabel>Convenable avec STEG</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            
            {!watchedValues.convenableSTEG && (
                <div className="md:col-span-2 space-y-4">
                    <FormField control={form.control} name="montantSTEG" render={({ field }) => (
                        <FormItem><FormLabel>Montant Facture STEG (TND)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.001" {...field} value={field.value ?? 0}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {typeof watchedValues.montantSTEG === 'number' && typeof watchedValues.amount === 'number' && (
                         <Alert variant={difference === 0 ? "default" : "destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Vérification de Montant</AlertTitle>
                            <AlertDescription>
                                Différence: {difference.toLocaleString('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 })}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}


            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href={cancelHref}><X className="mr-2" /> Annuler</Link>
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
