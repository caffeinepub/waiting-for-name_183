import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllPortfolioItems } from "@/hooks/useQueries";
import { getPortfolioImage } from "@/utils/productImages";
import { useState } from "react";
import type { PortfolioItem } from "../backend";

export default function PortfolioPage() {
  const { data: portfolio = [], isLoading } = useGetAllPortfolioItems();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...new Set(portfolio.map((item) => item.category)),
  ];
  const filteredPortfolio =
    selectedCategory === "All"
      ? portfolio
      : portfolio.filter((item) => item.category === selectedCategory);

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Our Work
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-body">
            Explore our collection of design projects across various industries
            and styles.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="aspect-[4/3] animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPortfolio.map((item) => (
                <button
                  type="button"
                  key={item.id.toString()}
                  onClick={() => setSelectedItem(item)}
                  className="group block text-left w-full"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={getPortfolioImage(item.title, item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        {item.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.clientName}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No portfolio items found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">
                  {selectedItem.category}
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {selectedItem.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Client: {selectedItem.clientName}
                </DialogDescription>
              </DialogHeader>
              <div className="aspect-video overflow-hidden bg-muted rounded-md">
                <img
                  src={getPortfolioImage(
                    selectedItem.title,
                    selectedItem.imageUrl,
                  )}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-muted-foreground font-body">
                {selectedItem.description}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
