
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  id: z.string().min(1, "Le N° de compteur est requis."),
  policeNumber: z.string().optional(),
  referenceFacteur: z.string().length(9, "La Réf. Facteur doit comporter 9 chiffres.").optional(),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MeterFormProps {
    onFinished?: () => void;
}

export function MeterForm({ onFinished }: MeterFormProps) {
  const { addMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: "",
        policeNumber: "",
        referenceFacteur: "",
        typeTension: "Moyenne Tension",
        description: "",
    }
  });

  const onSubmit = (values: FormValues) => {
    const newMeter: Meter = {
        id: values.id,
        status: 'En cours', // Default status
        typeTension: values.typeTension,
        policeNumber: values.policeNumber,
        referenceFacteur: values.referenceFacteur,
        description: values.description,
        lastUpdate: new Date().toISOString().split('T')[0],
    };
    addMeter(newMeter);
    toast({ title: "Compteur ajouté", description: "Le nouveau compteur a été enregistré avec succès." });
    
    if (onFinished) {
        onFinished();
    } else {
        router.push('/dashboard/meters');
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
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="policeNumber" render={({ field }) => ( <FormItem><FormLabel>N° Police</FormLabel><FormControl><Input placeholder="ex: 25-552200-99" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="referenceFacteur" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Réf. Facteur (9 chiffres)</FormLabel><FormControl><Input placeholder="ex: 378051249" {...field} /></FormControl><FormMessage /></FormItem> )} />

                <FormField control={form.control} name="typeTension" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Type de Tension</FormLabel>
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

                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Ajouter une description..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    <X className="mr-2" /> Annuler
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
