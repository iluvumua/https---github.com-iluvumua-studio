
"use client";

import { MeterForm } from "@/components/meter-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function NewReferencePage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter une nouvelle référence de facturation</CardTitle>
                <CardDescription>
                    Remplissez les détails ci-dessous pour créer une nouvelle référence.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MeterForm onFinished={() => router.push('/dashboard/billing')} />
            </CardContent>
        </Card>
    );
}
