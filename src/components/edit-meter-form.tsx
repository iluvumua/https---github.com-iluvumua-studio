
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Meter } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { useUser } from "@/hooks/use-user";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

const formSchema = z.object({
  status: z.enum(['En cours', 'En service', 'En cours de resiliation', 'Résilié']),
  description: z.string().optional(),
  dateDemandeResiliation: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMeterFormProps {
    meter: Meter;
}

export function EditMeterForm({ meter }: EditMeterFormProps) {
  const { user } = useUser();
  const { updateMeter } = useMetersStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const canEditStatus = user.role === 'Responsable Énergie et Environnement';
  const canEditDescription = user.role === 'Responsable Énergie et Environnement' || user.role === 'Technicien';
  const canSaveChanges = canEditStatus || canEditDescription;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        status: meter.status,
        description: meter.description || "",
        dateDemandeResiliation: meter.dateDemandeResiliation ? new Date(meter.dateDemandeResiliation) : undefined,
    }
  });

  const onSubmit = (values: FormValues) => {
    let newStatus = values.status;
    if (values.dateDemandeResiliation && meter.status === 'En service') {
        newStatus = 'En cours de resiliation';
    }

    updateMeter({
        ...meter,
        ...values,
        status: newStatus,
        dateDemandeResiliation: values.dateDemandeResiliation?.toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
    });
    toast({ title: "Compteur Mis à Jour", description: `Le compteur ${meter.id} a été modifié.` });
    router.push('/dashboard/meters');
  }
  
  const showResiliationDate = meter.status === 'En service' || meter.status === 'En cours de resiliation';

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>État</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canEditStatus}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="En service">En service</SelectItem>
                        <SelectItem value="En cours de resiliation">En cours de resiliation</SelectItem>
                        <SelectItem value="Résilié">Résilié</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Aucune description" {...field} disabled={!canEditDescription} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            {showResiliationDate && (
                 <FormField control={form.control} name="dateDemandeResiliation" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date de Demande de Résiliation</FormLabel>
                          <Popover><PopoverTrigger asChild>
                              <FormControl>
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={!canEditStatus}>
                                  {field.value ? (format(field.value, "PPP")) : (<span>Choisir une date</span>)}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                              </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                          </PopoverContent>
                          </Popover>
                          <FormMessage />
                      </FormItem>
                  )} />
            )}

            {canSaveChanges ? (
                 <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" asChild>
                        <Link href="/dashboard/meters"><X className="mr-2" /> Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2" /> Enregistrer
                    </Button>
                </div>
            ) : (
                <div className="flex justify-end pt-4">
                     <Button variant="outline" asChild>
                        <Link href="/dashboard/meters">
                            <X className="mr-2" /> Retour
                        </Link>
                    </Button>
                </div>
            )}
        </form>
    </Form>
  );
}
