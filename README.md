# Teniz

Teniz is a full-stack MVP for Caspian Sea fishery management in Kazakhstan. It covers the hackathon demo loop: fisherman catch registration, AI legality checks, QR traceability, buyer marketplace, and inspector oversight.

## Stack

- Next.js 14 App Router
- Supabase PostgreSQL + Storage
- Tailwind CSS
- Leaflet maps with client-only dynamic import
- Gemini API adapter with demo fallback
- `qrcode` for QR generation
- `html5-qrcode` for QR scanning
- PWA manifest and service worker

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

If keys are missing, the app uses demo data and deterministic AI fallbacks so the pitch flow still works.

## Supabase

Run `supabase/migrations/001_teniz_schema.sql` in Supabase SQL editor. It creates:

- `users`
- `catches`
- `lots`
- `quotas`
- `zones`
- public `catch-photos` storage bucket

The migration also seeds 10 sample catches near the Mangystau coast.

## Routes

- `/` role selection: Рыбак, Покупатель, Инспектор
- `/fisherman` mobile catch registration
- `/buyer` mobile active lots and QR scanner
- `/inspector` desktop dashboard
- `/fish-passport/[qr_id]` public fish passport
