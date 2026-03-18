import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { usePremiumCredits } from "@/hooks/usePremiumCredits";
import { useGetAllOrders, useGetAllProducts } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Crown,
  Loader2,
  LogOut,
  Package,
  Paintbrush,
  Save,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DesignRequest {
  id: string;
  name: string;
  email: string;
  description: string;
  status: string;
  createdAt: string;
}

function getMyDesignRequests(email: string): DesignRequest[] {
  try {
    const raw = localStorage.getItem("megatrx_local_design_requests");
    if (!raw) return [];
    const all = JSON.parse(raw) as DesignRequest[];
    return all.filter((r) => r.email?.toLowerCase() === email.toLowerCase());
  } catch {
    return [];
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "processing":
      return <Package className="w-3.5 h-3.5 text-yellow-400" />;
    case "shipped":
      return <Truck className="w-3.5 h-3.5 text-blue-400" />;
    case "delivered":
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
    case "cancelled":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    default:
      return <Package className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "processing":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "shipped":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "delivered":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getRequestStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "in progress":
    case "inprogress":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function AccountPage() {
  const { currentUser, isLoggedIn, logout, updateProfile } = useAuth();
  const { openModal } = useAuthModal();
  const { data: allOrders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: allProducts = [] } = useGetAllProducts();

  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [address, setAddress] = useState(currentUser?.address ?? "");
  const [saving, setSaving] = useState(false);
  const { isAdmin, balance, tier } = usePremiumCredits();

  // Filter orders by current user email
  const myOrders = allOrders.filter(
    (o) => o.email.toLowerCase() === currentUser?.email?.toLowerCase(),
  );

  // Design requests from localStorage
  const myDesignRequests = currentUser?.email
    ? getMyDesignRequests(currentUser.email)
    : [];

  function getOrderTotal(order: {
    items: Array<{ productId: bigint; quantity: bigint }>;
  }) {
    return order.items.reduce((sum, item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      if (!product) return sum;
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateProfile({ name, phone, address });
    setSaving(false);
    toast.success("Profile updated!");
  }

  if (!isLoggedIn) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-8 font-body">
            Please sign in to view your account and order history.
          </p>
          <Button size="lg" onClick={() => openModal("signin")}>
            Sign In / Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-2">
                My Account
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                {currentUser?.email}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              onClick={logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile */}
            <div>
              <Card className="border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Full Name
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        value={currentUser?.email ?? ""}
                        disabled
                        className="opacity-60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Phone
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 555-5555"
                        type="tel"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs uppercase text-muted-foreground">
                        Default Address
                      </Label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, State ZIP"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-2 border-amber-400/30 bg-amber-400/5 mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    TRX AI Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAdmin ? (
                    <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-lg px-3 py-2 w-full">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-400 font-mono uppercase">
                          Admin — Free
                        </p>
                        <p className="text-xs text-amber-400/70">
                          Unlimited credits
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          Balance
                        </span>
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {balance === Number.POSITIVE_INFINITY ? "∞" : balance}{" "}
                          credits
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          Tier
                        </span>
                        <span className="capitalize text-sm font-mono text-primary">
                          {tier}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Orders + Design Requests */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order History */}
              <Card className="border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Order History
                    {myOrders.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({myOrders.length} order
                        {myOrders.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : myOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-mono text-sm mb-4">No orders yet</p>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/shop">Browse Shop</Link>
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono text-xs uppercase">
                            Order #
                          </TableHead>
                          <TableHead className="font-mono text-xs uppercase">
                            Date
                          </TableHead>
                          <TableHead className="font-mono text-xs uppercase">
                            Status
                          </TableHead>
                          <TableHead className="font-mono text-xs uppercase text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myOrders.map((order) => (
                          <TableRow key={order.id.toString()}>
                            <TableCell>
                              <Link
                                to="/order/$orderId"
                                params={{ orderId: order.id.toString() }}
                                className="font-mono text-xs text-primary hover:underline"
                              >
                                #{order.id.toString()}
                              </Link>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-mono border px-2 py-0.5 rounded-full ${getStatusClass(order.status)}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${(getOrderTotal(order) / 100).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Design Requests */}
              <Card className="border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-primary" />
                    Design Requests
                    {myDesignRequests.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({myDesignRequests.length} request
                        {myDesignRequests.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {myDesignRequests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Paintbrush className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-mono text-sm mb-4">
                        No design requests yet
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/">Request a Custom Design</Link>
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono text-xs uppercase">
                            Request
                          </TableHead>
                          <TableHead className="font-mono text-xs uppercase">
                            Date
                          </TableHead>
                          <TableHead className="font-mono text-xs uppercase">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myDesignRequests.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>
                              <p className="text-sm font-medium truncate max-w-[200px]">
                                {req.description || "Custom Design Request"}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {req.createdAt
                                ? new Date(req.createdAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-mono border px-2 py-0.5 rounded-full ${getRequestStatusClass(req.status || "pending")}`}
                              >
                                {(req.status || "Pending")
                                  .charAt(0)
                                  .toUpperCase() +
                                  (req.status || "pending").slice(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
