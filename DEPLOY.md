# Deploying SuppStack

The app is a standard Next.js 16 app. It builds to a self-contained server
(`output: "standalone"`), so it runs anywhere Node or Docker runs.

> Data note: product/order data seeds from `src/data/catalog.ts`. On a
> writable disk (a normal server/VM) admin edits persist to `data/*.json`.
> On read-only serverless (Lambda/Netlify/Vercel functions) the app falls back
> to an in-memory copy — the store still works and displays, but admin edits and
> orders reset when the instance recycles. For persistent edits in production,
> use a VM/container (below) or move the store to a database.

## Fastest live URL (no server to manage)

**Vercel** (best fit for Next.js):
1. Push this repo to GitHub (already done).
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: Next.js (auto). Click Deploy. You get a public URL in ~2 min.

**Netlify**:
1. netlify.com → Add new site → Import from GitHub → pick the repo.
2. Netlify auto-detects Next.js. Deploy.

Set any needed env vars in the dashboard (see below).

## AWS

### Option A — AWS App Runner (simplest, container-based)
1. Build & push the image to ECR:
   ```bash
   aws ecr create-repository --repository-name suppstack
   docker build -t suppstack .
   aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com
   docker tag suppstack:latest <acct>.dkr.ecr.<region>.amazonaws.com/suppstack:latest
   docker push <acct>.dkr.ecr.<region>.amazonaws.com/suppstack:latest
   ```
2. App Runner → Create service → source: that ECR image → port `3000` → deploy.
   Admin edits persist while the instance runs.

### Option B — EC2 (a normal always-on server, edits persist to disk)
```bash
# on the instance
git clone <repo> && cd Suplement
npm ci && npm run build
npm start            # serves on port 3000
```
Put nginx or a load balancer in front for HTTPS, or run under `pm2`.

### Option C — ECS Fargate
Use the same Docker image as App Runner, task port `3000`.

## Local Docker (test the production build on your PC)
```bash
docker build -t suppstack .
docker run -p 3000:3000 suppstack
# open http://localhost:3000
```

## Environment variables (optional features)
Set these where you deploy if you use the feature:
- `ANTHROPIC_API_KEY` — the AI "Find My Stack" recommender (`/api/recommend`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe checkout
- `LEMONSQUEEZY_API_KEY` — LemonSqueezy checkout
- `ADMIN_SECRET` — protect the `/admin` pages (if unset, admin is open)

The storefront, catalog, cart and admin all work without any env vars.
