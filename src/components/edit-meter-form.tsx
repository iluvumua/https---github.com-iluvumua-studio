
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

const formSchema = z.object({
  status: z.enum(['En cours', 'En service', 'Résilié', 'Substitué']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMeterFormProps {
    meter: Meter;
}

export function EditMeterForm({ meter }: EditMeterFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        status: meter.status,
        description: meter.description || "",
    }
  });

  return (
    <Form {...form}>
        <form className="space-y-4">
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>État</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="En service">En service</SelectItem>
                        <SelectItem value="Résilié">Résilié</SelectItem>
                        <SelectItem value="Substitué">Substitué</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Aucune description" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </form>
    </Form>
  );
}
