
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useBillingSettingsStore } from "@/hooks/use-billing-settings-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";

export default function BillingSettingsPage() {
  const { settings, setSettings } = useBillingSettingsStore();
  const { user } = useUser();

  const isFinancier = user.role === 'Financier';
  const isDisabled = !isFinancier;

  // A real implementation would use a form library like react-hook-form
  // For this step, we'll just enable the fields and the save button for the financier.
  // The actual saving logic can be added in a future step.

  return (
    <Tabs defaultValue="basse-tension" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basse-tension">Basse Tension</TabsTrigger>
        <TabsTrigger value="moyen-tension-horaire">
          MT Tranche Horaire
        </TabsTrigger>
        <TabsTrigger value="moyen-tension-forfait">MT Forfait</TabsTrigger>
      </TabsList>
      <TabsContent value="basse-tension">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Basse Tension</CardTitle>
            <CardDescription>
              Ajustez les coefficients et les valeurs par défaut pour les
              factures de basse tension.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="bt_prix_unitaire">Prix Unitaire (kWh)</Label>
                    <Input id="bt_prix_unitaire" type="number" defaultValue={settings.basseTension.prix_unitaire_bt} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_tva">TVA</Label>
                    <Input id="bt_tva" type="number" defaultValue={settings.basseTension.tva_bt} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_ertt">Contribution ERTT</Label>
                    <Input id="bt_ertt" type="number" defaultValue={settings.basseTension.ertt_bt} disabled={isDisabled} />
                </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="moyen-tension-horaire">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres MT - Tranche Horaire</CardTitle>
            <CardDescription>
              Ajustez les valeurs par défaut pour les factures de moyenne
              tension à tranche horaire.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Prix Unitaire par Tranche (kWh)</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="mth_pu_jour" className="text-xs">Jour</Label>
                    <Input id="mth_pu_jour" type="number" defaultValue={settings.moyenTensionHoraire.prix_unitaire_jour} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_pointe" className="text-xs">Pointe</Label>
                    <Input id="mth_pu_pointe" type="number" defaultValue={settings.moyenTensionHoraire.prix_unitaire_pointe} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_soir" className="text-xs">Soir</Label>
                    <Input id="mth_pu_soir" type="number" defaultValue={settings.moyenTensionHoraire.prix_unitaire_soir} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_nuit" className="text-xs">Nuit</Label>
                    <Input id="mth_pu_nuit" type="number" defaultValue={settings.moyenTensionHoraire.prix_unitaire_nuit} disabled={isDisabled} />
                </div>
            </div>
            <Separator />
            <Label>Coefficients Multiplicateurs</Label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="mth_coef_jour" className="text-xs">Jour</Label>
                    <Input id="mth_coef_jour" type="number" defaultValue={settings.moyenTensionHoraire.coefficient_jour} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_pointe" className="text-xs">Pointe</Label>
                    <Input id="mth_coef_pointe" type="number" defaultValue={settings.moyenTensionHoraire.coefficient_pointe} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_soir" className="text-xs">Soir</Label>
                    <Input id="mth_coef_soir" type="number" defaultValue={settings.moyenTensionHoraire.coefficient_soir} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_nuit" className="text-xs">Nuit</Label>
                    <Input id="mth_coef_nuit" type="number" defaultValue={settings.moyenTensionHoraire.coefficient_nuit} disabled={isDisabled} />
                </div>
            </div>

          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="moyen-tension-forfait">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres MT - Forfait</CardTitle>
            <CardDescription>
              Ajustez les valeurs par défaut pour les factures de moyenne
              tension au forfait.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="mtf_pu">P.U. Consommation</Label>
                    <Input id="mtf_pu" type="number" defaultValue={settings.moyenTensionForfait.pu_consommation} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mtf_tva_conso">TVA Consommation (%)</Label>
                    <Input id="mtf_tva_conso" type="number" defaultValue={settings.moyenTensionForfait.tva_consommation_percent} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mtf_tva_redevance">TVA Redevance (%)</Label>
                    <Input id="mtf_tva_redevance" type="number" defaultValue={settings.moyenTensionForfait.tva_redevance_percent} disabled={isDisabled} />
                </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-6 flex justify-end">
        <Button disabled={isDisabled}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </Tabs>
  );
}
