import type {
  CustomDesignRequest,
  Order,
  PortfolioItem,
  Product,
} from "@/backend";
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
  useDeleteCustomDesignRequest,
  useGetAboutUs,
  useGetAllCustomDesignRequests,
  useGetAllOrders,
  useGetAllPortfolioItems,
  useGetAllProducts,
  useGetShippingInfo,
  useUpdateCustomDesignRequestStatus,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellOff,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Package,
  Palette,
  Paperclip,
  PenTool,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
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

function getOrderStatusClass(status: string) {
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

function OrdersTab() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {},
  );

  async function handleUpdateStatus(
    order: Order,
    status: string,
    tracking?: string,
  ) {
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status,
        trackingNumber: tracking ?? order.trackingNumber ?? "",
      });
      toast.success(`Order #${order.id} updated`);
    } catch {
      toast.error("Failed to update order");
    }
  }

  async function handleMarkShipped(order: Order) {
    const tracking = trackingInputs[order.id.toString()] ?? "";
    if (!tracking.trim()) {
      toast.error("Please enter a tracking number first");
      return;
    }
    await handleUpdateStatus(order, "shipped", tracking.trim());
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-mono">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Card key={order.id.toString()} className="border-border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{order.id.toString()}
                    </span>
                    <span className="font-bold text-sm">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.email}
                    </span>
                    <span
                      className={`text-[10px] font-mono border px-1.5 py-0.5 rounded uppercase tracking-wider ${getOrderStatusClass(order.status)}`}
                    >
                      {order.status || "processing"}
                    </span>
                    {order.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-muted-foreground">
                    📍 {order.shippingAddress}
                  </p>

                  {/* Tracking + Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      className="h-8 text-xs font-mono w-48"
                      placeholder="Tracking number..."
                      value={
                        trackingInputs[order.id.toString()] ??
                        order.trackingNumber ??
                        ""
                      }
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [order.id.toString()]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1"
                      onClick={() => handleMarkShipped(order)}
                      disabled={updateStatus.isPending}
                    >
                      <Truck className="w-3 h-3" />
                      Mark Shipped
                    </Button>
                    <Select
                      value={order.status || "processing"}
                      onValueChange={(v) => handleUpdateStatus(order, v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px] bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────────────────────

function CampaignsTab() {
  const { data: orders = [] } = useGetAllOrders();

  const emails = [...new Set(orders.map((o) => o.email).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Email campaigns require an upgraded plan. To contact your customers
            directly, use the customer email addresses from the Orders tab.
          </p>
          {emails.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Customer Emails ({emails.length})
              </p>
              <div className="rounded-md bg-muted/50 border border-border p-3">
                <div className="space-y-1">
                  {emails.map((email) => (
                    <p key={email} className="text-sm font-mono select-all">
                      {email}
                    </p>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Click any email address above to select it for copying.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-mono">
              No customer emails yet — they'll appear here after the first
              order.
            </p>
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

// ─── Design Requests Tab ──────────────────────────────────────────────────────

function DesignRequestsTab() {
  const { data: requests = [], isLoading } = useGetAllCustomDesignRequests();
  const updateStatus = useUpdateCustomDesignRequestStatus();
  const deleteRequest = useDeleteCustomDesignRequest();

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  async function handleStatusChange(
    req: CustomDesignRequest,
    newStatus: string,
  ) {
    try {
      await updateStatus.mutateAsync({ id: req.id, status: newStatus });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(req: CustomDesignRequest) {
    if (!confirm(`Delete design request from ${req.customerName}?`)) return;
    try {
      await deleteRequest.mutateAsync(req.id);
      toast.success("Request deleted");
    } catch {
      toast.error("Failed to delete request");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-mono">
        {requests.length} request{requests.length !== 1 ? "s" : ""} total
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <PenTool className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No design requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id.toString()} className="border-border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-bold text-sm truncate">
                        {req.customerName}
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono">
                        {req.email}
                      </span>
                      {req.chatEscalation && (
                        <span className="text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Chat
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono border px-1.5 py-0.5 rounded uppercase tracking-wider ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {req.productType}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      {req.colorPreferences && (
                        <>
                          <span>•</span>
                          <span>Colors: {req.colorPreferences}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {req.description}
                    </p>

                    {req.fileUrls.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {req.fileUrls.map((file) => (
                          <span
                            key={`${req.id.toString()}-${file}`}
                            className="inline-flex items-center gap-1 text-xs font-mono bg-muted/50 border border-border rounded px-2 py-0.5"
                          >
                            <Paperclip className="w-3 h-3 text-muted-foreground" />
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={req.status}
                      onValueChange={(v) => handleStatusChange(req, v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px] bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(req)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

const PAYOUT_METHODS = [
  {
    id: "bank",
    label: "Bank Account",
    subtitle: "Direct Deposit",
    detail: "2 business days · Free",
    icon: Building2,
  },
  {
    id: "debit",
    label: "Debit Card",
    subtitle: "Instant Payout",
    detail: "Within minutes · 1.5% fee",
    icon: CreditCard,
  },
  {
    id: "manual",
    label: "Manual / Check",
    subtitle: "Self-Managed",
    detail: "Schedule payouts yourself",
    icon: FileText,
  },
] as const;

function PaymentsTab() {
  const [stripeLink, setStripeLink] = useState(
    () => localStorage.getItem("megatrx_stripe_link") ?? "",
  );
  const [savedStripeLink, setSavedStripeLink] = useState(
    () => localStorage.getItem("megatrx_stripe_link") ?? "",
  );
  const [stripePk, setStripePk] = useState(
    () => localStorage.getItem("megatrx_stripe_pk") ?? "",
  );
  const [savedStripePk, setSavedStripePk] = useState(
    () => localStorage.getItem("megatrx_stripe_pk") ?? "",
  );
  const [payoutMethod, setPayoutMethod] = useState(
    () => localStorage.getItem("megatrx_payout_method") ?? "bank",
  );
  const [savedPayoutMethod, setSavedPayoutMethod] = useState(
    () => localStorage.getItem("megatrx_payout_method") ?? "bank",
  );

  function handleSaveStripe() {
    localStorage.setItem("megatrx_stripe_link", stripeLink.trim());
    setSavedStripeLink(stripeLink.trim());
    toast.success("Stripe Payment Link saved");
  }

  function handleSaveStripePk() {
    localStorage.setItem("megatrx_stripe_pk", stripePk.trim());
    setSavedStripePk(stripePk.trim());
    toast.success("Apple Pay / Google Pay enabled");
  }

  function handleSavePayout() {
    localStorage.setItem("megatrx_payout_method", payoutMethod);
    setSavedPayoutMethod(payoutMethod);
    toast.success("Payout method saved");
  }

  const isConnected = savedStripeLink.length > 0;
  const applePayEnabled = savedStripePk.length > 0;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Section A1: Apple Pay / Google Pay */}
      <Card className="border-primary/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Apple Pay &amp; Google Pay
            </CardTitle>
            {applePayEnabled ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                Not Set Up
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste your Stripe <strong>Publishable Key</strong> (starts with{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
              pk_live_
            </code>{" "}
            or{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
              pk_test_
            </code>
            ) to show a native Apple Pay or Google Pay button at checkout. This
            key is <strong>safe</strong> to use in the browser — it is not your
            secret key.
          </p>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Stripe Publishable Key
            </Label>
            <Input
              value={stripePk}
              onChange={(e) => setStripePk(e.target.value)}
              placeholder="pk_live_..."
              className="bg-background/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Find it in{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Stripe Dashboard → Developers → API keys
              </a>
              . Copy the "Publishable key" (NOT the secret key).
            </p>
          </div>
          <Button
            onClick={handleSaveStripePk}
            disabled={stripePk.trim() === savedStripePk}
            className="font-mono"
          >
            Enable Apple Pay / Google Pay
          </Button>
          <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 border border-border space-y-1">
            <p className="font-semibold text-foreground">
              Requirements for Apple Pay:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Customer must be on Safari on iPhone, iPad, or Mac</li>
              <li>Customer must have a card saved in Apple Wallet</li>
              <li>
                Your Stripe account must have Apple Pay domain registered (done
                automatically for sites served over HTTPS)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Section A2: Stripe Connection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Stripe Payment Link (Card Checkout)
            </CardTitle>
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                Not Connected
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Stripe Payment Link URL
            </Label>
            <Input
              value={stripeLink}
              onChange={(e) => setStripeLink(e.target.value)}
              placeholder="https://buy.stripe.com/..."
              className="bg-background/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get this from{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                stripe.com
              </a>{" "}
              → Payment Links. Create one product called "MEGATRX Order" and
              paste the link here.
            </p>
          </div>
          <Button
            onClick={handleSaveStripe}
            disabled={stripeLink.trim() === savedStripeLink}
            className="font-mono"
          >
            Save Payment Link
          </Button>
        </CardContent>
      </Card>

      {/* Section B: Payout Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            How You Get Paid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select your payout method
          </p>
          <div className="space-y-3">
            {PAYOUT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = payoutMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPayoutMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {method.label}
                      <span className="ml-2 text-xs font-normal opacity-70">
                        {method.subtitle}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {method.detail}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 border border-border">
            To set up payouts, log into your Stripe dashboard at{" "}
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              dashboard.stripe.com
            </a>{" "}
            → Settings → Payouts and connect your bank account or debit card.
          </p>
          <Button
            onClick={handleSavePayout}
            disabled={payoutMethod === savedPayoutMethod}
            className="font-mono"
          >
            Save Payout Method
          </Button>
        </CardContent>
      </Card>

      {/* Section C: Setup Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              "Create a free Stripe account at stripe.com",
              "Go to Stripe Dashboard → Developers → API keys, copy your Publishable Key (pk_live_...)",
              "Paste the Publishable Key in the Apple Pay & Google Pay section above and click Enable",
              "Go to Payment Links and create a new link, name it 'MEGATRX Order'",
              "Paste the Payment Link URL in the Card Checkout section and click Save",
              "Connect your bank account in Stripe dashboard → Settings → Payouts",
              "Select your payout method above and click Save",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>(
      typeof Notification !== "undefined" ? Notification.permission : "default",
    );

  useEffect(() => {
    if (localStorage.getItem("megatrx_admin") !== "true") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("megatrx_admin");
    navigate({ to: "/admin" });
  }

  async function handleEnableNotifications() {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      toast.success(
        "Notifications enabled! You'll be notified for new orders.",
      );
      new Notification("MEGATRX Notifications Active", {
        body: "You'll now receive alerts for new orders.",
      });
    } else {
      toast.error("Notification permission denied.");
    }
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                className="font-mono text-xs gap-1.5"
                title="Enable browser notifications for new orders"
              >
                {notifPermission === "granted" ? (
                  <Bell className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <BellOff className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {notifPermission === "granted" ? "Alerts On" : "Alerts"}
                </span>
              </Button>
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
          <TabsList className="grid grid-cols-7 w-full max-w-4xl bg-card border border-border h-auto p-1">
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
              value="designs"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Designs</span>
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="font-mono text-xs uppercase tracking-wide py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Payments</span>
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

          <TabsContent value="designs">
            <DesignRequestsTab />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
