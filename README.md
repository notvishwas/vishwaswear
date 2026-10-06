# Vishwaswear

Mobile-first menswear storefront. Next.js (App Router), TypeScript, Tailwind CSS, Supabase, Razorpay, Resend. See [AGENTS.md](AGENTS.md) for project rules.

## Repository layout

- `frontend/`: the Next.js app (pages, components, and the server-side code that runs inside it: data access, server actions, Supabase clients).
- `backend/`: the Supabase project (`supabase/migrations`, `supabase/seed.sql`).

## Getting started

Run app commands from `frontend/`:

```bash
cd frontend
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

## Environment variables

Keep this table in sync with `frontend/.env.example`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | public | Brand name, read only via `src/config/site.ts` |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_FACEBOOK_URL` / `NEXT_PUBLIC_YOUTUBE_URL` | public | Optional social links shown in the footer |
| `ORDER_TOKEN_SECRET` | server | Signs order confirmation links (long random string) |
| `RESEND_API_KEY` | server | Resend API key |
| `EMAIL_FROM` | server | From address for order emails |
| `ADMIN_NOTIFICATION_EMAIL` | server | Receives new-order notifications |
| `SUPPORT_EMAIL` | server | Support contact shown to customers |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Supabase service role key |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | public | Extra hostnames allowed for `next/image` (comma separated) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | public | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | server | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | server | Razorpay webhook signature secret |

## Database setup

Schema lives in `backend/supabase/migrations`, seed data in `backend/supabase/seed.sql`.

1. Create a project at [supabase.com](https://supabase.com) and copy the project URL, anon key and service role key into `frontend/.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. Apply the migrations, either way:
   - **SQL editor:** run each file in `backend/supabase/migrations` in filename order.
   - **CLI** (run from `backend/`): `npx supabase init` (once), `npx supabase login`, `npx supabase link --project-ref <ref>`, then `npx supabase db push`.
3. Load the catalog: paste `backend/supabase/seed.sql` into the SQL editor and run it. It is safe to run again.
4. Start the app and open `/catalog-check` to confirm categories and products load (temporary page; delete it once the shop pages exist).
5. Make an admin user: see [Admin area](#admin-area).

Notes:

- `orders` and `order_items` are not readable or writable by the anon or authenticated roles. Use the admin client (`frontend/src/lib/supabase/admin.ts`) from server code.
- Seed images are generated placeholders in `frontend/public/products` (`npm run images:placeholders` recreates them). Upload real photos to the `product-images` bucket and update `product_images.url`; hosts allowed by `next/image` come from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_IMAGE_DOMAINS`.
- After changing the schema, regenerate types with link the project from `backend/` as above, then run `npm run db:types` in `frontend/`. Entity types in `src/types/index.ts` derive from the generated `Database` type.

## Payments setup (Razorpay)

1. Run `backend/supabase/migrations/20250101000400_payments.sql` (adds the payment columns and the `mark_order_paid` function).
2. In the Razorpay dashboard, switch to **Test mode**, then copy the key id and key secret into `frontend/.env.local`
   (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
3. Under Settings > Payment Capture, use automatic capture, so `payment.captured` fires after each payment.
4. Add a webhook (Settings > Webhooks) pointing to `https://<your-domain>/api/webhooks/razorpay`, with the events
   `payment.captured` and `payment.failed`, and a secret of your choice. Put the same secret in `RAZORPAY_WEBHOOK_SECRET`.
   For local testing, expose your dev server with a tunnel such as `ngrok http 3000` and use that URL.
5. Pay with a Razorpay test card or UPI id (see the Razorpay test-mode docs). The order should move from `pending_payment` to `paid`
   and each variant's stock should drop by the quantity ordered, once.

If a customer pays for the last unit at the same moment someone else does, the second order stays `pending_payment` with
`payment_issue = 'insufficient_stock'` and needs a manual refund from the Razorpay dashboard.

## Google sign-in

Sign-in uses Supabase Auth with the Google provider. Shoppers can still check out as guests.

1. **Google Cloud Console** (console.cloud.google.com): create a project, then APIs & Services > OAuth consent screen (External; add your app name and support email).
   Then Credentials > Create credentials > OAuth client ID > Web application.
   - Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy the client ID and client secret.
2. **Supabase dashboard**: Authentication > Providers > Google. Enable it and paste the client ID and secret.
3. **Supabase dashboard**: Authentication > URL Configuration.
   - Site URL: your production URL (for example `https://vishwaswear.com`).
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`.
4. Restart the dev server and open `/login`.

Each Google user gets a `profiles` row automatically. Orders placed while signed in are stored against the user, and when someone
signs in, earlier guest orders with the same verified email are attached to their account. Their orders appear at `/account`.

## Admin area

The admin panel lives at `/admin` and is only for accounts whose `profiles.role` is `admin`. Visitors without a session are
redirected by the proxy; signed-in users are also checked against the database on every admin page, so a customer account
can never reach it.

1. Run `backend/supabase/migrations/20250101000600_admin_dashboard.sql` (adds the `admin_dashboard_stats` function).
2. **Create the first admin user.** In the Supabase dashboard open Authentication > Users > Add user > Create new user, enter an
   email and a password, and tick Auto Confirm User. (A trigger gives every new user a `profiles` row with the `customer` role.)
3. **Make that user an admin.** In the SQL editor run (using the same email):

   ```sql
   update public.profiles
   set role = admin
   where id = (select id from auth.users where email = you@example.com);
   ```

4. Sign in at `/admin/login` with that email and password. To demote someone later, set `role = customer`.

Dashboard numbers are computed in Postgres. A "paid order" means status `paid`, `processing`, `shipped` or `delivered`; cancelled,
refunded and unpaid orders are not counted. "Today" and "this month" use Indian Standard Time. Low stock counts variants of active
products with 5 or fewer units (`LOW_STOCK_THRESHOLD` in `src/lib/shop/variants.ts`).

To add an admin page, create it under `src/app/admin/(panel)/`, call `requireAdmin()` at the top of the page and of every data
function (use `getAdminDb()` for queries), and add it to `src/components/admin/nav-items.ts`.
