
"use client";

import React, { useEffect } from "react";
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

const formSchema = z.object({
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  dateMiseEnService: z.date({ required_error: "La date de mise en service est requise." }),
});

type FormValues = z.infer<typeof formSchema>;

interface MeterInstallationFormProps {
    onFinished: (data: FormValues) => void;
    isFinished?: boolean;
    meterId?: string;
    initialData?: Meter;
}

export function MeterInstallationForm({ onFinished, isFinished, meterId, initialData }: MeterInstallationFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        meterId: "",
        dateMiseEnService: undefined,
    }
  });
  
  useEffect(() => {
    if (initialData) {
        form.setValue("meterId", initialData.id.startsWith('MTR-WIP-') ? '' : initialData.id);
        if (initialData.dateMiseEnService) {
            form.setValue("dateMiseEnService", new Date(initialData.dateMiseEnService));
        }
    } else if (meterId && meterId.startsWith('MTR-WIP')) {
        form.setValue('meterId', '');
    } else if (meterId) {
        form.setValue('meterId', meterId);
    }
  }, [meterId, form, initialData]);


  const onSubmit = (values: FormValues) => {
    onFinished({
      ...values,
      dateMiseEnService: values.dateMiseEnService.toISOString().split('T')[0],
    });
    toast({ title: "Étape 2 Terminée", description: "Les informations du compteur ont été enregistrées." });
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="meterId" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} disabled={isFinished} /></FormControl><FormMessage /></FormItem> )} />
           
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
