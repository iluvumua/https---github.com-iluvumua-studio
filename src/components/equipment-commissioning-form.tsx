
"use client";

import React, { useEffect } from "react";
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
import { Equipment, Meter } from "@/lib/types";
import { useMetersStore } from "@/hooks/use-meters-store";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const formSchema = z.object({
  dateMiseEnService: z.date({ required_error: "La date de mise en service est requise." }),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentCommissioningFormProps {
    equipment: Equipment;
    onFinished: (data: { dateMiseEnService: string }) => void;
    isFinished?: boolean;
}

export function EquipmentCommissioningForm({ equipment, onFinished, isFinished }: EquipmentCommissioningFormProps) {
  const { toast } = useToast();
  const { meters } = useMetersStore();
  const associatedMeter = meters.find(m => m.id === equipment.compteurId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        dateMiseEnService: undefined,
    }
  });

  useEffect(() => {
    if (equipment.dateMiseEnService && !form.getValues('dateMiseEnService')) {
        form.setValue('dateMiseEnService', new Date(equipment.dateMiseEnService));
    }
    // Set from associated meter if available and equipment date is not set
    else if (associatedMeter?.dateMiseEnService && !form.getValues('dateMiseEnService')) {
        form.setValue('dateMiseEnService', new Date(associatedMeter.dateMiseEnService));
    }
  }, [equipment.dateMiseEnService, associatedMeter?.dateMiseEnService, form]);


  const onSubmit = (values: FormValues) => {
    onFinished({
      dateMiseEnService: values.dateMiseEnService.toISOString().split('T')[0],
    });
    toast({ title: "Étape 3 Terminée", description: "L'équipement a été mis en service." });
  }

  const renderMeterIndex = (meter: Meter | undefined) => {
    if (!meter) return <Input readOnly value="N/A" />;

    if (meter.typeTension === 'Basse Tension' || meter.typeTension === 'Moyen Tension Forfaitaire') {
        return <Input readOnly value={meter.indexDepart ?? 'N/A'} />;
    }
    if (meter.typeTension === 'Moyen Tension Tranche Horaire') {
        return (
            <div className="text-xs space-y-1 p-2 border rounded-md bg-muted">
                <p><span className="font-semibold">Jour:</span> {meter.indexDepartJour ?? 'N/A'}</p>
                <p><span className="font-semibold">Pointe:</span> {meter.indexDepartPointe ?? 'N/A'}</p>
                <p><span className="font-semibold">Soir:</span> {meter.indexDepartSoir ?? 'N/A'}</p>
                <p><span className="font-semibold">Nuit:</span> {meter.indexDepartNuit ?? 'N/A'}</p>
            </div>
        );
    }
     return <Input readOnly value="N/A" />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label>N° Compteur Associé</Label>
                <Input readOnly value={equipment.compteurId || "N/A"} className="font-mono"/>
            </div>

             <div className="space-y-2">
                <Label>Index de Départ Compteur</Label>
                {renderMeterIndex(associatedMeter)}
            </div>

            <FormField control={form.control} name="dateMiseEnService" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date de Mise en Service de l'Équipement</FormLabel>
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
                      <Save className="mr-2 h-4 w-4" /> Terminer et Mettre en Service
                  </Button>
              </div>
            )}
        </form>
    </Form>
  );
}
