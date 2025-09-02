
"use client";

import { ReferenceFacteurForm } from "@/components/reference-facteur-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function NewReferencePage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter/Modifier un numéro de facture</CardTitle>
                <CardDescription>
                    Recherchez un compteur, saisissez son numéro de facture et son adresse de facturation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReferenceFacteurForm onFinished={() => router.push('/dashboard/billing')} />
            </CardContent>
        </Card>
    );
}

    