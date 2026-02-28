import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useClearCart,
  useCreateOrder,
  useGetAllProducts,
  useGetCartItems,
  useRemoveFromCart,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { data: cartItems = [], isLoading: cartLoading } = useGetCartItems();
  const { data: allProducts = [] } = useGetAllProducts();
  const removeFromCartMutation = useRemoveFromCart();
  const createOrderMutation = useCreateOrder();
  const clearCartMutation = useClearCart();

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const cartWithDetails = cartItems.map((cartItem) => {
    const product = allProducts.find((p) => p.id === cartItem.productId);
    return { cartItem, product };
  });

  const total = cartWithDetails.reduce((sum, { cartItem, product }) => {
    if (!product) return sum;
    return sum + Number(product.price) * Number(cartItem.quantity);
  }, 0);

  const handleRemoveItem = async (productId: bigint) => {
    try {
      await removeFromCartMutation.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error(error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !email || !shippingAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const orderId = await createOrderMutation.mutateAsync({
        customerName,
        email,
        shippingAddress,
        items: cartItems,
      });

      await clearCartMutation.mutateAsync();

      toast.success(
        `Order placed successfully! Order ID: ${orderId.toString()}`,
      );

      setCustomerName("");
      setEmail("");
      setShippingAddress("");
    } catch (error) {
      toast.error("Failed to place order");
      console.error(error);
    }
  };

  if (cartLoading) {
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
            <div className="lg:col-span-2 space-y-4">
              {cartWithDetails.map(({ cartItem, product }) => {
                if (!product) return null;
                return (
                  <Card
                    key={cartItem.productId.toString()}
                    className="border-2 border-border"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden bg-muted rounded-md border border-border">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
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
                          </div>
                          <div className="flex items-end justify-between gap-4 mt-2">
                            <div>
                              <p className="text-sm text-muted-foreground font-mono">
                                Qty: {cartItem.quantity.toString()}
                              </p>
                              <p className="text-xl sm:text-2xl font-bold text-primary">
                                ${(Number(product.price) / 100).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveItem(cartItem.productId)
                              }
                              disabled={removeFromCartMutation.isPending}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <Card className="border-2 border-border sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-mono">
                        Subtotal
                      </span>
                      <span className="font-semibold">
                        ${(total / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="font-mono">Total</span>
                      <span className="text-primary">
                        ${(total / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-mono text-xs uppercase tracking-wider"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="font-mono text-xs uppercase tracking-wider"
                      >
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="font-mono text-xs uppercase tracking-wider"
                      >
                        Shipping Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                        placeholder="123 Main St, City, State, ZIP"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={
                        createOrderMutation.isPending ||
                        clearCartMutation.isPending
                      }
                    >
                      {createOrderMutation.isPending ||
                      clearCartMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
