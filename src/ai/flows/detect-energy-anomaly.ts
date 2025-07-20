'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting anomalies in energy consumption.
 *
 * - detectEnergyAnomaly - An async function that takes current energy consumption data and detects anomalies by comparing it to the average of the last three months.
 * - DetectEnergyAnomalyInput - The input type for the detectEnergyAnomaly function, including current consumption and historical data.
 * - DetectEnergyAnomalyOutput - The output type, indicating whether an anomaly was detected and providing a diagnosis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectEnergyAnomalyInputSchema = z.object({
  currentConsumption: z.number().describe('The current energy consumption value.'),
  averageLastThreeMonths: z
    .number()
    .describe('The average energy consumption over the last three months.'),
});
export type DetectEnergyAnomalyInput = z.infer<typeof DetectEnergyAnomalyInputSchema>;

const DetectEnergyAnomalyOutputSchema = z.object({
  isAnomaly: z.boolean().describe('Whether an anomaly in energy consumption is detected.'),
  diagnosis: z.string().describe('A diagnosis of the energy consumption anomaly, if any.'),
});
export type DetectEnergyAnomalyOutput = z.infer<typeof DetectEnergyAnomalyOutputSchema>;

export async function detectEnergyAnomaly(input: DetectEnergyAnomalyInput): Promise<DetectEnergyAnomalyOutput> {
  return detectEnergyAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectEnergyAnomalyPrompt',
  input: {schema: DetectEnergyAnomalyInputSchema},
  output: {schema: DetectEnergyAnomalyOutputSchema},
  prompt: `Vous êtes un expert analyste de la consommation d'énergie. Votre réponse doit être en français.

On vous fournit la consommation d'énergie actuelle et la consommation d'énergie moyenne des trois derniers mois.

Sur la base de ces données, déterminez s'il y a une anomalie dans la consommation d'énergie actuelle.
Une anomalie est définie comme un écart significatif (par exemple, plus de 15%) par rapport à la consommation moyenne.

Consommation Actuelle: {{{currentConsumption}}}
Consommation Moyenne (3 derniers mois): {{{averageLastThreeMonths}}}

Prenez en compte des facteurs comme les variations saisonnières, mais concentrez-vous sur l'identification de pics ou de baisses de consommation inhabituels.
Réglez le champ de sortie isAnomaly sur true si une anomalie est détectée ; sinon, réglez-le sur false.
Fournissez un bref diagnostic expliquant l'anomalie ou indiquant des schémas de consommation normaux.
`,
});

const detectEnergyAnomalyFlow = ai.defineFlow(
  {
    name: 'detectEnergyAnomalyFlow',
    inputSchema: DetectEnergyAnomalyInputSchema,
    outputSchema: DetectEnergyAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
