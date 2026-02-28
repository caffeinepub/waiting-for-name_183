import AuthModal from "@/components/AuthModal";
import ChatWidget from "@/components/ChatWidget";
import CustomDesignModal from "@/components/CustomDesignModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";
import { CartProvider, useCart } from "@/context/CartContext";
import { CustomizationModalProvider } from "@/context/CustomizationModalContext";
import { DesignModalProvider } from "@/context/DesignModalContext";
import { useSeedData } from "@/hooks/useSeedData";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { HelpCircle, LogIn, ShoppingCart, User } from "lucide-react";

// ── Inner layout that has access to auth/cart contexts ──────────────────────

function LayoutInner() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { cartCount } = useCart();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const { openModal } = useAuthModal();
  useSeedData();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/shipping", label: "Shipping" },
    { to: "/help", label: "Help" },
  ];

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <DesignModalProvider>
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

              {/* Right side: Auth + Cart */}
              <div className="flex items-center gap-2">
                {/* Auth button */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/account"
                      className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary font-mono">
                        {initials}
                      </div>
                      <span className="font-mono">Account</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex text-xs font-mono text-muted-foreground"
                      onClick={logout}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-1.5 font-mono text-xs"
                    onClick={() => openModal("signin")}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                )}

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
              {isLoggedIn ? (
                <Link
                  to="/account"
                  className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openModal("signin")}
                  className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  Login
                </button>
              )}
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
                  <li>
                    <Link
                      to="/account"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <User className="w-3 h-3" />
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/help"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 font-mono">
                  Connect
                </h3>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()}. Built with love using{" "}
                  <a
                    href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    caffeine.ai
                  </a>
                </p>
                <Link
                  to="/admin"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors font-mono border border-border/30 hover:border-primary/50 px-3 py-1.5 rounded"
                >
                  Staff Login
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Chat widget — always visible on public pages */}
        <ChatWidget />

        {/* Custom Design Modal — triggered by context */}
        <CustomDesignModal />

        {/* Auth Modal */}
        <AuthModal />
      </div>
    </DesignModalProvider>
  );
}

// ── Exported Layout wraps with all required providers ────────────────────────

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <AuthModalProvider>
          <CustomizationModalProvider>
            <LayoutInner />
          </CustomizationModalProvider>
        </AuthModalProvider>
      </CartProvider>
    </AuthProvider>
  );
}
