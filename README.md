# ARGUS — Multi-User Opportunity Alert Radar

A shareable, multi-user opportunity-alert platform that aggregates hackathons, bounties, freelance gigs, and grants, delivering real-time alerts via individually-connected Telegram accounts and a website dashboard matching the exact visual system of **kiddobuild.dev**.

## Tech Stack
- **Framework:** Next.js 15 (App Router, API routes, Vanilla CSS)
- **Database:** SQLite via Prisma ORM (`dev.db`)
- **Background Worker & Cron:** `node-cron`
- **Telegram Bot & Alerts:** `node-telegram-bot-api`
- **Typography:** Google Fonts (`Manrope`, `Instrument Serif`, `IBM Plex Mono`) via `next/font/google`
- **Auth:** Telegram Login Widget paired with `/start <token>` deep links

---

## Architecture & Implementation

### 1. Data Model (`prisma/schema.prisma`)
- `opportunities`: Normalized entries with compound unique constraint `@@unique([title, source])`, category index, and deadline tracking.
- `users`: Stores `telegram_id`, `chat_id`, `auth_token`, username, and timestamps.
- `filters`: Linked to user with `keywords[]`, `categories[]`, and `min_prize`.

### 2. Phase 1 Core Pipeline
- **4 Core Scrapers:**
  - Devpost (`src/scrapers/devpost.ts`)
  - Superteam Earn (`src/scrapers/superteam.ts`)
  - GitHub (`src/scrapers/github.ts`)
  - Reddit (`src/scrapers/reddit.ts`)
- **Normalizer Guardrails (`src/types/opportunity.ts` & `src/scrapers/base.ts`):** Never fabricates reward amounts, deadlines, or links. Flags ambiguous fields. Sanitizes all untrusted page content.
- **3-Hour Cron (`src/worker.ts`):** Scrapes all sources, deduplicates, and saves new entries.
- **Notification Dispatcher (`src/services/telegramAlerts.ts`):** Dispatches newly discovered listings to matching users with ~50ms rate-limit pacing.
- **Immediate Alerts (<48h):** Priority alerts for opportunities closing in under 48 hours.
- **Twice-Daily Lagos Digests (`src/services/telegramDigest.ts`):** Dispatched at 7:00am and 6:30pm (WAT / Africa:Lagos) with Top 5, Quick Wins, High Reward, Closing Soon (<72h), and Newly Announced sections (never padded with stale listings).

### 3. Phase 2 Expanded Sources (`src/scrapers/expanded/`)
Modular scrapers feeding into the unified schema:
1. Substack / Medium (RSS feeds)
2. lablab.ai
3. HackQuest
4. Kaggle
5. Major League Hacking (MLH)
6. Devfolio
7. HackerEarth
8. ETHGlobal
9. Unstop
10. Taikai
11. Encode Club
- `/addmanual <link>` bot command as a direct stand-in for manual submissions from X/Twitter or Discord.

### 4. Telegram Commands (`src/services/telegramBot.ts`)
- `/start <token>` — Activates chat and links personal alert routing.
- `/filter <keyword>` — Toggles keyword alert filters.
- `/category <hackathon|bounty|freelance|grant>` — Toggles category subscriptions.
- `/minprize <amount>` — Sets minimum prize filter.
- `/addmanual <link>` — Forwards external links into the opportunity radar.
- `/mystatus` — Displays active preferences.

### 5. Website UI (Matching kiddobuild.dev Visual System)
- **Typography:** Manrope for bold headings and body; Instrument Serif italic for accent pull-quotes; IBM Plex Mono for uppercase tracked-out micro-labels.
- **Color System:** `#171915` (dark background), `#f2eee2` (light text), `#99c3d9` (italic accent), `#e7603f` (coral accent), `#f1efe7` (light header), `#191915` (ink text), and hairline dividers.
- **Numbered 4-Column Bordered Grid:** Number top-left in coral mono (`01`, `02`), icon top-right, hairline borders.
- **Floating Pill Switcher:** Bottom-center navigation between categories and urgent filter.
- **Dashboard:** Filter configuration matrix and Telegram deep-link activation.

---

## Running Argus Locally

### 1. Setup & Environment
```bash
npm install
npx prisma generate
npx prisma db push
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="your_botfather_token"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="ArgusOpportunityBot"
APP_TIMEZONE="Africa/Lagos"
```

### 2. Launch Development Server
```bash
npm run dev
# Website runs on http://localhost:3000
```

### 3. Launch Cron Worker
```bash
npm run worker
```
