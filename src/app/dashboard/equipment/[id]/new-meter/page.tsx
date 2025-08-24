
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';
import { MeterRequestForm } from '@/components/meter-request-form';
import type { Meter } from '@/lib/types';
import { useMetersStore } from '@/hooks/use-meters-store';
import { MeterInstallationForm } from '@/components/meter-installation-form';
import { EquipmentCommissioningForm } from '@/components/equipment-commissioning-form';
import { CheckCircle, Circle, CircleDotDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useBuildingsStore } from '@/hooks/use-buildings-store';

export default function NewMeterWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const { id: equipmentId } = params;
    const { equipment, updateEquipment } = useEquipmentStore();
    const { meters, addMeter, updateMeter } = useMetersStore();
    const { buildings } = useBuildingsStore();
    
    const equipmentItem = Array.isArray(equipmentId) ? undefined : equipment.find(e => e.id === equipmentId);

    const [currentStep, setCurrentStep] = useState(1);
    const [wipMeter, setWipMeter] = useState<Meter | undefined>(undefined);

    useEffect(() => {
        if (equipmentItem) {
            // Case 1: Equipment is in a building that has an 'En service' meter
            const parentBuilding = buildings.find(b => b.id === equipmentItem.buildingId);
            if (parentBuilding && parentBuilding.meterId) {
                const buildingMeter = meters.find(m => m.id === parentBuilding.meterId && m.status === 'En service');
                if (buildingMeter) {
                    // Automatically associate the meter and skip to step 3
                    const updatedEquipment = {
                        ...equipmentItem,
                        compteurId: buildingMeter.id,
                        coordX: equipmentItem.coordX || parentBuilding.coordX,
                        coordY: equipmentItem.coordY || parentBuilding.coordY,
                        lastUpdate: new Date().toISOString().split('T')[0],
                    };
                    updateEquipment(updatedEquipment);
                    setWipMeter(buildingMeter);
                    setCurrentStep(3); // Skip to commissioning
                    return;
                }
            }

            // Case 2: Equipment already has a meter associated (in any state)
            if (equipmentItem.compteurId) {
                const meter = meters.find(m => m.id === equipmentItem.compteurId);
                if (meter) {
                    setWipMeter(meter);
                    if (meter.status === 'En service') {
                        setCurrentStep(4); // All done
                    } else if (meter.dateMiseEnService && !meter.id.startsWith('MTR-WIP-')) {
                        // This means it's installed but not commissioned
                        setCurrentStep(3);
                    } else if (meter.id.startsWith('MTR-WIP-')) {
                        // This is a request in progress
                        setCurrentStep(1);
                    } else {
                        // Meter exists but is not a WIP, likely needs installation details
                        setCurrentStep(2);
                    }
                    return;
                }
            }
        }
    }, [equipmentItem, meters, buildings, updateEquipment]);


    if (!equipmentItem) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }
    
    const handleStep1Finish = (data: { policeNumber?: string; districtSteg: string; typeTension: 'Moyenne Tension' | 'Basse Tension'; dateDemandeInstallation: Date; coordX?: number; coordY?: number }) => {
        const newMeter: Meter = {
            id: `MTR-WIP-${Date.now()}`,
            status: 'En cours',
            typeTension: data.typeTension,
            policeNumber: data.policeNumber,
            dateDemandeInstallation: data.dateDemandeInstallation.toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
            equipmentId: equipmentItem.id,
            districtSteg: data.districtSteg,
            description: `Demande pour équipement ${equipmentItem.name}`
        }
        addMeter(newMeter);
        
        updateEquipment({
            ...equipmentItem,
            compteurId: newMeter.id,
            coordX: data.coordX,
            coordY: data.coordY,
            lastUpdate: new Date().toISOString().split('T')[0],
        });
        
        router.push('/dashboard/equipment');
    }
    
    const handleStep2Finish = (data: { meterId: string; dateMiseEnService: string }) => {
        if (wipMeter) {
            const tempId = wipMeter.id;
            const updatedWipMeter: Meter = {
                ...wipMeter,
                id: data.meterId,
                dateMiseEnService: data.dateMiseEnService,
                lastUpdate: new Date().toISOString().split('T')[0],
                status: 'En cours', // Remain 'En cours'
            };
            
            updateMeter(updatedWipMeter, tempId);

            if (equipmentItem.compteurId === tempId) {
                 updateEquipment({
                    ...equipmentItem,
                    compteurId: data.meterId,
                    status: 'En cours', // Remain 'En cours'
                });
            }

            // Also update building if it was associated
            if (equipmentItem.buildingId) {
                const building = buildings.find(b => b.id === equipmentItem.buildingId);
                if (building && !building.meterId) {
                    // Update building store if needed, assuming a function exists
                }
            }

            router.push('/dashboard/equipment');
        }
    }

    const handleStep3Finish = (data: { dateMiseEnService: string }) => {
        if(wipMeter) {
            updateMeter({
                ...wipMeter,
                status: 'En service',
                lastUpdate: new Date().toISOString().split('T')[0],
            }, wipMeter.id);

            updateEquipment({
                ...equipmentItem,
                status: 'En service',
                dateMiseEnService: data.dateMiseEnService,
                lastUpdate: new Date().toISOString().split('T')[0],
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
                    <CardDescription>Suivez les étapes pour demander et installer un nouveau compteur pour cet équipement.</CardDescription>
                </CardHeader>
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
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <Card className={cn(currentStep !== 1 && "opacity-50 pointer-events-none")}>
                    <CardHeader>
                        <CardTitle>Étape 1: Demande de Compteur</CardTitle>
                        <CardDescription>Informations pour la demande initiale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeterRequestForm 
                            equipment={equipmentItem} 
                            onFinished={handleStep1Finish}
                            isFinished={currentStep > 1}
                        />
                    </CardContent>
                </Card>

                 <Card className={cn(currentStep !== 2 && "opacity-50 pointer-events-none")}>
                    <CardHeader>
                        <CardTitle>Étape 2: Installation du Compteur</CardTitle>
                        <CardDescription>Saisir les informations du compteur physique.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeterInstallationForm 
                            onFinished={handleStep2Finish}
                            isFinished={currentStep > 2}
                            meterId={wipMeter?.id}
                         />
                    </CardContent>
                </Card>
                
                 <Card className={cn(currentStep !== 3 && "opacity-50 pointer-events-none")}>
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
        </div>
    )
}
