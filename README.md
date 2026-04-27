# BleedPrints React App

BleedPrints is a Vite + React + TypeScript storefront for curated wall art, backed by Supabase for auth, catalog content, admin CMS, storage, and order data, with Razorpay handling hosted payments.

## Current Stack

- Frontend: React + Vite + TypeScript
- Hosting target: Vercel or Netlify
- Backend: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Admin/CMS: hidden in-app admin studio plus Supabase Studio
- Payments: Razorpay Checkout
- Images: Supabase Storage
- SEO/build tooling: route metadata plus build-time sitemap generation

## What Is Live In Code

- Supabase-backed catalog reads for collections, product detail pages, and order history
- Hidden admin login and admin studio protected by auth + admin role checks
- Customer auth UI for email/password, phone OTP, Google, and Apple
- Auth-required checkout and order history
- Razorpay order creation and payment verification through Supabase Edge Functions
- Navbar account dropdown with profile, orders, collections, admin access, and logout
- Live homepage collection filtering, print-size filtering, orientation filtering, search, and sort
- Standalone editorial series page at `/series/summer-solstice`
- Custom studio powered by live catalog data plus optional upload previewing
- Product SEO fields, canonical paths, structured data, manifest, robots, and generated sitemap
- CI-ready scripts for lint, test, build, admin bootstrap, and sitemap generation

## Architecture

- Architecture diagram and service map: [docs/architecture.md](/Users/kiran/Documents/workspace/bleedprints-react-app/docs/architecture.md:1)
- Admin access runbook: [docs/admin-access-and-setup.md](/Users/kiran/Documents/workspace/bleedprints-react-app/docs/admin-access-and-setup.md:1)
- Production audit and next steps: [docs/live-site-findings-and-implementation.md](/Users/kiran/Documents/workspace/bleedprints-react-app/docs/live-site-findings-and-implementation.md:1)

## Local Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env`
3. Add your Supabase and Razorpay keys
4. Start the app with `npm run dev`

## Supabase Setup

1. Run [supabase/schema.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/schema.sql:1) for a fresh project, or [supabase/app-readiness-upgrade.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/app-readiness-upgrade.sql:1) for an existing project
2. Run [supabase/seed-sample-collections.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/seed-sample-collections.sql:1) if you want the starter collection records in the CMS
3. Deploy the Edge Functions from `supabase/functions/`
4. Add Supabase secrets:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Create the first admin account:
   - existing auth user: run [supabase/promote-admin-user.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/promote-admin-user.sql:1)
   - no users yet: run `npm run create-admin-user -- you@example.com "strong-password" "Your Name"`
6. Populate `collections`, `products`, `product_dimensions`, and `product_images` with real catalog data

## Auth Provider Setup

These still require manual Supabase dashboard work because provider secrets and callbacks do not live in the repo.

### Required provider configuration

- Enable `Email`
- Enable `Phone`
- Enable `Google`
- Enable `Apple`

### Required Supabase Auth URLs

- `Site URL`: your app origin
- `Redirect URLs`:
  - local: `http://localhost:5173/**`
  - preview: your preview domain
  - production: your production domain
- OAuth callback for provider consoles:
  - `https://<your-project-ref>.supabase.co/auth/v1/callback`

## Hidden Admin Routes

- Admin access route: `/vault/meridian-entry`
- Admin dashboard route: `/vault/meridian-entry/studio`

Both are configurable through:

- `VITE_ADMIN_ACCESS_PATH`
- `VITE_ADMIN_DASHBOARD_PATH`

## Available Scripts

- `npm run dev` starts the local Vite server
- `npm run lint` runs ESLint
- `npm run test` runs the Vitest suite
- `npm run generate-sitemap` writes `public/sitemap.xml` from static routes plus live product slugs when Supabase env is available
- `npm run build` regenerates the sitemap and creates the production build
- `npm run preview` previews the production build locally
- `npm run create-admin-user -- you@example.com "strong-password" "Your Name"` creates and promotes the first admin account using the Supabase service role key

## Environment Variables

See [.env.example](/Users/kiran/Documents/workspace/bleedprints-react-app/.env.example:1).

Important public values:

- `VITE_PUBLIC_SITE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_FUNCTIONS_URL`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_ADMIN_ACCESS_PATH`
- `VITE_ADMIN_DASHBOARD_PATH`

Important server-side values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Deployment Notes

- The app uses `BrowserRouter`, so SPA rewrites are required
- Netlify rewrites are covered by [public/_redirects](/Users/kiran/Documents/workspace/bleedprints-react-app/public/_redirects:1)
- Vercel rewrites are covered by [vercel.json](/Users/kiran/Documents/workspace/bleedprints-react-app/vercel.json:1)
- `npm run build` now regenerates the sitemap before bundling

## What Still Needs Manual Work

- Enable Google and Apple providers in Supabase with real OAuth credentials
- Enable phone auth with a real SMS provider in Supabase
- Deploy the updated Edge Functions to the target Supabase project
- Set production environment variables in Supabase and your host
- Wire transactional email for order confirmation and status updates
- Add analytics, error tracking, and uptime monitoring
- Review legal/support content before public launch
