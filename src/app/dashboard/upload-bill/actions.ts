"use server";

import {
  extractBillInfo,
  type ExtractBillInfoInput,
  type ExtractBillInfoOutput,
} from "@/ai/flows/extract-bill-info";
import { z } from "zod";

const UploadBillSchema = z.object({
  photoDataUri: z.string(),
});

export async function processBill(
  values: ExtractBillInfoInput
): Promise<ExtractBillInfoOutput> {
  const parsed = UploadBillSchema.safeParse(values);
  if (!parsed.success) {
    throw new Error("Invalid input.");
  }

  try {
    const result = await extractBillInfo(parsed.data);
    return result;
  } catch (error) {
    console.error("Error processing bill:", error);
    throw new Error("Failed to process bill extraction.");
  }
}
