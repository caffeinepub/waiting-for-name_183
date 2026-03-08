import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload, X } from "lucide-react";
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

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Fallback src shown in preview when value is empty */
  fallbackSrc?: string;
}

/**
 * An image field that supports:
 * - Uploading a file from device (stored as base64 data URL)
 * - Entering a URL manually as fallback
 * - Preview of the current/selected image
 */
export function ImageUploadField({
  value,
  onChange,
  label = "Image",
  fallbackSrc,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const previewSrc = value || fallbackSrc || "";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
      setPreviewError(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to process image";
      if (msg.includes("too large")) {
        toast.error("Image is too large. Please use a photo under 2MB.");
      } else {
        toast.error(msg);
      }
    }
    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  function handleClear() {
    onChange("");
    setPreviewError(false);
  }

  return (
    <div className="space-y-2">
      <Label className="font-mono text-xs uppercase text-muted-foreground">
        {label}
      </Label>

      {/* Preview */}
      <div className="relative w-full aspect-square max-w-[160px] rounded-md overflow-hidden border-2 border-dashed border-border bg-muted/40 flex items-center justify-center">
        {previewSrc && !previewError ? (
          <>
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-40" />
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-mono"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload from device
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs font-mono text-muted-foreground"
          onClick={() => setUrlMode((v) => !v)}
        >
          {urlMode ? "Hide URL" : "Use URL instead"}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* URL input (optional) */}
      {urlMode && (
        <Input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewError(false);
          }}
          placeholder="https://example.com/image.jpg"
          className="bg-background/50 font-mono text-sm"
        />
      )}
    </div>
  );
}
