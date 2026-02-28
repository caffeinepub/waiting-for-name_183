import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDesignModal } from "@/context/DesignModalContext";
import { useGetAllPortfolioItems, useGetAllProducts } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Palette, PenTool, ShoppingBag, Zap } from "lucide-react";

export default function HomePage() {
  const { data: portfolio = [], isLoading: portfolioLoading } =
    useGetAllPortfolioItems();
  const { data: products = [], isLoading: productsLoading } =
    useGetAllProducts();
  const { openModal } = useDesignModal();

  const featuredPortfolio = portfolio.slice(0, 3);
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="w-full">
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-12 origin-top-right" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-4 block">
              Design + Commerce
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
              MEGA<span className="text-primary">TRX</span>
              <br />
              <span className="text-3xl sm:text-5xl lg:text-6xl font-light">
                Design Studio
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl font-body">
              Bold graphic design meets seamless ecommerce. Explore our
              portfolio or shop ready-made design assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/portfolio">
                  View Portfolio <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/shop">
                  Browse Shop <ShoppingBag className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="text-base"
                onClick={openModal}
              >
                <PenTool className="mr-2 w-4 h-4" />
                Custom Design
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 border-border hover:border-primary transition-colors group">
              <CardContent className="p-6 sm:p-8">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">
                  Fast Delivery
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Instant digital downloads and lightning-fast project
                  turnaround times.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-colors group md:mt-8">
              <CardContent className="p-6 sm:p-8">
                <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">
                  Expert Craft
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Professional-grade design work backed by years of creative
                  expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-colors group">
              <CardContent className="p-6 sm:p-8">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">
                  Shop Ready
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Pre-made templates and assets ready for immediate use in your
                  projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
                Latest Work
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter">
                Featured Projects
              </h2>
            </div>
            <Button asChild variant="ghost" className="font-mono">
              <Link to="/portfolio">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {portfolioLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="aspect-[4/3] animate-pulse bg-muted" />
              ))}
            </div>
          ) : featuredPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {featuredPortfolio.map((item) => (
                <Link
                  key={item.id.toString()}
                  to="/portfolio"
                  className="group block"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
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
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No portfolio items yet.
            </p>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
                Shop Now
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter">
                Popular Products
              </h2>
            </div>
            <Button asChild variant="ghost" className="font-mono">
              <Link to="/shop">
                Browse All <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="aspect-square animate-pulse bg-muted"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id.toString()}
                  to="/shop/$id"
                  params={{ id: product.id.toString() }}
                  className="group block"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        {product.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold mt-2 text-primary">
                        ${(Number(product.price) / 100).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No products available yet.
            </p>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-border bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
            Ready to elevate your brand?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-body">
            Discover our full collection of design work, shop ready-made
            products, or submit a fully custom design request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/portfolio">Explore Portfolio</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-base"
              onClick={openModal}
            >
              <PenTool className="mr-2 w-4 h-4" />
              Request Custom Design
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
