
import { create } from 'zustand';
import { billingData } from '@/lib/data';
import type { Bill } from '@/lib/types';

interface BillingState {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (updatedBill: Bill) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  bills: billingData.map(b => ({ ...b, convenableSTEG: true, nombreMois: 12 })), // Default existing to true and 12 months
  addBill: (newBill) =>
    set((state) => ({
      bills: [newBill, ...state.bills],
    })),
  updateBill: (updatedBill) =>
    set((state) => ({
        bills: state.bills.map((item) =>
            item.id === updatedBill.id ? { ...item, ...updatedBill } : item
        ),
    })),
}));
