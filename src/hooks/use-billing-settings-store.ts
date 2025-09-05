
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const defaultSettings = {
  basseTension: {
    tranche1: 0.195,
    tranche2: 0.240,
    tranche3: 0.333,
    tranche4: 0.391,
    surtaxe_municipale: 0.005,
    frais_transition_energetique: 0.005,
    tva_bt_percent: 19,
    redevances_fixes: 2.800,
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
  },
  anomalies: {
    costThresholdPercent: 20,
    consumptionThresholdPercent: 30,
  }
};

export type Settings = typeof defaultSettings;

interface BillingSettingsState {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
  updateSetting: <K extends keyof Settings, SK extends keyof Settings[K]>(
    key: K,
    subKey: SK,
    value: Settings[K][SK]
  ) => void;
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
      updateSetting: (key, subKey, value) =>
        set((state) => ({
            settings: {
                ...state.settings,
                [key]: {
                    ...state.settings[key],
                    [subKey]: value,
                }
            }
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'billing-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
