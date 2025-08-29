
"use client";

import React, { useState } from 'react';
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
import { useUser } from '@/hooks/use-user';
import { Checkbox } from './ui/checkbox';

const formSchema = z.object({
  dateDemandeResiliation: z.date().optional(),
  dateResiliation: z.date().optional(),
  dateDemandeResiliationEquipement: z.date().optional(),
  dateResiliationEquipement: z.date().optional(),
}).refine(data => {
    if (data.dateResiliation && data.dateDemandeResiliation && data.dateResiliation < data.dateDemandeResiliation) {
        return false;
    }
    return true;
}, {
    message: "La date de résiliation finale ne peut pas être antérieure à la date de demande.",
    path: ["dateResiliation"],
}).refine(data => {
     if (data.dateResiliationEquipement && data.dateDemandeResiliationEquipement && data.dateResiliationEquipement < data.dateDemandeResiliationEquipement) {
        return false;
    }
    return true;
}, {
    message: "La date de résiliation finale ne peut pas être antérieure à la date de demande.",
    path: ["dateResiliationEquipement"],
});

type FormValues = z.infer<typeof formSchema>;

interface ResiliationDialogProps {
    item: Equipment | Meter;
    itemType: 'equipment' | 'meter';
}

export function ResiliationDialog({ item, itemType }: ResiliationDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { equipment: allEquipment, updateEquipment } = useEquipmentStore();
  const { meters, updateMeter } = useMetersStore();
  const { buildings, updateBuilding } = useBuildingsStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const isEquipment = itemType === 'equipment';
  const equipment = isEquipment ? (item as Equipment) : undefined;
  const meter = !isEquipment ? (item as Meter) : undefined;
  
  const isRespoEnergie = user.role === 'Responsable Énergie et Environnement';


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
            newStatus = 'switched off en cours';
        }

        if (values.dateResiliationEquipement) {
             newStatus = 'switched off';
             if (equipment.compteurId) {
                const associatedMeter = meters.find(m => m.id === equipment.compteurId);
                const otherAssociations = allEquipment.some(e => e.id !== equipment.id && e.compteurId === equipment.compteurId && e.status !== 'switched off') || buildings.some(b => b.meterId === equipment.compteurId);
                
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
        // Handle regular resiliation
        let newStatus: Meter['status'] = meter.status;
        let history = meter.associationHistory || [];
        
        if (values.dateDemandeResiliation && meter.status === 'En service') {
            newStatus = 'switched off en cours';
        }
        if (values.dateResiliation) {
            newStatus = 'switched off';
             if (meter.buildingId) {
                const associatedBuilding = buildings.find(b => b.id === meter.buildingId);
                if (associatedBuilding) {
                     history.push(`Associé au bâtiment ${associatedBuilding.name} jusqu'au ${new Date().toLocaleDateString('fr-FR')}`);
                }
            } else {
                 const associatedEquip = allEquipment.find(e => e.compteurId === meter.id && e.status !== 'switched off');
                 if (associatedEquip) {
                    history.push(`Associé à l'équipement ${associatedEquip.name} jusqu'au ${new Date().toLocaleDateString('fr-FR')}`);
                }
            }
        }

        // Find all associated equipment and update their status
        const associatedEquips = allEquipment.filter(e => e.compteurId === meter.id);
        associatedEquips.forEach(eq => {
            // When meter is switched off, equipment becomes "En cours"
            updateEquipment({ ...eq, status: 'En cours', compteurId: undefined, lastUpdate: new Date().toISOString().split('T')[0] });
        });
        
        updateMeter({
            ...meter,
            status: newStatus,
            dateDemandeResiliation: values.dateDemandeResiliation?.toISOString().split('T')[0],
            dateResiliation: values.dateResiliation?.toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
            associationHistory: history,
        });
        
        toast({ title: "Compteur Mis à Jour", description: `La demande de résiliation pour ${meter.id} a été enregistrée.` });
    }
    setIsOpen(false);
    form.reset();
  }

  const triggerText = itemType === 'equipment' ? 'Résilier Équipement' : 'Résilier Compteur';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{triggerText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>Demande de Résiliation</DialogTitle>
                <DialogDescription>
                    Gérer la résiliation de {itemType === 'equipment' ? `l'équipement ${'name' in item ? item.name : ''}` : `le compteur ${item.id}`}.
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
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
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
