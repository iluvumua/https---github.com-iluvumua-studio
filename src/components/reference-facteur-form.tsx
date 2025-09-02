
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X, Building, Network } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import type { Meter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Combobox } from "./combobox";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  meterId: z.string().min(1, "Veuillez sélectionner un compteur."),
  referenceFacteur: z.string().length(9, "Le Numéro Facture doit comporter 9 chiffres."),
  billingAddress: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReferenceFacteurFormProps {
    onFinished?: () => void;
}

export function ReferenceFacteurForm({ onFinished }: ReferenceFacteurFormProps) {
  const { meters, updateMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const numeroFactureParam = searchParams.get('numeroFacture');


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meterId: "",
      referenceFacteur: numeroFactureParam || "",
      billingAddress: "",
    }
  });

  const watchedMeterId = form.watch("meterId");

  const availableMeters = useMemo(() => {
    return meters.filter(m => m.status === 'En service' && !m.referenceFacteur);
  }, [meters]);

  const meterOptions = useMemo(() => {
    return availableMeters.map(meter => ({
        value: meter.id,
        label: `${meter.id} - ${meter.description || 'Pas de description'}`,
    }));
  }, [availableMeters]);

  const selectedMeter = useMemo(() => {
    return meters.find(m => m.id === watchedMeterId);
  }, [watchedMeterId, meters]);

  const getAssociationName = (meter: Meter | undefined) => {
     if (!meter) return "N/A";
     if (meter.buildingId) {
      const building = buildings.find(b => b.id === meter.buildingId);
      return { type: 'building', name: building?.name || `Bâtiment ID: ${meter.buildingId}`};
    }
    const associatedEquipment = equipment.filter(e => e.compteurId === meter.id);
    if (associatedEquipment.length > 0) {
      return { type: 'equipment', name: associatedEquipment.map(e => e.name).join(', ') };
    }
    return { type: 'none', name: 'Non Associé' };
  }
  
  const meterAssociation = useMemo(() => getAssociationName(selectedMeter), [selectedMeter, buildings, equipment]);


  useEffect(() => {
    if (selectedMeter) {
        if (!numeroFactureParam) {
            form.setValue("referenceFacteur", selectedMeter.referenceFacteur || "");
        }
        form.setValue("billingAddress", selectedMeter.description || "");
    } else if (!numeroFactureParam) {
        form.setValue("referenceFacteur", "");
        form.setValue("billingAddress", "");
    }
  }, [selectedMeter, form, numeroFactureParam]);

  const onSubmit = (values: FormValues) => {
    if (!selectedMeter) {
        toast({ variant: "destructive", title: "Erreur", description: "Compteur non trouvé." });
        return;
    }

    const updatedMeter: Meter = {
      ...selectedMeter,
      referenceFacteur: values.referenceFacteur,
      description: values.billingAddress,
      lastUpdate: new Date().toISOString().split('T')[0],
    };

    updateMeter(updatedMeter);
    toast({ title: "Numéro Facture mis à jour", description: "Le numéro de facture a été enregistré avec succès." });
    
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

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 py-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="meterId"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>N° Compteur</FormLabel>
                        <Combobox
                            options={meterOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Rechercher un compteur..."
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                {selectedMeter && (
                     <div className="md:col-span-2 space-y-4 rounded-lg border p-4">
                        <h4 className="text-sm font-semibold">Détails du Compteur Sélectionné</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">N° Compteur</p>
                                <p className="font-mono">{selectedMeter.id}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Type de Tension</p>
                                <p>{selectedMeter.typeTension}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Associé à</p>
                                <div className="flex items-center gap-2">
                                    {meterAssociation.type === 'building' && <Building className="h-4 w-4" />}
                                    {meterAssociation.type === 'equipment' && <Network className="h-4 w-4" />}
                                    <p>{meterAssociation.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                 <FormField control={form.control} name="referenceFacteur" render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Numéro Facture (9 chiffres)</FormLabel>
                        <FormControl>
                            <Input placeholder="ex: 378051249" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem> 
                )} />
                 <FormField control={form.control} name="billingAddress" render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Adresse de Facturation (Optionnel)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Saisir l'adresse de facturation..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem> 
                )} />
                 
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

    

    