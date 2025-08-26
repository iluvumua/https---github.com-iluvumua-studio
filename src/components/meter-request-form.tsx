
"use client";

import React from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, MapPin, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Equipment, Meter, Building } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
  dateDemandeInstallation: z.date({ required_error: "La date de demande est requise." }),
  policeNumber: z.string().optional(),
  districtSteg: z.string().min(1, "Le district STEG est requis."),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  phase: z.enum(["Triphasé", "Monophasé"], { required_error: "Le type de phase est requis." }),
  amperage: z.enum(["16A", "32A", "63A", "Autre"], { required_error: "L'ampérage est requis." }),
  amperageAutre: z.string().optional(),
}).refine(data => {
    if (data.amperage === 'Autre') {
        return !!data.amperageAutre;
    }
    return true;
}, {
    message: "Veuillez préciser l'ampérage.",
    path: ['amperageAutre'],
});

type FormValues = z.infer<typeof formSchema>;

interface MeterRequestFormProps {
    equipment?: Equipment;
    building?: Building;
    onFinished: (data: FormValues) => void;
    isFinished?: boolean;
    initialData?: Partial<Meter>;
}

export function MeterRequestForm({ equipment, building, onFinished, isFinished, initialData }: MeterRequestFormProps) {
  const { toast } = useToast();
  
  const parentCoords = equipment ? { x: equipment.coordX, y: equipment.coordY } : { x: building?.coordX, y: building?.coordY };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        coordX: initialData?.coordX ?? parentCoords.x ?? 0,
        coordY: initialData?.coordY ?? parentCoords.y ?? 0,
        dateDemandeInstallation: initialData?.dateDemandeInstallation ? new Date(initialData.dateDemandeInstallation) : undefined,
        policeNumber: initialData?.policeNumber || "",
        districtSteg: initialData?.districtSteg || "",
        typeTension: initialData?.typeTension || "Basse Tension",
        phase: initialData?.phase,
        amperage: initialData?.amperage,
        amperageAutre: initialData?.amperageAutre || "",
    }
  });

  const watchedAmperage = form.watch('amperage');

  React.useEffect(() => {
    if (initialData) {
        form.reset({
            coordX: parentCoords.x ?? 0,
            coordY: parentCoords.y ?? 0,
            dateDemandeInstallation: initialData.dateDemandeInstallation ? new Date(initialData.dateDemandeInstallation) : undefined,
            policeNumber: initialData.policeNumber || '',
            districtSteg: initialData.districtSteg || '',
            typeTension: initialData.typeTension || 'Basse Tension',
            phase: initialData.phase,
            amperage: initialData.amperage,
            amperageAutre: initialData.amperageAutre || '',
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, parentCoords.x, parentCoords.y, form.reset]);

  const onSubmit = (values: FormValues) => {
    onFinished(values);
    toast({ title: "Étape 1 Terminée", description: "La demande de compteur a été enregistrée." });
  }

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

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label>Coordonnées Parent</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Input value={parentCoords.x || 'N/A'} readOnly disabled />
                    <Input value={parentCoords.y || 'N/A'} readOnly disabled />
                </div>
            </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <FormLabel>Coordonnées Compteur</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGeolocate} disabled={isFinished}><MapPin className="mr-2 h-4 w-4" /> Actuelle</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                </div>
            </div>

            <FormField control={form.control} name="dateDemandeInstallation" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date de Demande</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={isFinished}>
                            {field.value ? (format(field.value, "PPP")) : (<span>Choisir une date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />

             <FormField control={form.control} name="policeNumber" render={({ field }) => ( <FormItem><FormLabel>N° Police</FormLabel><FormControl><Input placeholder="ex: 25-552200-99" {...field} value={field.value ?? ''} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />

            <FormField control={form.control} name="districtSteg" render={({ field }) => (
                <FormItem><FormLabel>District STEG</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFinished}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un district"/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="SOUSSE NORD">SOUSSE NORD</SelectItem>
                            <SelectItem value="SOUSSE CENTRE">SOUSSE CENTRE</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )} />
            
            <FormField control={form.control} name="typeTension" render={({ field }) => (
                <FormItem><FormLabel>Type de Tension</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFinished}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Moyenne Tension">Moyenne Tension</SelectItem>
                        <SelectItem value="Basse Tension">Basse Tension</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />

             <FormField control={form.control} name="phase" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Phase</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={isFinished}>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Monophasé" /></FormControl><FormLabel className="font-normal">Monophasé</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Triphasé" /></FormControl><FormLabel className="font-normal">Triphasé</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                <FormMessage />
                </FormItem>
             )} />

            <FormField control={form.control} name="amperage" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Ampérage</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={isFinished}>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="16A" /></FormControl><FormLabel className="font-normal">16A</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="32A" /></FormControl><FormLabel className="font-normal">32A</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="63A" /></FormControl><FormLabel className="font-normal">63A</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Autre" /></FormControl><FormLabel className="font-normal">Autre</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                     {watchedAmperage === 'Autre' && (
                        <FormField control={form.control} name="amperageAutre" render={({ field }) => (
                            <FormItem><FormControl><Input placeholder="Préciser l'ampérage" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                <FormMessage />
                </FormItem>
             )} />

            {!isFinished && (
                <div className="flex justify-end gap-2 mt-8">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Enregistrer et Passer à l'Étape 2
                    </Button>
                </div>
            )}
        </form>
    </Form>
  );
}
