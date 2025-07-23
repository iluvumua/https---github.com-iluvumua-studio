
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

const fournisseurs = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "SIE" },
  { value: "Adtran", label: "Adtran", abbreviation: "ADT" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUA" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NOK" },
];

const localisations = [
    { value: "Erriadh", label: "Erriadh", abbreviation: "ERR5" },
    { value: "Sahloul", label: "Sahloul", abbreviation: "SHL2" },
    { value: "Khezama", label: "Khezama", abbreviation: "KHZ1" },
];

const formSchema = z.object({
  type: z.string().min(1, "Le type est requis."),
  etat: z.string().min(1, "L'état est requis."),
  fournisseur: z.string().min(1, "Le fournisseur est requis."),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().min(1, "Le type de châssis est requis."),
});

type FormValues = z.infer<typeof formSchema>;

let equipmentCounter = 10;

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
    },
  });

  const watchAllFields = form.watch();

  useEffect(() => {
    const { fournisseur, localisation, type, typeChassis } = watchAllFields;
    if (fournisseur && localisation && type && typeChassis) {
        const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
        const locInfo = localisations.find(l => l.value === localisation);

        const fAbbr = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
        const lAbbr = locInfo?.abbreviation || localisation.substring(0, 4).toUpperCase();
        const tAbbr = type === 'Indoor' ? 'MSI' : 'MSN';
        const counter = (equipmentCounter + 1).toString().padStart(2, '0');
        
        setGeneratedName(`${fAbbr}_SO_${lAbbr}_${tAbbr}${counter}_${typeChassis}`);
    } else {
        setGeneratedName("");
    }
  }, [watchAllFields]);


  if (user.role !== "Technicien") {
    return null;
  }
  
  const onSubmit = (values: FormValues) => {
    console.log({ ...values, generatedName });
    equipmentCounter++;
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
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel équipement</DialogTitle>
              <DialogDescription>
                Remplissez les détails de l'équipement. Le nom sera généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nom Généré</Label>
                <Input id="name" readOnly value={generatedName} className="col-span-3 font-mono bg-muted" placeholder="..."/>
              </div>
            </div>
            <DialogFooter>
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
