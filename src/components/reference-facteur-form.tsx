
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import type { Meter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  meterId: z.string().min(1, "Veuillez sélectionner un compteur."),
  referenceFacteur: z.string().length(9, "La Réf. Facteur doit comporter 9 chiffres."),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"], {
    required_error: "Le type de tension est requis."
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ReferenceFacteurFormProps {
    onFinished?: () => void;
}

export function ReferenceFacteurForm({ onFinished }: ReferenceFacteurFormProps) {
  const { meters, updateMeter } = useMetersStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meterId: "",
      referenceFacteur: "",
      typeTension: undefined,
    }
  });

  const watchedMeterId = form.watch("meterId");

  useEffect(() => {
    if (watchedMeterId) {
      const selectedMeter = meters.find(m => m.id === watchedMeterId);
      if (selectedMeter) {
        form.setValue("referenceFacteur", selectedMeter.referenceFacteur || "");
        form.setValue("typeTension", selectedMeter.typeTension);
      } else {
        form.setValue("referenceFacteur", "");
        form.setValue("typeTension", undefined);
      }
    }
  }, [watchedMeterId, meters, form]);

  const onSubmit = (values: FormValues) => {
    const meterToUpdate = meters.find(m => m.id === values.meterId);
    if (!meterToUpdate) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Compteur non trouvé.",
        });
        return;
    }

    const updatedMeter: Meter = {
      ...meterToUpdate,
      referenceFacteur: values.referenceFacteur,
      typeTension: values.typeTension,
      lastUpdate: new Date().toISOString().split('T')[0],
    };

    updateMeter(updatedMeter);
    toast({ title: "Référence mise à jour", description: "La référence de facteur a été enregistrée avec succès." });
    
    if (onFinished) {
        onFinished();
    } else {
        router.push('/dashboard/billing');
    }
  }

  const handleCancel = () => {
    if (onFinished) {
        onFinished();
    } else {
        router.push('/dashboard/billing');
    }
  }
  
  const selectedMeter = meters.find(m => m.id === watchedMeterId);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="meterId"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>N° Compteur</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un compteur" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {meters.filter(m => m.status === 'En service').map(meter => (
                                    <SelectItem key={meter.id} value={meter.id}>
                                        {meter.id} ({meter.description || 'Pas de description'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField control={form.control} name="referenceFacteur" render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Réf. Facteur (9 chiffres)</FormLabel>
                        <FormControl>
                            <Input placeholder="ex: 378051249" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem> 
                )} />
                 <FormField
                    control={form.control}
                    name="typeTension"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type de Tension</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type de tension" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                                <SelectItem value="Moyen Tension Forfaitaire">Moyen Tension - Forfaitaire</SelectItem>
                                <SelectItem value="Moyen Tension Tranche Horaire">Moyen Tension - Tranche Horaire</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                </Button>
            </div>
        </form>
    </Form>
  );
}
