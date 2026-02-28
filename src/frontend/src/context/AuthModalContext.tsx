import { createContext, useContext, useState } from "react";

interface AuthModalContextValue {
  isOpen: boolean;
  defaultTab: "signin" | "register";
  openModal: (tab?: "signin" | "register") => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"signin" | "register">("signin");

  function openModal(tab: "signin" | "register" = "signin") {
    setDefaultTab(tab);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <AuthModalContext.Provider
      value={{ isOpen, defaultTab, openModal, closeModal }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx)
    throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
