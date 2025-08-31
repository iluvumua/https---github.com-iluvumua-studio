
import { create } from 'zustand';
import { billingData } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { useAnomaliesStore } from './use-anomalies-store';
import { useBillingSettingsStore } from './use-billing-settings-store';
import { parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BillingState {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (updatedBill: Bill) => void;
}

const getMonthNumber = (monthName: string) => {
    try {
        const date = parse(monthName, "LLLL yyyy", new Date(), { locale: fr });
        if (!isNaN(date.getTime())) {
            return date.getFullYear() * 100 + date.getMonth();
        }
    } catch(e) {}
    return 0;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: billingData,
  addBill: (newBill) => {
    const allBills = get().bills;
    const { settings } = useBillingSettingsStore.getState();
    const { costThresholdPercent, consumptionThresholdPercent } = settings.anomalies;
    
    // Find the previous bill for the same meter
    const meterBills = allBills
        .filter(b => b.meterId === newBill.meterId)
        .sort((a, b) => getMonthNumber(b.month) - getMonthNumber(a.month));
        
    const previousBill = meterBills[0];
    
    if (previousBill && previousBill.nombreMois && newBill.nombreMois) {
      const prevCostPerMonth = previousBill.amount / previousBill.nombreMois;
      const newCostPerMonth = newBill.amount / newBill.nombreMois;
      const prevConsumptionPerMonth = previousBill.consumptionKWh / previousBill.nombreMois;
      const newConsumptionPerMonth = newBill.consumptionKWh / newBill.nombreMois;

      const costExceeded = newCostPerMonth > prevCostPerMonth * (1 + costThresholdPercent / 100);
      const consumptionExceeded = newConsumptionPerMonth > prevConsumptionPerMonth * (1 + consumptionThresholdPercent / 100);

      let anomalyMessages: string[] = [];

      if (costExceeded) {
          anomalyMessages.push(`Le coût a augmenté de plus de ${costThresholdPercent}%.`);
      }
      if (consumptionExceeded) {
          anomalyMessages.push(`La consommation a augmenté de plus de ${consumptionThresholdPercent}%.`);
      }

      if (anomalyMessages.length > 0) {
        const { addAnomaly } = useAnomaliesStore.getState();
        addAnomaly({
            id: `ANOM-${Date.now()}`,
            billId: newBill.id,
            meterId: newBill.meterId,
            message: `Facture ${newBill.reference}: ${anomalyMessages.join(' ')}`,
            date: new Date().toISOString().split('T')[0],
        });
      }
    }

    set({ bills: [newBill, ...allBills] });
  },
  updateBill: (updatedBill) =>
    set((state) => ({
        bills: state.bills.map((item) =>
            item.id === updatedBill.id ? { ...item, ...updatedBill } : item
        ),
    })),
}));
