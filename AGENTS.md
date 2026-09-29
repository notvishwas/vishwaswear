# Project rules

This is a mobile-first e-commerce website for a menswear clothing business selling suits, blazers, coats, pants, shirts and similar items. Currency is INR (₹). Customers are in India.

## Stack
Next.js (App Router) + TypeScript (strict) + Tailwind CSS + Supabase (Postgres, Auth, Storage) + Razorpay (payments) + Resend (emails).

## Design system
- Background: warm cream (#FAF7F2) or white
- Primary: dark navy (#0F1B2D)
- Accent: muted gold (#B08D57), used sparingly (thin borders, small highlights, badges)
- Font: Manrope (via next/font)
- Buttons: simple, dark navy fill, white text, high contrast, no gradients, small radius
- Product images: always a consistent 4:5 aspect ratio, object-cover
- Layout: mobile-first, then scale up with sm/md/lg breakpoints
- Overall feel: clean, premium, lots of whitespace, no clutter
- Admin: simple left sidebar (collapsible on mobile) + data tables

## Code rules
- Clean, small, readable files. One responsibility per file.
- Repo layout: `frontend/` is the Next.js app (UI and the server-side code that runs inside it); `backend/` holds the Supabase project (migrations, seed).
- Folder structure:
  frontend/src/{app (routes only, thin pages), components/{ui,layout,shop,cart,checkout,admin}, lib/{supabase,razorpay,resend,utils,data}, actions (server actions), types, config, hooks}
  backend/supabase/{migrations, seed.sql}
- No `any`. Validate all external input with zod.
- Server-only secrets never reach the client. Use `server-only` for server modules.
- Money is stored as integers in paise. Format with one shared helper.
- The website name must come from the env var NEXT_PUBLIC_SITE_NAME and be read through one config file (src/config/site.ts). Never hardcode the brand name anywhere else (titles, emails, footer, invoices, metadata all use the config).
- Never use placeholder text like "test", "demo", "lorem ipsum", "sample", "foo". Where content is needed, use realistic, believable made-up names, products, addresses and copy.
- Every page needs loading, empty and error states.
- Accessible: semantic HTML, labels, focus states, alt text.
- After each task, run `npm run lint` and `npm run build` and fix all errors before finishing.
- Keep `.env.example` and README in sync with any new env var.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
