
"use client";

import { EquipmentForm } from "@/components/equipment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEquipmentPage() {
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
    );
}
