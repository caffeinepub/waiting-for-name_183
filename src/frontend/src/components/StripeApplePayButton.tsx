import { useEffect, useRef, useState } from "react";

// Stripe loaded via CDN in index.html - access via window.Stripe
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Stripe?: (pk: string) => any;
  }
}

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
      // Load Stripe.js from CDN if not already available
      if (!window.Stripe) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://js.stripe.com/v3/";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      if (!window.Stripe || cancelled) {
        setAvailable(false);
        return;
      }

      const stripe = window.Stripe(pk);
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

      setTimeout(() => {
        if (cancelled || !mountRef.current) return;

        mountRef.current.innerHTML = "";

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

        prButton.mount(mountRef.current);

        pr.on(
          "paymentmethod",
          (ev: {
            paymentMethod: { id: string };
            complete: (status: string) => void;
          }) => {
            onPaymentMethod(ev.paymentMethod.id);
            ev.complete("success");
          },
        );

        cleanupRef.current = () => {
          prButton.unmount();
        };
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
