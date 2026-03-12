# InfluencerConnect

Two-sided marketplace connecting influencers with companies for advertising campaigns. Next.js App Router, TypeScript, Neon Postgres, Prisma, Pusher, Stripe Connect.

## Docs

- Technical spec: @technical-spec.md
- Frontend design brief: @frontend-brief.md

## Stack

- **Framework**: Next.js (App Router) with TypeScript strict mode
- **DB**: Neon Postgres with `@neondatabase/serverless` + `@prisma/adapter-neon`
- **ORM**: Prisma — singleton client in `src/lib/db.ts`
- **Auth**: NextAuth v5 (Auth.js) — JWT strategy, config in `src/lib/auth.ts`
- **Realtime**: Pusher — server SDK for actions, client SDK for components
- **Payments**: Stripe Connect (Express accounts)
- **Storage**: Cloudflare R2 via `@aws-sdk/client-s3`
- **UI**: Tailwind CSS v3 (`tailwind.config.ts`) + shadcn/ui
- **Validation**: Zod — shared schemas in `src/schemas/`
- **Email**: Resend

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio    # Visual DB browser
```

## Architecture Rules — IMPORTANT

1. **Server Components by default.** Every page is a Server Component. Only add `"use client"` when the component needs interactivity (event handlers, hooks, Pusher subscriptions).
2. **Server Actions for ALL mutations.** Define in `src/actions/*.ts`. Never use API routes for data mutations. Use `"use server"` at file top.
3. **Direct Prisma calls for data reads.** Fetch data in `async` Server Components via Prisma. No `useEffect` + `fetch` for page data. No API routes for reads.
4. **API routes ONLY for:** Stripe webhooks (`/api/webhooks/stripe`), Pusher auth (`/api/pusher/auth`), file upload presign (`/api/upload/presign`), OAuth callbacks.
5. **Zod validation on every Server Action.** Parse input with the matching schema from `src/schemas/` before any DB call. Return `{ success: true, data }` or `{ success: false, error }`.
6. **`revalidatePath()` after every mutation** in Server Actions to refresh cached data.
7. **Auth check in every Server Action and protected page.** Call `auth()` from `src/lib/auth.ts`, verify session exists, verify role matches.

## Code Style

- ES modules only (`import`/`export`), never CommonJS
- Destructure imports: `import { useState } from "react"`
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- All monetary values stored as **cents** (integers). Format for display only at render time.
- Use `cuid` for all primary keys via Prisma `@default(cuid())`
- Prefer named exports for components. Use default export only for page components.
- Colocate types with their schemas in `src/schemas/`. Infer types from Zod: `type Campaign = z.infer<typeof campaignSchema>`

## Tailwind

- Version 3 with `tailwind.config.ts` (TypeScript config)
- Custom design tokens defined in tailwind config `extend` — see @docs/frontend-brief.md
- shadcn/ui CSS variables mapped in `src/app/globals.css`
- Font stack: Plus Jakarta Sans (headings), Inter (body), JetBrains Mono (mono)
- **Never use Tailwind v4 syntax.** No `@theme`, no CSS-first config. Use `tailwind.config.ts` only.

## File Conventions

- Pages: `src/app/(auth)/` for public auth, `src/app/(platform)/` for authenticated
- Server Actions: `src/actions/<domain>.ts` (one file per domain)
- Zod schemas: `src/schemas/<domain>.ts`
- Shared components: `src/components/shared/`
- Domain components: `src/components/<domain>/`
- shadcn components: `src/components/ui/`
- Lib singletons: `src/lib/` (db, auth, pusher-server, pusher-client, stripe, r2, email, utils)
- Hooks: `src/hooks/`

## Prisma

- Schema at `prisma/schema.prisma`
- ALWAYS run `npx prisma generate` after schema changes before writing code that uses new models
- ALWAYS run `npx prisma migrate dev --name <descriptive-name>` after schema changes
- Use `select` and `include` to avoid over-fetching. Never use `findMany` without pagination.
- Connection uses Neon serverless adapter — do not use standard `PrismaClient()` constructor directly

## Pusher Pattern

- Server: import from `src/lib/pusher-server.ts`, trigger events inside Server Actions after DB write
- Client: import from `src/lib/pusher-client.ts`, subscribe in `useEffect` with cleanup
- Channel naming: `private-conversation-{id}` for messages, `presence-user-{id}` for notifications
- Events: `new-message`, `typing`, `message-read`, `new-notification`

## Git Workflow

- Create a new branch for each vertical slice: `slice-1/auth`, `slice-2/profiles`, etc.
- Commit after each meaningful unit of work, not at the end
- Write descriptive commit messages: `feat(campaigns): add search filters with URL param state`

## Testing Approach

- After completing each slice, verify it works end-to-end before moving to the next
- Check: auth guards work, role checks enforced, validation errors surface, happy path completes
- Run `npm run build` to catch type errors before considering a slice done

## Common Mistakes to Avoid

- Do NOT create API route handlers for data fetching — use Server Components
- Do NOT use `useRouter` from `next/navigation` for form submissions — use Server Actions
- Do NOT put Pusher subscriptions in Server Components — Pusher client is browser-only
- Do NOT import `pusher-server.ts` in client components — it exposes secrets
- Do NOT use `localStorage` or `sessionStorage` — not relevant for this app
- Do NOT install Tailwind v4 or use its config format
