
import { create } from 'zustand';
import { equipmentData } from '@/lib/data';
import type { Equipment } from '@/lib/types';

interface EquipmentState {
  equipment: Equipment[];
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (updatedEquipment: Equipment) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: equipmentData,
  addEquipment: (newEquipment) =>
    set((state) => ({
      equipment: [newEquipment, ...state.equipment],
    })),
  updateEquipment: (updatedEquipment) =>
    set((state) => ({
        equipment: state.equipment.map((item) =>
            item.id === updatedEquipment.id ? updatedEquipment : item
        ),
    })),
}));
