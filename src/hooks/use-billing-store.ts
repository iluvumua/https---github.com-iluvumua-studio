
import { create } from 'zustand';
import { billingData } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { useAnomaliesStore } from './use-anomalies-store';

interface BillingState {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (updatedBill: Bill) => void;
}

const calculateOverallAverage = (bills: Bill[]): number | null => {
    const annualBills = bills
      .filter(b => b.nombreMois && b.nombreMois >= 12)
      .sort((a, b) => b.id.localeCompare(a.id));

    if (annualBills.length > 0) {
      const latestAnnualBill = annualBills[0];
      return latestAnnualBill.amount / latestAnnualBill.nombreMois;
    }
    return null;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: billingData,
  addBill: (newBill) => {
    const allBills = [newBill, ...get().bills];
    const overallAverage = calculateOverallAverage(allBills);
    
    // Check for anomaly only if the new bill has a duration and there's an overall average to compare to.
    if (newBill.nombreMois && newBill.nombreMois > 0 && overallAverage) {
        const newBillAverage = newBill.amount / newBill.nombreMois;
        // Check if new bill's average is 30% higher than the overall average.
        if (newBillAverage > (overallAverage * 1.30)) {
            const { addAnomaly } = useAnomaliesStore.getState();
            const anomalyMessage = `La facture ${newBill.reference} (${(newBillAverage).toFixed(3)} TND/mois) dépasse la moyenne de 30% (${(overallAverage).toFixed(3)} TND/mois).`;
            addAnomaly({
                id: `ANOM-${Date.now()}`,
                billId: newBill.id,
                meterId: newBill.meterId,
                message: anomalyMessage,
                date: new Date().toISOString().split('T')[0],
            });
        }
    }

    set({ bills: allBills });
  },
  updateBill: (updatedBill) =>
    set((state) => ({
        bills: state.bills.map((item) =>
            item.id === updatedBill.id ? { ...item, ...updatedBill } : item
        ),
    })),
}));
