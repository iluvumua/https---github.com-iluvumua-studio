
"use client";

import React, { useState } from "react";
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
  consumptionKWh: z.coerce.number().positive("La consommation est requise."),
  amount: z.coerce.number().positive("Le montant est requis."),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  status: z.enum(["Payée", "Impayée"]),
});

type FormValues = z.infer<typeof formSchema>;

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
        typeTension: "Moyenne Tension",
        status: "Impayée",
    }
  });

  if (user.role !== "Financier") {
    return null;
  }

  const onSubmit = (values: FormValues) => {
    const newBill: Bill = {
        id: `BILL-${Date.now()}`,
        ...values,
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
                <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">N° Facture</FormLabel>
                        <FormControl className="col-span-3">
                        <Input placeholder="ex: 552200-AUG23" {...field} />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="meterId"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">N° Compteur</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="col-span-3">
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un compteur" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {meters.map(meter => (
                                    <SelectItem key={meter.id} value={meter.id}>{meter.id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Mois</FormLabel>
                        <FormControl className="col-span-3">
                        <Input placeholder="ex: Août 2023" {...field} />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="consumptionKWh"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Consommation (kWh)</FormLabel>
                        <FormControl className="col-span-3">
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Montant (TND)</FormLabel>
                        <FormControl className="col-span-3">
                        <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="typeTension"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Type Tension</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="col-span-3">
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Moyenne Tension">Moyenne Tension</SelectItem>
                                <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="col-span-3">
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               <SelectItem value="Impayée">Impayée</SelectItem>
                               <SelectItem value="Payée">Payée</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                    )}
                />

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
