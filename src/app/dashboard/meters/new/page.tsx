
"use client";

import { MeterForm } from "@/components/meter-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewMeterPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter un nouveau compteur</CardTitle>
                <CardDescription>
                    Remplissez les détails du compteur.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MeterForm />
            </CardContent>
        </Card>
    );
}
