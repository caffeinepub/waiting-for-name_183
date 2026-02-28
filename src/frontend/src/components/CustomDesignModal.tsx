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
import { useDesignModal } from "@/context/DesignModalContext";
import { useActor } from "@/hooks/useActor";
import { Loader2, Paperclip, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  "T-Shirt",
  "Sweater",
  "Mug",
  "Business Card",
  "Photo Book",
  "Tumbler",
  "Poster/Banner",
  "Sticker",
  "Other",
];

interface AttachedFile {
  name: string;
  preview?: string;
  type: string;
}

export default function CustomDesignModal() {
  const { isOpen, closeModal } = useDesignModal();
  const { actor } = useActor();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");
  const [colorPrefs, setColorPrefs] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: AttachedFile[] = [];
    for (const file of fileList) {
      if (newFiles.length >= 5) break;
      const isImage = file.type.startsWith("image/");
      newFiles.push({
        name: file.name,
        type: file.type,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      });
    }
    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  }, []);

  function removeFile(index: number) {
    setFiles((prev) => {
      const updated = [...prev];
      const file = updated[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  function resetForm() {
    setName("");
    setEmail("");
    setProductType("");
    setDescription("");
    setColorPrefs("");
    for (const f of files) {
      if (f.preview) URL.revokeObjectURL(f.preview);
    }
    setFiles([]);
  }

  function handleClose() {
    resetForm();
    closeModal();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || !name || !email || !productType || !description) return;

    setIsSubmitting(true);
    try {
      await actor.addCustomDesignRequest(
        name,
        email,
        productType,
        description,
        colorPrefs,
        files.map((f) => f.name),
        new Date().toISOString(),
        false,
      );
      toast.success(
        "Your design request has been submitted! We'll be in touch within 24 hours.",
      );
      handleClose();
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold tracking-tight">
            Request a Custom Design
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Email *
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Product Type *
            </Label>
            <Select value={productType} onValueChange={setProductType} required>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Design Description *
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design idea, colors, text, images you want..."
              required
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Color Preferences
            </Label>
            <Input
              value={colorPrefs}
              onChange={(e) => setColorPrefs(e.target.value)}
              placeholder="e.g. Red and black, dark tones, vibrant colors..."
              className="bg-background/50"
            />
          </div>

          {/* File Drop Zone */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Reference Files (optional)
            </Label>
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop files here or{" "}
                <span className="text-primary font-medium">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Images & PDFs accepted · Max 5 files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
              />
            </label>

            {/* File chips */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-1.5 bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-5 h-5 object-cover rounded"
                      />
                    ) : (
                      <Paperclip className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="max-w-[120px] truncate font-mono">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !name || !email || !productType || !description
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
