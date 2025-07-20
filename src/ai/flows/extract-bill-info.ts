'use server';
/**
 * @fileOverview A Genkit flow to extract information from a STEG bill image.
 *
 * - extractBillInfo - A function that handles the bill extraction process.
 * - ExtractBillInfoInput - The input type for the extractBillInfo function.
 * - ExtractBillInfoOutput - The return type for the extractBillInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractBillInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a STEG bill, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractBillInfoInput = z.infer<typeof ExtractBillInfoInputSchema>;

const ExtractBillInfoOutputSchema = z.object({
  numeroFacture: z.string().describe('Le numéro de la facture.'),
  codePayeur: z.string().describe('Le code payeur.'),
  reference: z.string().describe('La référence de la facture.'),
  mois: z.string().describe('Le mois de la facture (ex: 05).'),
  annee: z.string().describe("L'année de la facture (ex: 2025)."),
  montantAPayer: z.number().describe('Le montant total à payer en dinars (Montant à Payer).'),
  totalConsommation: z.number().describe('Le total de la consommation en dinars (Total Consommation).'),
  totalTaxes: z.number().describe('Le total des taxes en dinars (Total Taxes).'),
  dateEcheance: z.string().describe("La date d'échéance pour le paiement au format AAAA-MM-JJ (Prière payer avant le)."),
  dateProchainReleve: z.string().describe("La date du prochain relevé d'index au format AAAA-MM-JJ."),
});
export type ExtractBillInfoOutput = z.infer<typeof ExtractBillInfoOutputSchema>;

export async function extractBillInfo(input: ExtractBillInfoInput): Promise<ExtractBillInfoOutput> {
  return extractBillInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractBillInfoPrompt',
  input: { schema: ExtractBillInfoInputSchema },
  output: { schema: ExtractBillInfoOutputSchema },
  prompt: `You are an expert at reading Tunisian utility bills (STEG Facture). Your response must be in French.

You will be given an image of a STEG electricity and gas bill. Your task is to extract the following information accurately from the bill image provided and return it as a structured JSON object.

- numeroFacture (N° Facture)
- codePayeur (Code Payeur)
- reference (Référence)
- mois (Mois)
- annee (Année, from the coupon section at the bottom)
- montantAPayer (Montant à Payer)
- totalConsommation (Total Consommation)
- totalTaxes (Total Taxes)
- dateEcheance (Prière payer avant le)
- dateProchainReleve (Date du prochain relevé d'index)

Pay close attention to the labels to find the correct values. The values can be in different places on the bill. For dates, return them in YYYY-MM-DD format. For numeric values, parse them as numbers, removing any currency symbols or commas.

Image of the bill: {{media url=photoDataUri}}`,
});


const extractBillInfoFlow = ai.defineFlow(
  {
    name: 'extractBillInfoFlow',
    inputSchema: ExtractBillInfoInputSchema,
    outputSchema: ExtractBillInfoOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
