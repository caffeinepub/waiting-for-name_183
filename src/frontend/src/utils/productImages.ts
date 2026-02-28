// Local image map — paths here appear in compiled JS so the prune script keeps them
const categoryImageMap: Record<string, string> = {
  "Business Cards": "/assets/generated/product-business-cards.dim_800x800.jpg",
  "Photo Books": "/assets/generated/product-photo-book.dim_800x800.jpg",
  "Coffee Mugs": "/assets/generated/product-coffee-mug.dim_800x800.jpg",
  "T-Shirts": "/assets/generated/product-tshirt.dim_800x800.jpg",
  Sweaters: "/assets/generated/product-sweater.dim_800x800.jpg",
  Tumblers: "/assets/uploads/82F48B36-35A5-4866-8CDD-468614CA4C54-9.png",
  "Event Invitations":
    "/assets/uploads/0B019974-FB8C-46E0-87BF-FCBA7D6E8B7C-3-8.png",
  "Sports Graphics":
    "/assets/uploads/Screenshot-2025-11-10-at-3.42.52-PM-1-2.png",
  "Posters & Banners":
    "/assets/generated/product-poster-banner.dim_800x800.jpg",
  "Stickers & Decals": "/assets/generated/product-stickers.dim_800x800.jpg",
};

const portfolioImageMap: Record<string, string> = {
  "Tumbler Design":
    "/assets/uploads/82F48B36-35A5-4866-8CDD-468614CA4C54-9.png",
  "Sports Graphics":
    "/assets/uploads/Screenshot-2025-11-10-at-3.42.52-PM-2-6.png",
  "Event Invitations":
    "/assets/uploads/0B019974-FB8C-46E0-87BF-FCBA7D6E8B7C-1-3.png",
  "Photography Flyer":
    "/assets/uploads/Screenshot-2025-04-05-at-11.47.51-AM.jpeg-4-1.png",
  "Real Estate":
    "/assets/uploads/Screenshot-2025-04-05-at-11.47.51-AM.jpeg-5-4.png",
  "Custom Merch":
    "/assets/uploads/82F48B36-35A5-4866-8CDD-468614CA4C54-1-11.png",
  "Party Design":
    "/assets/uploads/0B019974-FB8C-46E0-87BF-FCBA7D6E8B7C-2-5.png",
};

// Fallback placeholders referenced directly so they survive pruning too
const fallbackImages = [
  "/assets/generated/product-business-cards.dim_800x800.jpg",
  "/assets/generated/product-coffee-mug.dim_800x800.jpg",
  "/assets/generated/product-photo-book.dim_800x800.jpg",
  "/assets/generated/product-poster-banner.dim_800x800.jpg",
  "/assets/generated/product-stickers.dim_800x800.jpg",
  "/assets/generated/product-sweater.dim_800x800.jpg",
  "/assets/generated/product-tshirt.dim_800x800.jpg",
];

/** Returns true if the imageUrl is a usable image src (not empty/placeholder) */
function isValidImageUrl(imageUrl: string | undefined | null): boolean {
  if (!imageUrl) return false;
  const s = imageUrl.trim();
  if (!s) return false;
  // Accept base64 data URLs
  if (s.startsWith("data:image/")) return true;
  // Accept absolute http/https URLs
  if (s.startsWith("http://") || s.startsWith("https://")) return true;
  // Accept local asset paths
  if (s.startsWith("/assets/")) return true;
  return false;
}

export function getProductImage(category: string, imageUrl: string): string {
  if (isValidImageUrl(imageUrl)) {
    return imageUrl;
  }
  // Look up category in the local map
  if (categoryImageMap[category]) {
    return categoryImageMap[category];
  }
  // Fallback: cycle through product images based on category hash
  const idx =
    Math.abs(category.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) %
    fallbackImages.length;
  return fallbackImages[idx];
}

export function getPortfolioImage(title: string, imageUrl: string): string {
  if (isValidImageUrl(imageUrl)) {
    return imageUrl;
  }
  // Search portfolio map by partial title match
  for (const [key, path] of Object.entries(portfolioImageMap)) {
    if (
      title.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(title.toLowerCase())
    ) {
      return path;
    }
  }
  // Default to uploaded images cycled by title hash
  const uploadedImages = Object.values(portfolioImageMap);
  const idx =
    Math.abs(title.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) %
    uploadedImages.length;
  return uploadedImages[idx];
}

/** Category-based fallback for use in onError handlers */
export function getCategoryFallback(category: string): string {
  if (categoryImageMap[category]) return categoryImageMap[category];
  const idx =
    Math.abs(category.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) %
    fallbackImages.length;
  return fallbackImages[idx];
}
