# InfluencerConnect — Technical Specification

## Project Overview

InfluencerConnect is a two-sided marketplace that connects **influencers** with **companies** seeking advertising services. Companies post campaign briefs, influencers discover and apply, and the platform facilitates the entire workflow from discovery through payment.

This document is the implementation guide for Claude Code. Each section provides the context, patterns, and decisions needed to build the platform. **No full code listings are included** — Claude Code should generate all implementation code based on these specifications.

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js (App Router) | Latest stable, TypeScript strict mode |
| Language | TypeScript | Strict mode enabled in tsconfig |
| Database | PostgreSQL via Neon | Serverless driver (`@neondatabase/serverless`) |
| ORM | Prisma | With `@prisma/adapter-neon` for serverless |
| Auth | NextAuth.js (Auth.js v5) | Credentials + OAuth (Google, GitHub) |
| Realtime | Pusher | Server SDK in server actions, client SDK in components |
| Payments | Stripe Connect | Express accounts for influencers |
| File Storage | Cloudflare R2 | S3-compatible, via `@aws-sdk/client-s3` |
| UI | Tailwind CSS v3 + shadcn/ui | `tailwind.config.ts` format |
| Hosting | Vercel | Edge-compatible where possible |
| Email | Resend | Transactional emails (notifications, verification) |
| Validation | Zod | Shared schemas for client + server |

### Key Architectural Decisions

- **Server-first**: Maximise use of React Server Components, server-side data fetching, and Next.js Server Actions. API routes should only exist where strictly necessary (webhooks for Stripe/Pusher, OAuth callbacks).
- **No client-side fetching for data reads**: All page data is fetched in Server Components via direct Prisma calls. No `useEffect` + `fetch` patterns for loading page data.
- **Server Actions for mutations**: All form submissions and data mutations go through Server Actions with Zod validation, not API routes.
- **API routes only for**: Stripe webhooks, Pusher auth endpoint, file upload presigned URLs, and any third-party callback that requires a raw HTTP endpoint.

---

## Neon Database Setup

Use Neon's serverless driver with Prisma:

- Connection string: `DATABASE_URL` env var (Neon pooled connection string)
- Direct connection: `DIRECT_URL` env var (for Prisma migrations)
- Configure `prisma/schema.prisma` with `datasource db` pointing to Neon, using `directUrl` for migrations
- Use `@prisma/adapter-neon` with `@neondatabase/serverless` for the serverless-compatible client
- Create a singleton Prisma client in `lib/db.ts` that uses the Neon adapter

---

## Database Schema

### Enums

```
UserRole: INFLUENCER | COMPANY | ADMIN
CampaignStatus: DRAFT | OPEN | IN_PROGRESS | COMPLETED | CANCELLED
ApplicationStatus: PENDING | ACCEPTED | REJECTED | WITHDRAWN
ContentStatus: SUBMITTED | REVISION_REQUESTED | APPROVED
PaymentStatus: PENDING | ESCROWED | RELEASED | REFUNDED | FAILED
MessageType: TEXT | FILE | SYSTEM
SocialPlatform: INSTAGRAM | TIKTOK | YOUTUBE | TWITTER | LINKEDIN | OTHER
Niche: FASHION | BEAUTY | TECH | GAMING | FITNESS | FOOD | TRAVEL | LIFESTYLE | EDUCATION | FINANCE | ENTERTAINMENT | OTHER
```

### Models

**User**
- `id` — String, cuid, primary key
- `email` — String, unique
- `name` — String
- `passwordHash` — String, optional (null if OAuth-only)
- `role` — UserRole
- `emailVerified` — DateTime, optional
- `image` — String, optional (avatar URL)
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: one InfluencerProfile, one CompanyProfile, many SentMessages, many ConversationParticipants, many Reviews (given and received), many Notifications

**InfluencerProfile**
- `id` — String, cuid, primary key
- `userId` — String, unique, foreign key → User
- `bio` — String (max 1000 chars)
- `niches` — Niche[] (array of enum)
- `socialLinks` — Json (object with platform keys and URL/handle/follower count)
- `location` — String, optional
- `ratePerPost` — Int, optional (cents)
- `ratePerStory` — Int, optional (cents)
- `ratePerVideo` — Int, optional (cents)
- `mediaKitUrl` — String, optional (R2 file URL)
- `portfolioUrls` — String[] (array of URLs)
- `isAvailable` — Boolean, default true
- `rating` — Float, default 0
- `reviewCount` — Int, default 0
- `completedCampaigns` — Int, default 0
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: many Applications

**CompanyProfile**
- `id` — String, cuid, primary key
- `userId` — String, unique, foreign key → User
- `companyName` — String
- `website` — String, optional
- `industry` — String
- `description` — String (max 1000 chars)
- `logo` — String, optional (R2 URL)
- `size` — String, optional (e.g. "1-10", "11-50", "51-200", "201-500", "500+")
- `rating` — Float, default 0
- `reviewCount` — Int, default 0
- `campaignsPosted` — Int, default 0
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: many Campaigns

**Campaign**
- `id` — String, cuid, primary key
- `companyProfileId` — String, foreign key → CompanyProfile
- `title` — String
- `description` — String (rich text / markdown)
- `requirements` — String
- `niches` — Niche[] (array)
- `platforms` — SocialPlatform[] (array)
- `budgetMin` — Int (cents)
- `budgetMax` — Int (cents)
- `currency` — String, default "USD"
- `deliverables` — String (description of what's expected)
- `deadline` — DateTime
- `maxInfluencers` — Int, default 1
- `status` — CampaignStatus, default OPEN
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: many Applications, one CompanyProfile

**Application**
- `id` — String, cuid, primary key
- `campaignId` — String, foreign key → Campaign
- `influencerProfileId` — String, foreign key → InfluencerProfile
- `coverLetter` — String
- `proposedRate` — Int (cents)
- `status` — ApplicationStatus, default PENDING
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: one Campaign, one InfluencerProfile, one ContentSubmission, one Payment
- Unique constraint: [campaignId, influencerProfileId] (one application per influencer per campaign)

**ContentSubmission**
- `id` — String, cuid, primary key
- `applicationId` — String, unique, foreign key → Application
- `contentUrls` — String[] (links to posted content)
- `notes` — String, optional
- `status` — ContentStatus, default SUBMITTED
- `revisionNotes` — String, optional
- `submittedAt` — DateTime
- `reviewedAt` — DateTime, optional

**Payment**
- `id` — String, cuid, primary key
- `applicationId` — String, unique, foreign key → Application
- `amount` — Int (cents)
- `platformFee` — Int (cents)
- `stripePaymentIntentId` — String, optional
- `stripeTransferId` — String, optional
- `status` — PaymentStatus, default PENDING
- `paidAt` — DateTime, optional
- `createdAt` — DateTime

**Conversation**
- `id` — String, cuid, primary key
- `campaignId` — String, optional, foreign key → Campaign (null for general messages)
- `createdAt` — DateTime
- `updatedAt` — DateTime
- Relations: many ConversationParticipants, many Messages

**ConversationParticipant**
- `id` — String, cuid, primary key
- `conversationId` — String, foreign key → Conversation
- `userId` — String, foreign key → User
- `lastReadAt` — DateTime, optional
- Unique constraint: [conversationId, userId]

**Message**
- `id` — String, cuid, primary key
- `conversationId` — String, foreign key → Conversation
- `senderId` — String, foreign key → User
- `content` — String
- `type` — MessageType, default TEXT
- `fileUrl` — String, optional
- `createdAt` — DateTime
- Relations: one Conversation, one User (sender)

**Review**
- `id` — String, cuid, primary key
- `applicationId` — String, foreign key → Application
- `reviewerId` — String, foreign key → User (person writing)
- `revieweeId` — String, foreign key → User (person being reviewed)
- `rating` — Int (1-5)
- `comment` — String
- `createdAt` — DateTime
- Unique constraint: [applicationId, reviewerId]

**Notification**
- `id` — String, cuid, primary key
- `userId` — String, foreign key → User
- `type` — String (e.g. "NEW_APPLICATION", "APPLICATION_ACCEPTED", "NEW_MESSAGE", "PAYMENT_RECEIVED")
- `title` — String
- `body` — String
- `linkUrl` — String, optional
- `isRead` — Boolean, default false
- `createdAt` — DateTime

---

## Project Structure

```
influencer-connect/
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/               # Static assets (logo, placeholders)
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page (public)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── (platform)/               # Authenticated layout group
│   │   │   ├── layout.tsx            # Sidebar/nav layout
│   │   │   ├── dashboard/page.tsx    # Role-based dashboard
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx          # Browse/search campaigns
│   │   │   │   ├── new/page.tsx      # Create campaign (company)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Campaign detail
│   │   │   │       ├── edit/page.tsx
│   │   │   │       └── applications/page.tsx  # View applications (company)
│   │   │   ├── influencers/
│   │   │   │   ├── page.tsx          # Browse influencers (company)
│   │   │   │   └── [id]/page.tsx     # Influencer public profile
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx          # Conversation list
│   │   │   │   └── [conversationId]/page.tsx  # Chat thread
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Own profile view/edit
│   │   │   │   └── settings/page.tsx
│   │   │   ├── applications/
│   │   │   │   └── page.tsx          # My applications (influencer)
│   │   │   ├── payments/
│   │   │   │   └── page.tsx          # Payment history
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── webhooks/
│   │       │   └── stripe/route.ts
│   │       ├── pusher/
│   │       │   └── auth/route.ts     # Pusher private channel auth
│   │       └── upload/
│   │           └── presign/route.ts  # Generate presigned R2 URLs
│   ├── actions/                      # Server Actions
│   │   ├── auth.ts
│   │   ├── campaigns.ts
│   │   ├── applications.ts
│   │   ├── messages.ts
│   │   ├── reviews.ts
│   │   ├── profile.ts
│   │   ├── payments.ts
│   │   └── notifications.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignFilters.tsx
│   │   │   ├── CampaignForm.tsx
│   │   │   └── ApplicationForm.tsx
│   │   ├── influencers/
│   │   │   ├── InfluencerCard.tsx
│   │   │   └── InfluencerFilters.tsx
│   │   ├── messages/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ChatThread.tsx        # Client component with Pusher
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── reviews/
│   │   │   ├── ReviewForm.tsx
│   │   │   └── ReviewList.tsx
│   │   └── shared/
│   │       ├── FileUpload.tsx
│   │       ├── RatingStars.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── Pagination.tsx
│   │       ├── EmptyState.tsx
│   │       └── AvatarWithFallback.tsx
│   ├── lib/
│   │   ├── db.ts                     # Prisma + Neon singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── pusher-server.ts          # Pusher server instance
│   │   ├── pusher-client.ts          # Pusher client instance
│   │   ├── stripe.ts                 # Stripe server instance
│   │   ├── r2.ts                     # R2/S3 client
│   │   ├── email.ts                  # Resend client
│   │   └── utils.ts                  # Shared helpers (cn, formatCurrency, etc.)
│   ├── schemas/                      # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── campaign.ts
│   │   ├── application.ts
│   │   ├── profile.ts
│   │   ├── message.ts
│   │   └── review.ts
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types/interfaces
│   └── hooks/
│       ├── usePusher.ts              # Pusher subscription hook
│       └── useNotifications.ts       # Real-time notification hook
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── .env.local.example
└── package.json
```

---

## Server Actions Pattern

All mutations follow this pattern:

1. Import `auth()` from the NextAuth config to get the session
2. Validate input with Zod
3. Check authorisation (correct role, owns the resource, etc.)
4. Perform the Prisma mutation
5. Call `revalidatePath()` or `revalidateTag()` to refresh cached data
6. Return a typed result: `{ success: true, data: ... }` or `{ success: false, error: "..." }`

Server Actions should be defined in files within `src/actions/` and imported into Server Components or Client Components that use them via forms or `startTransition`.

### Server-Side Data Fetching Pattern

All read operations happen in Server Components:

1. Page component is `async`
2. Call `auth()` to get session
3. Fetch data directly via Prisma (no fetch calls, no API routes)
4. Pass data as props to Client Components only when interactivity is needed
5. Use `Suspense` boundaries with loading skeletons for streaming

---

## Authentication & Authorisation

### NextAuth v5 Config

- Providers: Credentials (email + password with bcrypt), Google OAuth, GitHub OAuth
- Session strategy: JWT (stateless, works with serverless)
- Custom pages: `/login`, `/register`
- Callbacks: include `role` and `userId` in the JWT and session
- The session object must expose: `user.id`, `user.role`, `user.email`, `user.name`, `user.image`

### Registration Flow

1. User selects role (Influencer or Company) on the registration page
2. Account created with role stored in the User model
3. After first login, redirect to profile completion page based on role
4. Profile is marked incomplete until required fields are filled
5. Incomplete profiles see a persistent banner prompting completion

### Route Protection

- Use NextAuth middleware (`middleware.ts`) to protect all `/(platform)` routes
- Additional role-based checks within Server Components and Server Actions
- Company-only pages: campaign creation/edit, application review
- Influencer-only pages: application submission, content submission

---

## Realtime Messaging (Pusher)

### Channel Strategy

- Private channel per conversation: `private-conversation-{conversationId}`
- User presence channel: `presence-user-{userId}` (for online status and notification count)
- Pusher auth endpoint at `/api/pusher/auth` validates the user owns the conversation

### Message Flow

1. User types message in `MessageInput` (Client Component)
2. On submit, call the `sendMessage` Server Action
3. Server Action validates with Zod, inserts into DB via Prisma
4. Server Action triggers Pusher event on the conversation's private channel: event `new-message`, data includes the full message object
5. Server Action also triggers notification event on the recipient's presence channel
6. Recipient's `ChatThread` component receives the event via Pusher client subscription and appends the message to local state
7. If recipient is not on the chat page, `useNotifications` hook shows a toast/badge

### Events

- `new-message` — on conversation channel, payload: full Message with sender info
- `typing` — on conversation channel, payload: `{ userId, name }`
- `message-read` — on conversation channel, payload: `{ userId, lastReadAt }`
- `new-notification` — on user presence channel, payload: Notification object

---

## Payments (Stripe Connect)

### Setup

- Platform uses Stripe Connect with Express accounts
- Influencers onboard via Stripe Connect onboarding flow (redirect)
- Store `stripeAccountId` on InfluencerProfile (add this field)
- Store `stripeCustomerId` on CompanyProfile (add this field)

### Payment Flow

1. Company accepts an application → Payment record created with status PENDING
2. Company clicks "Fund Campaign" → Stripe PaymentIntent created, money collected from company
3. Payment status moves to ESCROWED
4. Influencer submits content → Company reviews
5. Company approves content → Server Action triggers Stripe Transfer to influencer's connected account (minus platform fee)
6. Payment status moves to RELEASED
7. Platform fee (e.g. 10%) is retained automatically

### Stripe Webhook

- Endpoint: `/api/webhooks/stripe`
- Handle events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `account.updated`
- Verify webhook signature
- Update Payment records accordingly

---

## File Uploads (Cloudflare R2)

### Pattern

1. Client Component requests a presigned upload URL via `/api/upload/presign` (API route because it returns a URL the browser POSTs to directly)
2. API route generates a presigned PUT URL using the S3 client pointed at R2
3. Client uploads directly to R2 using the presigned URL
4. Client sends the resulting file URL back to the relevant Server Action to store in the database

### File Types

- Profile avatars: max 2MB, image/jpeg or image/png
- Company logos: max 2MB, image/jpeg, image/png, or image/svg+xml
- Media kits: max 10MB, application/pdf
- Message attachments: max 5MB, images and PDFs

---

## Search & Filtering

### Campaign Search (Server-Side)

Fetch in the Server Component with Prisma `where` clauses based on URL search params:

- Text search: `title` and `description` using Prisma `contains` (case-insensitive)
- Filter by: niches (array overlap), platforms (array overlap), budget range (min/max), status, deadline (upcoming only)
- Sort by: newest, deadline soonest, budget highest
- Pagination: cursor-based using `id`

### Influencer Search (Server-Side)

- Text search: `bio`, user `name`
- Filter by: niches, platforms (derived from socialLinks), availability, location, rate range
- Sort by: rating, completed campaigns, newest
- Pagination: cursor-based

### Implementation

Use URL search params for all filter state. The filter components are Client Components that update the URL via `useRouter().push()`. The page Server Component reads `searchParams` and fetches accordingly. This keeps the filter state shareable and bookmarkable.

---

## Notifications

### Triggers (created via Server Actions after the relevant mutation)

- `NEW_APPLICATION` — when an influencer applies (notify company)
- `APPLICATION_ACCEPTED` / `APPLICATION_REJECTED` — (notify influencer)
- `NEW_MESSAGE` — when a message is received (notify recipient if not in the conversation)
- `CONTENT_SUBMITTED` — (notify company)
- `CONTENT_APPROVED` / `REVISION_REQUESTED` — (notify influencer)
- `PAYMENT_RECEIVED` — (notify influencer)
- `NEW_REVIEW` — (notify reviewee)

### Delivery

- In-app: stored in Notification table, pushed via Pusher to user's presence channel
- Email: sent via Resend for critical notifications (application accepted, payment received)
- Unread count shown in sidebar/nav, fetched server-side on layout load

---

## Environment Variables

```
# Neon
DATABASE_URL=
DIRECT_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Pusher
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
PUSHER_APP_ID=
PUSHER_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_PERCENT=10

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=
```

---

## Vertical Slices — Build Order

Each slice is a self-contained, testable increment. Complete and manually test each slice before moving to the next.

---

### Slice 1: Project Scaffolding & Auth

**Goal**: A user can register, log in, and see a role-appropriate empty dashboard.

**Setup tasks**:
- Scaffold next.js app with TypeScript, App Router, Tailwind v3 (`tailwind.config.ts`), ESLint
- Install and configure: Prisma with Neon adapter, NextAuth v5, shadcn/ui, Zod, bcrypt
- Set up `tailwind.config.ts` with the custom theme (see Frontend Brief)
- Configure shadcn/ui with the project's design tokens
- Create `lib/db.ts` (Prisma + Neon singleton), `lib/auth.ts` (NextAuth config)
- Create the Prisma schema with User model and enums
- Run initial migration against Neon

**Pages**:
- `/` — public landing page (simple hero, CTA to register)
- `/login` — email/password + OAuth buttons
- `/register` — email, password, name, role selection (Influencer/Company)
- `/(platform)/dashboard` — protected, shows "Welcome, [name]" with role, empty state

**Test criteria**:
- Can register as Influencer and as Company
- Can log in with credentials
- Dashboard redirects to login if not authenticated
- Dashboard shows correct role
- Cannot access `/(platform)` routes when logged out

---

### Slice 2: Profile Completion

**Goal**: After registration, users complete their role-specific profile.

**Schema additions**: InfluencerProfile, CompanyProfile models. Run migration.

**Server Actions**: `createInfluencerProfile`, `updateInfluencerProfile`, `createCompanyProfile`, `updateCompanyProfile` in `actions/profile.ts`

**Pages**:
- `/(platform)/profile` — displays own profile, edit button
- Profile completion form (shown after first login or if profile incomplete)
  - Influencer: bio, niches (multi-select), social links, rates, location, availability toggle
  - Company: company name, website, industry, description, company size

**Components**: profile forms with Zod validation, niche/platform multi-select, social links input (add/remove rows)

**Test criteria**:
- New user is prompted to complete profile
- Can fill out and save influencer profile
- Can fill out and save company profile
- Profile data persists and displays correctly
- Validation errors show for required fields

---

### Slice 3: Campaign CRUD & Browse

**Goal**: Companies can create campaigns. All users can browse and view campaign details.

**Schema additions**: Campaign model. Run migration.

**Server Actions**: `createCampaign`, `updateCampaign`, `deleteCampaign` (draft only), `publishCampaign` (draft → open)

**Pages**:
- `/(platform)/campaigns` — browse all open campaigns with search and filters
- `/(platform)/campaigns/new` — create campaign form (company only)
- `/(platform)/campaigns/[id]` — campaign detail page
- `/(platform)/campaigns/[id]/edit` — edit campaign (company owner only)

**Components**: CampaignCard, CampaignFilters (niches, platforms, budget range, sort), CampaignForm

**Data fetching**: Campaign list and detail fetched server-side in page components. Filters driven by URL search params.

**Test criteria**:
- Company can create a campaign with all fields
- Campaign appears in the browse listing
- Influencer can see campaign detail but cannot edit
- Filters narrow results correctly
- Search by title works
- Non-owner cannot access edit page

---

### Slice 4: Applications

**Goal**: Influencers can apply to campaigns. Companies can review and accept/reject applications.

**Schema additions**: Application model with unique constraint. Run migration.

**Server Actions**: `submitApplication`, `withdrawApplication`, `acceptApplication`, `rejectApplication`

**Pages**:
- Application form embedded on campaign detail page (influencer only, if not already applied)
- `/(platform)/campaigns/[id]/applications` — list of applications for a campaign (company owner only)
- `/(platform)/applications` — influencer's own applications list with status

**Components**: ApplicationForm (cover letter, proposed rate), ApplicationCard (with status badge, accept/reject buttons for company)

**Test criteria**:
- Influencer can apply to an open campaign
- Cannot apply twice to the same campaign
- Company sees applications on their campaign
- Can accept/reject applications
- Influencer sees updated status on their applications page
- Accepted application count doesn't exceed `maxInfluencers`

---

### Slice 5: Messaging

**Goal**: Users can have real-time conversations linked to campaigns.

**Schema additions**: Conversation, ConversationParticipant, Message models. Run migration.

**Setup**: Install and configure Pusher server SDK (`lib/pusher-server.ts`) and client SDK (`lib/pusher-client.ts`). Create `/api/pusher/auth` route.

**Server Actions**: `sendMessage`, `getOrCreateConversation`, `markConversationRead`

**Pages**:
- `/(platform)/messages` — conversation list (Server Component fetches all user conversations with last message preview and unread indicator)
- `/(platform)/messages/[conversationId]` — chat thread

**Components**:
- ConversationList (Server Component for initial data, Client Component wrapper for real-time unread updates)
- ChatThread (Client Component — subscribes to Pusher channel, displays messages, handles new incoming messages)
- MessageBubble (presentational)
- MessageInput (Client Component — calls sendMessage Server Action, emits typing indicator)

**Conversation initiation**: "Message" button on campaign detail page or influencer profile triggers `getOrCreateConversation` Server Action, then redirects to the conversation page.

**Test criteria**:
- Can start a conversation from a campaign page
- Messages appear in real-time for both participants
- Conversation list shows last message and timestamp
- Unread indicator works
- Typing indicator shows
- Messages persist on page refresh

---

### Slice 6: File Uploads

**Goal**: Users can upload avatars, logos, media kits, and message attachments.

**Setup**: Configure R2 client in `lib/r2.ts`. Create `/api/upload/presign` route.

**Components**: FileUpload (reusable Client Component — requests presigned URL, uploads to R2, returns URL)

**Integration points**:
- Profile edit: avatar (both roles), logo (company), media kit PDF (influencer)
- Message input: attach file button
- Campaign form: optional brief attachment

**Test criteria**:
- Can upload a profile avatar and see it displayed
- Can upload a media kit PDF
- Can send a file in a message
- File size and type validation works client-side
- Uploaded files are accessible via their R2 URLs

---

### Slice 7: Payments

**Goal**: Companies can pay for accepted campaigns. Influencers receive payouts.

**Schema additions**: Payment model. Add `stripeAccountId` to InfluencerProfile, `stripeCustomerId` to CompanyProfile. Run migration.

**Setup**: Configure Stripe in `lib/stripe.ts`. Create `/api/webhooks/stripe` route.

**Server Actions**: `createPaymentIntent`, `releasePayment`, `initiateStripeOnboarding` (for influencers)

**Flow**:
- Influencer connects Stripe account via onboarding link (from profile/settings)
- When application is accepted, company sees "Fund Campaign" button
- Funding creates a PaymentIntent, collects payment
- After content approval (Slice 8), company clicks "Release Payment"
- Stripe Transfer sends funds to influencer minus platform fee

**Pages**:
- `/(platform)/payments` — payment history for both roles
- `/(platform)/profile/settings` — Stripe Connect onboarding for influencers

**Test criteria**:
- Influencer can connect Stripe account
- Company can fund an accepted application
- Payment status updates correctly via webhooks
- Payment history shows for both parties
- Use Stripe test mode throughout

---

### Slice 8: Content Submission & Review

**Goal**: Influencers submit deliverables. Companies review and approve or request revisions.

**Schema additions**: ContentSubmission model. Run migration.

**Server Actions**: `submitContent`, `approveContent`, `requestRevision`

**Integration**: Content approval triggers payment release (from Slice 7).

**Pages**:
- Content submission form on the application detail (influencer, after accepted)
- Content review section on the application detail (company)

**Test criteria**:
- Influencer can submit content URLs and notes
- Company can see submission and approve or request revision
- Revision notes visible to influencer
- Approving content triggers payment release
- Status updates correctly through the flow

---

### Slice 9: Reviews & Ratings

**Goal**: After campaign completion, both parties can leave reviews.

**Schema additions**: Review model with unique constraint. Run migration.

**Server Actions**: `submitReview` — also updates the aggregate rating/reviewCount on the relevant profile.

**Components**: ReviewForm (star rating + comment), ReviewList

**Integration**: Review prompt appears after payment is released. Reviews display on profiles.

**Pages**:
- Review form accessible from completed campaign/application
- Reviews displayed on influencer and company profile pages

**Test criteria**:
- Can leave a review after campaign completion
- Cannot review before completion
- Cannot review the same application twice
- Average rating updates on profile
- Reviews display on public profile

---

### Slice 10: Notifications & Polish

**Goal**: In-app and email notifications for key events. UI polish and edge cases.

**Schema additions**: Notification model. Run migration.

**Server Actions**: `markNotificationRead`, `markAllNotificationsRead`

**Setup**: Configure Resend in `lib/email.ts`. Create email templates for key notifications.

**Integration**: Add notification creation calls to existing Server Actions (application submitted, accepted, message received, payment released, etc.)

**Components**: notification bell in navbar with unread count, notification dropdown/page, toast notifications for real-time events via Pusher

**Polish tasks**:
- Loading skeletons for all pages (Suspense boundaries)
- Empty states for all lists
- Error boundaries
- Mobile responsive testing and fixes
- Proper page titles and meta tags
- 404 and error pages

**Test criteria**:
- Notifications appear for all defined triggers
- Unread count in nav updates in real-time
- Email sent for critical notifications
- All pages have loading states
- App works on mobile viewports
- No broken states when data is empty

---

### Slice 11: Influencer Discovery (Company Side)

**Goal**: Companies can browse and search influencers directly, not just through campaigns.

**Pages**:
- `/(platform)/influencers` — browse influencer directory with filters
- `/(platform)/influencers/[id]` — public influencer profile with reviews, portfolio, rates, "Message" and "Invite to Campaign" buttons

**Components**: InfluencerCard, InfluencerFilters

**Server Actions**: `inviteToCampaign` — creates a notification/message inviting an influencer to apply to a specific campaign

**Test criteria**:
- Company can browse and filter influencers
- Can view full influencer profile
- Can message an influencer directly
- Can invite an influencer to a campaign
- Influencer receives notification of invitation

---

## Non-Functional Requirements

- **Performance**: All pages should load under 2 seconds. Use React Suspense and streaming SSR. Database queries should use appropriate Prisma `select` and `include` to avoid over-fetching.
- **Security**: All Server Actions validate session and role. All inputs validated with Zod. CSRF protection via NextAuth. Rate limiting on auth endpoints. Stripe webhook signature verification.
- **Accessibility**: All interactive elements keyboard-accessible. Proper ARIA labels. Colour contrast AA compliant. Focus management on modals/dialogs.
- **SEO**: Public pages (landing, campaign detail, influencer profile) should have proper meta tags and Open Graph data.
