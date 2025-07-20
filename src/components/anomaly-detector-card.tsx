"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Bot, Cpu, Zap, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { checkForAnomaly } from "@/app/dashboard/actions";
import type { DetectEnergyAnomalyOutput } from "@/ai/flows/detect-energy-anomaly";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  currentConsumption: z.coerce
    .number({ invalid_type_error: "Doit être un nombre" })
    .positive({ message: "Doit être un nombre positif" }),
  averageLastThreeMonths: z.coerce
    .number({ invalid_type_error: "Doit être un nombre" })
    .positive({ message: "Doit être un nombre positif" }),
});

type FormValues = z.infer<typeof formSchema>;

export function AnomalyDetectorCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectEnergyAnomalyOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentConsumption: 0,
      averageLastThreeMonths: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await checkForAnomaly(values);
      setResult(response);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la détection d'anomalie. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> Détection d'Anomalie par IA
            </CardTitle>
            <CardDescription>
              Entrez les données de consommation pour détecter les anomalies à l'aide de l'IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="currentConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation Actuelle (kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 6500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="averageLastThreeMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moy. 3 mois (kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 5400" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {result && (
              <Alert variant={result.isAnomaly ? "destructive" : "default"} className={result.isAnomaly ? "bg-destructive/20" : "bg-primary/10"}>
                {result.isAnomaly ? (
                   <AlertTriangle className="h-4 w-4" />
                ) : (
                   <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertTitle>{result.isAnomaly ? "Anomalie Détectée!" : "Consommation Normale"}</AlertTitle>
                <AlertDescription>{result.diagnosis}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Cpu className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Détecter l'Anomalie
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
