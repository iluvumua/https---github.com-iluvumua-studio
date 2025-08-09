
"use client";

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoyenTensionForm } from "@/components/moyen-tension-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasseTensionForm } from "@/components/basse-tension-form";
import { Suspense } from 'react';
import { MoyenTensionForfaitForm } from '@/components/moyen-tension-forfait-form';

function Calcul() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'basse-tension';

  return (
    <Tabs defaultValue={type}>
      <div className="flex items-center">
         <TabsList>
            <TabsTrigger value="basse-tension">Basse Tension</TabsTrigger>
            <TabsTrigger value="moyen-tension-horaire">Moyen Tension - Tranche Horaire</TabsTrigger>
            <TabsTrigger value="moyen-tension-forfait">Moyen Tension - Forfait</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="basse-tension">
        <Card>
            <CardHeader>
                <CardTitle>Calcul Facture Basse Tension</CardTitle>
                <CardDescription>
                Remplissez les informations du compteur pour calculer le montant de la facture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BasseTensionForm />
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="moyen-tension-horaire">
        <Card>
            <CardHeader>
                <CardTitle>Calcul Facture Moyen Tension (Tranche Horaire)</CardTitle>
                <CardDescription>
                Remplissez les informations du compteur pour calculer le montant de la facture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MoyenTensionForm />
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="moyen-tension-forfait">
         <Card>
            <CardHeader>
                <CardTitle>Calcul Facture Moyen Tension (Forfait)</CardTitle>
                <CardDescription>
                Remplissez les informations du compteur pour calculer le montant de la facture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MoyenTensionForfaitForm />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function CalculPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Calcul />
        </Suspense>
    )
}
