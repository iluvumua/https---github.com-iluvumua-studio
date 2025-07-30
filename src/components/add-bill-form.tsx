
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import type { Bill } from "@/lib/types";

const formSchema = z.object({
  reference: z.string().min(1, "La référence est requise."),
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  month: z.string().min(1, "Le mois est requis."),
  consumptionKWh: z.coerce.number(),
  amount: z.coerce.number(),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"]),
  status: z.enum(["Payée", "Impayée"]),
  ancienIndex: z.coerce.number().optional(),
  nouveauIndex: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const pu = {
    tranche1: 0.195,
    tranche2: 0.239,
    tranche3: 0.330,
    tranche4: 0.408,
}
const redevances_fixes = 28.000;
const tva = 5.320;
const contr_ertt = 0.000;

const calculateMontantConsommation = (cons: number) => {
    let montant = 0;
    let rest = cons;
    if (rest > 0) { const t4 = Math.max(0, rest - 200); montant += t4 * pu.tranche4; rest -= t4; }
    if (rest > 0) { const t3 = Math.max(0, rest - 100); montant += t3 * pu.tranche3; rest -= t3; }
    if (rest > 0) { const t2 = Math.max(0, rest - 50); montant += t2 * pu.tranche2; rest -= t2; }
    if (rest > 0) { montant += rest * pu.tranche1; }
    return montant;
}

export function AddBillForm() {
  const { user } = useUser();
  const { meters } = useMetersStore();
  const { addBill } = useBillingStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        reference: "",
        meterId: "",
        month: "",
        consumptionKWh: 0,
        amount: 0,
        typeTension: "Basse Tension",
        status: "Impayée",
        ancienIndex: 0,
        nouveauIndex: 0,
    }
  });

  const watchTypeTension = form.watch("typeTension");
  const watchAncienIndex = form.watch("ancienIndex");
  const watchNouveauIndex = form.watch("nouveauIndex");

  useEffect(() => {
    if (watchTypeTension === "Basse Tension") {
        const consommation = Math.max(0, (watchNouveauIndex || 0) - (watchAncienIndex || 0));
        const montant_consommation = calculateMontantConsommation(consommation);
        const total_consommation = montant_consommation + redevances_fixes;
        const total_taxes = contr_ertt + tva;
        const montant_a_payer = total_consommation + total_taxes;
        
        form.setValue("consumptionKWh", consommation);
        form.setValue("amount", parseFloat(montant_a_payer.toFixed(3)));
    }
  }, [watchTypeTension, watchAncienIndex, watchNouveauIndex, form]);


  if (user.role !== "Financier") {
    return null;
  }

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
    };
    addBill(newBill);
    form.reset();
    setIsOpen(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter Facture
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                <DialogTitle>Ajouter une nouvelle facture</DialogTitle>
                <DialogDescription>
                    Remplissez les détails de la facture ci-dessous. Cliquez sur Enregistrer.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {watchTypeTension === 'Basse Tension' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="ancienIndex" render={({ field }) => (
                                <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="nouveauIndex" render={({ field }) => (
                                <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </>
                )}
                
                <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                    <FormItem><FormLabel>Consommation (kWh)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} readOnly={watchTypeTension === 'Basse Tension'} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Montant (TND)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" {...field} readOnly={watchTypeTension === 'Basse Tension'}/>
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
                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
                    <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
