
"use client";

import { useSearchParams } from 'next/navigation';
import { BillForm } from "@/components/bill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';

function NewBill() {
    const searchParams = useSearchParams();
    const meterId = searchParams.get('meterId');
    const title = meterId ? "Ajouter une nouvelle facture" : "Ajouter une nouvelle référence";
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Remplissez les détails de la facture ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm meterId={meterId || undefined} />
            </CardContent>
        </Card>
    )
}


export default function NewBillPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewBill />
        </Suspense>
    );
}
