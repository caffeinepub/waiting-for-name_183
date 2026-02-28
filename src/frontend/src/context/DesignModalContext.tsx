import { createContext, useContext, useState } from "react";

interface DesignModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const DesignModalContext = createContext<DesignModalContextValue | null>(null);

export function DesignModalProvider({
  children,
}: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DesignModalContext.Provider
      value={{
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
      }}
    >
      {children}
    </DesignModalContext.Provider>
  );
}

export function useDesignModal() {
  const ctx = useContext(DesignModalContext);
  if (!ctx) {
    throw new Error("useDesignModal must be used within DesignModalProvider");
  }
  return ctx;
}
