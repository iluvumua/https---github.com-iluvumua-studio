
"use client";

import { useSearchParams } from 'next/navigation';
import { BillForm } from "@/components/bill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';

function NewBill() {
    const searchParams = useSearchParams();
    const meterId = searchParams.get('meterId');
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter une nouvelle facture</CardTitle>
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
