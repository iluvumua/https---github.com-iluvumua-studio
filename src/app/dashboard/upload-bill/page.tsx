"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Bot, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processBill } from "./actions";
import type { ExtractBillInfoOutput } from "@/ai/flows/extract-bill-info";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function UploadBillPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractBillInfoOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !previewUrl) {
      toast({
        variant: "destructive",
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier de facture à télécharger.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await processBill({ photoDataUri: previewUrl });
      setResult(response);
       toast({
        title: "Extraction Réussie",
        description: "Les informations de la facture ont été extraites.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'Extraction",
        description: "Impossible d'analyser la facture. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Télécharger une Facture
          </CardTitle>
          <CardDescription>
            Choisissez une image de votre facture STEG pour l'analyser avec l'IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Aperçu de la facture"
                  width={200}
                  height={250}
                  className="object-contain h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                </div>
              )}
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </label>
          </div>
          <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Cpu className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" /> Extraire les Informations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations Extraites</CardTitle>
          <CardDescription>
            Voici les données extraites de la facture par l'IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
               <Alert variant="default" className="bg-primary/10">
                 <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Extraction Réussie</AlertTitle>
                <AlertDescription>Vérifiez les informations ci-dessous.</AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">N° Facture</p>
                  <p className="font-medium">{result.numeroFacture}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Code Payeur</p>
                  <p className="font-medium">{result.codePayeur}</p>
                </div>
                 <div>
                  <p className="text-muted-foreground">Référence</p>
                  <p className="font-medium">{result.reference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mois/Année</p>
                  <p className="font-medium">{result.mois} / {result.annee}</p>
                </div>
                 <div>
                  <p className="text-muted-foreground">Total Consommation</p>
                  <p className="font-medium">{formatCurrency(result.totalConsommation)}</p>
                </div>
                 <div>
                  <p className="text-muted-foreground">Total Taxes</p>
                  <p className="font-medium">{formatCurrency(result.totalTaxes)}</p>
                </div>
                 <div className="col-span-2">
                    <p className="text-muted-foreground">Date d'Échéance</p>
                    <p className="font-medium">{new Date(result.dateEcheance).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</p>
                </div>
                 <div className="col-span-2">
                    <p className="text-muted-foreground">Date du Prochain Relevé</p>
                    <p className="font-medium">{new Date(result.dateProchainReleve).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</p>
                </div>
              </div>
               <div className="p-4 mt-4 text-lg font-bold text-center rounded-lg bg-secondary text-secondary-foreground">
                  <p className="text-sm font-normal text-muted-foreground">Montant à Payer</p>
                  {formatCurrency(result.montantAPayer)}
                </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>Les données de la facture apparaîtront ici après l'analyse.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
