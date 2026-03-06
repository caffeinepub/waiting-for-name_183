import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useCustomizationModal } from "@/context/CustomizationModalContext";
import { useDesignModal } from "@/context/DesignModalContext";
import { useGetAllProducts } from "@/hooks/useQueries";
import { getCategoryFallback, getProductImage } from "@/utils/productImages";
import { Link } from "@tanstack/react-router";
import { PenTool, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Load localStorage products and convert to backend-compatible shape
function getLocalStorageProducts() {
  try {
    const raw = localStorage.getItem("megatrx_products");
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrls: string[];
      stock: number;
      sizes?: string[];
    }>;
    return items.map((p) => ({
      id: BigInt(p.id.replace(/\D/g, "") || "0") as bigint,
      _localId: p.id, // keep original string id
      name: p.name,
      description: p.description,
      price: BigInt(p.price) as bigint,
      category: p.category,
      imageUrl: p.imageUrls[0] ?? "",
      imageUrls: p.imageUrls,
      stock: BigInt(p.stock) as bigint,
      sizes: p.sizes ?? [],
    }));
  } catch {
    return [];
  }
}

export default function ShopPage() {
  const { data: backendProducts = [], isLoading } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { openModal } = useDesignModal();
  const { addToCart } = useCart();
  const { openCustomizationModal } = useCustomizationModal();

  // Merge localStorage products (first) with backend products
  const localProducts = getLocalStorageProducts();
  const backendIds = new Set(backendProducts.map((p) => p.id.toString()));
  // Only include local products not already in backend (dedup)
  const uniqueLocalProducts = localProducts.filter(
    (p) => !backendIds.has(p.id.toString()),
  );
  const products = [...uniqueLocalProducts, ...backendProducts];

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handleAddToCart(e: React.MouseEvent, product: (typeof products)[0]) {
    e.preventDefault();
    e.stopPropagation();
    const sizes = "sizes" in product ? (product.sizes as string[]) : [];
    openCustomizationModal(
      product,
      (qty, customization) => {
        addToCart(product.id.toString(), qty, customization);
        toast.success(`${product.name} added to cart!`);
      },
      sizes,
    );
  }

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Ecommerce
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Shop
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-body">
            Browse our collection of premium design assets, templates, and
            products.
          </p>
        </div>
      </section>

      {/* Custom Design CTA Banner */}
      <section className="py-6 sm:py-8 border-b border-border bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-mono uppercase tracking-widest text-primary mb-1">
                Don&apos;t see what you need?
              </p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Request a fully custom design
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                T-shirts, mugs, business cards, and more — designed exactly how
                you want.
              </p>
            </div>
            <Button size="lg" onClick={openModal} className="shrink-0 gap-2">
              <PenTool className="w-4 h-4" />
              Request Custom Design
            </Button>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9 bg-background/50"
              data-ocid="shop.search_input"
            />
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="font-mono text-xs"
                data-ocid="shop.filter.tab"
              >
                {category}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card
                  key={i}
                  className="aspect-square animate-pulse bg-muted"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id.toString()} className="group block">
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all">
                    <Link to="/shop/$id" params={{ id: product.id.toString() }}>
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        {(() => {
                          const primaryImage =
                            product.imageUrls && product.imageUrls.length > 0
                              ? product.imageUrls[0]
                              : product.imageUrl;
                          return (
                            <img
                              src={getProductImage(
                                product.category,
                                primaryImage,
                              )}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const fallback = getCategoryFallback(
                                  product.category,
                                );
                                if (e.currentTarget.src !== fallback) {
                                  e.currentTarget.src = fallback;
                                }
                              }}
                            />
                          );
                        })()}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        {product.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold mt-1 tracking-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          ${(Number(product.price) / 100).toFixed(2)}
                        </p>
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs shrink-0"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
