# MEGATRX Ecommerce

## Current State
The app has a full ecommerce site with products, portfolio, admin dashboard, cart, checkout, accounts, and more. Product images use a `getProductImage()` utility that maps categories and `/assets/uploads/` paths to local files. However:
- Product images display as broken "?" when `imageUrl` stored in backend doesn't match the expected formats
- Profile/account page has no avatar image but shows a broken image placeholder  
- The admin product/portfolio edit dialogs only have a text "Image URL" field - no file upload capability

## Requested Changes (Diff)

### Add
- File upload input in admin Products dialog (click to upload image from device, previewed before save, stored as base64 data URL in the imageUrl field)
- File upload input in admin Portfolio dialog (same pattern)
- Image preview in both admin dialogs showing the current or newly selected image
- Graceful `onError` fallback on all `<img>` tags so broken images show a styled placeholder instead of browser "?" icon

### Modify
- `getProductImage()` - also accept base64 data URLs and any valid http/https URL, not just `/assets/uploads/` paths
- `getPortfolioImage()` - same fix
- All product image `<img>` tags - add `onError` handler to replace broken images with category fallback
- Admin Products tab: replace plain "Image URL" text input with image upload component (file picker + preview + optional URL fallback)
- Admin Portfolio tab: same

### Remove
- Nothing removed

## Implementation Plan
1. Update `getProductImage` and `getPortfolioImage` in `productImages.ts` to handle base64 data URLs, http/https URLs, and not just `/assets/uploads/` paths
2. Create a reusable `ImageUploadField` component that shows a preview thumbnail, a "Change Image" / "Upload Image" button that opens a file picker, and a fallback URL text input
3. Integrate `ImageUploadField` into the ProductsTab dialog (replacing the plain Image URL input)
4. Integrate `ImageUploadField` into the PortfolioTab dialog (replacing the plain Image URL input)
5. Add `onError` fallback handlers to all `<img>` tags in ShopPage, ProductDetailPage, PortfolioPage, and any other place product/portfolio images are rendered
