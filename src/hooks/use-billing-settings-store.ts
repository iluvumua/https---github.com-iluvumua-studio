
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
  puissance: {
    horaire: {
      "537400": { pph: 55, ppe: 55, pj: 55, ps: 55, pi: 160 },
      "542300": { pph: 45, ppe: 45, pj: 45, ps: 45, pi: 160 },
      "542440": { pph: 25, ppe: 25, pj: 25, ps: 25, pi: 125 },
      "545040": { pph: 270, ppe: 270, pj: 270, ps: 270, pi: 630 },
      "552200": { pph: 80, ppe: 80, pj: 80, ps: 80, pi: 400 },
      "554760": { pph: 60, ppe: 60, pj: 60, ps: 60, pi: 315 },
      "558090": { pph: 60, ppe: 60, pj: 60, ps: 60, pi: 80 },
      "570280": { pph: 20, ppe: 20, pj: 20, ps: 20, pi: 100 },
      "574520": { pph: 45, ppe: 45, pj: 45, ps: 45, pi: 100 },
    },
    forfait: {
      "548710": { pj: 15, pi: 63 },
      "552500": { pj: 90, pi: 160 },
      "556730": { pj: 50, pi: 80 },
    },
    prixUnitairePrimeTrancheHoraire: 11,
    prixUnitairePrimeRegimeForfaitaire: 5,
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
  updatePuissanceSetting: (type: 'horaire' | 'forfait', meterId: string, field: string, value: number) => void;
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
      updatePuissanceSetting: (type, meterId, field, value) =>
        set((state) => {
            const puissance = state.settings.puissance;
            const updatedPuissance = {
                ...puissance,
                [type]: {
                    ...puissance[type],
                    [meterId]: {
                        ...(puissance[type] as any)[meterId],
                        [field]: value
                    }
                }
            };
            return {
                settings: {
                    ...state.settings,
                    puissance: updatedPuissance
                }
            }
        }),
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
