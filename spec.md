# MEGATRX Graphic Design Ecommerce

## Current State
The site has a full ecommerce checkout flow. Payment is done via a Stripe Payment Link (redirect-based). The admin saves a Stripe Payment Link URL in localStorage, and at checkout customers are redirected to that external URL. There is no native Apple Pay or Google Pay button embedded in the page.

## Requested Changes (Diff)

### Add
- `@stripe/stripe-js` and `@stripe/react-stripe-js` npm packages
- A `StripePaymentButton` component that uses the Stripe Payment Request Button to show a native Apple Pay / Google Pay button when available in the browser
- Admin Payments tab: a "Stripe Publishable Key" field (in addition to the existing Stripe Payment Link field) so the owner can paste their `pk_live_...` key to enable native Apple Pay/Google Pay
- On the CartPage checkout sidebar: show the Apple Pay / Google Pay button (via Stripe Payment Request Button) above the regular "Pay Now" button when the browser supports it
- Clear instructions in admin about needing a Stripe publishable key (not secret key) for the Apple Pay button

### Modify
- `CartPage.tsx`: add Stripe Payment Request Button section above the existing "Pay Now" button when a Stripe publishable key is stored in localStorage
- `AdminDashboardPage.tsx` PaymentsTab: add a second field for Stripe Publishable Key with instructions
- `package.json` (frontend): add `@stripe/stripe-js` and `@stripe/react-stripe-js`

### Remove
- Nothing removed

## Implementation Plan
1. Install `@stripe/stripe-js` and `@stripe/react-stripe-js` in frontend/package.json
2. Create `src/frontend/src/components/StripeApplePayButton.tsx` -- loads Stripe with publishable key, creates a PaymentRequest for the cart total, shows the Payment Request Button (Apple Pay / Google Pay) if available
3. Update `CartPage.tsx` to import and render `StripeApplePayButton` when a publishable key is set and the cart total > 0
4. Update `AdminDashboardPage.tsx` PaymentsTab to add a Stripe Publishable Key input field with instructions, stored in localStorage as `megatrx_stripe_pk`
