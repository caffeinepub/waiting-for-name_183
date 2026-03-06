import type { Product } from "@/backend";
import CustomizationModal from "@/components/CustomizationModal";
import type { Customization } from "@/context/CartContext";
import { createContext, useCallback, useContext, useState } from "react";

type ConfirmCallback = (qty: number, customization: Customization) => void;

interface CustomizationModalContextValue {
  openCustomizationModal: (
    product: Product,
    onConfirm: ConfirmCallback,
    sizes?: string[],
  ) => void;
  closeCustomizationModal: () => void;
}

const CustomizationModalContext =
  createContext<CustomizationModalContextValue | null>(null);

interface ModalState {
  product: Product;
  onConfirm: ConfirmCallback;
  sizes?: string[];
}

export function CustomizationModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const openCustomizationModal = useCallback(
    (product: Product, onConfirm: ConfirmCallback, sizes?: string[]) => {
      setModalState({ product, onConfirm, sizes });
    },
    [],
  );

  const closeCustomizationModal = useCallback(() => {
    setModalState(null);
  }, []);

  function handleConfirm(qty: number, customization: Customization) {
    if (modalState) {
      modalState.onConfirm(qty, customization);
    }
    setModalState(null);
  }

  return (
    <CustomizationModalContext.Provider
      value={{ openCustomizationModal, closeCustomizationModal }}
    >
      {children}
      {modalState && (
        <CustomizationModal
          product={modalState.product}
          sizes={modalState.sizes}
          open={!!modalState}
          onClose={closeCustomizationModal}
          onConfirm={handleConfirm}
        />
      )}
    </CustomizationModalContext.Provider>
  );
}

export function useCustomizationModal() {
  const ctx = useContext(CustomizationModalContext);
  if (!ctx) {
    throw new Error(
      "useCustomizationModal must be used within CustomizationModalProvider",
    );
  }
  return ctx;
}
