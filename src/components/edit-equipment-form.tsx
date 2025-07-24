
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Combobox } from "./ui/combobox";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";


const fournisseurs = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "NSN" },
  { value: "Adtran", label: "Adtran", abbreviation: "NSN" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NSN" },
];

const localisations = locationsData.map(loc => ({
    value: loc.abbreviation,
    label: loc.localite,
    abbreviation: loc.abbreviation,
}));

const districtStegOptions = [...new Set(locationsData.map(loc => loc.districtSteg))];

const formSchema = z.object({
  type: z.string().min(1, "Le type est requis."),
  etat: z.string().min(1, "L'état est requis."),
  fournisseur: z.string().min(1, "Le fournisseur est requis."),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().min(1, "Le type de châssis est requis."),
  designation: z.string().min(1, "La désignation est requise."),
  tension: z.string().min(1, "La tension est requise."),
  adresseSteg: z.string().min(1, "L'adresse STEG est requise."),
  districtSteg: z.string().min(1, "Le district STEG est requis."),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditEquipmentFormProps {
    equipment: Equipment;
}

export function EditEquipmentForm({ equipment }: EditEquipmentFormProps) {
  const { user } = useUser();
  const { updateEquipment } = useEquipmentStore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        type: equipment.type || "",
        etat: equipment.status || "",
        fournisseur: equipment.fournisseur || "",
        localisation: equipment.location || "",
        typeChassis: equipment.typeChassis || "",
        designation: equipment.designation || "",
        tension: equipment.tension || "",
        adresseSteg: equipment.adresseSteg || "",
        districtSteg: equipment.districtSteg || "",
        coordX: equipment.coordX ?? undefined,
        coordY: equipment.coordY ?? undefined,
    },
  });

  if (user.role !== "Technicien") {
    return null;
  }
  
    const getStatusFromString = (status: string): "Active" | "Inactive" | "Maintenance" => {
        const s = status.toLowerCase();
        if (s.includes("active") || s.includes("actif")) return "Active";
        if (s.includes("inactive") || s.includes("inactif")) return "Inactive";
        if (s.includes("maintenance")) return "Maintenance";
        return "Inactive";
    }

  const onSubmit = (values: FormValues) => {
    const updatedEquipment: Equipment = {
        ...equipment,
        type: values.type,
        location: values.localisation,
        status: getStatusFromString(values.etat),
        lastUpdate: new Date().toISOString().split('T')[0],
        fournisseur: values.fournisseur,
        typeChassis: values.typeChassis,
        designation: values.designation,
        tension: values.tension,
        adresseSteg: values.adresseSteg,
        districtSteg: values.districtSteg,
        coordX: values.coordX,
        coordY: values.coordY,
    }
    updateEquipment(updatedEquipment);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Modifier l'équipement</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails de l'équipement. Le nom n'est pas modifiable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nom_MSAN</Label>
                <Input readOnly value={equipment.name} className="col-span-3 font-mono bg-muted" />
              </div>
              <FormField
                control={form.control}
                name="fournisseur"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Fournisseur</FormLabel>
                    <Combobox
                      className="col-span-3"
                      placeholder="Sélectionner ou écrire..."
                      options={fournisseurs.map(f => ({ value: f.value, label: f.label }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localisation"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Localisation</FormLabel>
                    <Combobox
                      className="col-span-3"
                      placeholder="Sélectionner ou écrire..."
                      options={localisations.map(l => ({ value: l.value, label: l.label }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="col-span-3">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="etat"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">État</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'état" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="Active">Actif</SelectItem>
                          <SelectItem value="Inactive">Inactif</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="typeChassis"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Type de Châssis</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="ex: 7302" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Désignation</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="ex: MM_Immeuble Zarrouk" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="tension"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Tension</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="ex: 48V" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="adresseSteg"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Adresse STEG</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="ex: 123 Rue de l'Avenir" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="districtSteg"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">District STEG</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {districtStegOptions.map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-4 items-start gap-4">
                 <Label className="text-right pt-2">X / Y</Label>
                 <div className="col-span-3 grid grid-cols-2 gap-2">
                    <FormField
                    control={form.control}
                    name="coordX"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>X</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="Longitude" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="coordY"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Y</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="Latitude" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
               <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
               <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
