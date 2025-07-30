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

export default function CalculPage() {
  return (
    <Tabs defaultValue="basse-tension">
      <div className="flex items-center">
         <TabsList>
            <TabsTrigger value="basse-tension">Basse Tension</TabsTrigger>
            <TabsTrigger value="moyen-tension-horaire">Moyen Tension - Tranche Horaire</TabsTrigger>
            <TabsTrigger value="moyen-tension-forfait" disabled>Moyen Tension - Forfait</TabsTrigger>
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
        {/* Future Basse Tension form will go here */}
      </TabsContent>
    </Tabs>
  );
}
