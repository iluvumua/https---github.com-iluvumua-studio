
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Save, X, PlusCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useBuildingsStore } from '@/hooks/use-buildings-store';
import { useMetersStore } from '@/hooks/use-meters-store';
import type { Building, Meter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { locationsData } from '@/lib/locations';
import { Combobox } from './combobox';

const formSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
  name: z.string().min(1, "Le nom est requis."),
  commune: z.string().min(1, "La commune est requise."),
  localisation: z.string().min(1, "La localisation est requise."),
  address: z.string().min(1, "L'adresse est requise."),
  propriete: z.string().min(1, "La propriété est requise."),
  nature: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une nature.",
  }),
  coordX: z.coerce.number({ required_error: "La coordonnée X est requise." }),
  coordY: z.coerce.number({ required_error: "La coordonnée Y est requise." }),
  googleMapsUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const natureOptions = [
    { id: 'A', label: 'Administratif' },
    { id: 'T', label: 'Technique' },
    { id: 'C', label: 'Commercial' },
    { id: 'D', label: 'Dépôt' },
] as const;

const localisations = locationsData.map(loc => ({
    value: loc.abbreviation,
    label: loc.localite,
}));

export function BuildingForm() {
  const { addBuilding } = useBuildingsStore();
  const { addMeter } = useMetersStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        code: '',
        name: '',
        commune: '',
        localisation: '',
        address: '',
        propriete: '',
        nature: [],
        coordX: undefined,
        coordY: undefined,
        googleMapsUrl: '',
    }
  });

  const watchedCoords = form.watch(['coordY', 'coordX']);
  const watchedUrl = form.watch('googleMapsUrl');
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${watchedCoords[0] || '35.829169'},${watchedCoords[1] || '10.638617'}`;
  
  useEffect(() => {
    if (watchedUrl) {
      const match = watchedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match && match[1] && match[2]) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        form.setValue('coordY', lat);
        form.setValue('coordX', lng);
      }
    }
  }, [watchedUrl, form]);

  const onSubmit = (values: FormValues) => {
    const newBuildingId = `BLD-${Date.now()}`;
    const newBuilding: Building = {
        id: newBuildingId,
        code: values.code,
        name: values.name,
        commune: values.commune,
        localisation: values.localisation,
        address: values.address,
        propriete: values.propriete,
        nature: values.nature,
        coordX: values.coordX,
        coordY: values.coordY,
    };
    
    addBuilding(newBuilding);
    toast({ title: "Bâtiment ajouté", description: "Le nouveau bâtiment a été enregistré." });
    router.push(`/dashboard/buildings`);
  }

  return (
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="code" render={({ field }) => ( <FormItem><FormLabel>Code Bâtiment</FormLabel><FormControl><Input placeholder="ex: SO01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nom du Site</FormLabel><FormControl><Input placeholder="ex: Complexe Sousse République" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="commune" render={({ field }) => ( <FormItem><FormLabel>Commune</FormLabel><FormControl><Input placeholder="ex: Sousse" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField
                    control={form.control}
                    name="localisation"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <Combobox
                            options={localisations}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Rechercher une localisation..."
                        />
                        <FormMessage />
                    </FormItem>
                )} />
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
                

                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                         <FormLabel>Coordonnées</FormLabel>
                         <Button type="button" variant="ghost" size="sm" asChild>
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" /> Ouvrir Google Maps
                            </a>
                        </Button>
                    </div>
                     <FormField control={form.control} name="googleMapsUrl" render={({ field }) => ( <FormItem><FormLabel>Lien Google Maps</FormLabel><FormControl><Input placeholder="Coller le lien Google Maps ici..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormLabel>X (Longitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 10.638617" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormLabel>Y (Latitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 35.829169" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
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
