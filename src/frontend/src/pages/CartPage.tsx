import StripeApplePayButton from "@/components/StripeApplePayButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { type Customization, useCart } from "@/context/CartContext";
import { useCreateOrder, useGetAllProducts } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LocalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageUrls?: string[];
  stock: number;
  sizes?: string[];
}

interface LocalOrder {
  id: number;
  customerName: string;
  email: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  createdAt: string;
  total: number;
}

function getLocalStorageProducts(): LocalProduct[] {
  try {
    const raw = localStorage.getItem("megatrx_products");
    return raw ? (JSON.parse(raw) as LocalProduct[]) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: LocalOrder) {
  try {
    const raw = localStorage.getItem("megatrx_local_orders");
    const orders: LocalOrder[] = raw ? JSON.parse(raw) : [];
    orders.push(order);
    localStorage.setItem("megatrx_local_orders", JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { data: backendProducts = [], isLoading: productsLoading } =
    useGetAllProducts();
  const createOrderMutation = useCreateOrder();
  const { currentUser, isLoggedIn } = useAuth();
  const { openModal } = useAuthModal();
  const navigate = useNavigate();

  const [street, setStreet] = useState(
    currentUser?.address?.split(",")[0] ?? "",
  );
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");

  // Merge backend + localStorage products
  const localProducts = getLocalStorageProducts();
  const backendIds = new Set(backendProducts.map((p) => p.id.toString()));
  const mergedProducts = [
    ...localProducts.filter((p) => !backendIds.has(p.id.toString())),
    ...backendProducts,
  ];

  const cartWithDetails = cartItems
    .map((item) => {
      const product = mergedProducts.find(
        (p) => p.id.toString() === item.productId,
      );
      return { item, product };
    })
    .filter(({ product }) => !!product);

  const subtotal = cartWithDetails.reduce((acc, { item, product }) => {
    return acc + Number(product!.price) * item.quantity;
  }, 0);

  const SHIPPING_COST = 599; // $5.99 standard shipping in cents

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !currentUser) {
      toast.error("Please sign in to checkout");
      openModal("signin");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!street || !city || !state || !zip) {
      toast.error("Please fill in your shipping address");
      return;
    }

    const baseAddress = `${street}, ${city}, ${state} ${zip}`;

    // Build per-item customization notes
    const customizationLines = cartWithDetails
      .filter(({ item }) => !!item.customization)
      .map(({ item, product }) => {
        const c = item.customization as Customization;
        const parts: string[] = [];
        if (c.size) parts.push(`Size: ${c.size}`);
        if (c.color) parts.push(`Color: ${c.color}`);
        if (c.text) parts.push(`Text: "${c.text}"`);
        if (c.notes) parts.push(`Notes: ${c.notes}`);
        if (c.fileUrl) parts.push(`Ref file: ${c.fileUrl}`);
        return `- ${product!.name}: ${parts.join(", ")}`;
      });

    const shippingAddress =
      customizationLines.length > 0
        ? `${baseAddress}\n\nCustomization Notes:\n${customizationLines.join("\n")}`
        : baseAddress;

    // Safe BigInt conversion — use 0 for local product IDs
    const orderItems = cartItems.map((item) => ({
      productId: BigInt(
        Number.isNaN(Number(item.productId)) ? 0 : item.productId,
      ),
      quantity: BigInt(item.quantity),
    }));

    // Build a localStorage order object
    const localOrder: LocalOrder = {
      id: Date.now(),
      customerName: currentUser.name,
      email: currentUser.email,
      shippingAddress,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName:
          mergedProducts.find((p) => p.id.toString() === item.productId)
            ?.name ?? "Unknown",
        quantity: item.quantity,
        price: Number(
          mergedProducts.find((p) => p.id.toString() === item.productId)
            ?.price ?? 0,
        ),
      })),
      status: "pending",
      createdAt: new Date().toISOString(),
      total: subtotal + SHIPPING_COST,
    };

    let orderId: bigint | number = localOrder.id;

    try {
      const result = await createOrderMutation.mutateAsync({
        customerName: currentUser.name,
        email: currentUser.email,
        shippingAddress,
        items: orderItems,
        createdAt: new Date().toISOString(),
      });
      orderId = result;

      // Web push notification for admin
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification("New MEGATRX Order!", {
          body: `Order from ${currentUser.name} — ${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}`,
        });
      }

      localStorage.setItem("megatrx_pending_order_id", orderId.toString());
    } catch {
      // Backend call failed — save locally and continue
      orderId = localOrder.id;
      localStorage.setItem("megatrx_pending_order_id", orderId.toString());
    }

    // Always save order locally so admin can see it
    saveLocalOrder(localOrder);

    const stripeLink = localStorage.getItem("megatrx_stripe_link");

    if (stripeLink && stripeLink.trim().length > 0) {
      clearCart();
      window.location.href = stripeLink.trim();
    } else {
      clearCart();
      toast.success("Order placed! Complete payment at pickup or contact us.");
      navigate({ to: `/order/${orderId.toString()}` });
    }
  };

  if (productsLoading) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8 font-body">
            Looks like you haven't added anything yet. Explore our shop to find
            amazing design products.
          </p>
          <Button asChild size="lg">
            <Link to="/shop">Browse Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartWithDetails.map(({ item, product }) => {
                if (!product) return null;
                return (
                  <Card key={item.productId} className="border-2 border-border">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden bg-muted rounded-md border border-border">
                          <img
                            src={
                              product.imageUrl ||
                              "/assets/generated/product-business-cards.dim_800x800.jpg"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/generated/product-business-cards.dim_800x800.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-primary">
                              {product.category}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                              <Link
                                to="/shop/$id"
                                params={{ id: product.id.toString() }}
                                className="hover:text-primary transition-colors"
                              >
                                {product.name}
                              </Link>
                            </h3>
                            {item.customization && (
                              <div className="mt-1.5 space-y-0.5">
                                {(item.customization.size ||
                                  item.customization.color ||
                                  item.customization.text) && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {[
                                      item.customization.size &&
                                        `Size: ${item.customization.size}`,
                                      item.customization.color &&
                                        `Color: ${item.customization.color}`,
                                      item.customization.text &&
                                        `Text: "${item.customization.text}"`,
                                    ]
                                      .filter(Boolean)
                                      .join("  |  ")}
                                  </p>
                                )}
                                {item.customization.notes && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    Notes: {item.customization.notes}
                                  </p>
                                )}
                                {item.customization.fileUrl && (
                                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                    📎 {item.customization.fileUrl}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-end justify-between gap-4 mt-2">
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-primary">
                                $
                                {(
                                  (Number(product.price) * item.quantity) /
                                  100
                                ).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                ${(Number(product.price) / 100).toFixed(2)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-border rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-mono text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Checkout Sidebar */}
            <div>
              <Card className="border-2 border-border sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-mono">
                        Subtotal
                      </span>
                      <span className="font-semibold">
                        ${(subtotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-mono">
                        Shipping
                      </span>
                      <span className="font-semibold">
                        ${(SHIPPING_COST / 100).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="font-mono">Total</span>
                      <span className="text-primary">
                        ${((subtotal + SHIPPING_COST) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Login gate */}
                  {!isLoggedIn && (
                    <div className="rounded-md bg-primary/10 border border-primary/30 p-4 text-center space-y-3">
                      <p className="text-sm font-mono">
                        Please sign in to checkout
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => openModal("signin")}
                      >
                        Sign In / Create Account
                      </Button>
                    </div>
                  )}

                  {/* Checkout Form */}
                  {isLoggedIn && (
                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Shipping To: {currentUser?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser?.email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider">
                          Phone
                        </Label>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 555-5555"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider">
                          Street Address *
                        </Label>
                        <Input
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="123 Main St"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="font-mono text-xs uppercase tracking-wider">
                            City *
                          </Label>
                          <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs uppercase tracking-wider">
                            State *
                          </Label>
                          <Input
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="TX"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider">
                          ZIP Code *
                        </Label>
                        <Input
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="75001"
                          required
                        />
                      </div>

                      {/* Total + CTA */}
                      <div className="rounded-md bg-primary/10 border border-primary/30 p-3 text-center">
                        <p className="text-sm text-muted-foreground font-mono mb-0.5">
                          Total due today
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${((subtotal + SHIPPING_COST) / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Apple Pay / Google Pay button */}
                      <StripeApplePayButton
                        totalCents={subtotal + SHIPPING_COST}
                        label="MEGATRX Order"
                        onPaymentMethod={async (paymentMethodId) => {
                          if (!isLoggedIn || !currentUser) {
                            toast.error("Please sign in to checkout");
                            openModal("signin");
                            return;
                          }
                          if (!street || !city || !state || !zip) {
                            toast.error(
                              "Please fill in your shipping address first",
                            );
                            return;
                          }
                          const baseAddress = `${street}, ${city}, ${state} ${zip}`;
                          const customizationLinesAP = cartWithDetails
                            .filter(({ item }) => !!item.customization)
                            .map(({ item, product }) => {
                              const c = item.customization as Customization;
                              const parts: string[] = [];
                              if (c.size) parts.push(`Size: ${c.size}`);
                              if (c.color) parts.push(`Color: ${c.color}`);
                              if (c.text) parts.push(`Text: "${c.text}"`);
                              if (c.notes) parts.push(`Notes: ${c.notes}`);
                              if (c.fileUrl)
                                parts.push(`Ref file: ${c.fileUrl}`);
                              return `- ${product!.name}: ${parts.join(", ")}`;
                            });
                          const shippingAddressAP =
                            customizationLinesAP.length > 0
                              ? `${baseAddress}\n\nCustomization Notes:\n${customizationLinesAP.join("\n")}`
                              : baseAddress;
                          const apOrderItems = cartItems.map((item) => ({
                            productId: BigInt(
                              Number.isNaN(Number(item.productId))
                                ? 0
                                : item.productId,
                            ),
                            quantity: BigInt(item.quantity),
                          }));
                          const apLocalOrder: LocalOrder = {
                            id: Date.now(),
                            customerName: currentUser.name,
                            email: currentUser.email,
                            shippingAddress: shippingAddressAP,
                            items: cartItems.map((item) => ({
                              productId: item.productId,
                              productName:
                                mergedProducts.find(
                                  (p) => p.id.toString() === item.productId,
                                )?.name ?? "Unknown",
                              quantity: item.quantity,
                              price: Number(
                                mergedProducts.find(
                                  (p) => p.id.toString() === item.productId,
                                )?.price ?? 0,
                              ),
                            })),
                            status: "pending",
                            createdAt: new Date().toISOString(),
                            total: subtotal + SHIPPING_COST,
                          };
                          try {
                            const orderId =
                              await createOrderMutation.mutateAsync({
                                customerName: currentUser.name,
                                email: currentUser.email,
                                shippingAddress: `${shippingAddressAP}\n\nPayment: Apple Pay / Google Pay (Stripe PM: ${paymentMethodId})`,
                                items: apOrderItems,
                                createdAt: new Date().toISOString(),
                              });
                            saveLocalOrder(apLocalOrder);
                            localStorage.setItem(
                              "megatrx_pending_order_id",
                              orderId.toString(),
                            );
                            clearCart();
                            toast.success("Payment confirmed! Order placed.");
                            navigate({ to: `/order/${orderId.toString()}` });
                          } catch {
                            saveLocalOrder(apLocalOrder);
                            localStorage.setItem(
                              "megatrx_pending_order_id",
                              apLocalOrder.id.toString(),
                            );
                            clearCart();
                            toast.success(
                              "Order placed! We'll confirm payment shortly.",
                            );
                            navigate({
                              to: `/order/${apLocalOrder.id.toString()}`,
                            });
                          }
                        }}
                      />

                      {/* Payment Info */}
                      <div className="rounded-md bg-muted/50 border border-border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <p className="text-xs font-mono uppercase tracking-wider">
                            Pay with Card via Stripe
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You'll be redirected to a secure Stripe checkout page
                          to complete your payment. All major cards accepted.
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Lock className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">
                            Secured by Stripe
                          </span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2"
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Pay Now →
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
