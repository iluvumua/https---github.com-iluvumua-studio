
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2, CalendarIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import type { Equipment, Meter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { useMetersStore } from '@/hooks/use-meters-store';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { useBuildingsStore } from '@/hooks/use-buildings-store';

const formSchema = z.object({
  dateDemandeResiliation: z.date().optional(),
  dateResiliation: z.date().optional(),
  dateDemandeResiliationEquipement: z.date().optional(),
  dateResiliationEquipement: z.date().optional(),
}).refine(data => {
    if (data.dateResiliation) {
        return !!data.dateDemandeResiliation;
    }
    return true;
}, {
    message: "La date de demande de résiliation doit être définie avant la date de résiliation finale.",
    path: ["dateResiliation"],
});

type FormValues = z.infer<typeof formSchema>;

interface ResiliationDialogProps {
    item: Equipment | Meter;
    itemType: 'equipment' | 'meter';
}

export function ResiliationDialog({ item, itemType }: ResiliationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { equipment: allEquipment, updateEquipment } = useEquipmentStore();
  const { meters, updateMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  
  const isEquipment = itemType === 'equipment';
  const equipment = isEquipment ? (item as Equipment) : undefined;
  const meter = !isEquipment ? (item as Meter) : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        dateDemandeResiliation: meter?.dateDemandeResiliation ? new Date(meter.dateDemandeResiliation) : undefined,
        dateResiliation: meter?.dateResiliation ? new Date(meter.dateResiliation) : undefined,
        dateDemandeResiliationEquipement: equipment?.dateDemandeResiliation ? new Date(equipment.dateDemandeResiliation) : undefined,
        dateResiliationEquipement: equipment?.dateResiliationEquipement ? new Date(equipment.dateResiliationEquipement) : undefined,
    }
  });

  const onSubmit = (values: FormValues) => {
    if (isEquipment && equipment) {
        let newStatus: Equipment['status'] = equipment.status;
        let meterStatusUpdate: Partial<Meter> | null = null;

        if (values.dateDemandeResiliationEquipement && equipment.status === 'En service') {
            newStatus = 'En cours de résiliation';
        }

        if (values.dateResiliationEquipement) {
             newStatus = 'Résilié';
             if (equipment.compteurId) {
                const associatedMeter = meters.find(m => m.id === equipment.compteurId);
                const otherAssociations = allEquipment.some(e => e.id !== equipment.id && e.compteurId === equipment.compteurId && e.status !== 'Résilié') || buildings.some(b => b.meterId === equipment.compteurId);
                if (associatedMeter && !otherAssociations) {
                    meterStatusUpdate = { id: associatedMeter.id, status: 'En cours' };
                }
             }
        }
        
        updateEquipment({
            ...equipment,
            status: newStatus,
            dateDemandeResiliation: values.dateDemandeResiliationEquipement?.toISOString().split('T')[0],
            dateResiliationEquipement: values.dateResiliationEquipement?.toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
        });
        
        if (meterStatusUpdate) {
            updateMeter({ ...meters.find(m => m.id === meterStatusUpdate!.id)!, ...meterStatusUpdate, lastUpdate: new Date().toISOString().split('T')[0] });
        }

        toast({ title: "Équipement Mis à Jour", description: `La demande de résiliation pour ${equipment.name} a été enregistrée.` });
    } else if (meter) {
        let newStatus: Meter['status'] = meter.status;
        let equipmentStatusUpdate: Partial<Equipment> | null = null;
        
        if (values.dateDemandeResiliation && meter.status === 'En service') {
            newStatus = 'En cours de resiliation';
        }
        if (values.dateResiliation) {
            newStatus = 'Résilié';
            const associatedEquip = allEquipment.find(e => e.compteurId === meter.id && e.status !== 'Résilié');
            if (associatedEquip) {
                equipmentStatusUpdate = { id: associatedEquip.id, status: 'En cours' };
            }
        }
        
        updateMeter({
            ...meter,
            status: newStatus,
            dateDemandeResiliation: values.dateDemandeResiliation?.toISOString().split('T')[0],
            dateResiliation: values.dateResiliation?.toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
        });
        
        if (equipmentStatusUpdate) {
             updateEquipment({ ...allEquipment.find(e => e.id === equipmentStatusUpdate!.id)!, ...equipmentStatusUpdate, lastUpdate: new Date().toISOString().split('T')[0] });
        }

        toast({ title: "Compteur Mis à Jour", description: `La demande de résiliation pour ${meter.id} a été enregistrée.` });
    }
    setIsOpen(false);
  }

  const canResiliate = item.status === 'En service' || item.status === 'En cours de resiliation' || item.status === 'En cours de résiliation';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
       <DialogTrigger asChild>
        <span className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
            onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        >
            {itemType === "meter" && (
                <>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span>Résilier Compteur</span>
                </>
            )}
            {itemType === "equipment" && (
                <>
                     <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                     <span>Résilier Équipement</span>
                </>
            )}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>Demande de Résiliation</DialogTitle>
                <DialogDescription>
                    Saisir les dates pour la résiliation de {itemType === 'equipment' ? `l'équipement ${'name' in item ? item.name : ''}` : `le compteur ${item.id}`}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               {isEquipment ? (
                <div className="space-y-4">
                    <FormField control={form.control} name="dateDemandeResiliationEquipement" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date Demande Résiliation Équipement</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
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
                    <FormField control={form.control} name="dateResiliationEquipement" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date Résiliation Équipement</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
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
                </div>
               ) : (
                 <div className="space-y-4">
                 <FormField control={form.control} name="dateDemandeResiliation" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date de Demande de Résiliation</FormLabel>
                          <Popover><PopoverTrigger asChild>
                              <FormControl>
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
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
                   <FormField control={form.control} name="dateResiliation" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date Résiliation Finale Compteur</FormLabel>
                          <Popover><PopoverTrigger asChild>
                              <FormControl>
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
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
                  </div>
               )}
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Annuler</Button>
              </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
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
