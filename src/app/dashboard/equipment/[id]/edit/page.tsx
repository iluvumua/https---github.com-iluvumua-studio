
"use client";

import { useParams } from 'next/navigation';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { EquipmentForm } from "@/components/equipment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditEquipmentPage() {
    const params = useParams();
    const { id } = params;
    const { equipment } = useEquipmentStore();
    const { user } = useUser();

    const equipmentToEdit = Array.isArray(id) ? undefined : equipment.find(e => e.id === id);
    const canEdit = user.role === 'Responsable Énergie et Environnement' || user.role === 'Déploiement';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Modifier l'équipement</CardTitle>
                        <CardDescription>
                            {canEdit ? "Mettez à jour" : "Consultez"} les détails de l'équipement ci-dessous.
                        </CardDescription>
                    </div>
                     {!canEdit && (
                         <Button variant="outline" asChild>
                            <Link href="/dashboard/equipment">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {equipmentToEdit ? (
                    <EquipmentForm equipment={equipmentToEdit} />
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
