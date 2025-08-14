
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
import { Loader2, Pencil } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Meter } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  id: z.string().min(1, "Le N° de compteur est requis."),
  policeNumber: z.string().optional(),
  referenceFacteur: z.string().optional(),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  status: z.enum(['En cours', 'En service', 'Résilié', 'Substitué']),
  associationType: z.enum(["building", "equipment", "none"]).default("none"),
  buildingId: z.string().optional(),
  equipmentId: z.string().optional(),
}).refine(data => {
    if (data.associationType === 'building' && !data.buildingId) return false;
    if (data.associationType === 'equipment' && !data.equipmentId) return false;
    return true;
}, {
    message: "Veuillez sélectionner une entité à associer.",
    path: ["associationType"],
});

type FormValues = z.infer<typeof formSchema>;

interface EditMeterFormProps {
    meter: Meter;
}

export function EditMeterForm({ meter }: EditMeterFormProps) {
  const { updateMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const [isOpen, setIsOpen] = useState(false);

  const getAssociationType = () => {
    if (meter.buildingId) return 'building';
    if (meter.equipmentId) return 'equipment';
    return 'none';
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: meter.id,
        policeNumber: meter.policeNumber || "",
        referenceFacteur: meter.referenceFacteur || "",
        typeTension: meter.typeTension,
        status: meter.status,
        associationType: getAssociationType(),
        buildingId: meter.buildingId || "",
        equipmentId: meter.equipmentId || "",
    }
  });

  const associationType = form.watch("associationType");

  const onSubmit = (values: FormValues) => {
    const updatedMeter: Meter = {
        ...meter,
        ...values,
        buildingId: values.associationType === 'building' ? values.buildingId : undefined,
        equipmentId: values.associationType === 'equipment' ? values.equipmentId : undefined,
    };
    updateMeter(updatedMeter);
    form.reset(values); // keep form state with new values
    setIsOpen(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                <DialogTitle>Modifier le compteur</DialogTitle>
                <DialogDescription>
                    Mettez à jour les détails du compteur. Cliquez sur Enregistrer.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
                    <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="policeNumber" render={({ field }) => ( <FormItem><FormLabel>N° Police</FormLabel><FormControl><Input placeholder="ex: 25-552200-99" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="referenceFacteur" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Référence Facteur</FormLabel><FormControl><Input placeholder="ex: R01" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />

                    <FormField control={form.control} name="typeTension" render={({ field }) => (
                        <FormItem><FormLabel>Type de Tension</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Moyenne Tension">Moyenne Tension</SelectItem>
                                <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />

                     <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem><FormLabel>État</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="En cours">En cours</SelectItem>
                                <SelectItem value="En service">En service</SelectItem>
                                <SelectItem value="Résilié">Résilié</SelectItem>
                                <SelectItem value="Substitué">Substitué</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />

                    <div className="md:col-span-2">
                        <FormField control={form.control} name="associationType" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Associer à :</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="none" /></FormControl><FormLabel className="font-normal">Aucun</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="building" /></FormControl><FormLabel className="font-normal">Bâtiment</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="equipment" /></FormControl><FormLabel className="font-normal">Équipement</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    
                    {associationType === 'building' && (
                         <FormField control={form.control} name="buildingId" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Bâtiment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un bâtiment"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    )}

                     {associationType === 'equipment' && (
                         <FormField control={form.control} name="equipmentId" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Équipement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un équipement"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {equipment.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    )}
                </div>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
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
