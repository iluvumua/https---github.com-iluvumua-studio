
import { create } from 'zustand';

export interface Anomaly {
    id: string;
    billId: string;
    meterId: string;
    message: string;
    date: string;
    isRead?: boolean;
}

interface AnomalyState {
  anomalies: Anomaly[];
  addAnomaly: (anomaly: Anomaly) => void;
  markAsRead: (anomalyId: string) => void;
}

export const useAnomaliesStore = create<AnomalyState>((set) => ({
  anomalies: [],
  addAnomaly: (newAnomaly) =>
    set((state) => ({
      anomalies: [newAnomaly, ...state.anomalies],
    })),
  markAsRead: (anomalyId: string) =>
    set((state) => ({
        anomalies: state.anomalies.map((item) =>
            item.id === anomalyId ? { ...item, isRead: true } : item
        ),
    })),
}));
