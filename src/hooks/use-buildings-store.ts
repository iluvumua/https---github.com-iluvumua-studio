
import { create } from 'zustand';
import { buildingData } from '@/lib/data';
import type { Building } from '@/lib/types';

interface BuildingState {
  buildings: Building[];
  addBuilding: (building: Building) => void;
  updateBuilding: (updatedBuilding: Building) => void;
  deleteBuilding: (buildingId: string) => void;
}

export const useBuildingsStore = create<BuildingState>((set) => ({
  buildings: buildingData,
  addBuilding: (newBuilding) =>
    set((state) => ({
      buildings: [newBuilding, ...state.buildings],
    })),
  updateBuilding: (updatedBuilding) =>
    set((state) => ({
        buildings: state.buildings.map((item) =>
            item.id === updatedBuilding.id ? updatedBuilding : item
        ),
    })),
    deleteBuilding: (buildingId) =>
    set((state) => ({
        buildings: state.buildings.filter((building) => building.id !== buildingId),
    })),
}));
