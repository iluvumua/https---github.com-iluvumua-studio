
"use client";

import { useParams } from 'next/navigation';
import { useEquipmentStore } from '@/hooks/use-equipment-store';
import { EquipmentForm } from "@/components/equipment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/hooks/use-user';

export default function EditEquipmentPage() {
    const params = useParams();
    const { id } = params;
    const { equipment } = useEquipmentStore();
    const { user } = useUser();

    const equipmentToEdit = Array.isArray(id) ? undefined : equipment.find(e => e.id === id);
    const canEdit = user.role === 'Responsable Énergie et Environnement';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modifier l'équipement</CardTitle>
                <CardDescription>
                    {canEdit ? "Mettez à jour" : "Consultez"} les détails de l'équipement ci-dessous.
                </CardDescription>
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
