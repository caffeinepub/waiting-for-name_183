# Megatrax Graphic Designs

## Current State
- Full ecommerce site with shop, portfolio, admin dashboard, and chat widget
- Products saved in localStorage via AdminDashboardPage ProductsTab
- LocalProduct type: `{ id, name, description, price, category, imageUrls, stock }`
- CustomizationModal shows size selector only for apparel categories (t-shirts, sweaters, hoodies) with hardcoded S/M/L/XL/XXL options
- AI chatbot (ChatWidget.tsx) uses Pollinations.ai GET and POST endpoints with local fallbacks
- Products and portfolio add/edit in admin via dialogs

## Requested Changes (Diff)

### Add
- **Sizes/Variants field on LocalProduct** in admin: a comma-separated or tag-based input for admins to define available sizes per product (e.g. "iPhone 13, iPhone 14, iPhone 15 Pro" for cases; "S, M, L, XL" for shirts; "11oz, 15oz" for mugs)
- **Size selector in CustomizationModal**: instead of hardcoded apparel-only sizes, always show a size dropdown when the product has `sizes` defined, populated with those product-specific sizes. If no sizes defined, hide the size field
- **Better AI fallback**: improve the AI chatbot to use a more reliable endpoint and always have a robust local fallback that feels natural and responds to context

### Modify
- `LocalProduct` interface: add optional `sizes: string[]` field
- `ProductsTab` in AdminDashboardPage: add a "Sizes / Variants" input field in the add/edit product dialog. Users can type comma-separated values (e.g. "S, M, L, XL, XXL" or "iPhone 13, iPhone 14, iPhone 15 Pro Max") and they get split into an array on save
- `CustomizationModal`: remove `APPAREL_CATEGORIES` check; instead check `product.sizes` (passed as a prop or read from localStorage). Show size dropdown when sizes exist, hide when empty
- `ShopPage` and `ProductDetailPage`: pass `sizes` from the product data when opening the customization modal
- `ChatWidget.tsx` `fetchAIResponse`: use a more reliable primary fetch with better timeout handling; expand local fallback responses to cover more topics

### Remove
- Hardcoded `APPAREL_CATEGORIES` size gating in CustomizationModal (replaced by dynamic sizes from product data)

## Implementation Plan
1. Update `LocalProduct` interface in AdminDashboardPage to include `sizes?: string[]`
2. Add "Sizes / Variants" text input to the product add/edit form dialog (comma-separated), pre-populated when editing
3. Update `handleSave` in ProductsTab to parse the sizes input into an array and store with the product
4. Update `getLocalStorageProducts()` in ShopPage to pass `sizes` through in the mapped product shape
5. Update `CustomizationModal` props to accept optional `sizes?: string[]`; replace `APPAREL_CATEGORIES` check with `sizes && sizes.length > 0` check; populate SelectItems dynamically from sizes array
6. Update `openCustomizationModal` context/calls to pass `sizes` when opening the modal
7. Fix ChatWidget `fetchAIResponse`: switch primary endpoint to `https://text.pollinations.ai/` with a well-formed POST body; improve local fallback with more response variety and remove the "having trouble connecting" error message on fallback
8. Run validation
