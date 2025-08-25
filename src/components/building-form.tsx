
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Save, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useBuildingsStore } from '@/hooks/use-buildings-store';
import { useMetersStore } from '@/hooks/use-meters-store';
import type { Building } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const natureOptions = [
    { id: 'A', label: 'Administratif' },
    { id: 'T', label: 'Technique' },
    { id: 'C', label: 'Commercial' },
    { id: 'D', label: 'Dépôt' },
] as const;

const formSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
  name: z.string().min(1, "Le nom est requis."),
  commune: z.string().min(1, "La commune est requise."),
  delegation: z.string().min(1, "La délégation est requise."),
  address: z.string().min(1, "L'adresse est requise."),
  propriete: z.string().min(1, "La propriété est requise."),
  nature: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une nature.",
  }),
  meterId: z.string().optional(),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BuildingForm() {
  const { addBuilding } = useBuildingsStore();
  const { meters } = useMetersStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        code: '',
        name: '',
        commune: '',
        delegation: '',
        address: '',
        propriete: '',
        nature: [],
        meterId: '',
        coordX: 0,
        coordY: 0,
    }
  });

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
    const newBuilding: Building = {
        id: `BLD-${Date.now()}`,
        ...values,
        meterId: values.meterId === 'none' ? undefined : values.meterId,
    };
    addBuilding(newBuilding);
    toast({ title: "Bâtiment ajouté", description: "Le nouveau bâtiment a été enregistré avec succès." });
    router.push('/dashboard/buildings');
  }

  return (
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="code" render={({ field }) => ( <FormItem><FormLabel>Code Bâtiment</FormLabel><FormControl><Input placeholder="ex: SO01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nom du Site</FormLabel><FormControl><Input placeholder="ex: Complexe Sousse République" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="commune" render={({ field }) => ( <FormItem><FormLabel>Commune</FormLabel><FormControl><Input placeholder="ex: Sousse" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="delegation" render={({ field }) => ( <FormItem><FormLabel>Délégation</FormLabel><FormControl><Input placeholder="ex: Sousse Medina" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="ex: Av de la République - Sousse 4000" {...field} /></FormControl><FormMessage /></FormItem> )} />
                
                <FormField
                    control={form.control}
                    name="nature"
                    render={() => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Nature</FormLabel>
                        <div className="flex flex-wrap gap-4">
                        {natureOptions.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="nature"
                            render={({ field }) => {
                                return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="propriete" render={({ field }) => ( <FormItem><FormLabel>Propriété</FormLabel><FormControl><Input placeholder="ex: Propriété TT" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField
                    control={form.control}
                    name="meterId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>N° Compteur (Optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un compteur" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">Aucun</SelectItem>
                                {meters.map(meter => (
                                    <SelectItem key={meter.id} value={meter.id}>{meter.id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                         <FormLabel>Coordonnées</FormLabel>
                         <Button type="button" variant="ghost" size="sm" onClick={handleGeolocate}><MapPin className="mr-2 h-4 w-4" /> Actuelle</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormLabel>X (Longitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 10.638617" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormLabel>Y (Latitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 35.829169" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </div>
            </div>
             <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/buildings"><X className="mr-2" /> Annuler</Link>
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
