
"use client";

import { useSearchParams } from 'next/navigation';
import { MeterForm } from "@/components/meter-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';

function NewMeter() {
    const searchParams = useSearchParams();
    const equipmentId = searchParams.get('equipmentId');

    const title = equipmentId ? "Associer un nouveau compteur" : "Ajouter un nouveau compteur";
    const description = equipmentId 
        ? "Remplissez les détails du compteur pour l'associer à l'équipement."
        : "Remplissez les détails du compteur.";
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <MeterForm equipmentId={equipmentId || undefined} />
            </CardContent>
        </Card>
    );
}

export default function NewMeterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewMeter />
        </Suspense>
    );
}
