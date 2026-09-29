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
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_INR` | public | Free-shipping threshold in rupees (default 2999) |
| `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_FACEBOOK_URL` / `NEXT_PUBLIC_YOUTUBE_URL` | public | Optional social links shown in the footer |
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
5. Make yourself an admin: sign up, then in the SQL editor run
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');`

Notes:

- `orders` and `order_items` are not readable or writable by the anon or authenticated roles. Use the admin client (`frontend/src/lib/supabase/admin.ts`) from server code.
- Seed images are generated placeholders in `frontend/public/products` (`npm run images:placeholders` recreates them). Upload real photos to the `product-images` bucket and update `product_images.url`; hosts allowed by `next/image` come from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_IMAGE_DOMAINS`.
- After changing the schema, regenerate types with link the project from `backend/` as above, then run `npm run db:types` in `frontend/`. Entity types in `src/types/index.ts` derive from the generated `Database` type.
