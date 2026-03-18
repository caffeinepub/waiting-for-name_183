import { useCallback, useEffect, useState } from "react";

export type PremiumTier = "free" | "starter" | "creator" | "pro";

interface PremiumState {
  balance: number;
  tier: PremiumTier;
}

export function usePremiumCredits() {
  const isAdmin =
    localStorage.getItem("megatrx_admin_authenticated") === "true";

  const [state, setState] = useState<PremiumState>(() => {
    try {
      const saved = localStorage.getItem("premium_credits");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { balance: 0, tier: "free" as PremiumTier };
  });

  useEffect(() => {
    localStorage.setItem("premium_credits", JSON.stringify(state));
  }, [state]);

  const addCredits = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const deductCredits = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
    }));
  }, []);

  const setTier = useCallback((tier: PremiumTier) => {
    setState((prev) => ({ ...prev, tier }));
  }, []);

  return {
    isAdmin,
    balance: isAdmin ? Number.POSITIVE_INFINITY : state.balance,
    tier: isAdmin ? ("pro" as PremiumTier) : state.tier,
    addCredits,
    deductCredits,
    setTier,
  };
}
