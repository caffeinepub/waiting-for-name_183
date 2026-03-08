import type { CustomDesignRequest, Order } from "@/backend";
import { ImageUploadField } from "@/components/ImageUploadField";
import { MultiImageUploadField } from "@/components/MultiImageUploadField";
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
  useGetAllCustomDesignRequests,
  useGetAllOrders,
  useGetHumanRequestCount,
  useGetIntegrationSettings,
  useGetNotificationEmail,
  useSetIntegrationSettings,
  useSetNotificationEmail,
} from "@/hooks/useQueries";
import { AIStudioTab } from "@/pages/DesignToolsPage";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Image,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Palette,
  Paperclip,
  PenTool,
  Printer,
  Send,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Local Storage Product/Portfolio Types ────────────────────────────────────

interface LocalProduct {
  id: string;
  name: string;
  description: string;
  price: number; // cents as number
  category: string;
  imageUrls: string[];
  stock: number;
  sizes?: string[];
}

interface LocalPortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  clientName: string;
}

function loadLocalProducts(): LocalProduct[] {
  try {
    const raw = localStorage.getItem("megatrx_products");
    if (!raw) return [];
    return JSON.parse(raw) as LocalProduct[];
  } catch {
    return [];
  }
}

function saveLocalProducts(products: LocalProduct[]) {
  localStorage.setItem("megatrx_products", JSON.stringify(products));
}

function loadLocalPortfolio(): LocalPortfolioItem[] {
  try {
    const raw = localStorage.getItem("megatrx_portfolio");
    if (!raw) return [];
    return JSON.parse(raw) as LocalPortfolioItem[];
  } catch {
    return [];
  }
}

function saveLocalPortfolio(items: LocalPortfolioItem[]) {
  localStorage.setItem("megatrx_portfolio", JSON.stringify(items));
}

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

function formatPriceCents(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

// ─── Products Tab (localStorage-backed) ──────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<LocalProduct[]>(() =>
    loadLocalProducts(),
  );

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<LocalProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    category: "",
    price: "",
    imageUrls: [] as string[],
    stock: "0",
    sizesInput: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);

  function openAdd() {
    setForm(emptyForm);
    setCategoryInput("");
    setShowAddDialog(true);
  }

  function openEdit(product: LocalProduct) {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: (product.price / 100).toFixed(2),
      imageUrls: product.imageUrls,
      stock: product.stock.toString(),
      sizesInput: product.sizes?.join(", ") ?? "",
    });
    setCategoryInput(product.category);
    setEditProduct(product);
  }

  function closeDialogs() {
    setShowAddDialog(false);
    setEditProduct(null);
    setForm(emptyForm);
    setCategoryInput("");
  }

  function handleSave() {
    if (!form.name || !form.category || !form.price) return;
    setIsSubmitting(true);
    try {
      const priceCents = Math.round(Number.parseFloat(form.price) * 100);
      const stockQty = Math.max(
        0,
        Math.round(Number.parseInt(form.stock, 10) || 0),
      );
      const sizes = form.sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editProduct) {
        const updated = products.map((p) =>
          p.id === editProduct.id
            ? {
                ...p,
                name: form.name,
                description: form.description,
                category: form.category,
                price: priceCents,
                imageUrls: form.imageUrls,
                stock: stockQty,
                sizes,
              }
            : p,
        );
        saveLocalProducts(updated);
        setProducts(updated);
        toast.success("Product updated");
      } else {
        const newProduct: LocalProduct = {
          id: Date.now().toString(),
          name: form.name,
          description: form.description,
          category: form.category,
          price: priceCents,
          imageUrls: form.imageUrls,
          stock: stockQty,
          sizes,
        };
        const updated = [...products, newProduct];
        saveLocalProducts(updated);
        setProducts(updated);
        toast.success("Product added");
      }
      closeDialogs();
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveLocalProducts(updated);
    setProducts(updated);
    toast.success("Product deleted");
  }

  const dialogOpen = showAddDialog || !!editProduct;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-mono">
          {products.length} product{products.length !== 1 ? "s" : ""}
          <span className="ml-2 text-xs text-primary">(saved locally)</span>
        </p>
        <Button
          onClick={openAdd}
          size="sm"
          className="font-mono"
          data-ocid="products.open_modal_button"
        >
          + Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="products.empty_state"
            >
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No products yet</p>
              <p className="font-mono text-xs mt-1 opacity-60">
                Click + Add Product to get started
              </p>
            </div>
          ) : (
            <Table data-ocid="products.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase w-12">
                    Img
                  </TableHead>
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
                {products.map((product, idx) => {
                  const thumb =
                    product.imageUrls.length > 0
                      ? product.imageUrls[0]
                      : undefined;
                  return (
                    <TableRow
                      key={product.id}
                      data-ocid={`products.item.${idx + 1}`}
                    >
                      <TableCell>
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted border border-border shrink-0">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[160px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatPriceCents(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(product)}
                            className="text-xs"
                            data-ocid="products.edit_button"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                            className="text-xs"
                            data-ocid="products.delete_button"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="products.dialog"
        >
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
                data-ocid="products.input"
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
                data-ocid="products.textarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Category *
                </Label>
                <Input
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setForm((f) => ({ ...f, category: e.target.value }));
                    setShowCatSuggestions(true);
                  }}
                  onFocus={() => setShowCatSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCatSuggestions(false), 150)
                  }
                  placeholder="Select or type..."
                  className="bg-background/50"
                />
                {showCatSuggestions && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {PRODUCT_CATEGORIES.filter(
                      (c) =>
                        !categoryInput ||
                        c.toLowerCase().includes(categoryInput.toLowerCase()),
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors font-mono"
                        onMouseDown={() => {
                          setCategoryInput(cat);
                          setForm((f) => ({ ...f, category: cat }));
                          setShowCatSuggestions(false);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
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
                  data-ocid="products.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Stock / Inventory
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                placeholder="0"
                className="bg-background/50 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Sizes / Variants (comma-separated, optional)
              </Label>
              <Input
                value={form.sizesInput}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sizesInput: e.target.value }))
                }
                placeholder="e.g. iPhone 13, iPhone 14, iPhone 15 Pro — or S, M, L, XL"
                className="bg-background/50"
                data-ocid="products.input"
              />
              <p className="text-xs text-muted-foreground font-mono">
                Leave blank if this product has no size options
              </p>
            </div>

            <MultiImageUploadField
              label="Product Images"
              values={form.imageUrls}
              onChange={(urls) => setForm((f) => ({ ...f, imageUrls: urls }))}
              maxImages={8}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeDialogs}
              data-ocid="products.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting || !form.name || !form.category || !form.price
              }
              data-ocid="products.save_button"
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

// ─── Portfolio Tab (localStorage-backed) ──────────────────────────────────────

function PortfolioTab() {
  const [items, setItems] = useState<LocalPortfolioItem[]>(() =>
    loadLocalPortfolio(),
  );

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<LocalPortfolioItem | null>(null);
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

  function openEdit(item: LocalPortfolioItem) {
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

  function handleSave() {
    if (!form.title || !form.category) return;
    setIsSubmitting(true);
    try {
      if (editItem) {
        const updated = items.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                title: form.title,
                description: form.description,
                category: form.category,
                imageUrl: form.imageUrl,
                clientName: form.clientName,
              }
            : i,
        );
        saveLocalPortfolio(updated);
        setItems(updated);
        toast.success("Portfolio item updated");
      } else {
        const newItem: LocalPortfolioItem = {
          id: Date.now().toString(),
          title: form.title,
          description: form.description,
          category: form.category,
          imageUrl: form.imageUrl,
          clientName: form.clientName,
        };
        const updated = [...items, newItem];
        saveLocalPortfolio(updated);
        setItems(updated);
        toast.success("Portfolio item added");
      }
      closeDialogs();
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this portfolio item?")) return;
    const updated = items.filter((i) => i.id !== id);
    saveLocalPortfolio(updated);
    setItems(updated);
    toast.success("Portfolio item deleted");
  }

  const dialogOpen = showAddDialog || !!editItem;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-mono">
          {items.length} item{items.length !== 1 ? "s" : ""}
          <span className="ml-2 text-xs text-primary">(saved locally)</span>
        </p>
        <Button
          onClick={openAdd}
          size="sm"
          className="font-mono"
          data-ocid="portfolio.open_modal_button"
        >
          + Add Portfolio Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="portfolio.empty_state"
            >
              <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No portfolio items yet</p>
              <p className="font-mono text-xs mt-1 opacity-60">
                Click + Add Portfolio Item to get started
              </p>
            </div>
          ) : (
            <Table data-ocid="portfolio.table">
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
                {items.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    data-ocid={`portfolio.item.${idx + 1}`}
                  >
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
                          data-ocid="portfolio.edit_button"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs"
                          data-ocid="portfolio.delete_button"
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
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="portfolio.dialog"
        >
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
                data-ocid="portfolio.input"
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
                data-ocid="portfolio.textarea"
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

            <ImageUploadField
              label="Portfolio Image"
              value={form.imageUrl}
              onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeDialogs}
              data-ocid="portfolio.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !form.title || !form.category}
              data-ocid="portfolio.save_button"
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useGetAllOrders();
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {},
  );

  async function handleUpdateStatus(
    order: Order,
    status: string,
    tracking?: string,
  ) {
    try {
      if (actor) {
        await actor.updateOrderStatus(
          order.id,
          status,
          tracking ?? order.trackingNumber ?? "",
        );
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success(`Order #${order.id} updated`);
      } else {
        // Save locally if no actor
        const localStatuses = JSON.parse(
          localStorage.getItem("megatrx_order_status") ?? "{}",
        ) as Record<string, string>;
        localStatuses[order.id.toString()] = status;
        localStorage.setItem(
          "megatrx_order_status",
          JSON.stringify(localStatuses),
        );
        toast.success("Order status saved locally");
      }
    } catch {
      // Backend call failed — save locally
      const localStatuses = JSON.parse(
        localStorage.getItem("megatrx_order_status") ?? "{}",
      ) as Record<string, string>;
      localStatuses[order.id.toString()] = status;
      localStorage.setItem(
        "megatrx_order_status",
        JSON.stringify(localStatuses),
      );
      toast.success("Order status saved locally");
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
        <div
          className="flex items-center justify-center py-12"
          data-ocid="orders.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent
            className="py-12 text-center text-muted-foreground"
            data-ocid="orders.empty_state"
          >
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order, idx) => (
            <Card
              key={order.id.toString()}
              className="border-border"
              data-ocid={`orders.item.${idx + 1}`}
            >
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
                      data-ocid="orders.input"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1"
                      onClick={() => handleMarkShipped(order)}
                      data-ocid="orders.primary_button"
                    >
                      <Truck className="w-3 h-3" />
                      Mark Shipped
                    </Button>
                    <Select
                      value={order.status || "processing"}
                      onValueChange={(v) => handleUpdateStatus(order, v)}
                    >
                      <SelectTrigger
                        className="h-8 text-xs w-[130px] bg-background/50"
                        data-ocid="orders.select"
                      >
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

// ─── Chat Sessions Tab ────────────────────────────────────────────────────────

function ChatSessionsTab() {
  const { data: requests = [], isLoading } = useGetAllCustomDesignRequests();

  // Filter only chat escalations
  const chatSessions = requests.filter((r) => r.chatEscalation);

  // Load saved replies from localStorage
  const [replies, setReplies] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("megatrx_chat_replies");
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});

  function saveReply(id: string) {
    const text = draftReplies[id] ?? "";
    const updated = { ...replies, [id]: text };
    localStorage.setItem("megatrx_chat_replies", JSON.stringify(updated));
    setReplies(updated);
    toast.success("Reply saved");
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground font-mono">
          {chatSessions.length} chat escalation
          {chatSessions.length !== 1 ? "s" : ""}
        </p>
        {chatSessions.filter((r) => r.status === "pending").length > 0 && (
          <span className="text-xs font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
            {chatSessions.filter((r) => r.status === "pending").length} pending
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          data-ocid="chat.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : chatSessions.length === 0 ? (
        <Card data-ocid="chat.empty_state">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No chat escalations yet</p>
            <p className="text-xs mt-2 opacity-60">
              When customers click "Talk to a human" in the chat widget, their
              requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chatSessions.map((req, idx) => {
            const idStr = req.id.toString();
            const savedReply = replies[idStr];
            const draftText = draftReplies[idStr] ?? savedReply ?? "";

            return (
              <Card
                key={idStr}
                className="border-orange-500/30"
                data-ocid={`chat.item.${idx + 1}`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base">
                          {req.customerName}
                        </h4>
                        <a
                          href={`mailto:${req.email}`}
                          className="text-sm text-primary underline underline-offset-2 font-mono hover:text-primary/80"
                        >
                          {req.email}
                        </a>
                        <span
                          className={`text-[10px] font-mono border px-1.5 py-0.5 rounded uppercase tracking-wider ${getStatusColor(req.status)}`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{new Date(req.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>Product: {req.productType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs font-mono"
                        onClick={() => {
                          const subject = encodeURIComponent(
                            "Re: Your MEGATRX Request",
                          );
                          const body = encodeURIComponent(
                            `Hi ${req.customerName},\n\nThank you for reaching out to MEGATRX!\n\n`,
                          );
                          window.open(
                            `mailto:${req.email}?subject=${subject}&body=${body}`,
                          );
                        }}
                        data-ocid="chat.primary_button"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send Email
                      </Button>
                    </div>
                  </div>

                  {/* Chat Transcript */}
                  <div className="bg-muted/40 border border-border rounded-md p-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Chat Transcript
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {req.description || "No transcript available."}
                    </p>
                  </div>

                  {/* File attachments */}
                  {req.fileUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {req.fileUrls.map((file) => (
                        <span
                          key={`${idStr}-${file}`}
                          className="inline-flex items-center gap-1 text-xs font-mono bg-muted/50 border border-border rounded px-2 py-0.5"
                        >
                          <Paperclip className="w-3 h-3 text-muted-foreground" />
                          {file}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Saved reply display */}
                  {savedReply && (
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                      <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                        Your Saved Reply
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {savedReply}
                      </p>
                    </div>
                  )}

                  {/* Quick reply */}
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase text-muted-foreground">
                      Quick Reply
                    </Label>
                    <Textarea
                      value={draftText}
                      onChange={(e) =>
                        setDraftReplies((prev) => ({
                          ...prev,
                          [idStr]: e.target.value,
                        }))
                      }
                      placeholder="Type your reply here..."
                      className="bg-background/50 min-h-[80px] text-sm resize-none"
                      data-ocid="chat.textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveReply(idStr)}
                        className="gap-1.5 font-mono text-xs"
                        data-ocid="chat.save_button"
                      >
                        Save Reply
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent(
                            "Re: Your MEGATRX Request",
                          );
                          const body = encodeURIComponent(
                            draftText ||
                              `Hi ${req.customerName},\n\nThank you for reaching out to MEGATRX!\n\n`,
                          );
                          window.open(
                            `mailto:${req.email}?subject=${subject}&body=${body}`,
                          );
                        }}
                        className="gap-1.5 font-mono text-xs"
                        data-ocid="chat.primary_button"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply via Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
            ) to show a native Apple Pay or Google Pay button at checkout.
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
              data-ocid="payments.input"
            />
          </div>
          <Button
            onClick={handleSaveStripePk}
            disabled={stripePk.trim() === savedStripePk}
            className="font-mono"
            data-ocid="payments.primary_button"
          >
            Enable Apple Pay / Google Pay
          </Button>
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
              data-ocid="payments.input"
            />
          </div>
          <Button
            onClick={handleSaveStripe}
            disabled={stripeLink.trim() === savedStripeLink}
            className="font-mono"
            data-ocid="payments.save_button"
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
                  data-ocid="payments.toggle"
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
          <Button
            onClick={handleSavePayout}
            disabled={payoutMethod === savedPayoutMethod}
            className="font-mono"
            data-ocid="payments.save_button"
          >
            Save Payout Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Printify Tab ─────────────────────────────────────────────────────────────

function PrintifyTab() {
  const { data: settings, isLoading } = useGetIntegrationSettings();
  const setSettings = useSetIntegrationSettings();

  const [apiKey, setApiKey] = useState("");
  const [shopId, setShopId] = useState("");
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [importStatus, setImportStatus] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.printifyApiKey || "");
      setShopId(settings.printifyShopId || "");
    }
  }, [settings]);

  async function handleSave() {
    if (!settings) return;
    try {
      await setSettings.mutateAsync({
        printifyApiKey: apiKey.trim(),
        printifyShopId: shopId.trim(),
        shopifyDomain: settings.shopifyDomain,
        shopifyApiToken: settings.shopifyApiToken,
      });
      toast.success("Printify credentials saved");
    } catch {
      toast.error("Failed to save credentials");
    }
  }

  async function handleTestConnection() {
    if (!apiKey.trim()) {
      toast.error("Enter your API key first");
      return;
    }
    setTestStatus("testing");
    try {
      const res = await fetch("https://api.printify.com/v1/shops.json", {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (res.ok) {
        setTestStatus("success");
        toast.success("Printify connection successful!");
      } else {
        setTestStatus("error");
        toast.error("Connection failed. Check your API key.");
      }
    } catch {
      setTestStatus("error");
      toast.error(
        "CORS error — Printify requires server-side calls. Save your key and contact support.",
      );
    }
  }

  async function handleImportProducts() {
    if (!apiKey.trim() || !shopId.trim()) {
      toast.error("Enter both API key and Shop ID first");
      return;
    }
    setIsImporting(true);
    setImportStatus("Fetching products from Printify...");
    try {
      const res = await fetch(
        `https://api.printify.com/v1/shops/${shopId.trim()}/products.json`,
        { headers: { Authorization: `Bearer ${apiKey.trim()}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const products = (data.data ?? data ?? []) as Array<{
        title?: string;
        description?: string;
        images?: Array<{ src: string }>;
        variants?: Array<{ price?: number }>;
        tags?: string[];
      }>;
      setImportStatus(`Importing ${products.length} products...`);
      const existing = loadLocalProducts();
      let imported = 0;
      for (const p of products.slice(0, 20)) {
        const images = (p.images ?? []).map((img) => img.src).slice(0, 4);
        const price = p.variants?.[0]?.price ?? 2500;
        const newProduct: LocalProduct = {
          id: `printify_${Date.now()}_${imported}`,
          name: p.title ?? "Printify Product",
          description: p.description ?? "",
          price: Math.round(price),
          category: p.tags?.[0] ?? "Custom Merchandise",
          imageUrls: images,
          stock: 100,
        };
        existing.push(newProduct);
        imported++;
      }
      saveLocalProducts(existing);
      setImportStatus(`✓ Imported ${imported} products successfully!`);
      toast.success(`Imported ${imported} products from Printify`);
    } catch {
      setImportStatus("");
      toast.error(
        "Printify import failed. CORS restrictions may prevent browser-side API calls.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  const isConnected = !!settings?.printifyApiKey;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              Printify Integration
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
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Printify API Key
                </Label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Printify API key..."
                  type="password"
                  className="bg-background/50 font-mono text-sm"
                  data-ocid="printify.input"
                />
                <p className="text-xs text-muted-foreground">
                  Find at{" "}
                  <a
                    href="https://printify.com/app/account/connections"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Printify → Account → Connections → API
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Printify Shop ID
                </Label>
                <Input
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="bg-background/50 font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSave}
                  disabled={setSettings.isPending}
                  className="font-mono"
                  data-ocid="printify.save_button"
                >
                  {setSettings.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Credentials
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing" || !apiKey.trim()}
                  className="font-mono gap-2"
                  data-ocid="printify.secondary_button"
                >
                  {testStatus === "testing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : testStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  Test Connection
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Import Products from Printify
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Import products directly from your Printify shop into your MEGATRX
            catalog. Imported products are saved locally and appear in your
            shop.
          </p>
          <Button
            onClick={handleImportProducts}
            disabled={isImporting || !apiKey.trim() || !shopId.trim()}
            className="font-mono gap-2"
            data-ocid="printify.primary_button"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            {isImporting ? "Importing..." : "Import Products from Printify"}
          </Button>
          {importStatus && (
            <p
              className="text-sm font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded p-3"
              data-ocid="printify.success_state"
            >
              {importStatus}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Printful Tab (NEW) ───────────────────────────────────────────────────────

function PrintfulTab() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("megatrx_printful_key") ?? "",
  );
  const [shopId, setShopId] = useState(
    () => localStorage.getItem("megatrx_printful_shopid") ?? "",
  );
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [importStatus, setImportStatus] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  function handleSave() {
    localStorage.setItem("megatrx_printful_key", apiKey.trim());
    localStorage.setItem("megatrx_printful_shopid", shopId.trim());
    toast.success("Printful credentials saved");
  }

  async function handleTestConnection() {
    if (!apiKey.trim()) {
      toast.error("Enter your API key first");
      return;
    }
    setTestStatus("testing");
    try {
      const res = await fetch("https://api.printful.com/store", {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (res.ok) {
        setTestStatus("success");
        toast.success("Printful connection successful!");
      } else {
        setTestStatus("error");
        toast.error("Connection failed. Check your API key.");
      }
    } catch {
      setTestStatus("error");
      toast.error(
        "CORS error — Printful API may require server-side calls. Save your key and contact support.",
      );
    }
  }

  async function handleImportProducts() {
    if (!apiKey.trim()) {
      toast.error("Enter your API key first");
      return;
    }
    setIsImporting(true);
    setImportStatus("Fetching products from Printful...");
    try {
      const url = shopId.trim()
        ? `https://api.printful.com/store/products?store_id=${shopId.trim()}`
        : "https://api.printful.com/store/products";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const products = (data.result ?? []) as Array<{
        name?: string;
        thumbnail_url?: string;
        variants?: Array<{ retail_price?: string }>;
      }>;
      setImportStatus(`Importing ${products.length} products...`);
      const existing = loadLocalProducts();
      let imported = 0;
      for (const p of products.slice(0, 20)) {
        const priceStr = p.variants?.[0]?.retail_price ?? "25.00";
        const price = Math.round(Number.parseFloat(priceStr) * 100);
        const newProduct: LocalProduct = {
          id: `printful_${Date.now()}_${imported}`,
          name: p.name ?? "Printful Product",
          description: "",
          price: price > 0 ? price : 2500,
          category: "Custom Merchandise",
          imageUrls: p.thumbnail_url ? [p.thumbnail_url] : [],
          stock: 100,
        };
        existing.push(newProduct);
        imported++;
      }
      saveLocalProducts(existing);
      setImportStatus(`✓ Imported ${imported} products successfully!`);
      toast.success(`Imported ${imported} products from Printful`);
    } catch {
      setImportStatus("");
      toast.error(
        "Printful import failed. CORS restrictions may prevent browser-side API calls.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  const isConnected = !!localStorage.getItem("megatrx_printful_key");

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              Printful Integration
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
              Printful API Key
            </Label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Printful API key..."
              type="password"
              className="bg-background/50 font-mono text-sm"
              data-ocid="printful.input"
            />
            <p className="text-xs text-muted-foreground">
              Find at{" "}
              <a
                href="https://www.printful.com/dashboard/settings/stores"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Printful → Dashboard → Settings → API
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Store ID (optional)
            </Label>
            <Input
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="e.g. 123456 (leave blank for default store)"
              className="bg-background/50 font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              className="font-mono"
              data-ocid="printful.save_button"
            >
              Save Credentials
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !apiKey.trim()}
              className="font-mono gap-2"
              data-ocid="printful.secondary_button"
            >
              {testStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : testStatus === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Import Products from Printful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Import products directly from your Printful catalog into your
            MEGATRX shop. Products are saved locally and displayed to customers.
          </p>
          <Button
            onClick={handleImportProducts}
            disabled={isImporting || !apiKey.trim()}
            className="font-mono gap-2"
            data-ocid="printful.primary_button"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            {isImporting ? "Importing..." : "Import Products from Printful"}
          </Button>
          {importStatus && (
            <p
              className="text-sm font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded p-3"
              data-ocid="printful.success_state"
            >
              {importStatus}
            </p>
          )}
          <div className="p-3 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Note about CORS:</p>
            <p>
              Browser security may block direct Printful API calls. If import
              fails, save your API key and reach out for server-side sync
              assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Integrations Tab (Shopify) ───────────────────────────────────────────────

function IntegrationsTab() {
  const { data: settings, isLoading } = useGetIntegrationSettings();
  const setSettings = useSetIntegrationSettings();

  const [shopifyDomain, setShopifyDomain] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");

  useEffect(() => {
    if (settings) {
      setShopifyDomain(settings.shopifyDomain || "");
      setShopifyToken(settings.shopifyApiToken || "");
    }
  }, [settings]);

  async function handleSaveShopify() {
    if (!settings) return;
    try {
      await setSettings.mutateAsync({
        printifyApiKey: settings.printifyApiKey,
        printifyShopId: settings.printifyShopId,
        shopifyDomain: shopifyDomain.trim(),
        shopifyApiToken: shopifyToken.trim(),
      });
      toast.success("Shopify credentials saved");
    } catch {
      toast.error("Failed to save credentials");
    }
  }

  const isConnected = !!(settings?.shopifyDomain && settings?.shopifyApiToken);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Shopify Integration
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
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Shopify Store Domain
                </Label>
                <Input
                  value={shopifyDomain}
                  onChange={(e) => setShopifyDomain(e.target.value)}
                  placeholder="mystore.myshopify.com"
                  className="bg-background/50 font-mono text-sm"
                  data-ocid="shopify.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Shopify Admin API Access Token
                </Label>
                <Input
                  value={shopifyToken}
                  onChange={(e) => setShopifyToken(e.target.value)}
                  placeholder="shpat_..."
                  type="password"
                  className="bg-background/50 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleSaveShopify}
                disabled={
                  setSettings.isPending ||
                  !shopifyDomain.trim() ||
                  !shopifyToken.trim()
                }
                className="font-mono"
                data-ocid="shopify.save_button"
              >
                {setSettings.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Shopify Credentials
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Content Tab (localStorage-backed) ────────────────────────────────────────

const SITE_TEXT_FIELDS = [
  {
    key: "hero_headline",
    label: "Home Page Headline",
    default: "Custom Designs That Stand Out",
    multiline: false,
  },
  {
    key: "hero_subheadline",
    label: "Home Page Sub-Headline",
    default:
      "From business cards to custom apparel — MEGATRX brings your vision to life.",
    multiline: true,
  },
  {
    key: "home_cta",
    label: "Main CTA Button Text",
    default: "Shop Custom Designs",
    multiline: false,
  },
  {
    key: "about_heading",
    label: "About Page Heading",
    default: "About MEGATRX",
    multiline: false,
  },
  {
    key: "shop_heading",
    label: "Shop Page Heading",
    default: "Our Products",
    multiline: false,
  },
  {
    key: "footer_tagline",
    label: "Footer Tagline",
    default: "Graphic design excellence meets modern ecommerce.",
    multiline: false,
  },
  {
    key: "home_services_text",
    label: "Services Section Text",
    default:
      "We specialize in bold, memorable designs for businesses and individuals.",
    multiline: true,
  },
];

function ContentTab() {
  const [aboutText, setAboutText] = useState(
    () => localStorage.getItem("megatrx_about") ?? "",
  );
  const [shippingText, setShippingText] = useState(
    () => localStorage.getItem("megatrx_shipping") ?? "",
  );
  const [textValues, setTextValues] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("megatrx_sitetexts");
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});

  function handleSaveAbout() {
    setSavingAbout(true);
    try {
      localStorage.setItem("megatrx_about", aboutText);
      toast.success("About Us updated");
    } catch {
      toast.error("Failed to save About Us");
    } finally {
      setSavingAbout(false);
    }
  }

  function handleSaveShipping() {
    setSavingShipping(true);
    try {
      localStorage.setItem("megatrx_shipping", shippingText);
      toast.success("Shipping Info updated");
    } catch {
      toast.error("Failed to save Shipping Info");
    } finally {
      setSavingShipping(false);
    }
  }

  function handleSaveSiteText(key: string) {
    setSavingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const updated = { ...textValues };
      localStorage.setItem("megatrx_sitetexts", JSON.stringify(updated));
      toast.success("Text updated");
    } catch {
      toast.error("Failed to save text");
    } finally {
      setSavingKeys((prev) => ({ ...prev, [key]: false }));
    }
  }

  function getTextValue(key: string): string {
    return (
      textValues[key] ??
      SITE_TEXT_FIELDS.find((f) => f.key === key)?.default ??
      ""
    );
  }

  return (
    <div className="space-y-8">
      {/* Website Text Fields */}
      <div>
        <h2 className="text-base font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Website Text
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SITE_TEXT_FIELDS.map((field) => (
            <Card key={field.key}>
              <CardContent className="pt-4 space-y-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  {field.label}
                </Label>
                {field.multiline ? (
                  <Textarea
                    value={getTextValue(field.key)}
                    onChange={(e) =>
                      setTextValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="bg-background/50 text-sm min-h-[80px]"
                    placeholder={field.default}
                    data-ocid="content.textarea"
                  />
                ) : (
                  <Input
                    value={getTextValue(field.key)}
                    onChange={(e) =>
                      setTextValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="bg-background/50 text-sm"
                    placeholder={field.default}
                    data-ocid="content.input"
                  />
                )}
                <Button
                  size="sm"
                  onClick={() => handleSaveSiteText(field.key)}
                  disabled={savingKeys[field.key]}
                  className="w-full font-mono text-xs"
                  data-ocid="content.save_button"
                >
                  {savingKeys[field.key] ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : null}
                  Save
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* About Us + Shipping Info */}
      <div>
        <h2 className="text-base font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Pages Content
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-mono uppercase tracking-wider">
                About Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="min-h-[200px] bg-background/50 text-sm"
                placeholder="Write your About Us content here..."
                data-ocid="content.textarea"
              />
              <Button
                onClick={handleSaveAbout}
                disabled={savingAbout}
                className="w-full font-mono"
                data-ocid="content.save_button"
              >
                {savingAbout ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save About Us
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-mono uppercase tracking-wider">
                Shipping Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={shippingText}
                onChange={(e) => setShippingText(e.target.value)}
                className="min-h-[200px] bg-background/50 text-sm"
                placeholder="Write your Shipping Policy content here..."
                data-ocid="content.textarea"
              />
              <Button
                onClick={handleSaveShipping}
                disabled={savingShipping}
                className="w-full font-mono"
                data-ocid="content.save_button"
              >
                {savingShipping ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Shipping Policy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Enhanced Design Requests Tab ────────────────────────────────────────────

function DesignRequestsTabEnhanced() {
  const { data: requests = [], isLoading } = useGetAllCustomDesignRequests();
  const { data: humanCount = BigInt(0) } = useGetHumanRequestCount();
  const updateStatus = useUpdateLocalDesignStatus();
  const deleteRequest = useDeleteCustomDesignRequest();
  const queryClient = useQueryClient();

  // Sort: chat escalations first
  const sorted = [...requests].sort((a, b) => {
    if (a.chatEscalation && !b.chatEscalation) return -1;
    if (!a.chatEscalation && b.chatEscalation) return 1;
    return 0;
  });

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
      await updateStatus(req.id, newStatus);
      await queryClient.invalidateQueries({ queryKey: ["designRequests"] });
      toast.success("Status updated");
    } catch {
      toast.success("Status saved locally");
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
      {/* Human escalation alert */}
      {Number(humanCount) > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/15 border border-orange-500/30"
          data-ocid="designs.error_state"
        >
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-400 text-sm">
              {Number(humanCount)} chat escalation request
              {Number(humanCount) !== 1 ? "s" : ""} waiting
            </p>
            <p className="text-xs text-orange-400/80 mt-0.5">
              Customers clicked "Talk to a human". Check the Chat Sessions tab
              to view and respond.
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground font-mono">
        {requests.length} request{requests.length !== 1 ? "s" : ""} total
        {Number(humanCount) > 0 && (
          <span className="ml-2 text-orange-400">
            · {Number(humanCount)} chat escalation
            {Number(humanCount) !== 1 ? "s" : ""}
          </span>
        )}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card data-ocid="designs.empty_state">
          <CardContent className="py-16 text-center text-muted-foreground">
            <PenTool className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No design requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((req, idx) => (
            <Card
              key={req.id.toString()}
              className={`border-border ${req.chatEscalation ? "border-orange-500/30" : ""}`}
              data-ocid={`designs.item.${idx + 1}`}
            >
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
                          Chat Escalation
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
                      <SelectTrigger
                        className="h-8 text-xs w-[130px] bg-background/50"
                        data-ocid="designs.select"
                      >
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
                      data-ocid="designs.delete_button"
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

// Helper: update status locally when backend fails
function useUpdateLocalDesignStatus() {
  const { actor } = useActor();
  return async (id: bigint, status: string) => {
    if (actor) {
      try {
        await actor.updateCustomDesignRequestStatus(id, status);
        return;
      } catch {
        // fall through to local
      }
    }
    const local = JSON.parse(
      localStorage.getItem("megatrx_design_statuses") ?? "{}",
    ) as Record<string, string>;
    local[id.toString()] = status;
    localStorage.setItem("megatrx_design_statuses", JSON.stringify(local));
  };
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data: savedEmail = "" } = useGetNotificationEmail();
  const setNotificationEmail = useSetNotificationEmail();
  const [email, setEmail] = useState("");

  // Logo state
  const [logoUrl, setLogoUrl] = useState(
    () => localStorage.getItem("megatrx_logo") ?? "",
  );

  useEffect(() => {
    if (savedEmail) setEmail(savedEmail);
  }, [savedEmail]);

  async function handleSaveEmail() {
    try {
      await setNotificationEmail.mutateAsync(email.trim());
      toast.success("Notification email saved");
    } catch {
      localStorage.setItem("megatrx_notification_email", email.trim());
      toast.success("Email saved locally");
    }
  }

  function handleLogoChange(value: string) {
    setLogoUrl(value);
    if (value) {
      localStorage.setItem("megatrx_logo", value);
      toast.success("Logo saved — reload the page to see it in the header");
    } else {
      localStorage.removeItem("megatrx_logo");
      toast.success("Logo removed");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Logo Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            Site Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your logo here. It will appear in the navigation header and
            chat widget across the entire website.
          </p>
          {logoUrl && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-md">
              <img
                src={logoUrl}
                alt="Current logo"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <p className="text-xs font-mono text-green-400">✓ Logo saved</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reload the page to see it in the header
                </p>
              </div>
            </div>
          )}
          <ImageUploadField
            label="Upload Logo"
            value={logoUrl}
            onChange={handleLogoChange}
          />
        </CardContent>
      </Card>

      {/* Notification Email */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Notification Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your email address to receive notifications for new orders,
            design requests, and chat escalations.
          </p>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Your Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-background/50 font-mono text-sm"
              data-ocid="settings.input"
            />
          </div>
          <Button
            onClick={handleSaveEmail}
            disabled={setNotificationEmail.isPending || !email.trim()}
            className="font-mono"
            data-ocid="settings.save_button"
          >
            {setNotificationEmail.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Admin passphrase:{" "}
            <code className="font-mono text-primary bg-muted px-1.5 py-0.5 rounded text-xs">
              MEGATRX2024
            </code>
          </p>
          <p className="text-xs text-muted-foreground">
            Share this passphrase only with trusted staff members. Access the
            admin dashboard at <code className="font-mono">/admin</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Live Chat Tab ────────────────────────────────────────────────────────────

interface LiveChatSession {
  id: string;
  customerName: string;
  customerEmail?: string;
  lastSeen: string;
  isEscalated?: boolean;
  messages: Array<{
    role: "customer" | "admin";
    content: string;
    timestamp: string;
    isHuman?: boolean;
  }>;
}

function loadLiveChatSessions(): LiveChatSession[] {
  try {
    const raw = localStorage.getItem("megatrx_live_chat_sessions");
    return raw ? (JSON.parse(raw) as LiveChatSession[]) : [];
  } catch {
    return [];
  }
}

function saveLiveChatSessions(sessions: LiveChatSession[]) {
  localStorage.setItem("megatrx_live_chat_sessions", JSON.stringify(sessions));
}

function LiveChatTab() {
  const [sessions, setSessions] = useState<LiveChatSession[]>(() =>
    loadLiveChatSessions(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const s = loadLiveChatSessions();
    // Prioritize escalated sessions
    const escalated = s.find((x) => x.isEscalated);
    return escalated?.id ?? (s.length > 0 ? s[0].id : null);
  });
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = loadLiveChatSessions();
      setSessions(updated);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;
  const escalatedCount = sessions.filter((s) => s.isEscalated).length;

  function sendAdminReply() {
    if (!reply.trim() || !selectedId) return;
    const allSessions = loadLiveChatSessions();
    const sessionIndex = allSessions.findIndex((s) => s.id === selectedId);
    if (sessionIndex === -1) return;

    allSessions[sessionIndex].messages.push({
      role: "admin",
      content: reply.trim(),
      timestamp: new Date().toISOString(),
      isHuman: true, // Mark as real human reply so customer sees "Real Person" badge
    });
    saveLiveChatSessions(allSessions);
    setSessions([...allSessions]);
    setReply("");
  }

  function clearSession(id: string) {
    if (!confirm("Delete this chat session?")) return;
    const updated = sessions.filter((s) => s.id !== id);
    saveLiveChatSessions(updated);
    setSessions(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground font-mono">
          {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
        </p>
        <span className="text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded animate-pulse">
          Live
        </span>
        {escalatedCount > 0 && (
          <span className="text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold">
            {escalatedCount} HUMAN REQUEST{escalatedCount !== 1 ? "S" : ""} —
            REPLY NEEDED
          </span>
        )}
      </div>

      {/* Escalation alert banner */}
      {escalatedCount > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
          data-ocid="livechat.error_state"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400 text-sm">
              {escalatedCount} customer{escalatedCount !== 1 ? "s" : ""}{" "}
              requested to talk to a real person!
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              These customers typed "talk to a human" or similar. Select their
              session below and reply — your message will appear directly in
              their chat widget as coming from a REAL PERSON (not the AI bot).
            </p>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <Card data-ocid="livechat.empty_state">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No active chat sessions</p>
            <p className="text-xs mt-2 opacity-60">
              When customers open the chat widget and send messages, their
              sessions will appear here so you can reply in real time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[580px]">
          {/* Session list */}
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">
                Sessions
              </CardTitle>
            </CardHeader>
            <div className="overflow-y-auto h-[calc(100%-52px)]">
              {/* Sort escalated first */}
              {[...sessions]
                .sort(
                  (a, b) => (b.isEscalated ? 1 : 0) - (a.isEscalated ? 1 : 0),
                )
                .map((session) => {
                  const lastMsg = session.messages[session.messages.length - 1];
                  // Only count real customer messages as "unread"
                  const lastCustomerMsg = [...session.messages]
                    .reverse()
                    .find(
                      (m) =>
                        m.role === "customer" &&
                        !m.content.startsWith("[AI Bot]") &&
                        !m.content.startsWith("[HUMAN REQUESTED]"),
                    );
                  const lastAdminMsg = [...session.messages]
                    .reverse()
                    .find((m) => m.role === "admin" && m.isHuman);
                  const hasUnread =
                    lastCustomerMsg &&
                    (!lastAdminMsg ||
                      new Date(lastCustomerMsg.timestamp) >
                        new Date(lastAdminMsg.timestamp));
                  const isSelected = session.id === selectedId;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedId(session.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${isSelected ? "bg-primary/10 border-l-2 border-l-primary" : session.isEscalated ? "bg-red-500/5 border-l-2 border-l-red-500 hover:bg-red-500/10" : "hover:bg-muted/40"}`}
                      data-ocid="livechat.item.1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-semibold text-sm truncate ${hasUnread && !isSelected ? "text-primary" : ""}`}
                        >
                          {session.customerName || "Customer"}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {session.isEscalated && (
                            <span className="text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase">
                              HUMAN
                            </span>
                          )}
                          {hasUnread && !isSelected && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      {session.customerEmail && (
                        <p className="text-[10px] text-muted-foreground/70 font-mono truncate">
                          {session.customerEmail}
                        </p>
                      )}
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lastMsg.role === "admin" ? "You: " : ""}
                          {lastMsg.content
                            .replace(/^\[AI Bot\] /, "")
                            .replace(/^\[HUMAN REQUESTED\] /, "")
                            .slice(0, 60)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                        {new Date(session.lastSeen).toLocaleTimeString()}
                      </p>
                    </button>
                  );
                })}
            </div>
          </Card>

          {/* Chat panel */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedSession ? (
              <>
                {/* Header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b border-border shrink-0 ${selectedSession.isEscalated ? "bg-red-500/5" : ""}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedSession.isEscalated ? "bg-red-500/20 border border-red-500/30" : "bg-primary/20 border border-primary/30"}`}
                    >
                      <User
                        className={`w-4 h-4 ${selectedSession.isEscalated ? "text-red-400" : "text-primary"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">
                          {selectedSession.customerName || "Customer"}
                        </p>
                        {selectedSession.isEscalated && (
                          <span className="text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Requested Real Person
                          </span>
                        )}
                      </div>
                      {selectedSession.customerEmail && (
                        <a
                          href={`mailto:${selectedSession.customerEmail}`}
                          className="text-xs text-primary font-mono hover:underline"
                        >
                          {selectedSession.customerEmail}
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedSession.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearSession(selectedSession.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 shrink-0"
                    data-ocid="livechat.delete_button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Escalation notice */}
                {selectedSession.isEscalated && (
                  <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400 font-mono">
                      This customer requested a REAL PERSON. Your replies will
                      show as "MEGATRX Team (Real Person)" in their chat — NOT
                      the AI bot.
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedSession.messages
                    .filter(
                      (msg) => !msg.content.startsWith("[HUMAN REQUESTED]"),
                    )
                    .map((msg, i) => {
                      const isAiBot = msg.content.startsWith("[AI Bot]");
                      const displayContent = msg.content.replace(
                        /^\[AI Bot\] /,
                        "",
                      );
                      return (
                        <div
                          key={`msg-${i}-${msg.timestamp}`}
                          className={`flex gap-2 ${msg.role === "admin" ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              msg.role === "admin" && !isAiBot
                                ? "bg-primary/20 border border-primary/30"
                                : msg.role === "admin" && isAiBot
                                  ? "bg-muted border border-border"
                                  : "bg-muted border border-border"
                            }`}
                          >
                            {msg.role === "admin" && !isAiBot ? (
                              <Shield className="w-3.5 h-3.5 text-primary" />
                            ) : msg.role === "admin" && isAiBot ? (
                              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 max-w-[75%]">
                            {msg.role === "admin" && isAiBot && (
                              <span className="text-[9px] font-mono text-muted-foreground/60 px-1">
                                AI Bot
                              </span>
                            )}
                            {msg.role === "admin" && !isAiBot && (
                              <span className="text-[9px] font-mono text-primary px-1 flex items-center gap-1">
                                <Shield className="w-2 h-2" /> You (Human)
                              </span>
                            )}
                            <div
                              className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                                msg.role === "admin" && !isAiBot
                                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                                  : msg.role === "admin" && isAiBot
                                    ? "bg-muted/50 text-muted-foreground rounded-tr-sm text-xs"
                                    : "bg-muted text-foreground rounded-tl-sm"
                              }`}
                            >
                              {displayContent}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 font-mono px-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply input */}
                <div
                  className={`border-t border-border p-3 shrink-0 ${selectedSession.isEscalated ? "bg-primary/5" : ""}`}
                >
                  {selectedSession.isEscalated && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[11px] text-primary font-mono font-semibold">
                        REAL PERSON MODE — Customer will see your message with a
                        "Real Person" badge
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendAdminReply();
                        }
                      }}
                      placeholder={
                        selectedSession.isEscalated
                          ? "Type your reply as a real person..."
                          : "Type your reply..."
                      }
                      className="flex-1 bg-background/50 text-sm h-9"
                      data-ocid="livechat.input"
                    />
                    <Button
                      size="sm"
                      onClick={sendAdminReply}
                      disabled={!reply.trim()}
                      className="shrink-0 gap-1.5"
                      data-ocid="livechat.primary_button"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                    {selectedSession.isEscalated
                      ? "Your reply appears in the customer's chat as coming from a real MEGATRX team member"
                      : "Your reply will appear in the customer's chat widget automatically"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-mono">Select a session</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant Tab ─────────────────────────────────────────────────────────

interface AdminChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How many orders do I have?",
  "Show me pending design requests",
  "List customer emails",
  "What's my best selling category?",
  "Any chat escalations pending?",
];

async function getAdminAIResponse(
  question: string,
  orderCount: number,
  designCount: number,
  productCount: number,
): Promise<string> {
  const contextData = `Store summary: ${orderCount} orders, ${designCount} design requests, ${productCount} products.`;
  const fullPrompt = `You are an admin AI assistant for MEGATRX graphic design store. ${contextData} Answer this question concisely and helpfully: ${question}`;
  const encodedPrompt = encodeURIComponent(fullPrompt);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 5) return text.trim();
    }
  } catch {
    // fall through
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system",
            content: `You are an admin AI for MEGATRX. ${contextData}`,
          },
          { role: "user", content: question },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || data?.text || "";
      if (text && text.trim().length > 5) return text.trim();
    }
  } catch {
    // fall through
  }

  // Local fallback answers
  const lower = question.toLowerCase();
  if (lower.includes("order")) {
    return `You have ${orderCount} total orders. Check the Orders tab for details.`;
  }
  if (lower.includes("design") || lower.includes("request")) {
    return `You have ${designCount} design requests. Check the Designs tab for details.`;
  }
  if (lower.includes("product")) {
    return `You have ${productCount} products in your catalog.`;
  }
  return `Store summary: ${orderCount} orders, ${designCount} design requests, ${productCount} products. Check each tab for details.`;
}

function AIAssistantTab() {
  const { data: orders = [] } = useGetAllOrders();
  const { data: designRequests = [] } = useGetAllCustomDesignRequests();
  const localProducts = loadLocalProducts();

  const [messages, setMessages] = useState<AdminChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your MEGATRX admin AI assistant. I have access to your store data — orders, customers, design requests, and products. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  async function sendQuestion(question: string) {
    if (!question.trim() || isLoading) return;
    const userMsg: AdminChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const reply = await getAdminAIResponse(
        question,
        orders.length,
        designRequests.length,
        localProducts.length,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content:
            "I'm having trouble connecting. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            AI Assistant
            <span className="text-xs font-normal font-mono text-muted-foreground">
              · Ask questions about your store
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-3 border-b border-border">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "assistant" ? "bg-primary/20 border border-primary/30" : "bg-muted border border-border"}`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing store data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              Quick questions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuestion(q)}
                  disabled={isLoading}
                  className="text-xs font-mono bg-muted hover:bg-muted/80 border border-border px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendQuestion(input);
                }
              }}
              placeholder="Ask about orders, customers, sales..."
              className="flex-1 bg-background/50 text-sm"
              disabled={isLoading}
              data-ocid="ai.input"
            />
            <Button
              size="sm"
              onClick={() => sendQuestion(input)}
              disabled={isLoading || !input.trim()}
              className="shrink-0"
              data-ocid="ai.submit_button"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
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
  const [activeTab, setActiveTab] = useState("products");

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
              {/* AI Chat quick link */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("ai")}
                className="font-mono text-xs gap-1.5"
                title="Open AI Assistant"
                data-ocid="admin.ai.button"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Chat</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                className="font-mono text-xs gap-1.5"
                title="Enable browser notifications for new orders"
                data-ocid="admin.notifications.toggle"
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
                data-ocid="admin.logout.button"
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab list */}
          <div className="overflow-x-auto">
            <TabsList className="flex w-max bg-card border border-border h-auto p-1 gap-0.5">
              {[
                { value: "products", icon: ShoppingBag, label: "Products" },
                { value: "portfolio", icon: Palette, label: "Portfolio" },
                { value: "orders", icon: Package, label: "Orders" },
                { value: "designs", icon: PenTool, label: "Designs" },
                {
                  value: "chat-sessions",
                  icon: MessageSquare,
                  label: "Chat Sessions",
                },
                {
                  value: "live-chat",
                  icon: MessageSquare,
                  label: "Live Chat",
                },
                { value: "content", icon: FileText, label: "Content" },
                { value: "integrations", icon: Store, label: "Shopify" },
                { value: "printify", icon: Printer, label: "Printify" },
                { value: "printful", icon: Printer, label: "Printful" },
                { value: "payments", icon: CreditCard, label: "Payments" },
                { value: "campaigns", icon: Mail, label: "Campaigns" },
                { value: "ai", icon: Bot, label: "AI Assistant" },
                { value: "aistudio", icon: Palette, label: "AI Studio" },
                { value: "settings", icon: Settings, label: "Settings" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="font-mono text-xs uppercase tracking-wide py-2 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                  data-ocid={`admin.${value}.tab`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

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
            <DesignRequestsTabEnhanced />
          </TabsContent>

          <TabsContent value="chat-sessions">
            <ChatSessionsTab />
          </TabsContent>

          <TabsContent value="live-chat">
            <LiveChatTab />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="printify">
            <PrintifyTab />
          </TabsContent>

          <TabsContent value="printful">
            <PrintfulTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab />
          </TabsContent>

          <TabsContent value="ai">
            <AIAssistantTab />
          </TabsContent>

          <TabsContent value="aistudio">
            <AIStudioTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
