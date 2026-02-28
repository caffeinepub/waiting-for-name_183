import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useGetAllProducts,
  useGetOrder,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Package,
  Printer,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

function getStatusBadgeClass(status: string) {
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

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "processing":
      return <Package className="w-4 h-4" />;
    case "shipped":
      return <Truck className="w-4 h-4" />;
    case "delivered":
      return <CheckCircle2 className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
}

export default function OrderReceiptPage() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string };
  const orderIdBigInt = orderId ? BigInt(orderId) : null;

  const { data: order, isLoading, refetch } = useGetOrder(orderIdBigInt);
  const { data: allProducts = [] } = useGetAllProducts();
  const updateStatusMutation = useUpdateOrderStatus();

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: "cancelled",
        trackingNumber: "",
      });
      await refetch();
      toast.success("Order cancelled.");
    } catch {
      toast.error("Failed to cancel order.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find order #{orderId}. It may have been removed or the
            link is invalid.
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const orderTotal = order.items.reduce((sum, item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + Number(product.price) * Number(item.quantity);
  }, 0);

  const isCancelled = order.status.toLowerCase() === "cancelled";
  const isProcessing = order.status.toLowerCase() === "processing";

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-card { border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="w-full">
        <section className="py-12 sm:py-16 border-b border-border bg-green-500/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                {isCancelled ? (
                  <XCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter">
                  {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
                </h1>
                <p className="text-muted-foreground font-mono text-sm mt-1">
                  Order #{order.id.toString()} •{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {!isCancelled && (
                  <p className="text-sm text-muted-foreground mt-2">
                    A confirmation has been sent to{" "}
                    <span className="font-medium text-foreground">
                      {order.email}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status */}
                <Card className="border-2 border-border print-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono uppercase tracking-wider">
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-mono border px-3 py-1.5 rounded-full ${getStatusBadgeClass(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tracking: </span>
                      <span className="font-mono font-medium">
                        {order.trackingNumber || "Processing"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card className="border-2 border-border print-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono uppercase tracking-wider">
                      Items Ordered
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                    {order.items.map((item) => {
                      const product = allProducts.find(
                        (p) => p.id === item.productId,
                      );
                      return (
                        <div
                          key={item.productId.toString()}
                          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">
                              {product?.name ?? `Product #${item.productId}`}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              Qty: {item.quantity.toString()}
                            </p>
                          </div>
                          <p className="font-bold">
                            {product
                              ? `$${((Number(product.price) * Number(item.quantity)) / 100).toFixed(2)}`
                              : "—"}
                          </p>
                        </div>
                      );
                    })}
                    <div className="pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="font-mono">Total</span>
                        <span className="text-primary">
                          ${(orderTotal / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping */}
                <Card className="border-2 border-border print-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono uppercase tracking-wider">
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {order.shippingAddress}
                    </p>
                    <Separator className="my-3" />
                    <p className="text-sm text-muted-foreground">
                      Email: {order.email}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="space-y-4 no-print">
                <Card className="border-2 border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono uppercase tracking-wider">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.print()}
                    >
                      <Printer className="w-4 h-4" />
                      Print Receipt
                    </Button>

                    <Button asChild className="w-full gap-2">
                      <Link to="/shop">
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                      </Link>
                    </Button>

                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/account">View All Orders</Link>
                    </Button>

                    {isProcessing && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full gap-2"
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Cancel Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel this order?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel order #{order.id.toString()}.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelOrder}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Cancel Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-border bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-mono">
                      <span className="font-medium text-foreground block mb-1">
                        What happens next?
                      </span>
                      We'll review your order and reach out to {order.email}{" "}
                      with payment instructions and a tracking number once your
                      order ships.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
