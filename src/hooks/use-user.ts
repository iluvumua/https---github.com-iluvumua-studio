
import { create } from 'zustand';

export type UserRole = "Financier" | "Moyen Bâtiment" | "Etude et Planification" | "Responsable Énergie et Environnement" | "Déploiement";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface UserState {
  user: User;
  availableRoles: UserRole[];
  setUser: (user: User) => void;
}

// This is a mock user store. In a real application, this would be populated
// from an authentication provider.
export const useUser = create<UserState>((set) => ({
  user: {
    name: 'Admin',
    email: 'admin@ener-track.com',
    role: 'Financier',
  },
  availableRoles: ["Financier", "Moyen Bâtiment", "Etude et Planification", "Responsable Énergie et Environnement", "Déploiement"],
  setUser: (user) => set({ user }),
}));
