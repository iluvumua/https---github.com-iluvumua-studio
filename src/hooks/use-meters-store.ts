
import { create } from 'zustand';
import { metersData } from '@/lib/data';
import type { Meter } from '@/lib/types';

interface MeterState {
  meters: Meter[];
  addMeter: (meter: Meter) => void;
  updateMeter: (updatedMeter: Meter) => void;
}

export const useMetersStore = create<MeterState>((set) => ({
  meters: metersData,
  addMeter: (newMeter) =>
    set((state) => ({
      meters: [newMeter, ...state.meters],
    })),
  updateMeter: (updatedMeter) =>
    set((state) => ({
        meters: state.meters.map((item) =>
            item.id === updatedMeter.id ? updatedMeter : item
        ),
    })),
}));
