# SuppStack — AI-Powered Supplement Store

A full-featured supplement e-commerce app built with Next.js 15, TypeScript, Tailwind CSS, Stripe, and the Anthropic API.

## Features

- **200+ product catalog** across 18 supplement categories with evidence ratings
- **AI recommender** — describe your goals, get personalised suggestions (Anthropic API)
- **Guided survey** — multi-step quiz to browse and select products
- **Cart & Stripe Checkout** — single cart, everything ships as one package
- **Order fulfillment** — automatic operator packing-list email + customer confirmation via Resend
- **Admin dashboard** at `/admin/orders` — view orders, packing lists, mark as shipped
- **JSON file order store** — zero-dependency, swappable behind a clean interface

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (test: `sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or Stripe Dashboard |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI recommendations |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `OPERATOR_EMAIL` | Where packing-list emails go |
| `FROM_EMAIL` | Sender address (must be verified in Resend) |
| `ADMIN_SECRET` | Secret token to protect `/admin/orders` |
| `NEXT_PUBLIC_BASE_URL` | Your app URL (e.g. `https://suppstack.vercel.app`) |

**Minimum to run locally:** No keys required — the app works without them (AI recommendations return an error, emails are logged to console, Stripe checkout requires keys).

## Stripe Setup

1. Get test keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. For webhooks in development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` secret to `STRIPE_WEBHOOK_SECRET`
3. In production, add the webhook endpoint in Stripe Dashboard pointing to `https://your-domain.com/api/webhooks/stripe`

## Email Setup (Resend)

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Set `RESEND_API_KEY`, `FROM_EMAIL`, and `OPERATOR_EMAIL`

Without `RESEND_API_KEY`, emails are logged to the server console instead.

## Admin Orders

Visit `/admin/orders` to see all orders with packing lists and mark them as shipped.

Protect it by setting `ADMIN_SECRET` — then access requires `?token=<your-secret>` in the URL.

## Vercel Deployment

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

For the Stripe webhook, add `https://your-app.vercel.app/api/webhooks/stripe` in Stripe Dashboard.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home (AI recommender + hero)
│   ├── products/                 # Browse + product detail pages
│   ├── survey/                   # Guided quiz
│   ├── cart/                     # Cart page
│   ├── checkout/success/         # Post-payment confirmation
│   ├── admin/orders/             # Admin order management
│   └── api/
│       ├── recommend/            # POST — Anthropic AI recommendations
│       ├── checkout/             # POST — Stripe Checkout Session
│       ├── webhooks/stripe/      # POST — Stripe webhook handler
│       └── admin/orders/         # GET/PATCH — Admin order API
├── components/                   # Shared UI components
├── context/CartContext.tsx        # Cart state (React context)
├── data/catalog.ts               # Full product catalog (200+ SKUs)
├── lib/
│   ├── orders.ts                 # JSON file order store
│   ├── fulfillment.ts            # Fulfillment provider interface
│   ├── stripe.ts                 # Stripe client
│   └── admin-auth.ts             # Admin token check
└── types/product.ts              # TypeScript types
data/
└── orders.json                   # Runtime order storage (gitignored)
```

## Extending

**Swap the order store:** Implement the same interface in `src/lib/orders.ts` backed by a database (Postgres, SQLite, etc.) — the webhook and admin routes call this interface only.

**Swap fulfillment:** Implement `FulfillmentProvider` in `src/lib/fulfillment.ts` to route orders to a third-party fulfillment API (ShipBob, etc.).

**Add products:** Edit `src/data/catalog.ts` — the catalog is a typed TypeScript array, trivially extensible.
