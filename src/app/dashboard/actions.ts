"use server";

import {
  detectEnergyAnomaly,
  type DetectEnergyAnomalyInput,
  type DetectEnergyAnomalyOutput,
} from "@/ai/flows/detect-energy-anomaly";
import { z } from "zod";

const AnomalySchema = z.object({
  currentConsumption: z.number(),
  averageLastThreeMonths: z.number(),
});

export async function checkForAnomaly(
  values: DetectEnergyAnomalyInput
): Promise<DetectEnergyAnomalyOutput> {
  const parsed = AnomalySchema.safeParse(values);
  if (!parsed.success) {
    throw new Error("Invalid input.");
  }

  try {
    const result = await detectEnergyAnomaly(parsed.data);
    return result;
  } catch (error) {
    console.error("Error detecting anomaly:", error);
    throw new Error("Failed to process anomaly detection.");
  }
}
