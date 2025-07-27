
import { create } from 'zustand';
import { billingData } from '@/lib/data';
import type { Bill } from '@/lib/types';

interface BillingState {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (updatedBill: Bill) => void;
  deleteBill: (billId: string) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  bills: billingData,
  addBill: (newBill) =>
    set((state) => ({
      bills: [newBill, ...state.bills],
    })),
  updateBill: (updatedBill) =>
    set((state) => ({
        bills: state.bills.map((item) =>
            item.id === updatedBill.id ? updatedBill : item
        ),
    })),
    deleteBill: (billId) =>
    set((state) => ({
        bills: state.bills.filter((bill) => bill.id !== billId),
    })),
}));
