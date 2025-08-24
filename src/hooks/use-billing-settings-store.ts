
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

// Default values are extracted from the existing forms

const defaultSettings = {
  basseTension: {
    prix_unitaire_bt: 0.250,
    tva_bt: 5.320,
    ertt_bt: 0.000,
  },
  moyenTensionHoraire: {
    coefficient_jour: 1,
    coefficient_pointe: 1,
    coefficient_soir: 1,
    coefficient_nuit: 1,
    prix_unitaire_jour: 0.290,
    prix_unitaire_pointe: 0.417,
    prix_unitaire_soir: 0.290,
    prix_unitaire_nuit: 0.222,
  },
  moyenTensionForfait: {
    coefficient_multiplicateur: 1.0,
    pu_consommation: 0.291,
    tva_consommation_percent: 19,
    tva_redevance_percent: 19,
  }
};

type Settings = typeof defaultSettings;

interface BillingSettingsState {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useBillingSettingsStore = create<BillingSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'billing-settings-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
