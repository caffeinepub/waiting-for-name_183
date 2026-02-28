import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("megatrx_pending_order_id");
    if (stored) {
      setOrderId(stored);
      localStorage.removeItem("megatrx_pending_order_id");
    }
  }, []);

  return (
    <div className="w-full">
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground font-body mb-6">
            Your payment was received and your order is being prepared. You'll
            receive updates about your order status via email.
          </p>

          {orderId && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardContent className="py-4 flex items-center justify-center gap-3">
                <Package className="w-5 h-5 text-green-400" />
                <span className="font-mono text-sm text-green-400">
                  Order #{orderId}
                </span>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/account">
                <Package className="w-4 h-4 mr-2" />
                View My Orders
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/shop">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
