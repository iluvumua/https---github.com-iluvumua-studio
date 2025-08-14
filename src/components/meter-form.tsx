
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Meter } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  id: z.string().min(1, "Le N° de compteur est requis."),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  status: z.enum(['En cours', 'En service', 'Résilié', 'Substitué']),
  associationType: z.enum(["building", "equipment", "none"]).default("none"),
  buildingId: z.string().optional(),
  equipmentId: z.string().optional(),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
}).refine(data => {
    if (data.associationType === 'building' && !data.buildingId) return false;
    if (data.associationType === 'equipment' && !data.equipmentId) return false;
    return true;
}, {
    message: "Veuillez sélectionner une entité à associer.",
    path: ["associationType"],
});

type FormValues = z.infer<typeof formSchema>;

export function MeterForm() {
  const { addMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: "",
        typeTension: "Moyenne Tension",
        status: "En cours",
        associationType: "none",
        buildingId: "",
        equipmentId: "",
        coordX: undefined,
        coordY: undefined,
    }
  });

  const associationType = form.watch("associationType");

  const handleGeolocate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            form.setValue('coordX', position.coords.longitude);
            form.setValue('coordY', position.coords.latitude);
            toast({ title: "Localisation Récupérée", description: "Les coordonnées ont été mises à jour." });
        }, (error) => {
            toast({ variant: "destructive", title: "Erreur de Géolocalisation", description: "Impossible de récupérer votre position." });
        });
    } else {
        toast({ variant: "destructive", title: "Erreur", description: "La géolocalisation n'est pas supportée par votre navigateur." });
    }
  }

  const onSubmit = (values: FormValues) => {
    const newMeter: Meter = {
        id: values.id,
        status: values.status,
        typeTension: values.typeTension,
        buildingId: values.associationType === 'building' ? values.buildingId : undefined,
        equipmentId: values.associationType === 'equipment' ? values.equipmentId : undefined,
        coordX: values.coordX,
        coordY: values.coordY,
    };
    addMeter(newMeter);
    toast({ title: "Compteur ajouté", description: "Le nouveau compteur a été enregistré avec succès." });
    router.push('/dashboard/meters');
  }
  
  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} /></FormControl><FormMessage /></FormItem> )} />
                
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
                        <FormItem><FormLabel>Bâtiment</FormLabel>
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
                        <FormItem><FormLabel>Équipement</FormLabel>
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

                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <FormLabel>Coordonnées</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={handleGeolocate}><MapPin className="mr-2 h-4 w-4" /> Actuelle</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormLabel>X (Longitude)</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormLabel>Y (Latitude)</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </div>

            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/meters"><X className="mr-2" /> Annuler</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2" /> Enregistrer
                </Button>
            </div>
        </form>
    </Form>
  );
}
