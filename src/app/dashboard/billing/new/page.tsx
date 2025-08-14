
"use client";

import { BillForm } from "@/components/bill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBillPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajouter une nouvelle facture</CardTitle>
                <CardDescription>
                    Remplissez les détails de la facture ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm />
            </CardContent>
        </Card>
    );
}
