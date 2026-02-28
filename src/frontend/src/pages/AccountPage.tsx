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
import { useGetAllOrders, useGetAllProducts } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Package,
  Save,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export default function AccountPage() {
  const { currentUser, isLoggedIn, logout, updateProfile } = useAuth();
  const { openModal } = useAuthModal();
  const { data: allOrders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: allProducts = [] } = useGetAllProducts();

  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [address, setAddress] = useState(currentUser?.address ?? "");
  const [saving, setSaving] = useState(false);

  // Filter orders by current user email
  const myOrders = allOrders.filter(
    (o) => o.email.toLowerCase() === currentUser?.email?.toLowerCase(),
  );

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
            </div>

            {/* Order History */}
            <div className="lg:col-span-2">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
