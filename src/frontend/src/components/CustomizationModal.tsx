import type { Product } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import type { Customization } from "@/context/CartContext";
import {
  Minus,
  Palette,
  Paperclip,
  Plus,
  Ruler,
  ShoppingCart,
  StickyNote,
  Type,
} from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  product: Product;
  sizes?: string[];
  initialQuantity?: number;
  open: boolean;
  onClose: () => void;
  onConfirm: (qty: number, customization: Customization) => void;
}

export default function CustomizationModal({
  product,
  sizes,
  initialQuantity = 1,
  open,
  onClose,
  onConfirm,
}: Props) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSizes = sizes && sizes.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function handleConfirm() {
    const customization: Customization = {};
    if (text.trim()) customization.text = text.trim();
    if (color.trim()) customization.color = color.trim();
    if (size) customization.size = size;
    if (notes.trim()) customization.notes = notes.trim();
    if (fileName) customization.fileUrl = fileName;
    onConfirm(quantity, customization);
    // Reset form
    setText("");
    setColor("");
    setSize("");
    setNotes("");
    setFileName("");
    setQuantity(1);
  }

  function handleClose() {
    setText("");
    setColor("");
    setSize("");
    setNotes("");
    setFileName("");
    setQuantity(initialQuantity);
    onClose();
  }

  const price = Number(product.price) / 100;
  const lineTotal = price * quantity;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Customize Your Order
          </DialogTitle>
        </DialogHeader>

        {/* Product Summary */}
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-wider text-primary truncate">
              {product.category}
            </p>
            <p className="font-semibold tracking-tight truncate">
              {product.name}
            </p>
            <p className="text-sm text-muted-foreground">
              ${price.toFixed(2)} each
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Quantity */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider">
              Quantity
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-border rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-10 text-center font-mono font-semibold">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-9 w-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                Total:{" "}
                <span className="text-primary font-bold">
                  ${lineTotal.toFixed(2)}
                </span>
              </span>
            </div>
          </div>

          {/* Size — shown only when product has defined sizes */}
          {hasSizes && (
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                Size / Variant
              </Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger data-ocid="customization.select">
                  <SelectValue placeholder="Select a size or variant…" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Text / Name to print */}
          <div className="space-y-2">
            <Label
              htmlFor="cust-text"
              className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Type className="w-3.5 h-3.5" />
              Text to print
            </Label>
            <Input
              id="cust-text"
              placeholder="e.g. your name, slogan, quote…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label
              htmlFor="cust-color"
              className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              Color preference
            </Label>
            <Input
              id="cust-color"
              placeholder="e.g. Red, Navy Blue, Black & White…"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="cust-notes"
              className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <StickyNote className="w-3.5 h-3.5" />
              Special instructions
            </Label>
            <Textarea
              id="cust-notes"
              placeholder="Any special instructions, layout preferences, or design details…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Reference file */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Reference image or logo{" "}
              <span className="text-muted-foreground normal-case">
                (optional)
              </span>
            </Label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName ? (
                <p className="text-sm font-mono text-primary">{fileName}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload image or PDF
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            data-ocid="customization.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 gap-2"
            onClick={handleConfirm}
            data-ocid="customization.confirm_button"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
