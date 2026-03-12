# InfluencerConnect

A two-sided marketplace connecting influencers with companies for advertising campaigns. Companies post campaign briefs, influencers discover and apply, and the platform handles the full workflow from discovery through payment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Role-based auth** — separate flows for influencers and companies (credentials + Google + GitHub)
- **Campaign management** — companies create and manage campaigns; influencers browse and apply
- **Real-time messaging** — Pusher-powered chat between companies and influencers
- **Payments** — Stripe Connect with escrow: funds held until content is approved, then released to influencer
- **Content submission & review** — influencers submit deliverables, companies approve or request revisions
- **Reviews & ratings** — mutual reviews after campaign completion
- **File uploads** — avatars, media kits, and message attachments via Cloudflare R2
- **Notifications** — in-app real-time notifications + transactional email via Resend

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Database | Neon Postgres (serverless) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Auth.js) |
| Realtime | Pusher |
| Payments | Stripe Connect |
| Storage | Cloudflare R2 |
| UI | Tailwind CSS v3 + shadcn/ui |
| Email | Resend |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- Accounts for: Pusher, Stripe, Cloudflare R2, Resend (only required for the features you're running)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/seanleken/influencerconnect.git
   cd influencerconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the values in `.env.local` — at minimum you need `DATABASE_URL`, `DIRECT_URL`, and `NEXTAUTH_SECRET` to run the app locally.

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list. Variables are grouped by service:

- `DATABASE_URL` / `DIRECT_URL` — Neon connection strings
- `NEXTAUTH_*` / `GOOGLE_*` / `GITHUB_*` — auth
- `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` — realtime messaging
- `STRIPE_*` / `NEXT_PUBLIC_STRIPE_*` — payments
- `R2_*` — file storage
- `RESEND_API_KEY` — email

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (platform)/      # Authenticated app pages
│   └── api/             # Stripe webhooks, Pusher auth, file presign
├── actions/             # Server Actions (all mutations)
├── components/          # UI components by domain
├── lib/                 # Singletons: db, auth, pusher, stripe, r2, email
├── schemas/             # Zod validation schemas
├── services/            # Data access layer
└── types/               # Shared TypeScript types
```

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma migrate dev   # Create and apply a migration
npx prisma studio        # Visual database browser
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — Copyright (c) 2026 Sean Pertet
