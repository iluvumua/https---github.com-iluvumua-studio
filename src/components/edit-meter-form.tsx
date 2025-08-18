
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const formSchema = z.object({
  id: z.string().min(1, "Le N° de compteur est requis."),
  policeNumber: z.string().optional(),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  status: z.enum(['En cours', 'En service', 'Résilié', 'Substitué']),
  associationType: z.enum(["building", "equipment", "none"]).default("none"),
  buildingId: z.string().optional(),
  equipmentId: z.string().optional(),
  dateDemandeInstallation: z.date().optional(),
  dateMiseEnService: z.date().optional(),
  description: z.string().optional(),
}).refine(data => {
    if (data.associationType === 'building' && !data.buildingId) return false;
    if (data.associationType === 'equipment' && !data.equipmentId) return false;
    return true;
}, {
    message: "Veuillez sélectionner une entité à associer.",
    path: ["associationType"],
});

type FormValues = z.infer<typeof formSchema>;

interface EditMeterFormProps {
    meter: Meter;
    onFinished: () => void;
}

export function EditMeterForm({ meter, onFinished }: EditMeterFormProps) {
  const { updateMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment } = useEquipmentStore();
  const { toast } = useToast();

  const getAssociationType = () => {
    if (meter.buildingId) return 'building';
    if (meter.equipmentId) return 'equipment';
    return 'none';
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: meter.id,
        policeNumber: meter.policeNumber || "",
        typeTension: meter.typeTension,
        status: meter.status,
        associationType: getAssociationType(),
        buildingId: meter.buildingId || "",
        equipmentId: meter.equipmentId || "",
        dateDemandeInstallation: meter.dateDemandeInstallation ? new Date(meter.dateDemandeInstallation) : undefined,
        dateMiseEnService: meter.dateMiseEnService ? new Date(meter.dateMiseEnService) : undefined,
        description: meter.description || "",
    }
  });

  const associationType = form.watch("associationType");
  const status = form.watch("status");

  const onSubmit = (values: FormValues) => {
    const updatedMeter: Meter = {
        ...meter,
        ...values,
        buildingId: values.associationType === 'building' ? values.buildingId : undefined,
        equipmentId: values.associationType === 'equipment' ? values.equipmentId : undefined,
        dateDemandeInstallation: values.dateDemandeInstallation?.toISOString().split('T')[0],
        dateMiseEnService: values.dateMiseEnService?.toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
    };
    updateMeter(updatedMeter);
    toast({ title: "Compteur Modifié", description: "Les informations ont été mises à jour."});
    onFinished();
  }
  
  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="policeNumber" render={({ field }) => ( <FormItem><FormLabel>N° Police</FormLabel><FormControl><Input placeholder="ex: 25-552200-99" {...field} /></FormControl><FormMessage /></FormItem> )} />

                <FormField control={form.control} name="typeTension" render={({ field }) => (
                    <FormItem><FormLabel>Type de Tension</FormLabel>
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

                    <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>État</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                
                {status === 'En cours' && (
                        <FormField control={form.control} name="dateDemandeInstallation" render={({ field }) => (
                        <FormItem className="flex flex-col pt-2"><FormLabel>Date de Demande d'Installation</FormLabel>
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
                )}

                {status === 'En service' && (
                    <FormField control={form.control} name="dateMiseEnService" render={({ field }) => (
                        <FormItem className="flex flex-col pt-2"><FormLabel>Date de Mise en Service</FormLabel>
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
                )}

                <div className="md:col-span-2">
                    <FormField control={form.control} name="associationType" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Associer à :</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="none" /></FormControl><FormLabel className="font-normal">Aucun</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="building" /></FormControl><FormLabel className="font-normal">Bâtiment</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="equipment" /></FormControl><FormLabel className="font-normal">Équipement</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                {associationType === 'building' && (
                        <FormField control={form.control} name="buildingId" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Bâtiment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un bâtiment"/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                )}

                    {associationType === 'equipment' && (
                        <FormField control={form.control} name="equipmentId" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Équipement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un équipement"/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {equipment.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                )}

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
            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="ghost" onClick={onFinished}>
                    <X className="mr-2 h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                </Button>
            </div>
        </form>
    </Form>
  );
}

    

    