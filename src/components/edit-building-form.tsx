
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Pencil, Loader2, MapPin } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useBuildingsStore } from '@/hooks/use-buildings-store';
import { useMetersStore } from '@/hooks/use-meters-store';
import type { Building } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { locationsData } from '@/lib/locations';

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
  meterId: z.string().optional(),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
  googleMapsUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;


interface EditBuildingFormProps {
    building: Building;
}

export function EditBuildingForm({ building }: EditBuildingFormProps) {
  const { updateBuilding } = useBuildingsStore();
  const { meters } = useMetersStore();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        code: building.code,
        name: building.name,
        commune: building.commune,
        localisation: building.localisation || '',
        address: building.address,
        propriete: building.propriete,
        nature: building.nature,
        meterId: building.meterId || '',
        coordX: building.coordX,
        coordY: building.coordY,
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
    const updatedBuilding: Building = {
        ...building,
        ...values,
        meterId: values.meterId === 'none' ? undefined : values.meterId,
    };
    updateBuilding(updatedBuilding);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
       <DialogTrigger asChild>
        <div className="w-full h-full">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>Modifier le bâtiment</DialogTitle>
            <DialogDescription>
                Mettez à jour les informations du bâtiment. Cliquez sur Enregistrer.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <FormField control={form.control} name="code" render={({ field }) => ( <FormItem><FormLabel>Code Bâtiment</FormLabel><FormControl><Input placeholder="ex: SO01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nom du Site</FormLabel><FormControl><Input placeholder="ex: Complexe Sousse République" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="commune" render={({ field }) => ( <FormItem><FormLabel>Commune</FormLabel><FormControl><Input placeholder="ex: Sousse" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="localisation" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une localisation" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {localisations.map(l => (
                                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="ex: Av de la République - Sousse 4000" {...field} /></FormControl><FormMessage /></FormItem> )} />
                
                <FormField
                    control={form.control}
                    name="nature"
                    render={() => (
                        <FormItem>
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
                <FormField control={form.control} name="propriete" render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Propriété</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner la propriété" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Propriété TT">Propriété TT</SelectItem>
                                <SelectItem value="Location, ETT">Location, ETT</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem> 
                )} />
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

                <div className="space-y-2">
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
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormLabel>X (Longitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 10.638617" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormLabel>Y (Latitude)</FormLabel><FormControl><Input type="number" step="any" placeholder="ex: 35.829169" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </div>
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
