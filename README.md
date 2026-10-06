# Vishwaswear

A mobile-first online store for menswear (suits, blazers, coats, trousers and shirts) selling to customers in India, priced in INR.
Customers browse, add to cart, pay with Razorpay (UPI, cards, net banking) and get confirmation emails. Staff run the shop from
an admin panel. The brand name lives in one place, so you can rename the whole site with a single setting.

See [AGENTS.md](AGENTS.md) for the coding rules this project follows.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4, Manrope via `next/font` |
| Database, auth, storage | Supabase (Postgres with Row Level Security, Auth with Google and email/password, Storage) |
| Payments | Razorpay Standard Checkout |
| Email | Resend with React Email templates |
| Validation | zod on every external input; react-hook-form on the larger forms |

## Folder structure

```
frontend/                      The Next.js app
  src/app/                     Routes only (thin pages)
    (shop)/                    Storefront: home, shop, product, cart, checkout, order, account, policies
    admin/                     Admin panel (login + protected area)
    api/webhooks/razorpay/     Razorpay webhook
    auth/callback/             Google sign-in return route
  src/components/              ui, layout, shop, cart, checkout, orders, admin
  src/actions/                 Server actions (checkout, cart, contact, newsletter, auth, admin/*)
  src/lib/                     supabase, razorpay, resend, data (catalogue reads), orders, admin, security, shop, utils
  src/config/                  site.ts (brand), shipping.ts (shipping rules and delivery window)
  src/types/                   Database types and shared types
  src/proxy.ts                 Session refresh and first gate for /admin
backend/
  supabase/migrations/         All SQL, run in filename order
  supabase/seed.sql            Sample catalogue (categories, products, variants, images)
```

## Getting started

```bash
cd frontend
cp .env.example .env.local     # then fill in the values (see below)
npm install
npm run dev                    # http://localhost:3000
```

Other scripts (run in `frontend/`): `npm run lint`, `npm run build`, `npm run start`, `npm run db:types`
(regenerate database types), `npm run images:placeholders` (regenerate the seed placeholder images).

## Environment variables

Copy `frontend/.env.example` to `frontend/.env.local`. Variables starting with `NEXT_PUBLIC_` are sent to the browser; everything
else stays on the server. Never put a secret in a `NEXT_PUBLIC_` variable.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | public | Brand name. Read only through `src/config/site.ts` |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL (used for SEO, sitemap, email links). No trailing slash |
| `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_YOUTUBE_URL` | public | Optional social links; hidden when empty |
| `ORDER_TOKEN_SECRET` | server | Signs order confirmation links. Long random string (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Supabase service role key. Bypasses RLS; keep secret |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | public | Extra hostnames allowed for `next/image` (comma separated). The Supabase host is added automatically |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | public | Razorpay key id (`rzp_test_...` or `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | server | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | server | Secret you set on the Razorpay webhook |
| `RESEND_API_KEY` | server | Resend API key |
| `EMAIL_FROM` | server | Sender, e.g. `Your Shop <orders@yourdomain.com>` (domain must be verified in Resend) |
| `ADMIN_NOTIFICATION_EMAIL` | server | Receives a notification for every paid order |
| `SUPPORT_EMAIL` | server | Support address shown to customers; receives contact-form messages |

Shipping rules (free above ₹2,999, otherwise ₹149) and the delivery window (4 to 7 business days) are in
`frontend/src/config/shipping.ts`. The return window (days) is in `frontend/src/config/site.ts`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com). Copy the project URL, anon key and service role key into `.env.local`.
2. Run the migrations in `backend/supabase/migrations` **in filename order**, either by pasting each file into the SQL editor, or with
   the CLI from `backend/`: `npx supabase init` (once), `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push`.

   | File | Adds |
   | --- | --- |
   | `20250101000000_catalog.sql` | Categories, products, images, variants, profiles, sign-up trigger |
   | `20250101000100_orders.sql` | Orders and order items |
   | `20250101000200_rls.sql` | Row Level Security (public reads active catalogue; orders private) |
   | `20250101000300_storage.sql` | Public `product-images` bucket, admin-only writes |
   | `20250101000400_payments.sql` | Idempotent checkout, atomic "mark paid and decrement stock" |
   | `20250101000500_emails_subscribers.sql` | Email-once flags, shipping fields, newsletter subscribers |
   | `20250101000600_admin_dashboard.sql` | Dashboard numbers |
   | `20250101000700_admin_management.sql` | Order timeline and status changes with stock restore, product saves, customers |
   | `20250101000800_rate_limits.sql` | Rate limiting for checkout, contact, newsletter and sign-in |

3. Load sample data: run `backend/supabase/seed.sql` in the SQL editor (safe to run again). It creates 5 categories and 20 products with generated
   placeholder images in `frontend/public/products`. Replace them with real photos from the admin panel before launch.
4. **Google sign-in** (optional but recommended):
   - Google Cloud Console: create a project, set up the OAuth consent screen, then Credentials > Create credentials > OAuth client ID > Web application.
     Add the authorised redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   - Supabase > Authentication > Providers > Google: enable it and paste the client ID and secret.
   - Supabase > Authentication > URL Configuration: set the Site URL to your production URL and add the Redirect URLs
     `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`.
5. After changing the schema, regenerate types with `npm run db:types` (the project must be linked from `backend/`).

## Razorpay setup

1. Create an account at [razorpay.com](https://razorpay.com). Start in **Test mode**.
2. Settings > API Keys > Generate test key. Put the key id in `NEXT_PUBLIC_RAZORPAY_KEY_ID` and the secret in `RAZORPAY_KEY_SECRET`.
3. Settings > Payment Capture: choose automatic capture.
4. Settings > Webhooks > Add new webhook:
   - URL: `https://<your-domain>/api/webhooks/razorpay`
   - Secret: any long random string. Put the same value in `RAZORPAY_WEBHOOK_SECRET`.
   - Events: `payment.captured` and `payment.failed`.
   - For local testing, expose your dev server with a tunnel (`ngrok http 3000`) and use that URL.
5. Test with card `4111 1111 1111 1111` (any future expiry and CVV) or UPI `success@razorpay`. The order should go from
   `pending_payment` to `paid`, stock should drop once, and two emails should go out.

**Going live:** complete Razorpay KYC and activate your account, switch the dashboard to **Live mode**, generate **live** keys, replace the
two key variables (`rzp_live_...`) in your hosting provider's environment, create the webhook again in Live mode (webhooks are separate per mode,
with a new secret for `RAZORPAY_WEBHOOK_SECRET`), then redeploy. Place one small real order and refund it to confirm everything.

If two customers pay for the last unit at the same moment, the later order stays `pending_payment` with `payment_issue = 'insufficient_stock'`;
refund it from the Razorpay dashboard (the admin order page shows a warning).

## Resend (email) setup

1. Create an account at [resend.com](https://resend.com) and an API key. Put it in `RESEND_API_KEY`.
2. Resend > Domains > Add domain. Add the DNS records it shows (SPF, DKIM, and optionally DMARC) at your DNS provider and wait until the domain shows **Verified**.
3. Set `EMAIL_FROM` to an address on that domain, e.g. `Your Shop <orders@yourdomain.com>`, and set `ADMIN_NOTIFICATION_EMAIL` and `SUPPORT_EMAIL`.
4. Until the domain is verified you can test with `EMAIL_FROM="Your Shop <onboarding@resend.dev>"`, which only delivers to your own Resend account email.

Emails sent: order confirmation (customer), new order (admin), order shipped (customer), newsletter welcome, and contact-form messages (to support).
Email problems are logged and never block an order.

## Creating the first admin

The admin panel is at `/admin`. Only accounts whose `profiles.role` is `admin` can use it.

1. Supabase dashboard > Authentication > Users > Add user > Create new user. Enter an email and password and tick **Auto Confirm User**.
2. In the SQL editor run (with that email):

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

3. Sign in at `/admin/login`. To remove admin access later, set `role = 'customer'`.

## Changing the site name

Set `NEXT_PUBLIC_SITE_NAME` (in `.env.local` locally, and in your hosting provider's environment variables) and redeploy. The name appears in the header, footer,
page titles, emails, structured data and policy pages. It is read in one place, `frontend/src/config/site.ts`; do not hardcode it elsewhere.
Also update `NEXT_PUBLIC_SITE_URL` and `EMAIL_FROM` if the domain changes.

## Deploying to Vercel

1. Push the repository to GitHub, then in Vercel choose **Add New > Project** and import it.
2. Set **Root Directory** to `frontend`. The framework preset is Next.js; the defaults for build (`npm run build`) are right.
3. Add every variable from the table above under Settings > Environment Variables (Production, and Preview if you want previews to work).
   Use your real domain for `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Then add your custom domain under Settings > Domains and follow the DNS instructions.
5. Update the production settings elsewhere: Supabase Site URL and Redirect URLs, the Razorpay webhook URL, and the Google OAuth redirect (the Supabase callback URL does not change).
6. Check `https://<your-domain>/sitemap.xml` and `/robots.txt`, then submit the sitemap in Google Search Console.

Public pages (home and product pages) are cached and refresh automatically: every 1 to 2 minutes, and immediately when the admin edits the catalogue or a paid order changes stock.

## How it works (short version)

- **Cart:** stored in the browser. Before checkout, and whenever the cart page opens, the server re-reads prices and stock from the database and corrects the cart.
- **Checkout:** `createOrder` recomputes totals on the server, saves a `pending_payment` order and creates the Razorpay order. Repeated submits reuse one order.
- **Payment:** both the browser verify step and the Razorpay webhook call one database function that marks the order paid and decrements stock in a single transaction, so stock is taken exactly once.
- **Emails:** sent after payment, each at most once (claimed with an atomic database update).
- **Admin:** every page and server action re-checks `profiles.role = 'admin'` on the server.

## Security notes

- Row Level Security is on for every table. Anonymous visitors can only read the active catalogue; orders, subscribers, rate limits and order events have no client access.
  Privileged database functions are callable by the service role only.
- Secrets never reach the browser (only `NEXT_PUBLIC_` values do). The service role client is `server-only`.
- Security headers (CSP, frame, content-type, referrer, HSTS in production) are set in `frontend/next.config.ts`.
- Rate limits (stored in Postgres) apply to checkout, payment verification, contact, newsletter, order tracking and admin sign-in.
- Webhooks verify the Razorpay signature on the raw body; the checkout step verifies the payment signature with the key secret.
- Server errors are logged as one JSON line each (see `src/instrumentation.ts`); add an error tracker there if you use one.

Policy pages (privacy, terms, returns, shipping) contain sensible default wording. Have a lawyer review them for your business before launch, and
update the values they quote (return window, shipping fee, delivery time) in the config files if your policy differs.
