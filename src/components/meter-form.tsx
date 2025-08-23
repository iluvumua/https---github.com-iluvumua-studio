
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
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

const formSchema = z.object({
  id: z.string().min(1, "Le N° de compteur est requis."),
  policeNumber: z.string().optional(),
  typeTension: z.enum(["Moyenne Tension", "Basse Tension"]),
  description: z.string().optional(),
  associationType: z.enum(["building", "equipment", "none"]).default("none"),
  buildingId: z.string().optional(),
  equipmentId: z.string().optional(),
  dateMiseEnService: z.date().optional(),
  districtSteg: z.string().min(1, "Le district STEG est requis."),
}).refine(data => {
    if (data.associationType === 'building' && !data.buildingId) return false;
    if (data.associationType === 'equipment' && !data.equipmentId) return false;
    return true;
}, {
    message: "Veuillez sélectionner une entité à associer.",
    path: ["associationType"],
}).refine(data => {
    if (data.associationType === 'equipment' && !data.dateMiseEnService) return false;
    return true;
}, {
    message: "La date de mise en service est requise pour un équipement.",
    path: ["dateMiseEnService"],
});

type FormValues = z.infer<typeof formSchema>;

interface MeterFormProps {
    onFinished?: () => void;
    equipmentId?: string;
}

export function MeterForm({ onFinished, equipmentId: equipmentIdFromProp }: MeterFormProps) {
  const { addMeter } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const { equipment, updateEquipment } = useEquipmentStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: "",
        policeNumber: "",
        typeTension: "Moyenne Tension",
        description: "",
        associationType: equipmentIdFromProp ? "equipment" : "none",
        buildingId: "",
        equipmentId: equipmentIdFromProp || "",
        dateMiseEnService: undefined,
        districtSteg: "",
    }
  });

  const associationType = form.watch("associationType");

  const onSubmit = (values: FormValues) => {
    const isActivatingEquipment = values.associationType === 'equipment' && values.equipmentId && values.dateMiseEnService;

    const newMeter: Meter = {
        id: values.id,
        status: isActivatingEquipment ? 'En service' : 'En cours',
        typeTension: values.typeTension,
        policeNumber: values.policeNumber,
        description: values.description,
        lastUpdate: new Date().toISOString().split('T')[0],
        dateMiseEnService: values.dateMiseEnService?.toISOString().split('T')[0],
        buildingId: values.associationType === 'building' ? values.buildingId : undefined,
        equipmentId: values.associationType === 'equipment' ? values.equipmentId : undefined,
        referenceFacteur: undefined,
        districtSteg: values.districtSteg,
    };

    addMeter(newMeter);

    if (isActivatingEquipment) {
        const equipmentToUpdate = equipment.find(e => e.id === values.equipmentId);
        if (equipmentToUpdate) {
            updateEquipment({
                ...equipmentToUpdate,
                status: 'En service',
                dateMiseEnService: values.dateMiseEnService?.toISOString().split('T')[0],
                compteurId: newMeter.id,
                lastUpdate: new Date().toISOString().split('T')[0],
            });
            toast({ title: "Compteur ajouté et équipement activé", description: "Le nouvel équipement a été mis en service." });
        }
    } else {
        toast({ title: "Compteur ajouté", description: "Le nouveau compteur a été enregistré avec succès." });
    }
    
    if (onFinished) {
        onFinished();
    } else {
        router.push(equipmentIdFromProp ? '/dashboard/equipment' : '/dashboard/meters');
    }
  }
  
  const handleCancel = () => {
    if (onFinished) {
        onFinished();
    } else {
        router.push(equipmentIdFromProp ? '/dashboard/equipment' : '/dashboard/billing');
    }
  }
  
  const availableEquipment = equipment.filter(e => e.status === 'En cours');

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
                <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>N° Compteur STEG</FormLabel><FormControl><Input placeholder="ex: 552200" {...field} /></FormControl><FormMessage /></FormItem> )} />
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

                <FormField control={form.control} name="districtSteg" render={({ field }) => (
                    <FormItem><FormLabel>District STEG</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un district"/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Enfidha">Enfidha</SelectItem>
                                <SelectItem value="Msaken">Msaken</SelectItem>
                                <SelectItem value="Sousse Centre">Sousse Centre</SelectItem>
                                <SelectItem value="Sousse Nord">Sousse Nord</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )} />

                <div className="md:col-span-2">
                    <FormField control={form.control} name="associationType" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Associer à :</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={!!equipmentIdFromProp}>
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
                     <>
                        <FormField control={form.control} name="equipmentId" render={({ field }) => (
                            <FormItem><FormLabel>Équipement (En cours)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!equipmentIdFromProp}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un équipement"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {availableEquipment.length > 0 ? (
                                             availableEquipment.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)
                                        ) : (
                                            <SelectItem value="none" disabled>Aucun équipement en cours</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="dateMiseEnService" render={({ field }) => (
                            <FormItem className="flex flex-col pt-2"><FormLabel>Date de Mise en Service d'Équipement</FormLabel>
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
                    </>
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
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    <X className="mr-2" /> Annuler
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2" /> Enregistrer
                </Button>
            </div>
        </form>
    </Form>
  );
}
