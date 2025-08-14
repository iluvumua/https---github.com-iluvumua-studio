
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
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import type { Bill } from "@/lib/types";
import { useBillingStore } from "@/hooks/use-billing-store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  reference: z.string().min(1, "La référence est requise."),
  month: z.string().min(1, "Le mois est requis."),
  consumptionKWh: z.coerce.number(),
  amount: z.coerce.number(),
  status: z.enum(["Payée", "Impayée"]),
});

type FormValues = z.infer<typeof formSchema>;

interface EditBillFormProps {
    bill: Bill;
}

export function EditBillForm({ bill }: EditBillFormProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { updateBill } = useBillingStore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: bill.reference,
      month: bill.month,
      consumptionKWh: bill.consumptionKWh,
      amount: bill.amount,
      status: bill.status,
    }
  });

  if (user.role !== "Financier") {
    return null;
  }
  
  const onSubmit = (values: FormValues) => {
    const updatedBill: Bill = {
        ...bill,
        ...values,
    };
    updateBill(updatedBill);
    toast({ title: "Facture modifiée", description: "La facture a été mise à jour." });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
            <DialogDescription>
                Mettez à jour les détails de la facture. Cliquez sur Enregistrer lorsque vous avez terminé.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField control={form.control} name="reference" render={({ field }) => (
                  <FormItem><FormLabel>Réf. Facture</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="month" render={({ field }) => (
                  <FormItem><FormLabel>Mois</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                  <FormItem><FormLabel>Consommation (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Montant (TND)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="mr-2" /> Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2" /> Enregistrer
              </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
