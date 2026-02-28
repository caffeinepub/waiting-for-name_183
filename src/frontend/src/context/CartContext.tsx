import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../backend";

export interface Customization {
  text?: string;
  color?: string;
  size?: string;
  notes?: string;
  fileUrl?: string;
}

export interface LocalCartItem {
  productId: string;
  quantity: number;
  customization?: Customization;
}

interface CartContextValue {
  cartItems: LocalCartItem[];
  cartCount: number;
  addToCart: (
    productId: string,
    qty?: number,
    customization?: Customization,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: (products: Product[]) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

function getStorageKey(email?: string | null): string {
  return email ? `megatrx_cart_${email}` : "megatrx_cart_guest";
}

function loadCart(key: string): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as LocalCartItem[];
  } catch {
    return [];
  }
}

function saveCart(key: string, items: LocalCartItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // We start with the guest key and switch when user logs in
  const [storageKey, setStorageKey] = useState<string>(() => {
    try {
      const user = localStorage.getItem("megatrx_current_user");
      if (user) {
        const parsed = JSON.parse(user) as { email?: string };
        return getStorageKey(parsed.email);
      }
    } catch {
      // ignore
    }
    return getStorageKey();
  });

  const [cartItems, setCartItems] = useState<LocalCartItem[]>(() =>
    loadCart(storageKey),
  );

  // Keep storage in sync whenever key changes (login/logout)
  useEffect(() => {
    function handleStorage() {
      try {
        const user = localStorage.getItem("megatrx_current_user");
        if (user) {
          const parsed = JSON.parse(user) as { email?: string };
          const newKey = getStorageKey(parsed.email);
          setStorageKey(newKey);
          setCartItems(loadCart(newKey));
        } else {
          const newKey = getStorageKey();
          setStorageKey(newKey);
          setCartItems(loadCart(newKey));
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener("megatrx_auth_change", handleStorage);
    return () =>
      window.removeEventListener("megatrx_auth_change", handleStorage);
  }, []);

  // Persist on every change
  useEffect(() => {
    saveCart(storageKey, cartItems);
  }, [storageKey, cartItems]);

  function addToCart(
    productId: string,
    qty = 1,
    customization?: Customization,
  ) {
    setCartItems((prev) => {
      // If there's customization, always add as new item
      if (customization) {
        const existing = prev.find(
          (i) => i.productId === productId && !i.customization,
        );
        if (existing) {
          // If there's a plain item already, update its customization and qty
          return prev.map((i) =>
            i.productId === productId && !i.customization
              ? { ...i, quantity: i.quantity + qty, customization }
              : i,
          );
        }
        return [...prev, { productId, quantity: qty, customization }];
      }
      // No customization — merge with existing item (if no customization on it)
      const existing = prev.find(
        (i) => i.productId === productId && !i.customization,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && !i.customization
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }

  function removeFromCart(productId: string) {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i,
      ),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  function getTotal(products: Product[]): number {
    return cartItems.reduce((sum, item) => {
      const product = products.find((p) => p.id.toString() === item.productId);
      if (!product) return sum;
      return sum + Number(product.price) * item.quantity;
    }, 0);
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
