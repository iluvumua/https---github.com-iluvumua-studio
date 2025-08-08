
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
import { Combobox } from "./combobox";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import type { Equipment } from "@/lib/types";
import { locationsData } from "@/lib/locations";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMetersStore } from "@/hooks/use-meters-store";

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

const equipmentTypes = [
    { value: 'BTS', label: 'Site GSM' },
    { value: 'MSN', label: 'MSAN Outdoor' },
    { value: 'MSI', label: 'MSAN Indoor' },
    { value: 'EXC', label: 'Central Téléphonique' },
    { value: 'OLT', label: 'OLT' },
    { value: 'FDT', label: 'SRO & FDT' },
]

const districtStegOptions = ["SOUSSE CENTRE", "SOUSSE NORD"];

const formSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, "Le type est requis."),
  fournisseur: z.string().min(1, "Le fournisseur est requis."),
  localisation: z.string().min(1, "La localisation est requise."),
  typeChassis: z.string().min(1, "Le type de châssis est requis."),
  designation: z.string().min(1, "La désignation est requise."),
  tension: z.enum(['BT', 'MT'], { required_error: "La tension est requise."}),
  districtSteg: z.string().min(1, "Le district STEG est requis."),
  coordX: z.coerce.number().optional(),
  coordY: z.coerce.number().optional(),
  compteurId: z.string().optional(),
  dateMiseEnService: z.date().optional(),
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
  const { meters } = useMetersStore();
  const isEditMode = !!initialEquipment;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialEquipment?.type || "",
      fournisseur: initialEquipment?.fournisseur || "",
      localisation: initialEquipment?.location || "",
      typeChassis: initialEquipment?.typeChassis || "",
      designation: initialEquipment?.designation || "",
      tension: initialEquipment?.tension || undefined,
      districtSteg: initialEquipment?.districtSteg || "",
      coordX: initialEquipment?.coordX ?? undefined,
      coordY: initialEquipment?.coordY ?? undefined,
      compteurId: initialEquipment?.compteurId || "",
      dateMiseEnService: initialEquipment?.dateMiseEnService ? new Date(initialEquipment.dateMiseEnService) : undefined,
    },
  });

  const watchAllFields = form.watch();
  const watchedLocalisation = form.watch("localisation");

  useEffect(() => {
    if (watchedLocalisation) {
      const locationInfo = locationsData.find(loc => loc.abbreviation === watchedLocalisation);
      if (locationInfo && locationInfo.districtSteg) {
        form.setValue("districtSteg", locationInfo.districtSteg);
      }
    }
  }, [watchedLocalisation, form]);

  useEffect(() => {
    const { fournisseur, localisation, type, typeChassis, designation } = watchAllFields;
    if (fournisseur && localisation && type && typeChassis && designation) {
        const fournisseurInfo = fournisseurs.find(f => f.value === fournisseur);
        const locInfo = localisations.find(l => l.value === localisation);

        const fAbbr = fournisseurInfo?.abbreviation || fournisseur.substring(0, 3).toUpperCase();
        
        let counterPart = "";
        if (isEditMode && initialEquipment) {
            const nameParts = initialEquipment.name.split('_');
            const potentialCounter = nameParts[3];
            // Regex to find MSI, MSN, etc. followed by numbers
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
        
        setGeneratedName(`${fAbbr}_SO_${lAbbr}_${tAbbr}${counterPart}_${designation}_${typeChassis}`);
    } else {
        setGeneratedName("");
    }
  }, [watchAllFields, allEquipment, isEditMode, initialEquipment]);
  
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
        const isActivating = initialEquipment.status === 'En Attente d\'Installation' && values.compteurId && values.dateMiseEnService;
        
        const updated: Equipment = {
            ...initialEquipment,
            name: generatedName,
            type: values.type,
            location: values.localisation,
            status: isActivating ? 'Active' : initialEquipment.status,
            lastUpdate: new Date().toISOString().split('T')[0],
            fournisseur: values.fournisseur,
            typeChassis: values.typeChassis,
            designation: values.designation,
            tension: values.tension,
            districtSteg: values.districtSteg,
            coordX: values.coordX,
            coordY: values.coordY,
            compteurId: values.compteurId,
            dateMiseEnService: values.dateMiseEnService?.toISOString().split('T')[0],
        }
        updateEquipment(updated);
        toast({ title: "Équipement Modifié", description: "Les modifications ont été enregistrées avec succès." });
    } else {
        const newEquipment: Equipment = {
            id: `EQP-${Date.now()}`,
            name: generatedName,
            type: values.type,
            location: values.localisation,
            status: 'Vérification Requise',
            lastUpdate: new Date().toISOString().split('T')[0],
            fournisseur: values.fournisseur,
            typeChassis: values.typeChassis,
            designation: values.designation,
            tension: values.tension,
            districtSteg: values.districtSteg,
            coordX: values.coordX,
            coordY: values.coordY,
        }
        addEquipment(newEquipment);
        toast({ title: "Équipement Ajouté", description: "Le nouvel équipement a été créé et est en attente de vérification." });
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

  const isInstallationStep = isEditMode && initialEquipment.status === 'En Attente d\'Installation';
  const readOnlyBaseFields = isEditMode && initialEquipment.status !== 'Vérification Requise';

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
                       disabled={readOnlyBaseFields}
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
                       disabled={readOnlyBaseFields}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}  disabled={readOnlyBaseFields}>
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
                name="tension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tension</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnlyBaseFields}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la tension" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BT">BT (Basse Tension)</SelectItem>
                        <SelectItem value="MT">MT (Moyenne Tension)</SelectItem>
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
                      <Input placeholder="ex: 7302" {...field}  disabled={readOnlyBaseFields} />
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
                name="districtSteg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District STEG</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} >
                       <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un district" />
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
                        <FormField control={form.control} name="coordX" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Longitude" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="coordY" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Latitude" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                </div>

                {isInstallationStep && (
                     <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-md border p-4">
                        <FormField
                            control={form.control}
                            name="compteurId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>N° du Compteur Installé</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un compteur" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {meters.filter(m => m.status === 'Actif').map(meter => (
                                            <SelectItem key={meter.id} value={meter.id}>{meter.id}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateMiseEnService"
                            render={({ field }) => (
                            <FormItem className="flex flex-col pt-2">
                                <FormLabel>Date de Mise en Service</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP")
                                        ) : (
                                        <span>Choisir une date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                )}
              
              <div className="md:col-span-2 space-y-2">
                <Label>Nom Généré</Label>
                <Input readOnly value={generatedName} className="font-mono bg-muted" placeholder="..."/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/equipment"><X className="mr-2" /> Annuler</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2" /> {isInstallationStep ? 'Activer Équipement' : 'Enregistrer'}
                </Button>
            </div>
          </form>
        </Form>
  );
}

    
