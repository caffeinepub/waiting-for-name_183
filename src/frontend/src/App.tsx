import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CartPage from "./pages/CartPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import DesignToolsPage from "./pages/DesignToolsPage";
import HelpPage from "./pages/HelpPage";
import HomePage from "./pages/HomePage";
import OrderReceiptPage from "./pages/OrderReceiptPage";
import PortfolioPage from "./pages/PortfolioPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShippingPage from "./pages/ShippingPage";
import ShopPage from "./pages/ShopPage";

// Root route that just renders an Outlet (no layout)
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public layout route — wraps all public pages with nav/footer
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

const portfolioRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/portfolio",
  component: PortfolioPage,
});

const shopRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/shop",
  component: ShopPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/shop/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/cart",
  component: CartPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/about",
  component: AboutPage,
});

const shippingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/shipping",
  component: ShippingPage,
});

const orderReceiptRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/order/$orderId",
  component: OrderReceiptPage,
});

const accountRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/account",
  component: AccountPage,
});

const helpRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/help",
  component: HelpPage,
});

const designToolsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/design-tools",
  component: DesignToolsPage,
});

const checkoutSuccessRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/checkout/success",
  component: CheckoutSuccessPage,
});

const checkoutCancelRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/checkout/cancel",
  component: CheckoutCancelPage,
});

// Admin routes — no main nav/footer wrapper
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    indexRoute,
    portfolioRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    aboutRoute,
    shippingRoute,
    orderReceiptRoute,
    accountRoute,
    helpRoute,
    designToolsRoute,
    checkoutSuccessRoute,
    checkoutCancelRoute,
  ]),
  adminLoginRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
