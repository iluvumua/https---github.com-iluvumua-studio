
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
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  status: z.enum(['En cours', 'En service', 'En cours de resiliation', 'Résilié']),
  description: z.string().optional(),
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
    }
  });

  const onSubmit = (values: FormValues) => {
    updateMeter({
        ...meter,
        ...values,
        lastUpdate: new Date().toISOString().split('T')[0],
    });
    toast({ title: "Compteur Mis à Jour", description: `Le compteur ${meter.id} a été modifié.` });
    router.push('/dashboard/meters');
  }

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
