# Admin Access And Setup

This app no longer exposes admin or CMS links in the public navbar.

## Default hidden routes

- Admin access login: `/vault/meridian-entry`
- Admin dashboard studio: `/vault/meridian-entry/studio`

These defaults are wired in [src/lib/env.ts](/Users/kiran/Documents/workspace/bleedprints-react-app/src/lib/env.ts:1) and used in [src/App.tsx](/Users/kiran/Documents/workspace/bleedprints-react-app/src/App.tsx:1).

## Env overrides

If you want different hidden paths, set:

- `VITE_ADMIN_ACCESS_PATH`
- `VITE_ADMIN_DASHBOARD_PATH`

The matching examples live in [.env.example](/Users/kiran/Documents/workspace/bleedprints-react-app/.env.example:1).

## Admin login requirements

An admin user must satisfy all of these:

1. Supabase Auth must be configured in the target project.
2. The user must sign in through the hidden access page or the regular auth flow.
3. The user must have `role = 'admin'` in `public.user_profiles`.
4. The current schema and policies must be applied from [supabase/schema.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/schema.sql:1) or [supabase/app-readiness-upgrade.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/app-readiness-upgrade.sql:1).

## Promote the first admin

If no users exist yet, create the first admin with:

```bash
npm run create-admin-user -- you@example.com "strong-password" "Your Name"
```

That script:

- uses the server-side Supabase admin API
- creates the auth user
- auto-confirms the email
- upserts `public.user_profiles` with `role = 'admin'`

If the account already exists and only needs the admin role, run [supabase/promote-admin-user.sql](/Users/kiran/Documents/workspace/bleedprints-react-app/supabase/promote-admin-user.sql:1) after replacing the sample email.

## What the admin studio now supports

- SEO Title
- SEO Description
- Canonical Path
- Badge
- Badge Class
- Base Price defaulting to `200`
- Compare At Price defaulting to `249`
- Dimension amount and compare-at defaults synced from the base product pricing
- Automatic slug, badge, canonical, and SEO suggestions from the product title
- Product image previews in both the catalog list and image editor rows

The admin UI lives in [src/pages/AdminCmsPage.tsx](/Users/kiran/Documents/workspace/bleedprints-react-app/src/pages/AdminCmsPage.tsx:1), and the protected admin login page lives in [src/pages/AdminAccessPage.tsx](/Users/kiran/Documents/workspace/bleedprints-react-app/src/pages/AdminAccessPage.tsx:1).
