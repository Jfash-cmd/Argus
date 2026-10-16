# ARGUS — Multi-User Opportunity Alert Radar


A shareable, multi-user opportunity-alert platform that aggregates hackathons, bounties, freelance gigs, and grants, delivering real-time alerts via individually-connected Telegram accounts and a website dashboard.


## Tech Stack

- **Framework**: Next.js 15 (App Router, API routes)
- **Database**: PostgreSQL via Prisma ORM (Supabase)
- **Background Worker & Cron**: node-cron (or external scheduler in production)
- **Telegram Bot & Alerts**: node-telegram-bot-api
- **Typography**: Google Fonts via `next/font/google`
- **Auth**: Telegram Login Widget paired with `/start <token>` deep links

## Architecture & Implementation

### 1. Data Model (`prisma/schema.prisma`)
- `opportunities`: Normalized entries with compound unique constraint on `[title, source]`, category index, and deadline tracking.
- `users`: Stores `telegram_id`, `chat_id`, `auth_token`, `username`, and timestamps.
- `filters`: Linked to user with `keywords[]`, `categories[]`, and `min_prize`.

### 2. Phase 1 Core Pipeline
- **4 Core Scrapers**:
  - Devpost (`src/scrapers/devpost.ts`)
  - Superteam Earn (`src/scrapers/superteam.ts`)
  - GitHub (`src/scrapers/github.ts`)
  - Reddit (`src/scrapers/reddit.ts`)
- **Normalizer Guardrails** (`src/types/opportunity.ts` & `src/scrapers/base.ts`): Never fabricates reward amounts, deadlines, or links. Flags ambiguous fields. Sanitizes all untrusted page content.
- **3-Hour Cron** (`src/worker.ts`): Scrapes all sources, deduplicates, filters out expired listings, and saves new entries.
- **Notification Dispatcher** (`src/services/telegramAlerts.ts`): Dispatches newly discovered listings to matching users with ~50ms rate-limit pacing.
- **Immediate Alerts (<48h)**: Priority alerts for opportunities closing in under 48 hours.
- **Twice-Daily Digests** (`src/services/telegramDigest.ts`): Dispatched at 7:00am and 6:30pm WAT (Africa/Lagos) with Top 5, Quick Wins, High Reward, Closing Soon (<72h), and Newly Announced sections — never padded with stale listings.

### 3. Phase 2 Expanded Sources (`src/scrapers/expanded/`)
Modular scrapers feeding into the unified schema, classified as Web3 or Web2 where applicable:
1. Substack (RSS)
2. Medium (RSS)
3. lablab.ai
4. HackQuest
5. Kaggle
6. Major League Hacking (MLH)
7. Devfolio
8. HackerEarth
9. ETHGlobal
10. Unstop
11. Taikai
12. Encode Club

- `/addmanual <link>` bot command as a direct stand-in for manual submissions from X/Twitter or Discord.

### 4. Telegram Commands (`src/services/telegramBot.ts`)
- `/start <token>` — Activates chat and links personal alert routing.
- `/filter <keyword>` — Toggles keyword alert filters.
- `/category <web3_hackathon|web2_hackathon|bounty|freelance|grant>` — Toggles category subscriptions.
- `/minprize <amount>` — Sets minimum prize filter.
- `/addmanual <link>` — Forwards external links into the opportunity radar.
- `/mystatus` — Displays active preferences.

### 5. Website
- Public feed and logged-in dashboard with category filter tabs (All / Web3 Hackathons / Web2 Hackathons / Bounties / Freelance / Grants / Urgent Only).
- Dashboard includes filter configuration and Telegram connect flow.

## Running Argus Locally

### 1. Setup & Environment

```bash
npm install
npx prisma generate
npx prisma db push
```

Edit `.env`:

```env
DATABASE_URL="your_supabase_connection_string"
TELEGRAM_BOT_TOKEN="your_botfather_token"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
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
