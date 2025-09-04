
"use client";

import { ReferenceFacteurForm } from "@/components/reference-facteur-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { Suspense } from "react";

function AddReferencePageContent() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter/Modifier une Référence Facture</CardTitle>
                <CardDescription>
                    Recherchez un compteur, saisissez sa référence facture et son adresse de facturation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReferenceFacteurForm onFinished={() => router.push('/dashboard/billing')} />
            </CardContent>
        </Card>
    );
}


export default function NewReferencePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddReferencePageContent />
        </Suspense>
    )
}
