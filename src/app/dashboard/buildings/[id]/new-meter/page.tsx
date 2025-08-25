
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
import { CheckCircle, Circle, CircleDotDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useBuildingsStore } from '@/hooks/use-buildings-store';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function NewMeterWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const { id: buildingId } = params;
    const { updateEquipment } = useEquipmentStore();
    const { meters, addMeter, updateMeter } = useMetersStore();
    const { buildings, updateBuilding } = useBuildingsStore();
    
    const buildingItem = Array.isArray(buildingId) ? undefined : buildings.find(b => b.id === buildingId);

    const [currentStep, setCurrentStep] = useState(1);
    const [wipMeter, setWipMeter] = useState<Meter | undefined>(undefined);

    useEffect(() => {
        if (buildingItem?.meterId) {
            const meter = meters.find(m => m.id === buildingItem.meterId);
            if (meter) {
                setWipMeter(meter);
                if (meter.status === 'En service') {
                    setCurrentStep(4); // All done
                } else if (meter.dateMiseEnService && !meter.id.startsWith('MTR-WIP-')) {
                     // This means it's installed but not commissioned
                    setCurrentStep(3);
                } else if (meter.id.startsWith('MTR-WIP-')) {
                    // This is a request in progress, installation is next
                    setCurrentStep(2);
                } else if (meter) {
                    // A meter is assigned, but not a WIP and not in service.
                    // This likely means it needs installation details.
                    setCurrentStep(2);
                }
            } else {
                 // Building has a meterId, but we can't find that meter.
                 // Treat as a new request.
                setCurrentStep(1);
                setWipMeter(undefined);
            }
        } else {
            // No meterId on building, definitely a new request.
            setCurrentStep(1);
            setWipMeter(undefined);
        }
    }, [buildingItem, meters]);


    if (!buildingItem) {
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
            buildingId: buildingItem.id,
            districtSteg: data.districtSteg,
            description: `Demande pour bâtiment ${buildingItem.name}`
        }
        addMeter(newMeter);
        
        updateBuilding({
            ...buildingItem,
            meterId: newMeter.id,
            coordX: data.coordX,
            coordY: data.coordY,
        });
        
        setWipMeter(newMeter);
        setCurrentStep(2);
    }
    
    const handleStep2Finish = (data: { meterId: string; dateMiseEnService: string }) => {
        if (wipMeter) {
            const tempId = wipMeter.id;
            const updatedWipMeter: Meter = {
                ...wipMeter,
                id: data.meterId,
                dateMiseEnService: data.dateMiseEnService,
                lastUpdate: new Date().toISOString().split('T')[0],
                status: 'En cours',
            };
            
            updateMeter(updatedWipMeter, tempId);

            if (buildingItem.meterId === tempId) {
                 updateBuilding({
                    ...buildingItem,
                    meterId: data.meterId,
                });
            }
            
            setWipMeter(updatedWipMeter);
            setCurrentStep(3);
        }
    }

    const handleStep3Finish = () => {
        if(wipMeter) {
            updateMeter({
                ...wipMeter,
                status: 'En service',
                lastUpdate: new Date().toISOString().split('T')[0],
            }, wipMeter.id);
            router.push('/dashboard/buildings');
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
                    <CardTitle>Nouveau Compteur pour le Bâtiment: <span className="font-mono text-primary">{buildingItem.name}</span></CardTitle>
                    <CardDescription>Suivez les étapes pour demander et installer un nouveau compteur pour ce bâtiment.</CardDescription>
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
                           <span className={cn(currentStep >= 2 && "font-semibold")}>2. Installation</span>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Étape 1: Demande de Compteur</CardTitle>
                        <CardDescription>Informations pour la demande initiale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeterRequestForm 
                            building={buildingItem} 
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
                        <CardDescription>Finaliser la mise en service du compteur.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">Cliquez sur le bouton pour marquer le compteur comme "En service".</p>
                            <Button 
                                onClick={handleStep3Finish}
                                disabled={currentStep !== 3}
                            >
                                <Save className="mr-2 h-4 w-4" /> Mettre en Service
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
