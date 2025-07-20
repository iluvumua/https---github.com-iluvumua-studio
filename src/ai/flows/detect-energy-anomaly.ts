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
  prompt: `You are an expert energy consumption analyst.

You are provided with the current energy consumption and the average energy consumption over the last three months.

Based on this data, determine if there is an anomaly in the current energy consumption.
An anomaly is defined as a significant deviation (e.g., more than 15%) from the average consumption.

Current Consumption: {{{currentConsumption}}}
Average Consumption (Last 3 Months): {{{averageLastThreeMonths}}}

Consider factors like seasonal variations, but focus on identifying unusual spikes or drops in consumption.
Set the isAnomaly output field to true if an anomaly is detected; otherwise, set it to false.
Provide a brief diagnosis explaining the anomaly or indicating normal consumption patterns.
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
