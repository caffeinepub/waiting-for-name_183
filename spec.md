# Megatrax Graphic Designs - Phase 1 Fix & Enhancement

## Current State
- Full ecommerce site with shop, portfolio, admin dashboard, chat widget, AI design tools
- Products/portfolio save to localStorage (admin page shows 0 items even though shop/portfolio pages show old seeded+local data)
- AI generators (logo, social media, mockup, background remover, color palette, video) on DesignToolsPage frequently fail or are very slow
- Live chat (ChatWidget) has UX issues: AI bot can interrupt an active human conversation, scroll area is too small, messages are hard to read
- Admin dashboard has Live Chat tab but the layout is cramped
- No TRX AI Premium credits/subscription system
- Free shipping is shown in some places
- Admin AI assistant doesn't have access to full chat history data

## Requested Changes (Diff)

### Add
- TRX AI Premium tab in admin: credit balance display, subscription toggle, "free for admin" badge
- Video generator in DesignToolsPage using free API (pollinations video or similar), with paid API key slot
- "Delete" button for each generated image in AI Studio/DesignTools history
- More style/prompt options in all AI generators (style presets dropdown, resolution choice)
- Generator switcher: allow toggling between Pollinations and a custom API key source
- PWA manifest with push notification support (service worker prompt when added to home screen)
- Shipping costs on all products (no free shipping label), competitive pricing shown at checkout

### Modify
- **Admin product/portfolio sync**: Admin page must load from localStorage (same source as shop/portfolio pages) and allow full CRUD there. Show count correctly.
- **AI generators**: Switch primary endpoint to `https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&enhance=true` with no content filtering params. Add retry logic (3 attempts). Social media generator fixed to use same reliable endpoint.
- **ChatWidget**: 
  - When in human-agent mode (admin has responded), AI bot must NOT inject responses
  - Live chat scroll area enlarged (min-height 400px), font size 14px min, message bubbles styled like SMS (user=right blue, agent=left green, bot=left gray)
  - Messages panel scrolls smoothly to bottom on new messages
- **Admin Live Chat tab**: Larger message window, easier to scroll individual sessions, clearer "REAL PERSON MODE" indicator, session list shows latest message preview
- **Admin AI Assistant**: Inject localStorage chat sessions, orders, design requests, and products as context in the system prompt so admin can ask questions about customer data
- **ProductDetailPage**: Add shipping info section below description card (estimated delivery 5-10 business days, pricing table)
- **DesignToolsPage**: Add delete button for recent generations, no-restriction mode (nologo, enhance params)

### Remove
- Any "Free Shipping" badges or labels from product cards and checkout

## Implementation Plan
1. Update AdminDashboardPage: fix product/portfolio tabs to read/write from localStorage and display correct counts
2. Update ChatWidget: fix human-mode AI interruption bug, improve scroll/layout, SMS-style bubbles
3. Update DesignToolsPage: fix all generators with reliable endpoint, add delete for generations, add video generator stub, add style presets
4. Update Admin Live Chat tab: better layout, larger scroll area, session previews
5. Update Admin AI Assistant: inject full customer data context
6. Add TRX AI Premium tab in admin (UI only, credits stored in localStorage)
7. Add PWA service worker notification prompt
8. Remove free shipping labels site-wide, add shipping cost info to ProductDetailPage
