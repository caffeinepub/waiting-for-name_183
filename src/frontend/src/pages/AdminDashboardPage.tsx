import type { Order, PortfolioItem, Product } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  useGetAboutUs,
  useGetAllOrders,
  useGetAllPortfolioItems,
  useGetAllProducts,
  useGetShippingInfo,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  FileText,
  Loader2,
  LogOut,
  Package,
  Palette,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  "Business Cards",
  "Photo Books",
  "Coffee Mugs",
  "T-Shirts",
  "Sweaters",
  "Tumblers",
  "Event Invitations",
  "Sports Graphics",
  "Posters & Banners",
  "Stickers & Decals",
];

const PORTFOLIO_CATEGORIES = [
  "Brand Identity",
  "Print Design",
  "Apparel",
  "Event Design",
  "Photography",
  "Sports Graphics",
  "Custom Merchandise",
  "Social Media",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useGetAllProducts();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    category: "",
    price: "",
    imageUrl: "",
  };
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setForm(emptyForm);
    setShowAddDialog(true);
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: (Number(product.price) / 100).toFixed(2),
      imageUrl: product.imageUrl,
    });
    setEditProduct(product);
  }

  function closeDialogs() {
    setShowAddDialog(false);
    setEditProduct(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!actor || !form.name || !form.category || !form.price) return;
    setIsSubmitting(true);
    try {
      const priceCents = BigInt(
        Math.round(Number.parseFloat(form.price) * 100),
      );
      if (editProduct) {
        await actor.updateProduct(
          editProduct.id,
          form.name,
          form.description,
          priceCents,
          form.category,
          form.imageUrl,
        );
        toast.success("Product updated");
      } else {
        await actor.addProduct(
          form.name,
          form.description,
          priceCents,
          form.category,
          form.imageUrl,
        );
        toast.success("Product added");
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      closeDialogs();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!actor) return;
    if (!confirm("Delete this product?")) return;
    try {
      await actor.deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  const dialogOpen = showAddDialog || !!editProduct;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-mono">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openAdd} size="sm" className="font-mono">
          + Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No products yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">
                    Name
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Category
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Price
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id.toString()}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(product)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                          className="text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialogs()}
      >
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Custom Business Cards"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Product description..."
                className="bg-background/50 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Category *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Price (USD) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className="bg-background/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Image URL
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-background/50 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting || !form.name || !form.category || !form.price
              }
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Portfolio Tab ─────────────────────────────────────────────────────────────

function PortfolioTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useGetAllPortfolioItems();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    clientName: "",
  };
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setForm(emptyForm);
    setShowAddDialog(true);
  }

  function openEdit(item: PortfolioItem) {
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      clientName: item.clientName,
    });
    setEditItem(item);
  }

  function closeDialogs() {
    setShowAddDialog(false);
    setEditItem(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!actor || !form.title || !form.category) return;
    setIsSubmitting(true);
    try {
      if (editItem) {
        await actor.updatePortfolioItem(
          editItem.id,
          form.title,
          form.description,
          form.category,
          form.imageUrl,
          form.clientName,
        );
        toast.success("Portfolio item updated");
      } else {
        await actor.addPortfolioItem(
          form.title,
          form.description,
          form.category,
          form.imageUrl,
          form.clientName,
        );
        toast.success("Portfolio item added");
      }
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      closeDialogs();
    } catch {
      toast.error("Failed to save portfolio item");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!actor) return;
    if (!confirm("Delete this portfolio item?")) return;
    try {
      await actor.deletePortfolioItem(id);
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Portfolio item deleted");
    } catch {
      toast.error("Failed to delete portfolio item");
    }
  }

  const dialogOpen = showAddDialog || !!editItem;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-mono">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openAdd} size="sm" className="font-mono">
          + Add Portfolio Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No portfolio items yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">
                    Title
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Category
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Client
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id.toString()}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.clientName || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(item)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialogs()}
      >
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Title *
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Retro Sports Logo Design"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Project description..."
                className="bg-background/50 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Category *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTFOLIO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Client Name
                </Label>
                <Input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientName: e.target.value }))
                  }
                  placeholder="Client or brand name"
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Image URL
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-background/50 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !form.title || !form.category}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const { data: orders = [], isLoading } = useGetAllOrders();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-mono">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">
                    Order #
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Email
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Shipping Address
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase">
                    Items
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.id.toString()}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.email}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {order.shippingAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────

function ContentTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: aboutUs = "", isLoading: loadingAbout } = useGetAboutUs();
  const { data: shippingInfo = "", isLoading: loadingShipping } =
    useGetShippingInfo();

  const [aboutText, setAboutText] = useState("");
  const [shippingText, setShippingText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);

  // Sync fetched data into local state
  useEffect(() => {
    if (aboutUs) setAboutText(aboutUs);
  }, [aboutUs]);

  useEffect(() => {
    if (shippingInfo) setShippingText(shippingInfo);
  }, [shippingInfo]);

  async function handleSaveAbout() {
    if (!actor) return;
    setSavingAbout(true);
    try {
      await actor.updateAboutUs(aboutText);
      await queryClient.invalidateQueries({ queryKey: ["aboutUs"] });
      toast.success("About Us updated");
    } catch {
      toast.error("Failed to save About Us");
    } finally {
      setSavingAbout(false);
    }
  }

  async function handleSaveShipping() {
    if (!actor) return;
    setSavingShipping(true);
    try {
      await actor.updateShippingInfo(shippingText);
      await queryClient.invalidateQueries({ queryKey: ["shippingInfo"] });
      toast.success("Shipping Info updated");
    } catch {
      toast.error("Failed to save Shipping Info");
    } finally {
      setSavingShipping(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* About Us */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider">
            About Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAbout ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <Textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="min-h-[200px] bg-background/50 text-sm"
              placeholder="Write your About Us content here..."
            />
          )}
          <Button
            onClick={handleSaveAbout}
            disabled={savingAbout || loadingAbout}
            className="w-full font-mono"
          >
            {savingAbout ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save About Us
          </Button>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider">
            Shipping Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingShipping ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <Textarea
              value={shippingText}
              onChange={(e) => setShippingText(e.target.value)}
              className="min-h-[200px] bg-background/50 text-sm"
              placeholder="Write your Shipping Info content here..."
            />
          )}
          <Button
            onClick={handleSaveShipping}
            disabled={savingShipping || loadingShipping}
            className="w-full font-mono"
          >
            {savingShipping ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Shipping Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("megatrx_admin") !== "true") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("megatrx_admin");
    navigate({ to: "/admin" });
  }

  // Don't render dashboard if not authenticated
  if (localStorage.getItem("megatrx_admin") !== "true") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold tracking-tighter">
                MEGA<span className="text-primary">TRX</span>
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
                Admin
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-mono text-xs gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Manage your MEGATRX content
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-card border border-border h-auto p-1">
            <TabsTrigger
              value="products"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
