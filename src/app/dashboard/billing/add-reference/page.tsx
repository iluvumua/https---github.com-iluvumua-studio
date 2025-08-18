
"use client";

import { ReferenceFacteurForm } from "@/components/reference-facteur-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function NewReferencePage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter/Modifier une référence de facturation</CardTitle>
                <CardDescription>
                    Sélectionnez un compteur et saisissez sa référence de facteur.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReferenceFacteurForm onFinished={() => router.push('/dashboard/billing')} />
            </CardContent>
        </Card>
    );
}
