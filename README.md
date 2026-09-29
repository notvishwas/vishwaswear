# Vishwaswear

Mobile-first menswear storefront. Next.js (App Router), TypeScript, Tailwind CSS, Supabase, Razorpay, Resend. See [AGENTS.md](AGENTS.md) for project rules.

## Getting started

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

## Environment variables

Keep this table in sync with `.env.example`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | public | Brand name, read only via `src/config/site.ts` |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL |
| `RESEND_API_KEY` | server | Resend API key |
| `EMAIL_FROM` | server | From address for order emails |
| `ADMIN_NOTIFICATION_EMAIL` | server | Receives new-order notifications |
| `SUPPORT_EMAIL` | server | Support contact shown to customers |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Supabase service role key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | public | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | server | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | server | Razorpay webhook signature secret |
