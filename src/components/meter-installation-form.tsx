
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Meter } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const formSchema = z.object({
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  dateMiseEnService: z.date({ required_error: "La date de mise en service est requise." }),
  indexDepart: z.coerce.number().optional(),
  indexDepartJour: z.coerce.number().optional(),
  indexDepartPointe: z.coerce.number().optional(),
  indexDepartSoir: z.coerce.number().optional(),
  indexDepartNuit: z.coerce.number().optional(),
}).refine(data => {
    const meterType = (data as any)._initialData?.typeTension;
    if (meterType === 'Basse Tension' || meterType === 'Moyen Tension Forfaitaire') {
        return data.indexDepart !== undefined && data.indexDepart >= 0;
    }
    return true;
}, {
    message: "L'index de départ est requis.",
    path: ['indexDepart'],
}).refine(data => {
    const meterType = (data as any)._initialData?.typeTension;
    if (meterType === 'Moyen Tension Tranche Horaire') {
        return data.indexDepartJour !== undefined && data.indexDepartJour >= 0;
    }
    return true;
}, {
    message: "L'index de départ Jour est requis.",
    path: ['indexDepartJour'],
});

type FormValues = z.infer<typeof formSchema>;

interface MeterInstallationFormProps {
    onFinished: (data: Partial<Meter>) => void;
    isFinished?: boolean;
    meterId?: string;
    initialData?: Partial<Meter>;
}

export function MeterInstallationForm({ onFinished, isFinished, meterId, initialData }: MeterInstallationFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        meterId: "",
        dateMiseEnService: undefined,
        indexDepart: 0,
        indexDepartJour: 0,
        indexDepartPointe: 0,
        indexDepartSoir: 0,
        indexDepartNuit: 0,
    }
  });
  
  React.useEffect(() => {
    if (initialData) {
        form.reset({
            _initialData: initialData, // Store initial data for resolver context
            meterId: initialData.id?.startsWith('MTR-WIP-') ? '' : initialData.id || '',
            dateMiseEnService: initialData.dateMiseEnService ? new Date(initialData.dateMiseEnService) : undefined,
            indexDepart: initialData.indexDepart || 0,
            indexDepartJour: initialData.indexDepartJour || 0,
            indexDepartPointe: initialData.indexDepartPointe || 0,
            indexDepartSoir: initialData.indexDepartSoir || 0,
            indexDepartNuit: initialData.indexDepartNuit || 0,
        } as any);
    } else if (meterId && meterId.startsWith('MTR-WIP')) {
        form.setValue('meterId', '');
    } else if (meterId) {
        form.setValue('meterId', meterId);
    }
  }, [meterId, form, initialData]);


  const onSubmit = (values: FormValues) => {
    const finalData: Partial<Meter> = {
        id: values.meterId,
        dateMiseEnService: values.dateMiseEnService.toISOString().split('T')[0],
    };

    if (initialData?.typeTension === 'Basse Tension' || initialData?.typeTension === 'Moyen Tension Forfaitaire') {
        finalData.indexDepart = values.indexDepart;
    } else if (initialData?.typeTension === 'Moyen Tension Tranche Horaire') {
        finalData.indexDepartJour = values.indexDepartJour;
        finalData.indexDepartPointe = values.indexDepartPointe;
        finalData.indexDepartSoir = values.indexDepartSoir;
        finalData.indexDepartNuit = values.indexDepartNuit;
    }

    onFinished(finalData);
    toast({ title: "Étape 2 Terminée", description: "Les informations du compteur ont été enregistrées." });
  }

  const amperageDisplay = initialData?.amperage === 'Autre' ? initialData.amperageAutre : initialData?.amperage;

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {initialData && (
                <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Détails de la demande</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Type de tension:</span>
                            <span>{initialData.typeTension || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Phase:</span>
                            <span>{initialData.phase || 'N/A'}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Ampérage:</span>
                            <span>{amperageDisplay || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <FormField control={form.control} name="meterId" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
           
            {(initialData?.typeTension === 'Basse Tension' || initialData?.typeTension === 'Moyen Tension Forfaitaire') && (
                <FormField control={form.control} name="indexDepart" render={({ field }) => ( <FormItem><FormLabel>Index de Départ</FormLabel><FormControl><Input type="number" placeholder="ex: 0" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
            )}

            {initialData?.typeTension === 'Moyen Tension Tranche Horaire' && (
                <div className="space-y-4 rounded-md border p-4">
                     <FormLabel>Index de Départ</FormLabel>
                     <FormField control={form.control} name="indexDepartJour" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Jour</FormLabel><FormControl><Input type="number" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="indexDepartPointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Pointe</FormLabel><FormControl><Input type="number" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="indexDepartSoir" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Soir</FormLabel><FormControl><Input type="number" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="indexDepartNuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nuit</FormLabel><FormControl><Input type="number" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
                </div>
            )}


            <FormField control={form.control} name="dateMiseEnService" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date de Mise en Service du Compteur STEG</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={isFinished}>
                            {field.value ? (format(field.value, "PPP")) : (<span>Choisir une date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus/>
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />
           
            {!isFinished && (
                <div className="flex justify-end gap-2 mt-8">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Enregistrer et Passer à l'Étape 3
                    </Button>
                </div>
            )}
        </form>
    </Form>
  );
}
