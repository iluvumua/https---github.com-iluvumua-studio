
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToast } from './use-toast';

// Initial data from existing static lists
const initialFournisseursGsm = [
  { value: "ERI", label: "ERI", abbreviation: "ERI" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
];

const initialFournisseursMsan = [
  { value: "Alcatel Lucent", label: "Alcatel Lucent", abbreviation: "ALU" },
  { value: "Siemens", label: "Siemens", abbreviation: "NSN" },
  { value: "Adtran", label: "Adtran", abbreviation: "NSN" },
  { value: "Huawei", label: "Huawei", abbreviation: "HUW" },
  { value: "Nokia Siemens", label: "Nokia Siemens", abbreviation: "NSN" },
];


const initialChassisTypes = [
    "7330", "7302", "7353", "FTTB-ST", "7363", "5818", "T300", "T100", 
    "T500", "HABD", "UA5000", "MA5818", "HABD/HABF", "MABB", "hix5635", 
    "hix5630-G600", "hix5630", "5635", "5625-G400"
].map(chassis => ({ value: chassis, label: chassis, abbreviation: chassis }));

const initialNatures = [
    { id: 'A', value: 'Administratif', label: 'Administratif', abbreviation: 'Adm' },
    { id: 'T', value: 'Technique', label: 'Technique', abbreviation: 'Tech' },
    { id: 'C', value: 'Commercial', label: 'Commercial', abbreviation: 'Comm' },
    { id: 'D', value: 'Dépôt', label: 'Dépôt', abbreviation: 'Dépôt' },
];

const initialProprietes = [
    { value: "Propriété TT", label: "Propriété TT", abbreviation: "PTT" },
    { value: "Location, ETT", label: "Location, ETT", abbreviation: "LETT" },
];

const initialDistricts = [
    { value: "SOUSSE NORD", label: "SOUSSE NORD", abbreviation: "SSN" },
    { value: "SOUSSE CENTRE", label: "SOUSSE CENTRE", abbreviation: "SSC" },
    { value: "ENFIDHA", label: "ENFIDHA", abbreviation: "ENF" },
    { value: "MSAKEN", label: "MSAKEN", abbreviation: "MSK" },
];

export interface Option {
    value: string;
    label: string;
    [key: string]: any;
}

type ListName = 'fournisseursGsm' | 'fournisseursMsan' | 'chassisTypes' | 'natures' | 'proprietes' | 'districts';

interface OptionsState {
  fournisseursGsm: Option[];
  fournisseursMsan: Option[];
  chassisTypes: Option[];
  natures: Option[];
  proprietes: Option[];
  districts: Option[];
  addOption: (listName: ListName, newOption: Option) => void;
  removeOption: (listName: ListName, optionValue: string) => void;
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set, get) => ({
      fournisseursGsm: initialFournisseursGsm,
      fournisseursMsan: initialFournisseursMsan,
      chassisTypes: initialChassisTypes,
      natures: initialNatures,
      proprietes: initialProprietes,
      districts: initialDistricts,
      addOption: (listName, newOption) =>
        set((state) => {
          const currentList = state[listName];
          if (currentList.some(o => o.value.toLowerCase() === newOption.value.toLowerCase())) {
            console.warn("Option already exists!");
            return state; 
          }
          return { [listName]: [...currentList, newOption] };
        }),
      removeOption: (listName, optionValue) =>
        set((state) => ({
            [listName]: state[listName].filter(o => o.value !== optionValue)
        })),
    }),
    {
      name: 'dynamic-options-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
