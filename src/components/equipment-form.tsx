
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Save, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { Combobox } from "./combobox";
import { Textarea } from "./ui/textarea";

const fournisseurs = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "NSN" },
  { value: "Adtran", label: "Adtran", abbreviation: "NSN" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NSN" },
  { value: "ERI", label: "ERI", abbreviation: "ERI" },
];

const localisations = locationsData.map(loc => ({
    value: loc.abbreviation,
    label: loc.localite,
    abbreviation: loc.abbreviation,
}));

const commonEquipmentTypes = [
    { value: 'BTS', label: 'Site GSM' },
];

const indoorEquipmentTypes = [
    { value: 'MSI', label: 'MSAN Indoor' },
    { value: 'EXC', label: 'Central Téléphonique' },
    { value: 'OLT', label: 'OLT' },
];

const outdoorEquipmentTypes = [
    { value: 'MSN', label: 'MSAN Outdoor' },
];

const formSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, "Le type est requis."),
  fournisseur: z.string().optional(),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().optional(),
  designation: z.string().optional(),
  description: z.string().optional(),
  coordX: z.coerce.number({required_error: "La coordonnée X est requise."}),
  coordY: z.coerce.number({required_error: "La coordonnée Y est requise."}),
  buildingId: z.string().optional(),
  googleMapsUrl: z.string().optional(),
}).superRefine((data, ctx) => {
    // Fournisseur is required for all types except BTS and EXC
    if (data.type !== 'EXC') { // Supplier is now required for BTS
        if (!data.fournisseur) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le fournisseur est requis.",
                path: ["fournisseur"],
            });
        }
    }
    // TypeChassis is required only for MSAN types
    if (data.type === 'MSI' || data.type === 'MSN') {
        if (!data.typeChassis) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le type de châssis est requis.",
                path: ["typeChassis"],
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentFormProps {
    equipment?: Equipment;
}

const extractDesignationFromName = (name: string, type: string, typeChassis: string): string => {
    if (!name || !type) return "";

    const typeRegex = new RegExp(`_${type}\\d+`);
    const typeMatch = name.match(typeRegex);
    if (!typeMatch || typeof typeMatch.index === 'undefined') return "";
    
    const designationStartIndex = typeMatch.index + typeMatch[0].length + 1;

    let designationEndIndex = name.length;
    if (typeChassis) {
        const chassisIndex = name.lastIndexOf(`_${typeChassis}`);
        if (chassisIndex > designationStartIndex) {
            designationEndIndex = chassisIndex;
        }
    }
    
    if (designationStartIndex >= designationEndIndex) return "";

    return name.substring(designationStartIndex, designationEndIndex);
}

export function EquipmentForm({ equipment: initialEquipment }: EquipmentFormProps) {
  const { user } = useUser();
  const { equipment: allEquipment, addEquipment, updateEquipment } = useEquipmentStore();
  const [generatedName, setGeneratedName] = useState(initialEquipment?.name || "");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { meters } = useMetersStore();
  const { buildings } = useBuildingsStore();
  const isEditMode = !!initialEquipment;
  
  const buildingIdParam = searchParams.get('buildingId');
  const building = buildings.find(b => b.id === buildingIdParam);

  const equipmentTypes = useMemo(() => {
    const baseTypes = buildingIdParam ? indoorEquipmentTypes : outdoorEquipmentTypes;
    return [...commonEquipmentTypes, ...baseTypes];
  }, [buildingIdParam]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialEquipment?.type || "",
      fournisseur: initialEquipment?.fournisseur || "",
      localisation: initialEquipment?.location || building?.code || "",
      typeChassis: initialEquipment?.typeChassis || "",
      designation: initialEquipment ? extractDesignationFromName(initialEquipment.name, initialEquipment.type, initialEquipment.typeChassis || '') : (building?.name || ""),
      description: initialEquipment?.description || "",
      coordX: initialEquipment?.coordX ?? building?.coordX,
      coordY: initialEquipment?.coordY ?? building?.coordY,
      buildingId: initialEquipment?.buildingId || buildingIdParam || "",
      googleMapsUrl: '',
    },
  });

  const watchAllFields = form.watch();
  const watchedType = form.watch('type');
  const watchedUrl = form.watch('googleMapsUrl');

  const supplierOptions = useMemo(() => {
    if (watchedType === 'BTS') {
      return fournisseurs.filter(f => f.value === 'ERI');
    }
    return fournisseurs;
  }, [watchedType]);

  useEffect(() => {
    if (watchedUrl) {
      const match = watchedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match && match[1] && match[2]) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        form.setValue('coordY', lat);
        form.setValue('coordX', lng);
      }
    }
  }, [watchedUrl, form]);

  useEffect(() => {
    const { fournisseur, localisation, type, typeChassis, designation } = watchAllFields;
    
    if (localisation && type) {
        let nameParts = [];
        const locInfo = localisations.find(l => l.value === localisation);
        const lAbbr = locInfo?.abbreviation || localisation.substring(0, 4).toUpperCase();
        
        let counterPart = "";
        if (isEditMode && initialEquipment) {
            const initialNameParts = initialEquipment.name.split('_');
            const potentialCounter = initialNameParts.find(part => part.startsWith(type));
            const match = potentialCounter?.match(/([A-Z]+)(\d+)/);
            if(match && match[2]) {
                 counterPart = match[2];
            } else {
                 counterPart = "01";
            }
        } else {
             const sameTypeCount = allEquipment.filter(eq => eq.type === type).length;
             counterPart = (sameTypeCount + 1).toString().padStart(2, '0');
        }

        const tAbbr = type;
        const isMSAN = type === 'MSI' || type === 'MSN';
        const needsFournisseur = type !== 'EXC';

        let namePrefix = 'SO';
        let supplierPrefix = '';
        if (needsFournisseur && fournisseur) {
            const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
            supplierPrefix = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
            namePrefix = 'SO';
            nameParts.push(supplierPrefix, namePrefix);
        } else {
            nameParts.push(namePrefix);
        }

        nameParts.push(lAbbr, `${tAbbr}${counterPart}`);

        if (designation) nameParts.push(designation);
        
        if (isMSAN && typeChassis) {
            nameParts.push(typeChassis);
        }

        if (nameParts.length > 0) {
            setGeneratedName(nameParts.join('_'));
        } else {
            setGeneratedName("");
        }
    } else {
        setGeneratedName("");
    }
  }, [watchAllFields, allEquipment, isEditMode, initialEquipment]);
  
  const watchedCoords = form.watch(['coordY', 'coordX']);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${watchedCoords[0] || '35.829169'},${watchedCoords[1] || '10.638617'}`;

  const onSubmit = (values: FormValues) => {
    if (isEditMode && initialEquipment) {
        const updated: Equipment = {
            ...initialEquipment,
            name: generatedName,
            type: values.type,
            location: values.localisation,
            lastUpdate: new Date().toISOString().split('T')[0],
            fournisseur: values.fournisseur,
            typeChassis: values.typeChassis,
            designation: values.designation,
            description: values.description,
            coordX: values.coordX,
            coordY: values.coordY,
            buildingId: values.buildingId,
        }
        updateEquipment(updated);
        toast({ title: "Équipement Modifié", description: "Les modifications ont été enregistrées avec succès." });
    } else {
        const newEquipment: Equipment = {
            id: `EQP-${Date.now()}`,
            name: generatedName,
            type: values.type,
            location: values.localisation,
            status: 'En cours',
            lastUpdate: new Date().toISOString().split('T')[0],
            fournisseur: values.fournisseur,
            typeChassis: values.typeChassis,
            designation: values.designation || undefined,
            description: values.description || undefined,
            coordX: values.coordX,
            coordY: values.coordY,
            compteurId: building?.meterId,
            buildingId: values.buildingId,
        }
        addEquipment(newEquipment);
        toast({ title: "Équipement Ajouté", description: "Le nouvel équipement a été créé et est en attente de vérification." });
    }
    router.push('/dashboard/equipment');
  }

  const canEditStatus = user.role === 'Responsable Énergie et Environnement' || user.role === 'Admin';
  const canEditGenerally = user.role === 'Déploiement' || user.role === 'Etude et Planification' || user.role === 'Admin';
  const canCreate = user.role === 'Etude et Planification' || user.role === 'Admin';
  const canEditDesignation = user.role !== 'Financier';

  const isFormDisabled = isEditMode && !canEditStatus && !canEditGenerally;
  
  const showSupplier = watchedType && watchedType !== 'EXC';
  const showChassis = watchedType === 'MSI' || watchedType === 'MSN';

  const availableMeters = useMemo(() => {
    const selectedLocation = watchAllFields.localisation;
    const selectedBuilding = buildings.find(b => b.code === selectedLocation);

    if (selectedBuilding) {
      const equipmentInBuilding = allEquipment.filter(e => e.buildingId === selectedBuilding.id);
      const meterIds = equipmentInBuilding.map(e => e.compteurId).filter(Boolean);
      if (selectedBuilding.meterId) {
        meterIds.push(selectedBuilding.meterId);
      }
      const uniqueMeterIds = [...new Set(meterIds)];
      return meters.filter(m => uniqueMeterIds.includes(m.id));
    }

    if (selectedLocation) {
        const equipmentInLocation = allEquipment.filter(e => e.location === selectedLocation);
        const meterIds = new Set(equipmentInLocation.map(e => e.compteurId).filter(Boolean));
        return meters.filter(m => meterIds.has(m.id));
    }
    
    return meters;
  }, [watchAllFields.localisation, meters, buildings, allEquipment]);

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Combobox
                        options={equipmentTypes}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Rechercher un type..."
                        disabled={isFormDisabled}
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
                        options={localisations}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Rechercher une localisation..."
                        disabled={!!building || isFormDisabled}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            {showSupplier && (
                <FormField
                    control={form.control}
                    name="fournisseur"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fournisseur</FormLabel>
                        <Combobox
                            options={supplierOptions}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                if (watchedType === 'BTS' && supplierOptions.length === 1) {
                                    field.onChange(supplierOptions[0].value);
                                } else {
                                    field.onChange(value);
                                }
                            }}
                            placeholder="Sélectionner un fournisseur"
                            disabled={isFormDisabled}
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            {showChassis && (
               <FormField
                control={form.control}
                name="typeChassis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de Châssis</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 7302" {...field} disabled={isFormDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
               <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Désignation (Optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: MM_Immeuble Zarrouk" {...field} disabled={!canEditDesignation} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Coordonnées</Label>
                        <Button type="button" variant="ghost" size="sm" asChild>
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" /> Ouvrir Google Maps
                            </a>
                        </Button>
                    </div>
                     <FormField control={form.control} name="googleMapsUrl" render={({ field }) => ( <FormItem><FormLabel>Lien Google Maps</FormLabel><FormControl><Input placeholder="Coller le lien Google Maps ici..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid grid-cols-2 gap-2">
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem>
                            <FormLabel>X (Longitude)</FormLabel>
                            <FormControl><Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} disabled={isFormDisabled} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem>
                            <FormLabel>Y (Latitude)</FormLabel>
                            <FormControl><Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} disabled={isFormDisabled} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                </div>

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (Optionnel)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ajouter une description..." {...field} disabled={isFormDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2 space-y-2">
                <Label>Nom Généré</Label>
                <Input readOnly value={generatedName} className="font-mono bg-muted" placeholder="..."/>
              </div>

            </div>
            {((isEditMode && canEditGenerally) || (!isEditMode && canCreate)) && (
                 <div className="flex justify-end gap-2 mt-8">
                    <Button type="button" variant="ghost" asChild>
                        <Link href="/dashboard/equipment"><X className="mr-2" /> Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2" /> Enregistrer
                    </Button>
                </div>
            )}
             {isFormDisabled && (
                 <div className="flex justify-end gap-2 mt-8">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/equipment"><X className="mr-2" /> Retour</Link>
                    </Button>
                </div>
            )}
          </form>
        </Form>
  );
}

    