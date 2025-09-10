
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from 'react';
import { MeterRequestForm } from '@/components/meter-request-form';
import type { Meter } from '@/lib/types';
import { useMetersStore } from '@/hooks/use-meters-store';
import { MeterInstallationForm } from '@/components/meter-installation-form';
import { EquipmentCommissioningForm } from '@/components/equipment-commissioning-form';
import { CheckCircle, Circle, CircleDotDashed, List, PlusSquare, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useBuildingsStore } from '@/hooks/use-buildings-store';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const existingMeterSchema = z.object({
  meterId: z.string().min(1, "Veuillez sélectionner un compteur."),
});
type ExistingMeterFormValues = z.infer<typeof existingMeterSchema>;


const AssignExistingMeterForm = ({ equipmentId }: { equipmentId: string }) => {
    const router = useRouter();
    const { toast } = useToast();
    const { equipment, updateEquipment } = useEquipmentStore();
    const { meters } = useMetersStore();
    const equipmentItem = equipment.find(e => e.id === equipmentId);

    const availableMeters = useMemo(() => {
        // Filter for outdoor meters (no buildingId)
        const outdoorMeters = meters.filter(m => !m.buildingId && m.status === 'En service');
        
        // Count how many equipment are associated with each meter
        const meterUsageCount = equipment.reduce((acc, eq) => {
            if (eq.compteurId) {
                acc[eq.compteurId] = (acc[eq.compteurId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Filter meters that are used by 1 or 0 equipment
        return outdoorMeters.filter(m => (meterUsageCount[m.id] || 0) <= 1);

    }, [meters, equipment]);
    
    const form = useForm<ExistingMeterFormValues>({
        resolver: zodResolver(existingMeterSchema),
        defaultValues: { meterId: "" }
    });

    const onSubmit = (values: ExistingMeterFormValues) => {
        if (equipmentItem) {
            updateEquipment({
                ...equipmentItem,
                compteurId: values.meterId,
                status: 'En service',
                dateMiseEnService: format(new Date(), 'yyyy-MM-dd'),
                lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            });
            toast({
                title: "Compteur Assigné",
                description: `Le compteur ${values.meterId} a été assigné à l'équipement ${equipmentItem.name}.`
            });
            router.push('/dashboard/equipment');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Affecter un Compteur Existant</CardTitle>
                <CardDescription>
                    Sélectionnez un compteur extérieur disponible pour l'associer à cet équipement.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="meterId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Compteurs Extérieurs Disponibles</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un compteur..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableMeters.length > 0 ? (
                                                availableMeters.map(meter => (
                                                    <SelectItem key={meter.id} value={meter.id}>
                                                        {meter.id} - {meter.description || "N/A"}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">Aucun compteur extérieur disponible.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                                <Save className="mr-2 h-4 w-4"/> Enregistrer l'Association
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}


export default function NewMeterWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const { id: equipmentId } = params;
    const { equipment, updateEquipment } = useEquipmentStore();
    const { meters, addMeter, updateMeter } = useMetersStore();
    const { buildings } = useBuildingsStore();
    
    const [workflowChoice, setWorkflowChoice] = useState<'existing' | 'new' | null>(null);
    
    const equipmentItem = Array.isArray(equipmentId) ? undefined : equipment.find(e => e.id === equipmentId);

    const [currentStep, setCurrentStep] = useState(1);
    const [wipMeter, setWipMeter] = useState<Partial<Meter> | undefined>(undefined);

     // This effect runs only once on mount to handle pre-filling from a parent building.
    useEffect(() => {
        const equipmentItem = Array.isArray(equipmentId) ? undefined : equipment.find(e => e.id === equipmentId);
        if (equipmentItem && equipmentItem.buildingId) {
            const parentBuilding = buildings.find(b => b.id === equipmentItem.buildingId);
            if (parentBuilding && parentBuilding.meterId) {
                if (equipmentItem.compteurId !== parentBuilding.meterId) {
                    updateEquipment({
                        ...equipmentItem,
                        compteurId: parentBuilding.meterId,
                        coordX: parentBuilding.coordX,
                        coordY: parentBuilding.coordY,
                        lastUpdate: format(new Date(), 'yyyy-MM-dd'),
                    });
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [equipmentId]); // Run only when equipmentId changes

    useEffect(() => {
        if (equipmentItem) {
            // If the equipment is 'En cours', don't automatically choose a workflow.
            if (equipmentItem.status === 'En cours' && !equipmentItem.compteurId) {
                setWorkflowChoice(null);
                setCurrentStep(1);
                return;
            }

            // If a choice has already been made by the user, respect it.
            if(workflowChoice) return;

            // Case 1: Indoor equipment in a building that already has a meter
            const parentBuilding = buildings.find(b => b.id === equipmentItem.buildingId);
            if (parentBuilding && parentBuilding.meterId) {
                const buildingMeter = meters.find(m => m.id === parentBuilding.meterId);
                if (buildingMeter) {
                    setWipMeter(buildingMeter);
                    // If equipment is not yet in service, it needs commissioning
                    setCurrentStep(equipmentItem.status === 'En service' ? 4 : 3);
                    setWorkflowChoice('new'); // It's a new "installation" workflow
                    return; // Stop further processing
                }
            }

            // Case 2: Equipment already has a meter associated (in any state)
            if (equipmentItem.compteurId) {
                const meter = meters.find(m => m.id === equipmentItem.compteurId);
                if (meter) {
                    setWorkflowChoice('new'); // It has a meter, so it follows the new installation workflow
                    setWipMeter(meter);
                    if (equipmentItem.status === 'En service') {
                        setCurrentStep(4); // All done
                    } else if (meter.status === 'En service' && equipmentItem.status !== 'En service') {
                        // Meter is ready, equipment needs commissioning
                        setCurrentStep(3);
                    } else if (meter.dateMiseEnService && !meter.id.startsWith('MTR-WIP-')) {
                        // This means it's installed but not commissioned
                        setCurrentStep(3);
                    } else if (meter.id.startsWith('MTR-WIP-')) {
                        // This is a request in progress
                        setCurrentStep(2);
                    } else {
                        // Meter exists but is not a WIP, likely needs installation details
                        setCurrentStep(2);
                    }
                    return;
                }
            }
        }
        
        // If no conditions met (e.g. outdoor equipment with no meter), currentStep remains 1
        // and workflowChoice remains null, waiting for user input.
    }, [equipmentItem, meters, buildings, workflowChoice]);


    if (!equipmentItem) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }
    
    const handleStep1Finish = (data: { policeNumber?: string; districtSteg: string; typeTension: 'Moyen Tension Tranche Horaire' | 'Moyen Tension Forfaitaire' | 'Basse Tension'; dateDemandeInstallation: Date; coordX?: number; coordY?: number; phase: 'Triphasé' | 'Monophasé', amperage: '16A' | '32A' | '63A' | 'Autre', amperageAutre?: string }) => {
        const newMeter: Partial<Meter> = {
            id: `MTR-WIP-${Date.now()}`,
            status: 'En cours',
            typeTension: data.typeTension,
            policeNumber: data.policeNumber,
            dateDemandeInstallation: format(data.dateDemandeInstallation, 'yyyy-MM-dd'),
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            districtSteg: data.districtSteg,
            description: `Demande pour équipement ${equipmentItem.name}`,
            phase: data.phase,
            amperage: data.amperage,
            amperageAutre: data.amperageAutre
        }
        addMeter(newMeter as Meter);
        
        updateEquipment({
            ...equipmentItem,
            compteurId: newMeter.id,
            coordX: data.coordX,
            coordY: data.coordY,
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
        });
        
        setWipMeter(newMeter);
        setCurrentStep(2);
    }
    
    const handleStep2Finish = (data: Partial<Meter>) => {
        if (wipMeter && equipmentItem) {
            const tempId = wipMeter.id!;
             const updatedWipMeter: Meter = {
                ...(wipMeter as Meter),
                ...data,
                id: data.id!, // Ensure the new ID from the form is used
                lastUpdate: format(new Date(), 'yyyy-MM-dd'),
                status: 'En cours',
            };
            
            updateMeter(updatedWipMeter, tempId);

            updateEquipment({
                ...equipmentItem,
                compteurId: updatedWipMeter.id, // Update equipment with the NEW meter ID
                status: 'En cours',
                lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            });
            
            setWipMeter(updatedWipMeter);
            setCurrentStep(3);
        }
    }

    const handleStep3Finish = (data: { dateMiseEnService: string }) => {
        if(wipMeter && equipmentItem) {
            const finalMeterId = wipMeter.id;
            if (finalMeterId && !finalMeterId.startsWith('MTR-WIP-')) {
                 const meterToUpdate = meters.find(m => m.id === finalMeterId);
                 if (meterToUpdate && meterToUpdate.status !== 'En service') {
                    updateMeter({
                        ...meterToUpdate,
                        status: 'En service',
                        lastUpdate: format(new Date(), 'yyyy-MM-dd'),
                    });
                 }
            }

            updateEquipment({
                ...equipmentItem,
                status: 'En service',
                dateMiseEnService: data.dateMiseEnService,
                compteurId: finalMeterId,
                lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            });
            
            router.push('/dashboard/equipment');
        }
    }

    const getStepIcon = (step: number) => {
        if (currentStep > step) {
            return <CheckCircle className="h-6 w-6 text-green-500" />;
        }
        if (currentStep === step) {
            return <CircleDotDashed className="h-6 w-6 text-primary animate-pulse" />;
        }
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Nouveau Compteur pour l'Équipement: <span className="font-mono text-primary">{equipmentItem.name}</span></CardTitle>
                    <CardDescription>
                         {workflowChoice === 'new' ? "Suivez les étapes pour demander et installer un nouveau compteur pour cet équipement." : "Choisissez une méthode pour affecter un compteur à cet équipement."}
                    </CardDescription>
                </CardHeader>
                {workflowChoice === 'new' && (
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2">
                            {getStepIcon(1)}
                            <span className={cn(currentStep >= 1 && "font-semibold")}>1. Demande</span>
                            </div>
                            <Separator className="flex-1" />
                            <div className="flex items-center gap-2">
                            {getStepIcon(2)}
                            <span className={cn(currentStep >= 2 && "font-semibold")}>2. Installation Compteur</span>
                            </div>
                            <Separator className="flex-1" />
                            <div className="flex items-center gap-2">
                            {getStepIcon(3)}
                            <span className={cn(currentStep >= 3 && "font-semibold")}>3. Mise en Service</span>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {!workflowChoice && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card 
                        className="hover:bg-accent hover:border-primary transition-all cursor-pointer"
                        onClick={() => setWorkflowChoice('existing')}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <List className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle>Affecter un Compteur Existant</CardTitle>
                                    <CardDescription>Choisir parmi les compteurs extérieurs déjà installés.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card 
                        className="hover:bg-accent hover:border-primary transition-all cursor-pointer"
                        onClick={() => setWorkflowChoice('new')}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <PlusSquare className="h-10 w-10 text-primary" />
                                 <div>
                                    <CardTitle>Nouvelle Demande de Compteur</CardTitle>
                                    <CardDescription>Lancer le processus de demande pour un nouveau compteur.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {workflowChoice === 'existing' && (
                <AssignExistingMeterForm equipmentId={equipmentItem.id} />
            )}

            {workflowChoice === 'new' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 1: Demande de Compteur</CardTitle>
                            <CardDescription>Informations pour la demande initiale.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MeterRequestForm 
                                equipment={equipmentItem} 
                                onFinished={handleStep1Finish}
                                isFinished={currentStep > 1}
                                initialData={wipMeter}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 2: Installation du Compteur</CardTitle>
                            <CardDescription>Saisir les informations du compteur physique.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MeterInstallationForm 
                                onFinished={handleStep2Finish}
                                isFinished={currentStep > 2}
                                meterId={wipMeter?.id}
                                initialData={wipMeter}
                            />
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 3: Mise en Service</CardTitle>
                            <CardDescription>Finaliser la mise en service de l'équipement.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EquipmentCommissioningForm 
                                equipment={equipmentItem} 
                                onFinished={handleStep3Finish}
                                isFinished={currentStep > 3}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
