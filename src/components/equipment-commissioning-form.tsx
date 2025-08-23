
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Equipment } from "@/lib/types";

const formSchema = z.object({
  dateMiseEnService: z.date({ required_error: "La date de mise en service est requise." }),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentCommissioningFormProps {
    equipment: Equipment;
    onFinished: (data: FormValues) => void;
}

export function EquipmentCommissioningForm({ equipment, onFinished }: EquipmentCommissioningFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        dateMiseEnService: equipment.dateMiseEnService ? new Date(equipment.dateMiseEnService) : undefined,
    }
  });

  const onSubmit = (values: FormValues) => {
    onFinished({
      ...values,
      dateMiseEnService: values.dateMiseEnService.toISOString().split('T')[0],
    });
    toast({ title: "Étape 3 Terminée", description: "L'équipement a été mis en service." });
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="dateMiseEnService" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date de Mise en Service de l'Équipement</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
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
           
            <div className="flex justify-end gap-2 mt-8">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Terminer et Mettre en Service
                </Button>
            </div>
        </form>
    </Form>
  );
}
