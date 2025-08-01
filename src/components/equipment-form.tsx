
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Save, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Combobox } from "./ui/combobox";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  name: z.string().optional(),
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

interface EquipmentFormProps {
    equipment?: Equipment;
}

export function EquipmentForm({ equipment: initialEquipment }: EquipmentFormProps) {
  const { user } = useUser();
  const { equipment: allEquipment, addEquipment, updateEquipment } = useEquipmentStore();
  const [generatedName, setGeneratedName] = useState(initialEquipment?.name || "");
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!initialEquipment;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialEquipment?.type || "",
      etat: initialEquipment?.status || "",
      fournisseur: initialEquipment?.fournisseur || "",
      localisation: initialEquipment?.location || "",
      typeChassis: initialEquipment?.typeChassis || "",
      designation: initialEquipment?.designation || "",
      tension: initialEquipment?.tension || "",
      adresseSteg: initialEquipment?.adresseSteg || "",
      districtSteg: initialEquipment?.districtSteg || "",
      coordX: initialEquipment?.coordX ?? undefined,
      coordY: initialEquipment?.coordY ?? undefined,
    },
  });

  const watchAllFields = form.watch();

  useEffect(() => {
    if (isEditMode) return;

    const { fournisseur, localisation, type, typeChassis, designation } = watchAllFields;
    if (fournisseur && localisation && type && typeChassis && designation) {
        const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
        const locInfo = localisations.find(l => l.value === localisation);

        const fAbbr = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
        
        const supplierEquipmentCount = allEquipment.filter(eq => {
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
  }, [watchAllFields, allEquipment, isEditMode]);
  
    const getStatusFromString = (status: string): "Active" | "Inactive" | "Maintenance" => {
        const s = status.toLowerCase();
        if (s.includes("active") || s.includes("actif")) return "Active";
        if (s.includes("inactive") || s.includes("inactif")) return "Inactive";
        if (s.includes("maintenance")) return "Maintenance";
        return "Inactive";
    }
  
  const handleGeolocate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            form.setValue('coordX', position.coords.longitude);
            form.setValue('coordY', position.coords.latitude);
            toast({ title: "Localisation Récupérée", description: "Les coordonnées ont été mises à jour." });
        }, (error) => {
            toast({ variant: "destructive", title: "Erreur de Géolocalisation", description: "Impossible de récupérer votre position." });
        });
    } else {
        toast({ variant: "destructive", title: "Erreur", description: "La géolocalisation n'est pas supportée par votre navigateur." });
    }
  }

  const onSubmit = (values: FormValues) => {
    if (isEditMode && initialEquipment) {
        const updated: Equipment = {
            ...initialEquipment,
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
        updateEquipment(updated);
        toast({ title: "Équipement Modifié", description: "Les modifications ont été enregistrées avec succès." });
    } else {
        const newEquipment: Equipment = {
            id: `EQP-${Date.now()}`,
            name: generatedName,
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
        addEquipment(newEquipment);
        toast({ title: "Équipement Ajouté", description: "Le nouvel équipement a été créé avec succès." });
    }
    router.push('/dashboard/equipment');
  }

  if (user.role !== "Technicien") {
    return (
        <div className="p-4 text-center text-muted-foreground">
            Vous n'avez pas la permission de voir ce formulaire.
        </div>
    );
  }

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fournisseur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur</FormLabel>
                    <Combobox
                      placeholder="Sélectionner ou écrire..."
                      options={fournisseurs.map(f => ({ value: f.value, label: f.label }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <Combobox
                      placeholder="Sélectionner ou écrire..."
                      options={localisations.map(l => ({ value: l.value, label: l.label }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="etat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>État</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="typeChassis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de Châssis</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 7302" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Désignation</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: MM_Immeuble Zarrouk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="tension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tension</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 48V" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="adresseSteg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse STEG</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 123 Rue de l'Avenir" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="districtSteg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District STEG</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Coordonnées</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGeolocate}><MapPin className="mr-2 h-4 w-4" /> Position Actuelle</Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <FormField
                        control={form.control}
                        name="coordX"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} />
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
                            <FormControl>
                            <Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Nom Généré</Label>
                <Input readOnly value={isEditMode ? initialEquipment.name : generatedName} className="font-mono bg-muted" placeholder="..."/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/equipment"><X className="mr-2" /> Annuler</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2" /> Enregistrer
                </Button>
            </div>
          </form>
        </Form>
  );
}
