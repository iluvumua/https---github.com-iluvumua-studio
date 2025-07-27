import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoyenTensionForm } from "@/components/moyen-tension-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CalculPage() {
  return (
    <Tabs defaultValue="moyen-tension">
      <div className="flex items-center">
         <TabsList>
            <TabsTrigger value="moyen-tension">Moyen Tension</TabsTrigger>
            <TabsTrigger value="basse-tension" disabled>Basse Tension</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="moyen-tension">
        <Card>
            <CardHeader>
                <CardTitle>Calcul Facture Moyen Tension</CardTitle>
                <CardDescription>
                Remplissez les informations du compteur pour calculer le montant de la facture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MoyenTensionForm />
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="basse-tension">
        {/* Future Basse Tension form will go here */}
      </TabsContent>
    </Tabs>
  );
}
