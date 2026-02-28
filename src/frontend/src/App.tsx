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
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
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
