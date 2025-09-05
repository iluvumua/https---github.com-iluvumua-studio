
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useMetersStore } from '@/hooks/use-meters-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EditMeterForm } from '@/components/edit-meter-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

export default function EditMeterPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { meters } = useMetersStore();
    const { user } = useUser();

    const meterToEdit = Array.isArray(id) ? undefined : meters.find(e => e.id === id);
    const canEdit = user.role === 'Déploiement' || user.role === 'Responsable Énergie et Environnement';


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Détails du compteur <span className="text-primary font-mono">{meterToEdit?.id}</span></CardTitle>
                        <CardDescription>
                           {canEdit ? "Modifiez" : "Consultez"} l'état et la description du compteur.
                        </CardDescription>
                    </div>
                     {!canEdit && (
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/meters">
                                <ArrowLeft className="mr-2" /> Retour
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {meterToEdit ? (
                    <EditMeterForm 
                        meter={meterToEdit} 
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
