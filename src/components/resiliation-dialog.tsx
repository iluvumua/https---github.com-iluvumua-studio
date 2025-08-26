
"use client";

import React, from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { DropdownMenuItem } from './ui/dropdown-menu';

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
    onOpenChange: (open: boolean) => void;
}

export function ResiliationDialog({ item, itemType, onOpenChange }: ResiliationDialogProps) {
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
        let history = equipment.associationHistory || [];

        if (values.dateDemandeResiliationEquipement && equipment.status === 'En service') {
            newStatus = 'En cours de résiliation';
        }

        if (values.dateResiliationEquipement) {
             newStatus = 'Résilié';
             if (equipment.compteurId) {
                const associatedMeter = meters.find(m => m.id === equipment.compteurId);
                const otherAssociations = allEquipment.some(e => e.id !== equipment.id && e.compteurId === equipment.compteurId && e.status !== 'Résilié') || buildings.some(b => b.meterId === equipment.compteurId);
                
                if (associatedMeter) {
                    history.push(`Associé au compteur ${associatedMeter.id} jusqu'au ${new Date().toLocaleDateString('fr-FR')}`);
                }

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
            associationHistory: history,
        });
        
        if (meterStatusUpdate) {
            updateMeter({ ...meters.find(m => m.id === meterStatusUpdate!.id)!, ...meterStatusUpdate, lastUpdate: new Date().toISOString().split('T')[0] });
        }

        toast({ title: "Équipement Mis à Jour", description: `La demande de résiliation pour ${equipment.name} a été enregistrée.` });
    } else if (meter) {
        let newStatus: Meter['status'] = meter.status;
        let equipmentStatusUpdate: Partial<Equipment> | null = null;
        let history = meter.associationHistory || [];
        
        if (values.dateDemandeResiliation && meter.status === 'En service') {
            newStatus = 'En cours de resiliation';
        }
        if (values.dateResiliation) {
            newStatus = 'Résilié';
            const associatedEquip = allEquipment.find(e => e.compteurId === meter.id && e.status !== 'Résilié');
            if (associatedEquip) {
                equipmentStatusUpdate = { id: associatedEquip.id, status: 'En cours' };
                history.push(`Associé à l'équipement ${associatedEquip.name} jusqu'au ${new Date().toLocaleDateString('fr-FR')}`);
            } else if (meter.buildingId) {
                const associatedBuilding = buildings.find(b => b.id === meter.buildingId);
                if (associatedBuilding) {
                     history.push(`Associé au bâtiment ${associatedBuilding.name} jusqu'au ${new Date().toLocaleDateString('fr-FR')}`);
                }
            }
        }
        
        updateMeter({
            ...meter,
            status: newStatus,
            dateDemandeResiliation: values.dateDemandeResiliation?.toISOString().split('T')[0],
            dateResiliation: values.dateResiliation?.toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
            associationHistory: history,
        });
        
        if (equipmentStatusUpdate) {
             updateEquipment({ ...allEquipment.find(e => e.id === equipmentStatusUpdate!.id)!, ...equipmentStatusUpdate, lastUpdate: new Date().toISOString().split('T')[0] });
        }

        toast({ title: "Compteur Mis à Jour", description: `La demande de résiliation pour ${meter.id} a été enregistrée.` });
    }
    onOpenChange(false);
  }

  return (
    <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
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
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                </Button>
            </DialogFooter>
        </form>
       </Form>
    </DialogContent>
  );
}
