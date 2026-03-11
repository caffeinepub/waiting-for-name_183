import { Card, CardContent } from "@/components/ui/card";
import { useGetShippingInfo } from "@/hooks/useQueries";
import { Clock, MapPin, Package, RotateCcw } from "lucide-react";

export default function ShippingPage() {
  const { data: shippingText = "", isLoading } = useGetShippingInfo();

  const defaultShipping =
    shippingText ||
    `We offer fast and reliable shipping on all physical products. Digital products are available for instant download after purchase.

Standard Shipping: 5-7 business days
Express Shipping: 2-3 business days
Digital Products: Instant delivery

All orders are processed within 1-2 business days. You will receive tracking information via email once your order ships.`;

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Delivery Info
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Shipping
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-body">
            Fast, reliable delivery on all orders. Learn about our shipping
            policies and timelines.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-2 border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 font-mono">
                  Calculated at Checkout
                </h3>
                <p className="text-xs text-muted-foreground">
                  Standard $5.99 · Express $14.99
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 font-mono">
                  Fast Processing
                </h3>
                <p className="text-xs text-muted-foreground">
                  1-2 business days
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 font-mono">
                  Tracking
                </h3>
                <p className="text-xs text-muted-foreground">
                  Full tracking provided
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 font-mono">
                  Easy Returns
                </h3>
                <p className="text-xs text-muted-foreground">
                  30-day return policy
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 tracking-tight">
                  Shipping Policy
                </h2>
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
                  </div>
                ) : (
                  <div className="text-muted-foreground font-body leading-relaxed whitespace-pre-wrap">
                    {defaultShipping}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-border mt-6">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 tracking-tight">
                  Returns & Exchanges
                </h2>
                <div className="text-muted-foreground font-body leading-relaxed space-y-4">
                  <p>
                    We want you to be completely satisfied with your purchase.
                    If you're not happy with your order, you can return it
                    within 30 days for a full refund or exchange.
                  </p>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 font-mono text-foreground">
                      Return Requirements:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Items must be unused and in original condition</li>
                      <li>Original packaging must be included</li>
                      <li>
                        Digital products are non-refundable once downloaded
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    Please contact us before initiating a return to receive
                    instructions and a return authorization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
