
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
import { useMetersStore } from "@/hooks/use-meters-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useBuildingsStore } from "@/hooks/use-buildings-store";

const PuissanceTable = ({ type, title }: { type: 'horaire' | 'forfait', title: string }) => {
    const { settings, updatePuissanceSetting } = useBillingSettingsStore();
    const { meters } = useMetersStore();
    const { equipment } = useEquipmentStore();
    const { buildings } = useBuildingsStore();
    const { user } = useUser();
    const isDisabled = user.role !== 'Financier' && user.role !== 'Admin';

    const relevantMeters = meters.filter(m => settings.puissance[type][m.id as keyof typeof settings.puissance[type]]);
    
    const getAssociationName = (meterId: string) => {
        const associatedEquipment = equipment.filter(e => e.compteurId === meterId);
        if (associatedEquipment.length > 0) {
            return associatedEquipment.map(e => e.name).join(', ');
        }
        
        const meter = meters.find(m => m.id === meterId);
        if(meter?.buildingId) {
            const associatedBuilding = buildings.find(b => b.id === meter.buildingId);
            return associatedBuilding?.name || 'Bâtiment Inconnu';
        }

        return 'N/A';
    }

    const calculatePr = (params: { pph: number, ppe: number, pj: number, ps: number }) => {
        return (0.4 * params.pph) + (0.3 * params.ppe) + (0.2 * params.pj) + (0.1 * params.ps);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Compteur</TableHead>
                            <TableHead>Associé à</TableHead>
                            {type === 'horaire' && <><TableHead>Pph</TableHead><TableHead>Ppe</TableHead></>}
                            <TableHead>Pj</TableHead>
                            {type === 'horaire' && <TableHead>Ps</TableHead>}
                            <TableHead>P. Installée</TableHead>
                            {type === 'horaire' && <TableHead>P. Réduite (Pr)</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {relevantMeters.map(meter => {
                            const params = (settings.puissance[type] as any)[meter.id];
                            if (!params) return null;
                            const pr = type === 'horaire' ? calculatePr(params) : null;
                            return (
                                <TableRow key={meter.id}>
                                    <TableCell className="font-mono">{meter.id}</TableCell>
                                    <TableCell className="text-xs max-w-[200px] truncate">{getAssociationName(meter.id)}</TableCell>
                                    {type === 'horaire' && <>
                                        <TableCell><Input type="number" value={params.pph} onChange={e => updatePuissanceSetting(type, meter.id, 'pph', parseFloat(e.target.value))} disabled={isDisabled} className="w-20" /></TableCell>
                                        <TableCell><Input type="number" value={params.ppe} onChange={e => updatePuissanceSetting(type, meter.id, 'ppe', parseFloat(e.target.value))} disabled={isDisabled} className="w-20" /></TableCell>
                                    </>}
                                    <TableCell><Input type="number" value={params.pj} onChange={e => updatePuissanceSetting(type, meter.id, 'pj', parseFloat(e.target.value))} disabled={isDisabled} className="w-20" /></TableCell>
                                    {type === 'horaire' && <TableCell><Input type="number" value={params.ps} onChange={e => updatePuissanceSetting(type, meter.id, 'ps', parseFloat(e.target.value))} disabled={isDisabled} className="w-20" /></TableCell>}
                                    <TableCell><Input type="number" value={params.pi} onChange={e => updatePuissanceSetting(type, meter.id, 'pi', parseFloat(e.target.value))} disabled={isDisabled} className="w-20" /></TableCell>
                                    {type === 'horaire' && <TableCell>{pr?.toFixed(2)}</TableCell>}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function BillingSettingsPage() {
  const { settings, setSettings: setStoreSettings } = useBillingSettingsStore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = user.role === 'Financier' || user.role === 'Admin';
  const isDisabled = !canEdit;

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
  
   const handleRootInputChange = (key: keyof Settings['puissance'], value: string) => {
    setLocalSettings(prev => ({
        ...prev,
        puissance: {
            ...prev.puissance,
            [key]: parseFloat(value) || 0,
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

  const btFormula = "Montant Total = (Σ (Conso Tranche * PU)) + Redevances + Surtaxe + Contr. ERTT + TVA";
  const mthFormula = "Montant Total = (Σ (Conso Tranche * Coeff * PU)) + Redevances + Taxes";
  const mtfFormula = "Montant Total = ((Énergie Enregistrée + Pertes) * PU) + Prime Puissance + Taxes - Bonification +/- Avance";


  return (
    <div className="space-y-6">
    <Tabs defaultValue="tarifs" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="tarifs">Tarifs Basse Tension</TabsTrigger>
        <TabsTrigger value="moyen-tension-horaire">
          Tarifs MT Tranche Horaire
        </TabsTrigger>
        <TabsTrigger value="moyen-tension-forfait">Tarifs MT Forfait</TabsTrigger>
        <TabsTrigger value="puissance">Puissance</TabsTrigger>
        <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
      </TabsList>
      <TabsContent value="tarifs">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Basse Tension</CardTitle>
            <CardDescription>
              Ajustez les tarifs par tranche, les redevances et les taxes pour les
              factures de basse tension non-résidentiel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Prix Unitaire par Tranche de Consommation Mensuelle (kWh)</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div>
                    <Label htmlFor="bt_tranche1" className="text-xs">Tranche 1 (1-200)</Label>
                    <Input id="bt_tranche1" type="number" step="0.001" value={localSettings.basseTension.tranche1} onChange={(e) => handleInputChange('basseTension', 'tranche1', e.target.value)} disabled={isDisabled} />
                </div>
                <div>
                    <Label htmlFor="bt_tranche2" className="text-xs">Tranche 2 (201-300)</Label>
                    <Input id="bt_tranche2" type="number" step="0.001" value={localSettings.basseTension.tranche2} onChange={(e) => handleInputChange('basseTension', 'tranche2', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_tranche3" className="text-xs">Tranche 3 (301-500)</Label>
                    <Input id="bt_tranche3" type="number" step="0.001" value={localSettings.basseTension.tranche3} onChange={(e) => handleInputChange('basseTension', 'tranche3', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_tranche4" className="text-xs">Tranche 4 (>500)</Label>
                    <Input id="bt_tranche4" type="number" step="0.001" value={localSettings.basseTension.tranche4} onChange={(e) => handleInputChange('basseTension', 'tranche4', e.target.value)} disabled={isDisabled} />
                </div>
            </div>
             <Separator />
             <Label>Redevances et Taxes</Label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="bt_redevances_fixes">Redevances Fixes</Label>
                    <Input id="bt_redevances_fixes" type="number" step="0.001" value={localSettings.basseTension.redevances_fixes} onChange={(e) => handleInputChange('basseTension', 'redevances_fixes', e.target.value)} disabled={isDisabled} />
                </div>
                <div>
                    <Label htmlFor="bt_tva">TVA (%)</Label>
                    <Input id="bt_tva" type="number" value={localSettings.basseTension.tva_bt_percent} onChange={(e) => handleInputChange('basseTension', 'tva_bt_percent', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_surtaxe">Surtaxe Municipale (P.U.)</Label>
                    <Input id="bt_surtaxe" type="number" step="0.001" value={localSettings.basseTension.surtaxe_municipale} onChange={(e) => handleInputChange('basseTension', 'surtaxe_municipale', e.target.value)} disabled={isDisabled} />
                </div>
                 <div>
                    <Label htmlFor="bt_ertt">Frais Transition Énergétique (P.U.)</Label>
                    <Input id="bt_ertt" type="number" step="0.001" value={localSettings.basseTension.frais_transition_energetique} onChange={(e) => handleInputChange('basseTension', 'frais_transition_energetique', e.target.value)} disabled={isDisabled} />
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
       <TabsContent value="puissance">
        <div className="space-y-6">
          <PuissanceTable type="horaire" title="Puissance Contractuelle - Tranche Horaire" />
          <PuissanceTable type="forfait" title="Puissance Contractuelle - Forfait" />
          <Card>
            <CardHeader>
                <CardTitle>Paramètres Prime Puissance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="prix_prime_horaire">Prix Unitaire Prime (Tranche Horaire)</Label>
                    <Input 
                        id="prix_prime_horaire" 
                        type="number" 
                        value={localSettings.puissance.prixUnitairePrimeTrancheHoraire} 
                        onChange={e => handleRootInputChange('prixUnitairePrimeTrancheHoraire', e.target.value)}
                        disabled={isDisabled} 
                    />
                </div>
                 <div>
                    <Label htmlFor="prix_prime_forfait">Prix Unitaire Prime (Régime Forfaitaire)</Label>
                    <Input 
                        id="prix_prime_forfait" 
                        type="number" 
                        value={localSettings.puissance.prixUnitairePrimeRegimeForfaitaire}
                         onChange={e => handleRootInputChange('prixUnitairePrimeRegimeForfaitaire', e.target.value)}
                        disabled={isDisabled}
                    />
                </div>
            </CardContent>
          </Card>
        </div>
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
