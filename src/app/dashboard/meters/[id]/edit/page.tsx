
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useMetersStore } from '@/hooks/use-meters-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EditMeterForm } from '@/components/edit-meter-form';

export default function EditMeterPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { meters } = useMetersStore();

    const meterToEdit = Array.isArray(id) ? undefined : meters.find(e => e.id === id);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modifier le compteur</CardTitle>
                <CardDescription>
                    Mettez à jour les détails du compteur ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {meterToEdit ? (
                    <EditMeterForm 
                        meter={meterToEdit} 
                        onFinished={() => router.push('/dashboard/meters')}
                    />
                ) : (
                    <div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
