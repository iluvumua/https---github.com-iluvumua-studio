
"use client";

import { EquipmentForm } from "@/components/equipment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function NewEquipment() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Ajouter un nouvel équipement</CardTitle>
                <CardDescription>
                    Remplissez les détails de l'équipement. Le nom sera généré automatiquement.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EquipmentForm />
            </CardContent>
        </Card>
    )
}


export default function NewEquipmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewEquipment />
        </Suspense>
    );
}
