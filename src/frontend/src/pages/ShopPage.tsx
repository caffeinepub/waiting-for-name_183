import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAllProducts } from "@/hooks/useQueries";
import { getProductImage } from "@/utils/productImages";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ShopPage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

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

      <section className="py-8 sm:py-12 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="font-mono text-xs"
              >
                {category}
              </Button>
            ))}
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
                <Link
                  key={product.id.toString()}
                  to="/shop/$id"
                  params={{ id: product.id.toString() }}
                  className="group block"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={getProductImage(
                          product.category,
                          product.imageUrl,
                        )}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <Button size="sm" className="gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        {product.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold mt-1 tracking-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold mt-2 text-primary">
                        ${(Number(product.price) / 100).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
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
