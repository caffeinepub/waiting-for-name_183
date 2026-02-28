import { Badge } from "@/components/ui/badge";
import { useGetCartItems } from "@/hooks/useQueries";
import { useSeedData } from "@/hooks/useSeedData";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

export default function Layout() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data: cartItems = [] } = useGetCartItems();
  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );
  useSeedData();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/shipping", label: "Shipping" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="group">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter font-sans">
                MEGA
                <span className="text-primary">TRX</span>
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 lg:px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                    pathname === link.to
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs px-1"
                >
                  {cartCount}
                </Badge>
              )}
              <span className="hidden sm:inline font-mono">Cart</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-4 overflow-x-auto pb-3 -mx-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap text-xs font-medium uppercase tracking-wide transition-colors ${
                  pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold tracking-tighter mb-2 font-sans">
                MEGA<span className="text-primary">TRX</span>
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                Graphic design excellence meets modern ecommerce.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 font-mono">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 font-mono">
                Connect
              </h3>
              <p className="text-sm text-muted-foreground">
                © 2026. Built with love using{" "}
                <a
                  href="https://caffeine.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
              <Link
                to="/admin"
                className="mt-4 block text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors font-mono"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
