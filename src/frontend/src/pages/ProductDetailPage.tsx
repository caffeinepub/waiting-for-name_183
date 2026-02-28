import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddToCart, useGetProduct } from "@/hooks/useQueries";
import { getProductImage } from "@/utils/productImages";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const productId = id ? BigInt(id) : null;
  const { data: product, isLoading } = useGetProduct(productId);
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate({ to: "/cart" });
  };

  if (isLoading) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="aspect-square animate-pulse bg-muted" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-12 bg-muted animate-pulse rounded w-1/4" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/shop">Return to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="font-mono">
            <Link to="/shop">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square overflow-hidden bg-muted rounded-md border-2 border-border">
              <img
                src={getProductImage(product.category, product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter mb-4">
                {product.name}
              </h1>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-6">
                ${(Number(product.price) / 100).toFixed(2)}
              </p>

              <Card className="border-2 border-border mb-6">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 font-mono">
                    Description
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border-2 border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 font-mono font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  Quantity
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Button
                  size="lg"
                  className="flex-1 text-base gap-2"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 text-base"
                  onClick={handleBuyNow}
                  disabled={addToCartMutation.isPending}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
