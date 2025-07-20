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
    .number({ invalid_type_error: "Must be a number" })
    .positive({ message: "Must be a positive number" }),
  averageLastThreeMonths: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive({ message: "Must be a positive number" }),
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
        title: "Error",
        description: "Failed to run anomaly detection. Please try again.",
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
              <Bot /> AI Anomaly Detection
            </CardTitle>
            <CardDescription>
              Enter consumption data to detect anomalies using AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="currentConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Consumption (kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 6500" {...field} />
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
                    <FormLabel>3-Month Avg. (kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5400" {...field} />
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
                <AlertTitle>{result.isAnomaly ? "Anomaly Detected!" : "Normal Consumption"}</AlertTitle>
                <AlertDescription>{result.diagnosis}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Cpu className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Detect Anomaly
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
