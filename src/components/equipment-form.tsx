
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";

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

const indoorEquipmentTypes = [
    { value: 'MSI', label: 'MSAN Indoor' },
    { value: 'EXC', label: 'Central Téléphonique' },
    { value: 'OLT', label: 'OLT' },
    { value: 'BTS', label: 'Site GSM' },
];

const outdoorEquipmentTypes = [
    { value: 'MSN', label: 'MSAN Outdoor' },
];

const formSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, "Le type est requis."),
  fournisseur: z.string().min(1, "Le fournisseur est requis."),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().min(1, "Le type de châssis est requis."),
  designation: z.string().optional(),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
  buildingId: z.string().optional(),
  googleMapsUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentFormProps {
    equipment?: Equipment;
}

const extractDesignationFromName = (name: string, type: string, typeChassis: string): string => {
    if (!name || !type || !typeChassis) return "";

    const chassisIndex = name.lastIndexOf(`_${typeChassis}`);
    if (chassisIndex === -1) return "";

    // Find the type with its counter (e.g., MSI11, MSN01)
    const typeRegex = new RegExp(`_${type}\\d+`);
    const typeMatch = name.match(typeRegex);
    if (!typeMatch || typeof typeMatch.index === 'undefined') return "";
    
    const designationStartIndex = typeMatch.index + typeMatch[0].length + 1; // +1 for the underscore

    if (designationStartIndex >= chassisIndex) return "";

    return name.substring(designationStartIndex, chassisIndex);
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
    return buildingIdParam ? indoorEquipmentTypes : outdoorEquipmentTypes;
  }, [buildingIdParam]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialEquipment?.type || "",
      fournisseur: initialEquipment?.fournisseur || "",
      localisation: initialEquipment?.location || building?.code || "",
      typeChassis: initialEquipment?.typeChassis || "",
      designation: initialEquipment ? extractDesignationFromName(initialEquipment.name, initialEquipment.type, initialEquipment.typeChassis) : (building?.name || ""),
      coordX: initialEquipment?.coordX ?? building?.coordX ?? 0,
      coordY: initialEquipment?.coordY ?? building?.coordY ?? 0,
      buildingId: initialEquipment?.buildingId || buildingIdParam || "",
      googleMapsUrl: '',
    },
  });

  const watchAllFields = form.watch();
  const watchedUrl = form.watch('googleMapsUrl');

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
    if (fournisseur && localisation && type && typeChassis) {
        const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
        const locInfo = localisations.find(l => l.value === localisation);

        const fAbbr = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
        
        let counterPart = "";
        if (isEditMode && initialEquipment) {
            const nameParts = initialEquipment.name.split('_');
            const potentialCounter = nameParts.length > 3 ? nameParts[3] : '';
            const match = potentialCounter.match(/([A-Z]+)(\d+)/);
            if(match && match[2]) {
                 counterPart = match[2];
            } else {
                 counterPart = "01";
            }
        } else {
            const supplierEquipmentCount = allEquipment.filter(eq => {
                const eqFournisseurInfo = fournisseurs.find(f => f.value === eq.fournisseur);
                return eqFournisseurInfo?.abbreviation === fAbbr;
            }).length;
            counterPart = (supplierEquipmentCount + 1).toString().padStart(2, '0');
        }

        const lAbbr = locInfo?.abbreviation || localisation.substring(0, 4).toUpperCase();
        const tAbbr = type;
        
        const designationPart = designation ? `_${designation}` : "";

        setGeneratedName(`${fAbbr}_SO_${lAbbr}_${tAbbr}${counterPart}${designationPart}_${typeChassis}`);
    } else {
        setGeneratedName("");
    }
  }, [watchAllFields.fournisseur, watchAllFields.localisation, watchAllFields.type, watchAllFields.typeChassis, watchAllFields.designation, allEquipment, isEditMode, initialEquipment]);
  
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

  const canEditStatus = user.role === 'Responsable Énergie et Environnement';
  const canEditDescription = user.role === 'Responsable Énergie et Environnement' || user.role === 'Technicien';
  const canCreate = user.role === 'Technicien';

  const isFormDisabled = isEditMode && !canEditStatus && !canEditDescription;
  
  const availableMeters = useMemo(() => {
    const selectedLocation = watchAllFields.localisation;
    const selectedBuilding = buildings.find(b => b.code === selectedLocation);

    if (selectedBuilding) {
      // Find all equipment in the same building
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
                name="fournisseur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode && !canEditStatus}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fournisseurs.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!building || (isEditMode && !canEditStatus)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {localisations.map(l => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode && !canEditStatus}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
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
                      <Input placeholder="ex: 7302" {...field} disabled={isEditMode && !canEditStatus} />
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
                    <FormLabel>Désignation (Optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: MM_Immeuble Zarrouk" {...field} disabled={!canEditDescription} />
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
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} readOnly={!!building} disabled={isEditMode && !canEditStatus} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} readOnly={!!building} disabled={isEditMode && !canEditStatus} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label>Nom Généré</Label>
                <Input readOnly value={generatedName} className="font-mono bg-muted" placeholder="..."/>
              </div>

            </div>
            {((isEditMode && (canEditStatus || canEditDescription)) || (!isEditMode && canCreate)) && (
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
