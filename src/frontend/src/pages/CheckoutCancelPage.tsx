import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ShoppingBag, ShoppingCart } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="w-full">
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg text-center">
          {/* Cancel icon */}
          <div className="w-20 h-20 rounded-full bg-orange-500/15 border-2 border-orange-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-orange-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground font-body mb-6">
            Your payment was not completed. Don't worry — your order has been
            saved. You can return to your cart and try again at any time.
          </p>

          <Card className="mb-8 border-orange-500/20 bg-orange-500/5">
            <CardContent className="py-4">
              <p className="text-sm text-orange-400 font-mono">
                No charges were made to your account.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Return to Cart
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
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
