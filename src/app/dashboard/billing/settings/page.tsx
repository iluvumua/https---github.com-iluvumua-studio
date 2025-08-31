
"use client";

import { useState } from "react";
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
import { useBillingSettingsStore, Settings } from "@/hooks/use-billing-settings-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function BillingSettingsPage() {
  const { settings, setSettings: setStoreSettings } = useBillingSettingsStore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const isFinancier = user.role === 'Financier';
  const isDisabled = !isFinancier;

  const handleInputChange = <K extends keyof Settings, SK extends keyof Settings[K]>(
    key: K,
    subKey: SK,
    value: string
  ) => {
    setLocalSettings(prev => ({
        ...prev,
        [key]: {
            ...prev[key],
            [subKey]: parseFloat(value) || 0
        }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setStoreSettings(localSettings);
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: "Paramètres Enregistrés",
            description: "Vos modifications ont été sauvegardées.",
        })
    }, 500);
  }

  const btFormula = "Montant Total = (Consommation kWh * Prix Unitaire) + TVA + Contribution ERTT";
  const mthFormula = "Montant Total = (Σ (Conso Tranche * Coeff * PU)) + Redevances + Taxes";
  const mtfFormula = "Montant Total = ((Énergie Enregistrée + Pertes) * PU) + Prime Puissance + Taxes - Bonification +/- Avance";


  return (
    <div className="space-y-6">
    <Tabs defaultValue="tarifs" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="tarifs">Tarifs Basse Tension</TabsTrigger>
        <TabsTrigger value="moyen-tension-horaire">
          Tarifs MT Tranche Horaire
        </TabsTrigger>
        <TabsTrigger value="moyen-tension-forfait">Tarifs MT Forfait</TabsTrigger>
        <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
      </TabsList>
      <TabsContent value="tarifs">
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
                    <Input id="bt_prix_unitaire" type="number" value={localSettings.basseTension.prix_unitaire_bt} onChange={(e) => handleInputChange('basseTension', 'prix_unitaire_bt', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_tva">TVA</Label>
                    <Input id="bt_tva" type="number" value={localSettings.basseTension.tva_bt} onChange={(e) => handleInputChange('basseTension', 'tva_bt', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_ertt">Contribution ERTT</Label>
                    <Input id="bt_ertt" type="number" value={localSettings.basseTension.ertt_bt} onChange={(e) => handleInputChange('basseTension', 'ertt_bt', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
             <Separator />
            <div>
                <Label>Formule de Calcul</Label>
                <Textarea readOnly value={btFormula} className="mt-2 font-mono text-sm bg-muted" />
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
                    <Input id="mth_pu_jour" type="number" value={localSettings.moyenTensionHoraire.prix_unitaire_jour} onChange={(e) => handleInputChange('moyenTensionHoraire', 'prix_unitaire_jour', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_pointe" className="text-xs">Pointe</Label>
                    <Input id="mth_pu_pointe" type="number" value={localSettings.moyenTensionHoraire.prix_unitaire_pointe} onChange={(e) => handleInputChange('moyenTensionHoraire', 'prix_unitaire_pointe', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_soir" className="text-xs">Soir</Label>
                    <Input id="mth_pu_soir" type="number" value={localSettings.moyenTensionHoraire.prix_unitaire_soir} onChange={(e) => handleInputChange('moyenTensionHoraire', 'prix_unitaire_soir', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_pu_nuit" className="text-xs">Nuit</Label>
                    <Input id="mth_pu_nuit" type="number" value={localSettings.moyenTensionHoraire.prix_unitaire_nuit} onChange={(e) => handleInputChange('moyenTensionHoraire', 'prix_unitaire_nuit', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
            <Separator />
            <Label>Coefficients Multiplicateurs</Label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="mth_coef_jour" className="text-xs">Jour</Label>
                    <Input id="mth_coef_jour" type="number" value={localSettings.moyenTensionHoraire.coefficient_jour} onChange={(e) => handleInputChange('moyenTensionHoraire', 'coefficient_jour', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_pointe" className="text-xs">Pointe</Label>
                    <Input id="mth_coef_pointe" type="number" value={localSettings.moyenTensionHoraire.coefficient_pointe} onChange={(e) => handleInputChange('moyenTensionHoraire', 'coefficient_pointe', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_soir" className="text-xs">Soir</Label>
                    <Input id="mth_coef_soir" type="number" value={localSettings.moyenTensionHoraire.coefficient_soir} onChange={(e) => handleInputChange('moyenTensionHoraire', 'coefficient_soir', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mth_coef_nuit" className="text-xs">Nuit</Label>
                    <Input id="mth_coef_nuit" type="number" value={localSettings.moyenTensionHoraire.coefficient_nuit} onChange={(e) => handleInputChange('moyenTensionHoraire', 'coefficient_nuit', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
            <Separator />
             <div>
                <Label>Formule de Calcul</Label>
                <Textarea readOnly value={mthFormula} className="mt-2 font-mono text-sm bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Note: Les redevances et taxes (Groupe 1 & 2) sont saisies directement sur la facture.</p>
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
                    <Input id="mtf_pu" type="number" value={localSettings.moyenTensionForfait.pu_consommation} onChange={(e) => handleInputChange('moyenTensionForfait', 'pu_consommation', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mtf_tva_conso">TVA Consommation (%)</Label>
                    <Input id="mtf_tva_conso" type="number" value={localSettings.moyenTensionForfait.tva_consommation_percent} onChange={(e) => handleInputChange('moyenTensionForfait', 'tva_consommation_percent', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="mtf_tva_redevance">TVA Redevance (%)</Label>
                    <Input id="mtf_tva_redevance" type="number" value={localSettings.moyenTensionForfait.tva_redevance_percent} onChange={(e) => handleInputChange('moyenTensionForfait', 'tva_redevance_percent', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
            <Separator />
             <div>
                <Label>Formule de Calcul</Label>
                <Textarea readOnly value={mtfFormula} className="mt-2 font-mono text-sm bg-muted" />
                 <p className="text-xs text-muted-foreground mt-1">Note: Les autres frais (pertes, prime, taxes, etc.) sont saisis directement sur la facture.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="anomalies">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres des Anomalies</CardTitle>
            <CardDescription>
              Configurez les seuils de détection des anomalies de facturation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="anomaly_cost">Seuil d'anomalie de coût (%)</Label>
                    <Input id="anomaly_cost" type="number" value={localSettings.anomalies.costThresholdPercent} onChange={(e) => handleInputChange('anomalies', 'costThresholdPercent', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="anomaly_consumption">Seuil d'anomalie de consommation (%)</Label>
                    <Input id="anomaly_consumption" type="number" value={localSettings.anomalies.consumptionThresholdPercent} onChange={(e) => handleInputChange('anomalies', 'consumptionThresholdPercent', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Une anomalie est déclenchée si le coût ou la consommation par mois d'une nouvelle facture dépasse celui de la facture précédente du même pourcentage que le seuil.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isDisabled || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer les modifications
        </Button>
    </div>
    </div>
  );
}
