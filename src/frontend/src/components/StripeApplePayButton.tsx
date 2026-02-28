import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useRef, useState } from "react";

interface StripeApplePayButtonProps {
  /** Total amount in cents */
  totalCents: number;
  /** Called when the payment sheet is confirmed (paymentMethodId returned) */
  onPaymentMethod: (paymentMethodId: string) => void;
  /** Label shown in the Apple Pay / Google Pay sheet */
  label?: string;
}

export default function StripeApplePayButton({
  totalCents,
  onPaymentMethod,
  label = "MEGATRX Order",
}: StripeApplePayButtonProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const pk = localStorage.getItem("megatrx_stripe_pk") ?? "";
    if (!pk || totalCents <= 0) {
      setAvailable(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const stripe = await loadStripe(pk);
      if (!stripe || cancelled) return;

      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label,
          amount: totalCents,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const canMakePayment = await pr.canMakePayment();
      if (cancelled) return;

      if (!canMakePayment) {
        setAvailable(false);
        return;
      }

      setAvailable(true);

      // Mount the button once the element is in the DOM
      // We wait one tick for React to render the container
      setTimeout(() => {
        if (cancelled || !mountRef.current) return;

        // Clear any old button
        mountRef.current.innerHTML = "";

        const { Elements, PaymentRequestButtonElement } =
          // Dynamically import to avoid SSR issues and keep bundle lean
          // We already have @stripe/react-stripe-js installed
          // but we'll use the low-level stripe.js API directly for simplicity
          // so we don't need a context provider
          { Elements: null, PaymentRequestButtonElement: null };

        // Render via raw DOM + Stripe Elements
        const elements = stripe.elements();
        const prButton = elements.create("paymentRequestButton", {
          paymentRequest: pr,
          style: {
            paymentRequestButton: {
              type: "buy",
              theme: "dark",
              height: "48px",
            },
          },
        });

        prButton.mount(mountRef.current!);

        pr.on("paymentmethod", (ev) => {
          onPaymentMethod(ev.paymentMethod.id);
          ev.complete("success");
        });

        cleanupRef.current = () => {
          prButton.unmount();
        };

        // Silence unused imports warning
        void Elements;
        void PaymentRequestButtonElement;
      }, 0);
    })();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [totalCents, label, onPaymentMethod]);

  if (available === false) return null;
  if (available === null) return null;

  return (
    <div className="space-y-3">
      {/* Apple Pay / Google Pay native button */}
      <div ref={mountRef} className="w-full min-h-[48px]" />
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider shrink-0">
          or pay with card
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}
