import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetAllPortfolioItems } from "@/hooks/useQueries";
import { getPortfolioImage } from "@/utils/productImages";
import { Search } from "lucide-react";
import { useState } from "react";
import type { PortfolioItem } from "../backend";

// Load localStorage portfolio items and convert to PortfolioItem shape
function getLocalStoragePortfolio(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem("megatrx_portfolio");
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      imageUrl: string;
      clientName: string;
    }>;
    return items.map((p) => ({
      id: BigInt(p.id.replace(/\D/g, "") || "0") as bigint,
      title: p.title,
      description: p.description,
      category: p.category,
      imageUrl: p.imageUrl,
      clientName: p.clientName,
    }));
  } catch {
    return [];
  }
}

export default function PortfolioPage() {
  const { data: backendPortfolio = [], isLoading } = useGetAllPortfolioItems();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Merge localStorage portfolio (first) with backend portfolio
  const localPortfolio = getLocalStoragePortfolio();
  const backendIds = new Set(backendPortfolio.map((p) => p.id.toString()));
  const uniqueLocalPortfolio = localPortfolio.filter(
    (p) => !backendIds.has(p.id.toString()),
  );
  const portfolio = [...uniqueLocalPortfolio, ...backendPortfolio];

  const categories = [
    "All",
    ...new Set(portfolio.map((item) => item.category)),
  ];

  const filteredPortfolio = portfolio.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

      <section className="py-6 sm:py-8 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portfolio..."
              className="pl-9 bg-background/50"
              data-ocid="portfolio.search_input"
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
                data-ocid="portfolio.filter.tab"
              >
                {category}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {filteredPortfolio.length} item
              {filteredPortfolio.length !== 1 ? "s" : ""}
            </span>
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".img-fallback")
                          ) {
                            const fb = document.createElement("div");
                            fb.className =
                              "img-fallback w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-mono";
                            fb.textContent = item.category;
                            parent.appendChild(fb);
                          }
                        }}
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
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
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
