
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from 'react';
import { MeterRequestForm } from '@/components/meter-request-form';
import type { Meter } from '@/lib/types';
import { useMetersStore } from '@/hooks/use-meters-store';
import { MeterInstallationForm } from '@/components/meter-installation-form';
import { EquipmentCommissioningForm } from '@/components/equipment-commissioning-form';
import { CheckCircle, Circle, RadioButtonChecked } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function NewMeterWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const { id: equipmentId } = params;
    const { equipment, updateEquipment } = useEquipmentStore();
    const { meters, addMeter, updateMeter } = useMetersStore();
    
    const [currentStep, setCurrentStep] = useState(1);

    const equipmentItem = Array.isArray(equipmentId) ? undefined : equipment.find(e => e.id === equipmentId);

    if (!equipmentItem) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }
    
    const associatedMeter = meters.find(m => m.id === equipmentItem.compteurId);

    const handleStep1Finish = (data: { policeNumber: string; districtSteg: string; typeTension: 'Moyenne Tension' | 'Basse Tension'; dateDemandeInstallation: string; coordX?: number; coordY?: number }) => {
        const newMeter: Meter = {
            id: `MTR-${Date.now()}`,
            status: 'En cours',
            typeTension: data.typeTension,
            policeNumber: data.policeNumber,
            dateDemandeInstallation: data.dateDemandeInstallation,
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
        
        setCurrentStep(2);
    }
    
    const handleStep2Finish = (data: { meterId: string; dateMiseEnService: string }) => {
        if (associatedMeter) {
            updateMeter({
                ...associatedMeter,
                id: data.meterId,
                dateMiseEnService: data.dateMiseEnService,
                lastUpdate: new Date().toISOString().split('T')[0],
            });
            updateEquipment({
                ...equipmentItem,
                compteurId: data.meterId,
            });
            setCurrentStep(3);
        }
    }

    const handleStep3Finish = (data: { dateMiseEnService: string }) => {
        if(associatedMeter) {
            updateMeter({
                ...associatedMeter,
                status: 'En service',
                lastUpdate: new Date().toISOString().split('T')[0],
            });
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
            return <RadioButtonChecked className="h-6 w-6 text-primary animate-pulse" />;
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
                 <Card className={cn(currentStep < 1 && "opacity-50 pointer-events-none")}>
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

                 <Card className={cn(currentStep < 2 && "opacity-50 pointer-events-none")}>
                    <CardHeader>
                        <CardTitle>Étape 2: Installation du Compteur</CardTitle>
                        <CardDescription>Saisir les informations du compteur physique.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeterInstallationForm 
                            onFinished={handleStep2Finish}
                            isFinished={currentStep > 2}
                         />
                    </CardContent>
                </Card>
                
                 <Card className={cn(currentStep < 3 && "opacity-50 pointer-events-none")}>
                    <CardHeader>
                        <CardTitle>Étape 3: Mise en Service</CardTitle>
                        <CardDescription>Finaliser la mise en service de l'équipement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EquipmentCommissioningForm 
                            equipment={equipmentItem} 
                            onFinished={handleStep3Finish}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
