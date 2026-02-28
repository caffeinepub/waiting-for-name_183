import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useCustomizationModal } from "@/context/CustomizationModalContext";
import { useGetProduct } from "@/hooks/useQueries";
import { getProductImage } from "@/utils/productImages";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();

  const productId = id ? BigInt(id) : null;
  const { data: product, isLoading } = useGetProduct(productId);
  const { addToCart } = useCart();
  const { openCustomizationModal } = useCustomizationModal();

  const handleAddToCart = () => {
    if (!product) return;
    openCustomizationModal(product, (qty, customization) => {
      addToCart(product.id.toString(), qty, customization);
      toast.success(`Added ${qty} × ${product.name} to cart!`);
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    openCustomizationModal(product, (qty, customization) => {
      addToCart(product.id.toString(), qty, customization);
      navigate({ to: "/cart" });
    });
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

              {/* Customization note */}
              <p className="text-sm text-muted-foreground font-mono mb-6 p-3 rounded-md bg-primary/10 border border-primary/20">
                ✏️ You'll choose quantity, colors, size, and design details on
                the next step.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Button
                  size="lg"
                  className="flex-1 text-base gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 text-base"
                  onClick={handleBuyNow}
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
