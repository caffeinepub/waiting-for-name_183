import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Download,
  Eraser,
  Image,
  Loader2,
  MessageSquare,
  Palette,
  Shirt,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadImageUrl(url: string, filename: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      downloadDataUrl(blobUrl, filename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    })
    .catch(() => {
      // Fallback: open in new tab
      window.open(url, "_blank");
    });
}

// ─── 1. Logo Generator ────────────────────────────────────────────────────────

function LogoGenerator() {
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState("Modern");
  const [colors, setColors] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }
    setIsLoading(true);
    setGeneratedUrl("");
    try {
      const prompt = `professional logo design for brand "${brandName}", ${style} style, ${colors || "bold versatile"} color scheme, clean vector design, white background, high quality, sharp edges, graphic design`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&safe=false&seed=${Date.now()}&enhance=true`;
      // Pre-load image with generous timeout
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        const timeout = setTimeout(() => reject(new Error("Timeout")), 30000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load image"));
        };
        img.src = url;
      });
      setGeneratedUrl(url);
      toast.success("Logo generated!");
    } catch {
      // Retry with simpler prompt
      try {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(`${brandName} logo, ${style}, white background`)}?width=1024&height=1024&nologo=true&safe=false&seed=${Math.floor(Math.random() * 999999)}`;
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          const timeout = setTimeout(() => reject(new Error("Timeout")), 25000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed"));
          };
          img.src = url;
        });
        setGeneratedUrl(url);
        toast.success("Logo generated!");
      } catch {
        toast.error(
          "Generation failed. The AI service may be busy — please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Brand Name *
          </Label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. MEGATRX"
            className="bg-background/50"
            data-ocid="logo.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Style
          </Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-background/50" data-ocid="logo.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Modern",
                "Bold",
                "Minimalist",
                "Retro",
                "Luxury",
                "Playful",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Color Preference
          </Label>
          <Input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="e.g. red and black, gold and white, blue and silver"
            className="bg-background/50"
          />
        </div>
      </div>
      <Button
        onClick={handleGenerate}
        disabled={isLoading || !brandName.trim()}
        className="gap-2 font-mono"
        data-ocid="logo.primary_button"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        {isLoading ? "Generating..." : "Generate Logo"}
      </Button>

      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground"
          data-ocid="logo.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-mono">Creating your logo with AI...</p>
        </div>
      )}

      {generatedUrl && !isLoading && (
        <div className="space-y-3" data-ocid="logo.success_state">
          <div className="rounded-lg overflow-hidden border-2 border-primary/30 bg-white max-w-sm mx-auto">
            <img
              src={generatedUrl}
              alt="Generated logo"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono"
              onClick={() =>
                downloadImageUrl(generatedUrl, `${brandName}-logo.png`)
              }
              data-ocid="logo.secondary_button"
            >
              <Download className="w-3.5 h-3.5" />
              Download Logo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-mono"
              onClick={handleGenerate}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2. Social Media Post Generator ──────────────────────────────────────────

function SocialPostGenerator() {
  const [platform, setPlatform] = useState("Instagram");
  const [brandName, setBrandName] = useState("");
  const [message, setMessage] = useState("");
  const [postStyle, setPostStyle] = useState("Vibrant");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const PLATFORM_SIZES: Record<string, { w: number; h: number }> = {
    Instagram: { w: 1024, h: 1024 },
    TikTok: { w: 768, h: 1024 },
    Facebook: { w: 1024, h: 536 },
  };

  async function handleGenerate() {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }
    setIsLoading(true);
    setGeneratedUrl("");
    try {
      const size = PLATFORM_SIZES[platform] ?? { w: 1024, h: 1024 };
      const prompt = `${platform} social media post for brand "${brandName}", ${postStyle} aesthetic, text overlay: "${message || "Check us out!"}", modern graphic design, ${platform} optimized layout, professional marketing material, bold typography, eye-catching`;
      const seed = Date.now();
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size.w}&height=${size.h}&nologo=true&safe=false&seed=${seed}&enhance=true`;

      // Try with a generous timeout (Pollinations can be slow)
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        const timeout = setTimeout(() => reject(new Error("Timeout")), 30000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed"));
        };
        img.src = url;
      });
      setGeneratedUrl(url);
      toast.success("Post graphic generated!");
    } catch {
      // Try alternative seed if first fails
      try {
        const size = PLATFORM_SIZES[platform] ?? { w: 1024, h: 1024 };
        const prompt = `branded ${platform} graphic for "${brandName}", ${postStyle} colors, marketing post`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size.w}&height=${size.h}&nologo=true&safe=false&seed=${Math.floor(Math.random() * 999999)}`;
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          const timeout = setTimeout(() => reject(new Error("Timeout")), 25000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed"));
          };
          img.src = url;
        });
        setGeneratedUrl(url);
        toast.success("Post graphic generated!");
      } catch {
        toast.error(
          "Generation failed. The AI service may be busy — please try again in a moment.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Platform
          </Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger
              className="bg-background/50"
              data-ocid="social.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Instagram", "TikTok", "Facebook"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Brand Name *
          </Label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. MEGATRX"
            className="bg-background/50"
            data-ocid="social.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Style
          </Label>
          <Select value={postStyle} onValueChange={setPostStyle}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Vibrant", "Clean", "Dark", "Neon"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Post Message / Caption
          </Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. New collection dropping Friday!"
            className="bg-background/50"
          />
        </div>
      </div>
      <Button
        onClick={handleGenerate}
        disabled={isLoading || !brandName.trim()}
        className="gap-2 font-mono"
        data-ocid="social.primary_button"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isLoading ? "Generating..." : "Generate Post Graphic"}
      </Button>

      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground"
          data-ocid="social.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-mono">
            Creating your {platform} graphic...
          </p>
        </div>
      )}

      {generatedUrl && !isLoading && (
        <div className="space-y-3" data-ocid="social.success_state">
          <div className="rounded-lg overflow-hidden border-2 border-primary/30 max-w-sm mx-auto">
            <img
              src={generatedUrl}
              alt={`${platform} post`}
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono"
              onClick={() =>
                downloadImageUrl(
                  generatedUrl,
                  `${brandName}-${platform}-post.png`,
                )
              }
              data-ocid="social.secondary_button"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-mono"
              onClick={handleGenerate}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3. Background Remover ────────────────────────────────────────────────────

function BackgroundRemover() {
  const [originalSrc, setOriginalSrc] = useState("");
  const [processedSrc, setProcessedSrc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setOriginalSrc(ev.target?.result as string);
      setProcessedSrc("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeBackground() {
    if (!originalSrc) return;
    setIsProcessing(true);
    setProcessedSrc("");

    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample background color from corners
      const corners = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 },
      ];

      const bgColors = corners.map(({ x, y }) => {
        const i = (y * canvas.width + x) * 4;
        return { r: data[i], g: data[i + 1], b: data[i + 2] };
      });

      const avgBg = {
        r: Math.round(bgColors.reduce((a, c) => a + c.r, 0) / bgColors.length),
        g: Math.round(bgColors.reduce((a, c) => a + c.g, 0) / bgColors.length),
        b: Math.round(bgColors.reduce((a, c) => a + c.b, 0) / bgColors.length),
      };

      const threshold = 60;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff =
          Math.abs(r - avgBg.r) + Math.abs(g - avgBg.g) + Math.abs(b - avgBg.b);

        // Also remove near-white pixels (common background)
        const isNearWhite = r > 220 && g > 220 && b > 220;

        if (diff < threshold || isNearWhite) {
          data[i + 3] = 0; // transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };
    img.src = originalSrc;
  }

  return (
    <div className="space-y-5">
      <canvas ref={canvasRef} className="hidden" />

      <button
        type="button"
        className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        data-ocid="bg.dropzone"
      >
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-mono text-sm text-muted-foreground">
          Click to upload an image
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          PNG, JPG supported — works best with solid/light backgrounds
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-ocid="bg.upload_button"
        />
      </button>

      {originalSrc && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Original
              </p>
              <div className="rounded-lg overflow-hidden border border-border bg-muted/20">
                <img
                  src={originalSrc}
                  alt="Original"
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
            </div>
            {processedSrc && (
              <div data-ocid="bg.success_state">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Background Removed
                </p>
                <div
                  className="rounded-lg overflow-hidden border border-border"
                  style={{
                    background:
                      "repeating-conic-gradient(#e0e0e0 0% 25%, #f0f0f0 0% 50%) 0 0 / 20px 20px",
                  }}
                >
                  <img
                    src={processedSrc}
                    alt="Processed"
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={removeBackground}
              disabled={isProcessing}
              className="gap-2 font-mono"
              data-ocid="bg.primary_button"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eraser className="w-4 h-4" />
              )}
              {isProcessing ? "Processing..." : "Remove Background"}
            </Button>
            {processedSrc && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono"
                onClick={() =>
                  downloadDataUrl(processedSrc, "background-removed.png")
                }
                data-ocid="bg.secondary_button"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 4. Color Palette Generator ───────────────────────────────────────────────

const MOOD_PALETTES: Record<
  string,
  Array<{ h: number; s: number; l: number }>
> = {
  Professional: [
    { h: 220, s: 60, l: 35 },
    { h: 220, s: 30, l: 55 },
    { h: 0, s: 0, l: 95 },
    { h: 0, s: 0, l: 20 },
    { h: 190, s: 70, l: 45 },
  ],
  Energetic: [
    { h: 14, s: 90, l: 50 },
    { h: 45, s: 95, l: 50 },
    { h: 0, s: 0, l: 10 },
    { h: 0, s: 0, l: 98 },
    { h: 275, s: 75, l: 55 },
  ],
  Calm: [
    { h: 190, s: 50, l: 55 },
    { h: 160, s: 40, l: 60 },
    { h: 210, s: 25, l: 75 },
    { h: 0, s: 0, l: 95 },
    { h: 240, s: 20, l: 40 },
  ],
  Bold: [
    { h: 350, s: 85, l: 50 },
    { h: 0, s: 0, l: 8 },
    { h: 45, s: 95, l: 55 },
    { h: 0, s: 0, l: 98 },
    { h: 350, s: 50, l: 30 },
  ],
  Luxury: [
    { h: 45, s: 70, l: 50 },
    { h: 0, s: 0, l: 8 },
    { h: 0, s: 0, l: 95 },
    { h: 30, s: 40, l: 60 },
    { h: 270, s: 30, l: 35 },
  ],
};

const MOOD_FONTS: Record<string, [string, string]> = {
  Professional: ["Bricolage Grotesque", "General Sans"],
  Energetic: ["Cabinet Grotesk", "Outfit"],
  Calm: ["Instrument Serif", "Figtree"],
  Bold: ["Mona Sans", "Sora"],
  Luxury: ["Playfair Display", "Crimson Pro"],
};

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function ColorPaletteGenerator() {
  const [brandName, setBrandName] = useState("");
  const [mood, setMood] = useState("Professional");
  const [palette, setPalette] = useState<string[]>([]);
  const [fontPair, setFontPair] = useState<[string, string] | null>(null);

  function generatePalette() {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }
    const base = MOOD_PALETTES[mood] ?? MOOD_PALETTES.Professional;
    const seed = seedFromString(brandName);
    const hueShift = (seed % 30) - 15;
    const colors = base.map(({ h, s, l }) =>
      hslToHex((h + hueShift + 360) % 360, s, l),
    );
    setPalette(colors);
    setFontPair(MOOD_FONTS[mood] ?? ["Mona Sans", "General Sans"]);
    toast.success("Palette generated!");
  }

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex).then(() => {
      toast.success(`Copied ${hex}`);
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Brand Name *
          </Label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. MEGATRX"
            className="bg-background/50"
            data-ocid="palette.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Brand Mood
          </Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger
              className="bg-background/50"
              data-ocid="palette.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MOOD_PALETTES).map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={generatePalette}
        disabled={!brandName.trim()}
        className="gap-2 font-mono"
        data-ocid="palette.primary_button"
      >
        <Palette className="w-4 h-4" />
        Generate Palette
      </Button>

      {palette.length > 0 && (
        <div className="space-y-4" data-ocid="palette.success_state">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Color Palette for {brandName}
            </p>
            <div className="flex gap-3 flex-wrap">
              {palette.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title={`Click to copy ${hex}`}
                  data-ocid="palette.toggle"
                >
                  <div
                    className="w-16 h-16 rounded-lg border border-border shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {hex}
                  </span>
                  <Copy className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
              Click any swatch to copy the hex code
            </p>
          </div>

          {fontPair && (
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Recommended Font Pairing
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    Display / Headings
                  </span>
                  <p className="text-xl font-bold text-foreground">
                    {fontPair[0]}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    Body / Text
                  </span>
                  <p className="text-sm text-muted-foreground">{fontPair[1]}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 5. Mockup Creator ────────────────────────────────────────────────────────

const PRODUCT_TEMPLATES: Record<
  string,
  { label: string; bgColor: string; overlay: string }
> = {
  tshirt: {
    label: "T-Shirt",
    bgColor: "#f5f5f5",
    overlay:
      "Placed on a classic crew-neck t-shirt mockup, flat lay style, neutral background",
  },
  mug: {
    label: "Coffee Mug",
    bgColor: "#fff8f0",
    overlay:
      "Wrapped around a white ceramic coffee mug, professional product photo, studio lighting",
  },
  phone: {
    label: "Phone Case",
    bgColor: "#f0f4f8",
    overlay:
      "Applied to a modern smartphone phone case mockup, clean white background",
  },
  tote: {
    label: "Tote Bag",
    bgColor: "#f5f0e8",
    overlay:
      "Printed on a natural canvas tote bag mockup, lifestyle photography style",
  },
};

function MockupCreator() {
  const [designSrc, setDesignSrc] = useState("");
  const [productType, setProductType] = useState("tshirt");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDesignSrc(ev.target?.result as string);
      setGeneratedUrl("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleGenerate() {
    if (!designSrc) {
      toast.error("Please upload a design first");
      return;
    }
    setIsLoading(true);
    setGeneratedUrl("");
    try {
      const template = PRODUCT_TEMPLATES[productType];
      const prompt = `Professional product mockup: custom graphic design ${template.overlay}, high quality commercial photography, white/neutral studio background, sharp focus, product photography`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&safe=false&seed=${Date.now()}`;
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed"));
        img.src = url;
      });
      setGeneratedUrl(url);
      toast.success("Mockup created!");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <button
            type="button"
            className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="mockup.dropzone"
          >
            {designSrc ? (
              <div className="space-y-2">
                <img
                  src={designSrc}
                  alt="Design"
                  className="max-h-32 mx-auto object-contain rounded"
                />
                <p className="text-xs font-mono text-primary">
                  Click to change
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-mono text-muted-foreground">
                  Upload your design
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PNG, JPG
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="mockup.upload_button"
            />
          </button>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs uppercase text-muted-foreground">
            Product Type
          </Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger
              className="bg-background/50"
              data-ocid="mockup.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRODUCT_TEMPLATES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground font-mono">
              AI will generate a realistic mockup showing your design on a{" "}
              {PRODUCT_TEMPLATES[productType]?.label ?? "product"}.
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !designSrc}
        className="gap-2 font-mono"
        data-ocid="mockup.primary_button"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Shirt className="w-4 h-4" />
        )}
        {isLoading ? "Creating Mockup..." : "Generate Mockup"}
      </Button>

      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground"
          data-ocid="mockup.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-mono">Generating your mockup...</p>
        </div>
      )}

      {generatedUrl && !isLoading && (
        <div className="space-y-3" data-ocid="mockup.success_state">
          <div className="rounded-lg overflow-hidden border-2 border-primary/30 max-w-sm mx-auto">
            <img
              src={generatedUrl}
              alt="Product mockup"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono"
              onClick={() =>
                downloadImageUrl(generatedUrl, `${productType}-mockup.png`)
              }
              data-ocid="mockup.secondary_button"
            >
              <Download className="w-3.5 h-3.5" />
              Download Mockup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-mono"
              onClick={handleGenerate}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin AI Studio Tab (also exported for use in Admin Dashboard) ───────────

interface AIStudioGeneratedImage {
  url: string;
  prompt: string;
  timestamp: string;
}

export function AIStudioTab() {
  const [prompt, setPrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("Photorealistic");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AIStudioGeneratedImage[]>([]);

  // Video generator state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const AI_STYLES: Record<string, string> = {
    Photorealistic:
      "photorealistic, ultra detailed, 8k photography, sharp focus",
    Cartoon: "cartoon style, vibrant colors, clean lines, animated look",
    Watercolor: "watercolor painting, soft edges, artistic, painterly",
    Minimalist: "minimalist design, clean white background, simple shapes",
    Grunge: "grunge texture, distressed, raw aesthetic, edgy graphic design",
    Neon: "neon lights, dark background, glowing colors, cyberpunk aesthetic",
    Vintage: "vintage retro style, aged texture, nostalgic, old-school design",
    Abstract: "abstract art, creative, dynamic composition, modern",
    "3D Render":
      "3d render, cinema 4d, blender, high quality 3d art, realistic materials",
    Logo: "professional logo design, vector style, clean, white background",
    Product:
      "commercial product photography, studio lighting, white background",
    "Social Media":
      "social media graphic, bold typography, vibrant colors, eye-catching",
  };

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsLoading(true);
    try {
      const styleHint = AI_STYLES[imageStyle] ?? "";
      const fullPrompt = `${prompt}, ${styleHint}`;
      const seed = Date.now();
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&safe=false&enhance=true&seed=${seed}`;

      // Try up to 3 times
      let loaded = false;
      for (let attempt = 0; attempt < 3 && !loaded; attempt++) {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            const timeout = setTimeout(
              () => reject(new Error("Timeout")),
              30000,
            );
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed"));
            };
            img.src =
              attempt === 0 ? url : `${url}&seed=${seed + attempt * 1000}`;
          });
          loaded = true;
          setGeneratedUrl(
            attempt === 0 ? url : `${url}&seed=${seed + attempt * 1000}`,
          );
        } catch {
          if (attempt === 2) throw new Error("All attempts failed");
        }
      }
      const newItem: AIStudioGeneratedImage = {
        url: generatedUrl || url,
        prompt: prompt.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 12));
      toast.success("Image generated!");
    } catch {
      toast.error("Generation failed after 3 attempts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateVideo() {
    if (!videoPrompt.trim()) {
      toast.error("Please enter a video prompt");
      return;
    }
    setIsVideoLoading(true);
    setVideoUrl("");
    try {
      const encodedPrompt = encodeURIComponent(videoPrompt);
      const url = `https://video.pollinations.ai/prompt/${encodedPrompt}`;
      setVideoUrl(url);
      toast.success("Video URL ready — click play below!");
    } catch {
      toast.error("Video generation failed. Please try again.");
    } finally {
      setIsVideoLoading(false);
    }
  }

  function deleteHistoryItem(index: number) {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Image Prompt *
              </Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. MEGATRX brand logo with lightning bolt, bold typography, red and black..."
                className="bg-background/50 min-h-[80px] resize-none"
                data-ocid="aistudio.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase text-muted-foreground">
                Style
              </Label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger
                  className="bg-background/50"
                  data-ocid="aistudio.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AI_STYLES).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="gap-2 font-mono"
            data-ocid="aistudio.primary_button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? "Generating..." : "Generate Image"}
          </Button>

          {isLoading && (
            <div
              className="flex items-center gap-3 text-muted-foreground py-4"
              data-ocid="aistudio.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-mono">
                Creating your image... (may take 15-30s)
              </span>
            </div>
          )}

          {generatedUrl && !isLoading && (
            <div className="space-y-3" data-ocid="aistudio.success_state">
              <div className="rounded-lg overflow-hidden border-2 border-primary/30 max-w-sm">
                <img
                  src={generatedUrl}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono"
                onClick={() =>
                  downloadImageUrl(generatedUrl, "generated-image.png")
                }
                data-ocid="aistudio.secondary_button"
              >
                <Download className="w-3.5 h-3.5" />
                Download Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Generator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            AI Video Generator
            <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 ml-1">
              BETA
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Video Prompt *
            </Label>
            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="e.g. MEGATRX logo animation with fire effects, cinematic, dark background..."
              className="bg-background/50 min-h-[70px] resize-none"
              data-ocid="video.textarea"
            />
          </div>
          <Button
            onClick={handleGenerateVideo}
            disabled={isVideoLoading || !videoPrompt.trim()}
            className="gap-2 font-mono"
            data-ocid="video.primary_button"
          >
            {isVideoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isVideoLoading ? "Preparing..." : "Generate Video"}
          </Button>
          {videoUrl && !isVideoLoading && (
            <div className="space-y-3" data-ocid="video.success_state">
              <p className="text-xs text-muted-foreground font-mono">
                Your video is ready — click play (may take a moment to buffer):
              </p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg border border-border max-h-64"
                onError={() => {
                  window.open(videoUrl, "_blank");
                }}
              >
                <track kind="captions" src="" label="No captions available" />
              </video>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-mono uppercase tracking-wider">
                Recent Generations
              </CardTitle>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs text-muted-foreground hover:text-destructive font-mono transition-colors"
              >
                Clear all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {history.map((item, i) => (
                <div
                  key={`${item.timestamp}-${i}`}
                  className="relative group cursor-pointer"
                  data-ocid={`aistudio.item.${i + 1}`}
                >
                  <button
                    type="button"
                    className="block w-20 h-20 rounded-md overflow-hidden border border-border"
                    onClick={() => setGeneratedUrl(item.url)}
                  >
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <p className="text-[8px] font-mono text-white text-center px-1 line-clamp-2">
                      {item.prompt}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistoryItem(i);
                      }}
                      className="bg-red-500/80 rounded-full p-0.5 hover:bg-red-500 transition-colors"
                      aria-label="Delete"
                      data-ocid={`aistudio.delete_button.${i + 1}`}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: "logo",
    icon: Wand2,
    label: "Logo Generator",
    description: "Generate professional logos with AI in seconds",
  },
  {
    id: "social",
    icon: Sparkles,
    label: "Social Media",
    description: "Create branded graphics for Instagram, TikTok & Facebook",
  },
  {
    id: "background",
    icon: Eraser,
    label: "Background Remover",
    description: "Remove backgrounds from images with one click",
  },
  {
    id: "palette",
    icon: Palette,
    label: "Color Palette",
    description: "Generate brand color palettes and font pairings",
  },
  {
    id: "mockup",
    icon: Shirt,
    label: "Mockup Creator",
    description: "Place your design on realistic product mockups",
  },
];

export default function DesignToolsPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border bg-gradient-to-br from-background via-background to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Powered by AI
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            AI Design <span className="text-primary">Tools</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-body">
            Create professional graphics instantly — logos, social posts, color
            palettes, and product mockups. Free to use for MEGATRX customers.
          </p>
        </div>
      </section>

      {/* Tools grid — quick overview */}
      <section className="py-8 border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="flex flex-col items-center text-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <p className="text-xs font-mono font-semibold">
                    {tool.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools tabs */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="logo" className="space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="flex w-max bg-card border border-border h-auto p-1 gap-0.5">
                {TOOLS.map(({ id, icon: Icon, label }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="font-mono text-xs uppercase tracking-wide py-2.5 px-4 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                    data-ocid={`tools.${id}.tab`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="logo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Logo Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter your brand name and preferences — AI will generate
                    logo options instantly.
                  </p>
                </CardHeader>
                <CardContent>
                  <LogoGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Social Media Post Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate ready-to-use branded graphics for Instagram,
                    TikTok, and Facebook.
                  </p>
                </CardHeader>
                <CardContent>
                  <SocialPostGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="background">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eraser className="w-5 h-5 text-primary" />
                    Background Remover
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload an image and remove the background with one click.
                    Best with solid or light backgrounds.
                  </p>
                </CardHeader>
                <CardContent>
                  <BackgroundRemover />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="palette">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Palette & Brand Kit Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate a full color palette and font pairing for your
                    brand based on name and mood.
                  </p>
                </CardHeader>
                <CardContent>
                  <ColorPaletteGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mockup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-primary" />
                    Mockup Creator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload your design and see it placed on realistic product
                    mockups.
                  </p>
                </CardHeader>
                <CardContent>
                  <MockupCreator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 border-t border-border bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter">
              Like what you see?
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Turn your AI-generated concepts into real products. Our designers
            can refine and produce anything.
          </p>
          <Button
            size="lg"
            className="gap-2 font-mono"
            onClick={() => window.dispatchEvent(new Event("openMegatrxChat"))}
            data-ocid="tools.cta.primary_button"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with a Designer
          </Button>
        </div>
      </section>
    </div>
  );
}
