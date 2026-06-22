import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from './data';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  playerId?: string;
  avatar?: string;
}

interface AppContextType {
  user: AppUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  setUser: (user: AppUser | null) => void;
}

const DEMO_USERS: Record<UserRole, AppUser> = {
  guest: { id: 'guest', name: 'Guest User', email: '', role: 'guest' },
  player: { id: 'p1', name: 'Chukwuemeka Obi', email: 'emeka@lfc.ng', role: 'player', teamId: '1', playerId: '1', avatar: undefined },
  manager: { id: 'm1', name: 'Emeka Eze', email: 'emeka.eze@lfc.ng', role: 'manager', teamId: '1' },
  admin: { id: 'a1', name: 'Admin User', email: 'admin@lagosfa.ng', role: 'admin' },
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const role: UserRole = user?.role ?? 'guest';

  const login = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (email.includes('admin')) {
      setUser(DEMO_USERS.admin);
    } else if (email.includes('manager') || email.includes('eze')) {
      setUser(DEMO_USERS.manager);
    } else {
      setUser(DEMO_USERS.player);
    }
  };

  const loginAsRole = (r: UserRole) => {
    setUser(r === 'guest' ? null : DEMO_USERS[r]);
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, role, isAuthenticated: !!user, login, loginAsRole, logout, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
