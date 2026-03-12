# InfluencerConnect — Frontend Design Brief

## Design Direction

### Aesthetic: Clean Professional with Confident Accents

InfluencerConnect targets two professional audiences — marketers at companies and working influencers. The design should feel trustworthy and premium without being corporate or sterile. Think: a modern fintech app meets a creative portfolio platform. Clean enough for business users to take seriously, with enough personality that creator-types feel at home.

**Tone keywords**: Confident, clean, approachable, modern, trustworthy.

**References for feel** (not to copy): Linear's clarity, Stripe's polish, Dribbble's creative warmth.

---

## Design Tokens

### Colour Palette

All colours defined as HSL values in `tailwind.config.ts` and mapped to CSS variables in `globals.css` for shadcn/ui compatibility.

#### Brand Colours

| Token | HSL | Hex (approx) | Usage |
|---|---|---|---|
| `brand-600` | `243 75% 59%` | `#5B4CF0` | Primary actions, links, active states |
| `brand-700` | `243 75% 49%` | `#4A3BD4` | Primary hover states |
| `brand-500` | `243 65% 68%` | `#7B6EF6` | Lighter accents, focus rings |
| `brand-100` | `243 60% 95%` | `#EDEAFD` | Tinted backgrounds, badges |
| `brand-50` | `243 50% 98%` | `#F6F5FE` | Subtle tinted surfaces |

#### Neutral Palette

| Token | HSL | Usage |
|---|---|---|
| `gray-950` | `220 20% 10%` | Primary text, headings |
| `gray-800` | `220 14% 20%` | Strong secondary text |
| `gray-600` | `220 10% 40%` | Body text, descriptions |
| `gray-500` | `220 8% 52%` | Muted text, placeholders |
| `gray-400` | `220 8% 65%` | Disabled text |
| `gray-200` | `220 10% 90%` | Borders, dividers |
| `gray-100` | `220 12% 95%` | Card backgrounds, table stripes |
| `gray-50` | `220 15% 98%` | Page background |
| `white` | `0 0% 100%` | Card surfaces, inputs |

#### Semantic Colours

| Token | HSL | Usage |
|---|---|---|
| `success-600` | `152 60% 40%` | Accepted, approved, online, paid |
| `success-100` | `152 50% 93%` | Success backgrounds |
| `warning-600` | `38 92% 50%` | Pending, draft, attention |
| `warning-100` | `38 80% 93%` | Warning backgrounds |
| `error-600` | `0 72% 51%` | Rejected, failed, errors |
| `error-100` | `0 60% 95%` | Error backgrounds |
| `info-600` | `205 78% 50%` | Informational, in-progress |
| `info-100` | `205 60% 94%` | Info backgrounds |

### Typography

#### Font Stack

- **Headings**: `"General Sans", sans-serif` — a geometric sans with personality. Load via `@fontsource/general-sans` or Google Fonts alternative: `"Plus Jakarta Sans"`. Both have the confident, slightly rounded feel that avoids looking generic.
- **Body**: `"Inter", sans-serif` — yes, normally too common, but here it serves as the quiet workhorse beside a distinctive heading font. The pairing works because the heading font carries all the character.
- **Mono** (code, data): `"JetBrains Mono", monospace` — for any numerical data, rates, IDs.

If General Sans is unavailable, use **Plus Jakarta Sans** for headings as the fallback. Configure both in `tailwind.config.ts` under `fontFamily`.

#### Type Scale

Define in `tailwind.config.ts` under `fontSize`. Each entry is `[size, { lineHeight, letterSpacing, fontWeight }]`.

| Token | Size | Line Height | Letter Spacing | Weight | Usage |
|---|---|---|---|---|---|
| `display` | `2.25rem` (36px) | `1.2` | `-0.025em` | `700` | Landing hero, major page titles |
| `h1` | `1.875rem` (30px) | `1.25` | `-0.02em` | `700` | Page headings |
| `h2` | `1.5rem` (24px) | `1.3` | `-0.015em` | `600` | Section headings |
| `h3` | `1.25rem` (20px) | `1.35` | `-0.01em` | `600` | Card titles, subsections |
| `h4` | `1.125rem` (18px) | `1.4` | `0` | `600` | Small headings, labels |
| `body-lg` | `1rem` (16px) | `1.6` | `0` | `400` | Primary body text |
| `body` | `0.875rem` (14px) | `1.6` | `0` | `400` | Default body, descriptions |
| `body-sm` | `0.8125rem` (13px) | `1.5` | `0` | `400` | Secondary info, metadata |
| `caption` | `0.75rem` (12px) | `1.5` | `0.01em` | `500` | Timestamps, badges, labels |
| `overline` | `0.6875rem` (11px) | `1.4` | `0.06em` | `600` | Overlines, category labels (uppercase) |

### Spacing

Use Tailwind's default spacing scale. Key conventions:

- **Page padding**: `px-4` mobile, `px-6` tablet, `px-8` desktop
- **Section gaps**: `gap-8` or `gap-12` between major sections
- **Card internal padding**: `p-5` or `p-6`
- **Tight element groups**: `gap-2` or `gap-3`
- **Form field stacks**: `gap-4`
- **Between a label and its field**: `gap-1.5`

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | `0.25rem` | Badges, small chips |
| `rounded-md` | `0.375rem` | Inputs, buttons |
| `rounded-lg` | `0.5rem` | Cards, modals, dropdowns |
| `rounded-xl` | `0.75rem` | Feature cards, hero sections |
| `rounded-full` | `9999px` | Avatars, circular buttons, pills |

### Shadows

Define as custom values in `tailwind.config.ts` under `boxShadow`:

| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | Subtle lift on inputs |
| `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)` | Cards at rest |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)` | Modals, elevated cards on hover |
| `shadow-focus` | `0 0 0 3px hsl(243 65% 68% / 0.3)` | Focus rings (brand-coloured) |

---

## Tailwind Config Structure

The `tailwind.config.ts` should extend (not replace) the default theme for `colors`, `fontFamily`, `fontSize`, `boxShadow`, and `borderRadius`. Define all brand and semantic colours under `colors`. Set up `fontFamily.heading`, `fontFamily.body`, `fontFamily.mono`.

Configure the `content` array to include `./src/**/*.{ts,tsx}` and the shadcn/ui component paths.

---

## shadcn/ui Configuration

Initialise shadcn/ui with the following settings:

- Style: `default`
- Base colour: `slate` (will be overridden by our neutrals)
- CSS variables: `yes`
- Tailwind config: `tailwind.config.ts`
- Components alias: `@/components/ui`
- Utils alias: `@/lib/utils`

After init, override the CSS variables in `globals.css` to map to our design tokens. The key variables to override:

```
--background, --foreground, --card, --card-foreground,
--primary, --primary-foreground, --secondary, --secondary-foreground,
--muted, --muted-foreground, --accent, --accent-foreground,
--destructive, --destructive-foreground, --border, --input, --ring
```

Map `--primary` to `brand-600`, `--destructive` to `error-600`, `--border` to `gray-200`, `--background` to `gray-50`, `--card` to `white`, `--ring` to `brand-500`.

---

## Component Design Specifications

### Layout

#### Sidebar (Desktop)

- Width: `w-64` (256px), fixed left
- Background: `white` with right border `gray-200`
- Logo/wordmark at top: `p-6`
- Navigation items: vertical stack with `gap-1`, each item is `px-3 py-2 rounded-md` with icon (20px via Lucide) + label
- Active state: `bg-brand-100 text-brand-600 font-medium`
- Hover state: `bg-gray-100`
- Default state: `text-gray-600`
- Bottom section: user avatar + name + role badge, settings link
- Collapsible on tablet to icons-only (`w-16`)

#### Top Navbar (Mobile)

- Height: `h-14`, `bg-white`, bottom border
- Hamburger menu left, logo centre, notification bell right
- Mobile nav slides in from left as overlay

#### Page Container

- Max width: `max-w-6xl` for content pages, `max-w-4xl` for forms
- Centered with `mx-auto`
- Top padding: `pt-8`

### Cards

#### Campaign Card

- White background, `rounded-lg`, `shadow-sm`, `border border-gray-200`
- Hover: `shadow-md` transition (`transition-shadow duration-200`)
- Internal padding: `p-5`
- Layout: company logo (40px circle) + company name (caption, gray-500) top row. Campaign title (h3, gray-950) below. Description truncated to 2 lines (body, gray-600). Bottom row: niche badges + budget range + deadline.
- Budget displayed in mono font, formatted as "$X,XXX – $X,XXX"

#### Influencer Card

- Same card base as above
- Layout: avatar (48px circle) + name (h3) + top niche badge. Bio truncated to 2 lines. Bottom row: rating (stars + count), platforms icons, starting rate.

### Badges / Status Chips

- Base: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium`
- Variants by semantic colour:
  - Open / Available / Approved / Paid → `bg-success-100 text-success-600`
  - Pending / Draft → `bg-warning-100 text-warning-600`
  - Rejected / Failed / Cancelled → `bg-error-100 text-error-600`
  - In Progress / Submitted → `bg-info-100 text-info-600`
- Niche badges: `bg-brand-100 text-brand-600`
- Optional leading dot: `w-1.5 h-1.5 rounded-full bg-current`

### Buttons

Extend shadcn's Button component. Variants:

- **Primary**: `bg-brand-600 text-white hover:bg-brand-700`, `rounded-md`, `shadow-xs`
- **Secondary**: `bg-white text-gray-800 border border-gray-200 hover:bg-gray-50`, `shadow-xs`
- **Ghost**: `bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800`
- **Destructive**: `bg-error-600 text-white hover:bg-error-600/90`
- **Sizes**: `sm` (h-8, text-body-sm, px-3), `default` (h-10, text-body, px-4), `lg` (h-12, text-body-lg, px-6)
- All buttons: `font-medium transition-colors duration-150`
- Focus: `ring-2 ring-brand-500 ring-offset-2`

### Form Inputs

Extend shadcn's Input, Textarea, Select:

- `h-10 rounded-md border-gray-200 bg-white text-body text-gray-950`
- Placeholder: `text-gray-400`
- Focus: `border-brand-500 ring-2 ring-brand-500/20`
- Error: `border-error-600 ring-2 ring-error-600/20`
- Label: `text-body-sm font-medium text-gray-800`, positioned above with `gap-1.5`
- Helper text: `text-caption text-gray-500`, below field
- Error message: `text-caption text-error-600`, below field

### Messaging UI

#### Conversation List

- Each row: avatar (36px) + name + last message preview (truncated, gray-500) + timestamp (caption, gray-400) right-aligned
- Unread: name in `font-semibold`, blue dot indicator (`w-2 h-2 rounded-full bg-brand-600`)
- Active conversation: `bg-brand-50` background
- Dividers between items via `divide-y divide-gray-100`

#### Chat Thread

- Messages area: `flex-1 overflow-y-auto p-4`, background `gray-50`
- Own messages: `bg-brand-600 text-white rounded-lg rounded-br-sm` aligned right
- Other messages: `bg-white text-gray-950 border border-gray-200 rounded-lg rounded-bl-sm` aligned left
- Max width of message bubble: `max-w-[70%]`
- Timestamp below each message: `text-caption text-gray-400` (own) or `text-gray-400` (other)
- Day separators: centred pill with date, `bg-gray-100 text-caption text-gray-500 rounded-full px-3 py-1`
- Input area: fixed bottom, white background, top border, `p-3`. Input field fills space, send button right (`brand-600` icon button)
- Typing indicator: three animated dots in a message bubble shape

### Rating Stars

- Filled: `text-warning-600` (amber)
- Empty: `text-gray-200`
- Size: 16px for inline, 20px for review forms
- Display: stars + numeric average + count in parentheses ("4.8 (23)")

### Empty States

- Centered in container, `py-16`
- Illustration or icon: `w-12 h-12 text-gray-300` (use Lucide icon)
- Heading: `h3 text-gray-800`
- Description: `body text-gray-500 max-w-sm mx-auto`
- CTA button if applicable

### Loading Skeletons

- Use `bg-gray-100 animate-pulse rounded-md` blocks matching the shape of content they replace
- Skeleton for cards: match card dimensions with placeholder blocks for image, title lines, metadata
- Skeleton for text: `h-4 rounded` with varying widths (100%, 80%, 60%)
- Skeleton for avatars: `rounded-full` matching avatar size

---

## Page-Specific Design Notes

### Landing Page (`/`)

- Full-width hero with `bg-gray-950` (dark), white heading text, brand-coloured CTA button
- Headline: display size, bold and direct (e.g. "Connect with the right creators. Launch campaigns that convert.")
- Two CTA buttons: "Find Influencers" (primary), "Join as Influencer" (secondary, white outline on dark)
- Below hero: how-it-works section (3 columns, icon + heading + short text)
- Social proof / stats section
- Footer with links

### Dashboard

- Greeting: "Good morning, [Name]" with current date
- Role-specific cards in a grid:
  - **Company**: active campaigns count, pending applications count, recent messages, quick action to create campaign
  - **Influencer**: available campaigns matching niches, active applications, earnings summary, profile completeness prompt

### Campaign Browse

- Filter bar at top (horizontal on desktop, collapsible on mobile): niche pills, platform pills, budget range slider, sort dropdown
- Grid of CampaignCards: 3 columns desktop, 2 tablet, 1 mobile
- Pagination at bottom

### Campaign Detail

- Two-column layout on desktop: main content left (title, company info, full description, requirements, deliverables), sidebar right (budget, deadline, platform badges, "Apply" button or status)
- Below main content: similar campaigns

### Profile

- Header area: avatar/logo, name, role badge, location, joined date, rating
- Tab navigation below header: "About", "Portfolio" (influencer), "Reviews", "Campaigns" (company)
- About tab: bio, social links with follower counts, niches, rates table (influencer)
- Edit mode: inline form that replaces the display content

---

## Responsive Breakpoints

Use Tailwind defaults:

| Breakpoint | Width | Adaptation |
|---|---|---|
| Default | < 640px | Single column, stacked layout, bottom nav consideration, hamburger menu |
| `sm` | ≥ 640px | Minor adjustments |
| `md` | ≥ 768px | Two-column grids appear, sidebar icons-only |
| `lg` | ≥ 1024px | Full sidebar, three-column grids, two-column detail layouts |
| `xl` | ≥ 1280px | Max-width containers kick in, generous spacing |

---

## Animations & Transitions

Keep animations subtle and purposeful. This is a professional tool, not a portfolio site.

- **Page transitions**: none (rely on Next.js streaming and Suspense for perceived speed)
- **Card hover**: `transition-shadow duration-200` to `shadow-md`
- **Button hover/active**: `transition-colors duration-150`
- **Focus rings**: `transition-shadow duration-150`
- **Dropdown/popover entry**: `animate-in fade-in-0 zoom-in-95 duration-150` (shadcn default)
- **Toast notifications**: slide in from top-right, `duration-300`
- **Skeleton pulse**: `animate-pulse` (Tailwind default)
- **Message appear**: subtle `animate-in fade-in-0 slide-in-from-bottom-2 duration-200`
- **Typing indicator dots**: staggered `animate-bounce` with delays

---

## Iconography

Use **Lucide React** exclusively for all icons. Key icon mappings:

- Navigation: `LayoutDashboard`, `Megaphone` (campaigns), `Users` (influencers), `MessageSquare`, `Bell`, `Settings`, `CreditCard` (payments)
- Actions: `Plus`, `Pencil`, `Trash2`, `Send`, `Paperclip`, `Search`, `Filter`, `ChevronDown`, `ChevronRight`, `ExternalLink`
- Status: `Check`, `X`, `Clock`, `AlertCircle`, `CheckCircle2`
- Social: `Instagram`, `Youtube`, `Twitter` (for platform icons, supplement with custom SVGs where Lucide doesn't cover TikTok, LinkedIn)
- Default icon size: `w-5 h-5` (20px) in navigation, `w-4 h-4` (16px) inline with text

---

## Dark Mode

**Not in MVP**. Design all tokens and components for light mode only. However, structure the CSS variable approach so dark mode can be added later by defining an alternate set of variables under a `.dark` class or `prefers-color-scheme` media query. Don't add any dark mode code — just don't make decisions that would make it painful to add later (e.g. avoid hardcoding white backgrounds, use the semantic tokens instead).

---

## Accessibility Checklist

- All interactive elements must have visible focus states (the `shadow-focus` ring)
- Colour contrast must meet WCAG AA (4.5:1 for body text, 3:1 for large text). The palette above is designed for this — `gray-600` on `white` passes, `brand-600` on `white` passes
- All images need `alt` text. Avatars: `alt="{user name}'s avatar"`. Decorative images: `alt=""`
- Form inputs must have associated `<label>` elements (not just placeholder text)
- Modals/dialogs: trap focus, close on Escape, return focus to trigger on close (shadcn handles this)
- Status communicated by colour must also have text/icon (e.g. badges always include text, not just colour)
- Skip-to-content link as first focusable element in the layout
- `aria-live="polite"` region for real-time message updates in chat

---

## Image & Asset Guidelines

- **Avatars**: display as circles (`rounded-full`), sizes: 32px (inline), 40px (cards), 48px (profiles), 64px (profile header). Fallback: coloured circle with initials (first letter of name, `bg-brand-100 text-brand-600 font-semibold`)
- **Company logos**: display as squares with `rounded-lg`, same size scale. Fallback: initials on `bg-gray-100`
- **Placeholder / empty state illustrations**: keep minimal. Use oversized Lucide icons in `gray-200` or simple abstract shapes. No stock illustrations
- **File type icons**: PDF icon for media kits, generic file icon for attachments

---

## Form UX Patterns

- **Validation**: inline, on blur for individual fields, on submit for the full form. Show error messages immediately below the field. Use Zod schemas that match the server-side schemas exactly.
- **Submit buttons**: show loading spinner on submit (replace button text with spinner). Disable button while submitting.
- **Multi-step forms**: not needed for MVP. Campaign creation and profile completion should be single-page forms with clear sections.
- **Multi-select** (niches, platforms): use a pill-based input where selected items show as removable pills. Click opens a dropdown with checkboxes.
- **Currency inputs**: prefix with "$", format with commas on blur, store as cents internally.
- **Textarea**: auto-grow up to a max height, then scroll. Show character count for limited fields (bio).
- **File upload**: drag-and-drop zone with border dashed `border-gray-300`. On hover/drag: `border-brand-500 bg-brand-50`. Show upload progress. After upload: show filename + remove button.
