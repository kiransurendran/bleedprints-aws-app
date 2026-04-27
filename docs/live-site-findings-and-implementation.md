# Live Site Findings And Implementation Plan

Audit refreshed: 2026-04-25

## Current Status

The app is now much closer to a real deployment target than a mock storefront.

Implemented in the repo now:

- Supabase-backed catalog, product detail, order history, and admin CMS flows
- Hidden admin login and admin studio routes
- Email/password, phone OTP, Google, and Apple auth entry points in the app
- Auth-required checkout and order history
- Razorpay order creation and payment verification through Supabase Edge Functions
- Navbar account dropdown with logout, profile, orders, collections, and admin access
- Homepage collection filters, print-size filters, orientation filters, search, and sort
- Live custom studio page using real catalog products plus upload preview mode
- Product SEO fields, canonical handling, manifest, robots, and product structured data
- Build-time sitemap generation from static routes plus live product slugs
- Runtime sample-image usage removed from public-facing pages

Removed or cleaned up:

- public admin/CMS links in the navbar
- fake promo-code inputs
- fake write-a-review CTA and review block
- sample-image hero usage on the series page and order confirmation page
- silent storefront fallback to local sample products

## What Is Still Manual Or External

These items are not blocked by code anymore, but they still need project-side setup.

### 1. Supabase Auth provider enablement

Still required in Supabase dashboard:

- enable Google provider
- enable Apple provider
- enable phone auth with a real SMS provider
- confirm `Site URL` and `Redirect URLs` for local, preview, and production

### 2. Deployment wiring

Still required in the target environments:

- add production environment variables in the host
- add required Supabase secrets for Edge Functions
- deploy `create-razorpay-order` and `verify-razorpay-payment`
- validate SPA rewrite rules on the chosen host

### 3. Post-purchase operations

Still not implemented in code:

- transactional emails for order confirmation and status updates
- refund / support recovery workflows beyond the current baseline order flow

### 4. Observability

Still needed before a public launch:

- analytics
- error tracking
- uptime monitoring
- alerting

### 5. Legal and support content

Still needs review before public launch:

- terms
- privacy
- returns wording
- support contact details

## What Changed In This Pass

### Storefront discovery

- Navbar search now routes into the live catalog.
- Homepage search and sort are active and URL-backed.
- Search works together with collection, print-size, and orientation filters.
- The homepage now has honest empty states and active search/filter chips.

### Custom studio

- `CreatePosterPage.tsx` is no longer a static mock.
- Catalog mode now works with real products and can add the selected print to cart.
- Upload mode now supports local image previewing and a manual custom-quote request path.
- The page clearly distinguishes between direct checkout-ready catalog prints and manual custom uploads.

### Production cleanup

- Public runtime sample-image usage was removed.
- Silent sample-product fallback was removed from the storefront data layer.
- Sitemap generation is now script-driven instead of relying on a permanently static file.
- OAuth error handling is clearer when providers are not enabled in Supabase.

## Launch Checklist

### Ready in code

- catalog reads
- search and sort
- auth guards
- admin guards
- checkout auth requirement
- Razorpay order flow
- custom studio baseline
- SEO metadata
- generated sitemap

### Must be completed manually

1. Enable Google and Apple in Supabase Auth.
2. Configure phone auth in Supabase.
3. Add preview and production redirect URLs in Supabase Auth.
4. Deploy the latest Edge Functions to Supabase.
5. Set all host and Supabase environment variables.
6. Run hosted QA on auth, checkout, payment verification, and order history.
7. Wire transactional email.
8. Add monitoring and analytics.
9. Review legal/support copy.

## Recommended Next Execution Order

1. Finish Supabase provider setup for Google, Apple, and phone auth.
2. Deploy the updated Edge Functions and confirm checkout works end to end.
3. Connect the host environment variables and create a preview deployment.
4. Run hosted QA across auth, cart, checkout, payment, order confirmation, and admin.
5. Add email plus observability before switching the production domain.

## Repo References

- Main setup notes: [README.md](/Users/kiran/Documents/workspace/bleedprints-react-app/README.md:1)
- Architecture diagram: [docs/architecture.md](/Users/kiran/Documents/workspace/bleedprints-react-app/docs/architecture.md:1)
- Admin runbook: [docs/admin-access-and-setup.md](/Users/kiran/Documents/workspace/bleedprints-react-app/docs/admin-access-and-setup.md:1)
- Schema: [supabase/schema.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/schema.sql:1)
- Upgrade script: [supabase/app-readiness-upgrade.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/app-readiness-upgrade.sql:1)
