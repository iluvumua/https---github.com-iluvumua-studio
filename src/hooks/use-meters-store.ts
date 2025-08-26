
import { create } from 'zustand';
import { metersData } from '@/lib/data';
import type { Meter } from '@/lib/types';

interface MeterState {
  meters: Meter[];
  addMeter: (meter: Meter) => void;
  updateMeter: (updatedMeter: Partial<Meter> & { id: string }, oldId?: string) => void;
}

export const useMetersStore = create<MeterState>((set) => ({
  meters: metersData,
  addMeter: (newMeter) =>
    set((state) => ({
      meters: [newMeter, ...state.meters],
    })),
  updateMeter: (updatedMeter, oldId) =>
    set((state) => ({
        meters: state.meters.map((item) =>
            item.id === (oldId || updatedMeter.id) ? { ...item, ...updatedMeter } : item
        ),
    })),
}));
