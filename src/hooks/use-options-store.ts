
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToast } from './use-toast';

// Initial data from existing static lists
const initialFournisseurs = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "NSN" },
  { value: "Adtran", label: "Adtran", abbreviation: "NSN" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NSN" },
  { value: "ERI", label: "ERI", abbreviation: "ERI" },
];

const initialChassisTypes = [
    "7330", "7302", "7353", "FTTB-ST", "7363", "5818", "T300", "T100", 
    "T500", "HABD", "UA5000", "MA5818", "HABD/HABF", "MABB", "hix5635", 
    "hix5630-G600", "hix5630", "5635", "5625-G400"
].map(chassis => ({ value: chassis, label: chassis, abbreviation: chassis }));


export interface Option {
    value: string;
    label: string;
    [key: string]: any;
}

interface OptionsState {
  fournisseurs: Option[];
  chassisTypes: Option[];
  addOption: (listName: 'fournisseurs' | 'chassisTypes', newOption: Option) => void;
  removeOption: (listName: 'fournisseurs' | 'chassisTypes', optionValue: string) => void;
  updateOption: (listName: 'fournisseurs' | 'chassisTypes', optionValue: string, updatedOption: Option) => void;
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set, get) => ({
      fournisseurs: initialFournisseurs,
      chassisTypes: initialChassisTypes,
      addOption: (listName, newOption) =>
        set((state) => {
          const currentList = state[listName];
          if (currentList.some(o => o.value.toLowerCase() === newOption.value.toLowerCase())) {
            // In a real component, you'd get this from useToast, but we can't use hooks here.
            // This is a limitation of this pattern. For the demo, we'll just log it.
            console.warn("Option already exists!");
            return state; 
          }
          return { [listName]: [...currentList, newOption] };
        }),
      removeOption: (listName, optionValue) =>
        set((state) => ({
            [listName]: state[listName].filter(o => o.value !== optionValue)
        })),
      updateOption: (listName, optionValue, updatedOption) =>
        set((state) => ({
            [listName]: state[listName].map(o => o.value === optionValue ? updatedOption : o)
        })),
    }),
    {
      name: 'dynamic-options-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
