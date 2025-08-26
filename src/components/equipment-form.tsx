
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
import { Combobox } from "./combobox";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { Separator } from "./ui/separator";

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
];

const outdoorEquipmentTypes = [
    { value: 'BTS', label: 'Site GSM' },
    { value: 'MSN', label: 'MSAN Outdoor' },
    { value: 'FDT', label: 'SRO & FDT' },
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
  compteurId: z.string().optional(),
  dateMiseEnService: z.date().optional(),
  status: z.string().optional(),
  buildingId: z.string().optional(),
  dateResiliationCompteur: z.date().optional(),
  dateResiliationEquipement: z.date().optional(),
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
      designation: initialEquipment?.designation || building?.name || "",
      coordX: initialEquipment?.coordX ?? building?.coordX ?? 0,
      coordY: initialEquipment?.coordY ?? building?.coordY ?? 0,
      compteurId: initialEquipment?.compteurId || building?.meterId || "",
      dateMiseEnService: initialEquipment?.dateMiseEnService ? new Date(initialEquipment.dateMiseEnService) : undefined,
      status: initialEquipment?.status || 'En cours',
      buildingId: initialEquipment?.buildingId || buildingIdParam || "",
      dateResiliationCompteur: initialEquipment?.dateResiliationCompteur ? new Date(initialEquipment.dateResiliationCompteur) : undefined,
      dateResiliationEquipement: initialEquipment?.dateResiliationEquipement ? new Date(initialEquipment.dateResiliationEquipement) : undefined,
    },
  });

  const watchAllFields = form.watch();

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
    let newStatus: Equipment['status'] = values.status as Equipment['status'] || 'En cours';

    if (isEditMode && initialEquipment) {
        if (initialEquipment.status === 'En service' && (values.dateResiliationCompteur || values.dateResiliationEquipement)) {
            newStatus = 'En cours de résiliation';
        }
        if (initialEquipment.status === 'En cours de résiliation' && values.dateResiliationCompteur && values.dateResiliationEquipement) {
            newStatus = 'Résilié';
        }

        const updated: Equipment = {
            ...initialEquipment,
            name: generatedName,
            type: values.type,
            location: values.localisation,
            status: newStatus,
            lastUpdate: new Date().toISOString().split('T')[0],
            fournisseur: values.fournisseur,
            typeChassis: values.typeChassis,
            designation: values.designation,
            coordX: values.coordX,
            coordY: values.coordY,
            compteurId: values.compteurId,
            dateMiseEnService: values.dateMiseEnService?.toISOString().split('T')[0],
            buildingId: values.buildingId,
            dateResiliationCompteur: values.dateResiliationCompteur?.toISOString().split('T')[0],
            dateResiliationEquipement: values.dateResiliationEquipement?.toISOString().split('T')[0],
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
            compteurId: values.compteurId,
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


  const showResiliationFields = isEditMode && (initialEquipment.status === 'En service' || initialEquipment.status === 'En cours de résiliation');

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
                      placeholder="Sélectionner ou créer..."
                      options={fournisseurs.map(f => ({ value: f.value, label: f.label }))}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isEditMode && !canEditStatus}
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
                      placeholder="Sélectionner ou créer..."
                      options={localisations.map(l => ({ value: l.value, label: l.label }))}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!!building || (isEditMode && !canEditStatus)}
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
                      <Input placeholder="ex: MM_Immeuble Zarrouk" {...field} readOnly={!!building} disabled={isEditMode && !canEditDescription} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Coordonnées</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={handleGeolocate} disabled={isEditMode && !canEditStatus}><MapPin className="mr-2 h-4 w-4" /> Position Actuelle</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} readOnly={!!building} disabled={isEditMode && !canEditStatus} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} readOnly={!!building} disabled={isEditMode && !canEditStatus} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                </div>
              
                
                {building?.meterId && (
                     <FormField
                        control={form.control}
                        name="compteurId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>N° Compteur (Hérité du bâtiment)</FormLabel>
                             <FormControl>
                                <Input readOnly {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}

              <div className="md:col-span-2 space-y-2">
                <Label>Nom Généré</Label>
                <Input readOnly value={generatedName} className="font-mono bg-muted" placeholder="..."/>
              </div>

               {showResiliationFields && (
                <div className="md:col-span-2 space-y-4 rounded-md border p-4">
                  <h3 className="text-sm font-medium">Informations de Résiliation</h3>
                   <FormField control={form.control} name="dateResiliationCompteur" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date Résiliation Compteur</FormLabel>
                          <Popover><PopoverTrigger asChild>
                              <FormControl>
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={!canEditStatus}>
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
                              <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={!canEditStatus}>
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
