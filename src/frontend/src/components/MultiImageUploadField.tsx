import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Link2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let compressed = canvas.toDataURL("image/jpeg", 0.75);
      // Compression passes if too large
      if (compressed.length > 600000) {
        compressed = canvas.toDataURL("image/jpeg", 0.55);
      }
      if (compressed.length > 900000) {
        compressed = canvas.toDataURL("image/jpeg", 0.35);
      }
      if (compressed.length > 1200000) {
        reject(
          new Error(
            "Image too large even after compression. Please use a smaller image file.",
          ),
        );
        return;
      }
      resolve(compressed);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

interface MultiImageUploadFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  maxImages?: number;
}

/**
 * Multi-image upload field that supports:
 * - Uploading files from device (stored as base64 data URLs)
 * - Adding image URLs
 * - Thumbnail grid with remove buttons
 * - Max image count enforcement
 */
export function MultiImageUploadField({
  values,
  onChange,
  label = "Product Images",
  maxImages = 8,
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const canAddMore = values.length < maxImages;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxImages - values.length;
    const toProcess = files.slice(0, remaining);

    const results: string[] = [];
    for (const file of toProcess) {
      try {
        const compressed = await compressImage(file);
        results.push(compressed);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to process image";
        if (msg.includes("too large")) {
          toast.error(
            `${file.name}: Image is too large. Please use a photo under 2MB.`,
          );
        } else {
          toast.error(`${file.name}: ${msg}`);
        }
      }
    }
    if (results.length > 0) {
      onChange([...values, ...results]);
    }

    // Reset so the same files can be re-selected
    e.target.value = "";
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed || values.length >= maxImages) return;
    if (values.includes(trimmed)) {
      setUrlInput("");
      setShowUrlInput(false);
      return;
    }
    onChange([...values, trimmed]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-xs uppercase text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs font-mono text-muted-foreground">
          {values.length} / {maxImages} photos
        </span>
      </div>

      {/* Thumbnail grid */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((url, index) => (
            <div
              key={`img-${index}-${url.slice(0, 20)}`}
              className="relative w-20 h-20 rounded-md overflow-hidden border border-border bg-muted/40 shrink-0"
            >
              <img
                src={url}
                alt={`View ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.opacity = "0.3";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors shadow-sm"
                title="Remove image"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-mono bg-primary/80 text-primary-foreground py-0.5 uppercase tracking-wider">
                  Main
                </span>
              )}
            </div>
          ))}

          {/* Add more placeholder */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-md border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[9px] font-mono uppercase tracking-wider">
                Add
              </span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {values.length === 0 && (
        <div className="w-full py-8 rounded-md border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-40" />
          <span className="text-xs font-mono uppercase tracking-wider opacity-60">
            No images yet
          </span>
        </div>
      )}

      {/* Action buttons */}
      {canAddMore && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-mono"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Photo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs font-mono text-muted-foreground"
            onClick={() => setShowUrlInput((v) => !v)}
          >
            <Link2 className="w-3.5 h-3.5" />
            {showUrlInput ? "Cancel URL" : "Use URL"}
          </Button>
        </div>
      )}

      {/* Hidden file input (accepts multiple) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* URL input */}
      {showUrlInput && canAddMore && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
            placeholder="https://example.com/image.jpg"
            className="bg-background/50 font-mono text-sm flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
