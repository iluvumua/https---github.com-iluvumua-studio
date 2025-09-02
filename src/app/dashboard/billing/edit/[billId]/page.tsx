
"use client";

import { useParams, useRouter } from 'next/navigation';
import { BillForm } from "@/components/bill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBillingStore } from '@/hooks/use-billing-store';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBillPage() {
    const params = useParams();
    const router = useRouter();
    const { billId } = params;
    const { bills } = useBillingStore();

    const billToEdit = Array.isArray(billId) ? undefined : bills.find(b => b.id === billId);

    if (!billToEdit) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Modifier une facture</CardTitle>
                    <CardDescription>Mettez à jour les informations de la facture.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                            <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modifier l'Id Facture <span className="font-mono text-sm text-primary">{billToEdit.reference}</span></CardTitle>
                <CardDescription>
                    Mettez à jour les détails de la facture ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm bill={billToEdit} />
            </CardContent>
        </Card>
    )
}

    