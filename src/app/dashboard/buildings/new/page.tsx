
"use client";

import { BuildingForm } from "@/components/building-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBuildingPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter un nouveau bâtiment</CardTitle>
                <CardDescription>
                    Remplissez les informations du bâtiment. Cliquez sur Enregistrer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BuildingForm />
            </CardContent>
        </Card>
    );
}
