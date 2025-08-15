
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
import { Loader2, Replace, Save, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import type { Meter } from "@/lib/types";
import { useMetersStore } from "@/hooks/use-meters-store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const formSchema = z.object({
  newMeterId: z.string().min(1, "Le N° de compteur est requis."),
});

type FormValues = z.infer<typeof formSchema>;

interface ReplaceMeterFormProps {
    oldMeter: Meter;
}

export function ReplaceMeterForm({ oldMeter }: ReplaceMeterFormProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { updateMeter, addMeter } = useMetersStore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newMeterId: "",
    }
  });

  if (user.role !== "Financier") {
    return null;
  }
  
  const onSubmit = (values: FormValues) => {
    // 1. Create the new meter, inheriting properties from the old one
    const newMeter: Meter = {
      ...oldMeter,
      id: values.newMeterId,
      status: 'En service', // The new meter is active
      lastUpdate: new Date().toISOString().split('T')[0],
      dateDemandeInstallation: undefined,
      dateMiseEnService: new Date().toISOString().split('T')[0],
      description: `Remplace le compteur ${oldMeter.id}.`,
    };
    addMeter(newMeter);

    // 2. Update the old meter's status to 'Substitué'
    updateMeter({
      ...oldMeter,
      status: 'Substitué',
      lastUpdate: new Date().toISOString().split('T')[0],
      description: `${oldMeter.description || ''} (Remplacé par ${values.newMeterId})`.trim(),
    });

    toast({ title: "Compteur Remplacé", description: `Le compteur ${oldMeter.id} a été remplacé par ${values.newMeterId}.` });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
            <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <Replace className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
                <p>Remplacer le compteur</p>
            </TooltipContent>
        </Tooltip>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>Remplacer le compteur {oldMeter.id}</DialogTitle>
            <DialogDescription>
                Entrez le numéro du nouveau compteur qui prendra la relève pour cette référence de facturation. L'ancien compteur sera marqué comme 'Substitué'.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField control={form.control} name="newMeterId" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Nouveau N° de Compteur</FormLabel>
                      <FormControl><Input placeholder="Entrez le nouveau numéro" {...field} /></FormControl>
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
                  <Save className="mr-2" /> Remplacer
              </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
