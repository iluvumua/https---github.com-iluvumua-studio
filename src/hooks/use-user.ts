
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = "Admin" | "Financier" | "Moyen Bâtiment" | "Etude et Planification" | "Responsable Énergie et Environnement" | "Déploiement";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface UserState {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  updateUserRole: (userId: number, role: UserRole) => void;
  updateUserEmail: (userId: number, email: string) => void;
}

const initialUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@ener-track.com', role: 'Admin' },
    { id: 2, name: 'Finance User', email: 'financier@ener-track.com', role: 'Financier' },
    { id: 3, name: 'Building User', email: 'batiment@ener-track.com', role: 'Moyen Bâtiment' },
    { id: 4, name: 'Planning User', email: 'plan@ener-track.com', role: 'Etude et Planification' },
    { id: 5, name: 'Energy User', email: 'energie@ener-track.com', role: 'Responsable Énergie et Environnement' },
    { id: 6, name: 'Deploy User', email: 'deploiement@ener-track.com', role: 'Déploiement' },
];

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            users: initialUsers,
            currentUser: initialUsers[0],
            setCurrentUser: (user) => set({ currentUser: user }),
            updateUserRole: (userId, role) => set((state) => ({
                users: state.users.map(u => u.id === userId ? { ...u, role } : u),
                // Also update currentUser if it's the one being changed
                currentUser: state.currentUser.id === userId ? { ...state.currentUser, role } : state.currentUser,
            })),
            updateUserEmail: (userId, email) => set((state) => ({
                users: state.users.map(u => u.id === userId ? { ...u, email } : u),
                currentUser: state.currentUser.id === userId ? { ...state.currentUser, email } : state.currentUser,
            })),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useUser = () => {
    const { currentUser, users, setCurrentUser, updateUserRole, updateUserEmail } = useUserStore();
    const availableRoles = ["Admin", "Financier", "Moyen Bâtiment", "Etude et Planification", "Responsable Énergie et Environnement", "Déploiement"] as UserRole[];
    
    // This function simulates logging in as another user from the list.
    const loginAs = (userId: number) => {
        const userToLogin = users.find(u => u.id === userId);
        if (userToLogin) {
            setCurrentUser(userToLogin);
        }
    }

    return { user: currentUser, users, availableRoles, updateUserRole, loginAs, setCurrentUser, updateUserEmail };
}
