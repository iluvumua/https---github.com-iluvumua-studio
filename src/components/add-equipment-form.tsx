
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
import { PlusCircle, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Combobox } from "./ui/combobox";
import { equipmentData } from "@/lib/data";

const fournisseurs = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "NSN" },
  { value: "Adtran", label: "Adtran", abbreviation: "NSN" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NSN" },
];

const localisations = [
    { value: "Erriadh", label: "Erriadh", abbreviation: "ERR5" },
    { value: "Sahloul", label: "Sahloul", abbreviation: "SHL2" },
    { value: "Khezama", label: "Khezama", abbreviation: "KHZ1" },
    { value: "Kantaoui", label: "Kantaoui", abbreviation: "KANT" },
    { value: "Sahloul 4", label: "Sahloul 4", abbreviation: "SAHL" },
];

const formSchema = z.object({
  type: z.string().min(1, "Le type est requis."),
  etat: z.string().min(1, "L'état est requis."),
  fournisseur: z.string().min(1, "Le fournisseur est requis."),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().min(1, "Le type de châssis est requis."),
  designation: z.string().min(1, "La désignation est requise."),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddEquipmentForm() {
  const { user } = useUser();
  const [generatedName, setGeneratedName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      etat: "",
      fournisseur: "",
      localisation: "",
      typeChassis: "",
      designation: "",
      coordX: undefined,
      coordY: undefined,
    },
  });

  const watchAllFields = form.watch();

  useEffect(() => {
    const { fournisseur, localisation, type, typeChassis, designation } = watchAllFields;
    if (fournisseur && localisation && type && typeChassis && designation) {
        const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
        const locInfo = localisations.find(l => l.value === localisation);

        const fAbbr = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
        
        // Count existing equipment for the selected supplier to determine the next counter value.
        const supplierEquipmentCount = equipmentData.filter(eq => {
            const eqFournisseurInfo = fournisseurs.find(f => f.value === eq.fournisseur);
            return eqFournisseurInfo?.abbreviation === fAbbr;
        }).length;
        
        const counter = (supplierEquipmentCount + 1).toString().padStart(2, '0');

        const lAbbr = locInfo?.abbreviation || localisation.substring(0, 4).toUpperCase();
        const tAbbr = type === 'Indoor' ? 'MSI' : 'MSN';
        
        setGeneratedName(`${fAbbr}_SO_${lAbbr}_${tAbbr}${counter}_${designation}_${typeChassis}`);
    } else {
        setGeneratedName("");
    }
  }, [watchAllFields]);


  if (user.role !== "Technicien") {
    return null;
  }
  
  const onSubmit = (values: FormValues) => {
    console.log({ ...values, generatedName });
    // This is where you would typically send data to your backend to create the new equipment.
    // For this prototype, we'll just log it and close the dialog.
    form.reset();
    setGeneratedName("");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter Équipement
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel équipement</DialogTitle>
              <DialogDescription>
                Remplissez les détails de l'équipement. Le nom sera généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
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
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
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
               <div className="grid grid-cols-4 items-start gap-4">
                 <Label className="text-right pt-2">Coordonnées</Label>
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
              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label className="text-right">Nom Généré</Label>
                <Input id="name" readOnly value={generatedName} className="col-span-3 font-mono bg-muted" placeholder="..."/>
              </div>
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
