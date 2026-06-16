# Backend Requirements README

This document captures when BleedPrints should move beyond the current frontend + Supabase setup, what the backend must own, and the safest implementation order.

## Current Baseline

The app currently uses:

- React/Vite frontend for storefront, account, checkout, and admin studio UI.
- Supabase Auth for customer/admin sessions.
- Supabase Postgres with RLS for catalog, profiles, orders, and order items.
- Supabase Edge Functions for Razorpay order creation and payment verification.
- Supabase Storage for product images.

This is enough for the current phase if the admin only needs lightweight order visibility and manual status updates.

## Do We Need A Backend?

Yes, but not necessarily a separate server immediately.

For the near term, Supabase Edge Functions can act as the backend. They are a good fit for payment callbacks, secure admin actions, email triggers, and small workflow automation.

A dedicated backend service becomes useful when BleedPrints needs long-running jobs, richer CRM workflows, shipping integrations, customer support tooling, advanced analytics, or integrations that should not live in the browser.

## Backend Responsibilities

- Authentication and authorization: verify Supabase JWTs, enforce admin roles, and keep service-role operations off the frontend.
- Order management: create, update, cancel, fulfill, refund, and audit order lifecycle changes.
- Razorpay webhooks: receive payment events, verify signatures, handle retries, and update orders idempotently.
- CRM basics: customer profiles, customer notes, order timeline, support tags, and communication history.
- Fulfillment: shipping labels, tracking numbers, dispatch status, delivery status, and manual fulfillment notes.
- Notifications: payment confirmation, order received, status changed, shipped, cancelled, and refunded emails/SMS/WhatsApp.
- Audit logging: record who changed order status, when, from which value, and why.
- Catalog governance: restrict sensitive product/category mutations to trusted admin APIs if direct client writes become too broad.
- File handling: private uploads, image transforms, invoice PDFs, and print-ready asset generation.
- Observability: structured logs, error tracking, payment webhook logs, and admin action logs.
- Security: rate limits, request validation, secret management, replay protection, and least-privilege database access.

## Data Requirements

The existing `orders` and `order_items` tables can remain the core. Add these tables when the workflow grows:

- `order_status_events`: immutable order timeline entries for status changes.
- `admin_audit_events`: records admin actions across orders, catalog, refunds, and customer notes.
- `webhook_events`: idempotency table for Razorpay webhook event IDs and raw payload references.
- `customer_notes`: private CRM notes attached to a customer or order.
- `support_tickets`: lightweight customer issue tracking.
- `fulfillment_shipments`: carrier, tracking number, shipping label URL, dispatch status, and delivery status.
- `notification_events`: email/SMS/WhatsApp send attempts, provider IDs, and delivery state.
- `refunds`: refund provider IDs, amount, reason, and status.

## API Requirements

Minimum backend endpoints/functions:

- `POST /orders/create-payment-order`: create a Razorpay order from a validated cart.
- `POST /orders/verify-payment`: verify Razorpay payment signature and mark the order paid.
- `POST /webhooks/razorpay`: verify Razorpay webhook signatures and update payment/order state idempotently.
- `GET /admin/orders`: list and filter orders for admins.
- `PATCH /admin/orders/:id/status`: update order status with audit trail.
- `POST /admin/orders/:id/notes`: add internal CRM notes.
- `POST /admin/orders/:id/fulfillment`: attach shipment/tracking details.
- `POST /admin/orders/:id/refund`: start and track refunds.

## Implementation Order

1. Stabilize the current Supabase schema, RLS, and admin order panel.
2. Add admin-only order status updates with an `order_status_events` audit trail.
3. Add Razorpay webhooks with signature verification and a `webhook_events` idempotency table.
4. Move admin order updates from direct frontend writes into an Edge Function.
5. Add transactional email for order received, payment confirmed, and status changed.
6. Add CRM primitives: customer notes, tags, and support issue tracking.
7. Add fulfillment primitives: shipment records, tracking numbers, and delivery status.
8. Add observability: error tracking, webhook logs, admin action logs, and dashboards.
9. Reassess whether Edge Functions are still enough or whether a dedicated Node/Fastify/Nest service is needed.

## Recommended Architecture

Start with Supabase Edge Functions as the backend layer.

Use a dedicated backend service later only if one of these becomes true:

- Workflows require queues, scheduled workers, or long-running tasks.
- Admin operations need complex server-side orchestration.
- Multiple third-party integrations need shared retry/error handling.
- CRM and fulfillment become large enough to justify a separate API domain.

## Required Secrets

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- Email provider API key, for example Resend, SendGrid, or SES.
- SMS/WhatsApp provider credentials, if used later.
- Shipping provider credentials, if used later.

## Current Recommendation

Do not build a full separate backend yet.

Use the admin order panel for immediate operations, then add backend behavior incrementally through Supabase Edge Functions. The first backend upgrade should be Razorpay webhooks plus order status audit logs, because those protect revenue and reduce manual reconciliation risk.
