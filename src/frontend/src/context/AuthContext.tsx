import { createContext, useCallback, useContext, useState } from "react";

export interface MegatrxUser {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  address: string;
}

interface AuthContextValue {
  currentUser: MegatrxUser | null;
  isLoggedIn: boolean;
  register: (email: string, password: string, name: string) => string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (
    data: Partial<Pick<MegatrxUser, "name" | "phone" | "address">>,
  ) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "megatrx_users";
const CURRENT_KEY = "megatrx_current_user";

function hashPassword(email: string, password: string): string {
  return btoa(`${email}:${password}`);
}

function getUsers(): MegatrxUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MegatrxUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: MegatrxUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser(): MegatrxUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MegatrxUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MegatrxUser | null>(
    loadCurrentUser,
  );

  const register = useCallback(
    (email: string, password: string, name: string): string | null => {
      const users = getUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return "An account with this email already exists.";
      }
      const newUser: MegatrxUser = {
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(email.toLowerCase().trim(), password),
        name,
        phone: "",
        address: "",
      };
      saveUsers([...users, newUser]);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));
      setCurrentUser(newUser);
      window.dispatchEvent(new Event("megatrx_auth_change"));
      return null;
    },
    [],
  );

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const hash = hashPassword(email.toLowerCase().trim(), password);
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.passwordHash === hash,
    );
    if (!user) return false;
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    setCurrentUser(user);
    window.dispatchEvent(new Event("megatrx_auth_change"));
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_KEY);
    setCurrentUser(null);
    window.dispatchEvent(new Event("megatrx_auth_change"));
  }, []);

  const updateProfile = useCallback(
    (data: Partial<Pick<MegatrxUser, "name" | "phone" | "address">>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...data };
      const users = getUsers().map((u) =>
        u.email === currentUser.email ? updated : u,
      );
      saveUsers(users);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(updated));
      setCurrentUser(updated);
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
