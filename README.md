# Community Pulse

Anonymous community feedback powered by AI-generated insights.

## Project status

This repo is the original hackathon build (working name *Dyadem*), written up [on dev.to](https://dev.to/adamp78/i-built-surveys-that-get-smarter-with-every-response-1l1) (the article describes the later Postgres-backed version; this repo uses SQLite).
The production system at [communitypulse.org.uk](https://communitypulse.org.uk) grew out of it and is closed-source as a commercial product. Findings from its 51-respondent field deployment are written up [here](https://adampio.dev/blog/when-community-feedback-contradicts-itself).


Community Pulse collects anonymous survey responses, uses Gemini to generate personalised follow-up questions, and synthesises all responses into a narrative "Community Voice" insight. The entire survey — questions, branding, AI prompts, and page copy — is driven by a single config file, making it reusable for any community feedback scenario.

## Features

- **Config-driven surveys** — define questions, branding, prompts, and copy in one TypeScript file
- **Typed question system** — choice, scale, and free-text questions with Zod validation
- **Adaptive AI follow-ups** — Gemini Flash generates 1-2 personalised questions based on answers and the dataset
- **Streaming AI insights** — Gemini 3 Pro synthesises all community data into a narrative
- **Content moderation** — Gemini Flash screens free-text for PII, hate speech, and spam (store-and-gate: submissions always stored, but unmoderated free-text is excluded from AI queries until moderation passes)
- **Theme extraction** — automatic discovery of dominant themes from free-text responses
- **Statistics dashboard** — real-time charts showing response distribution and sacrifice themes

## Tech Stack

- **Next.js 14** (App Router, Server Actions, Route Handlers)
- **TypeScript** + **Zod** validation
- **Drizzle ORM** + **SQLite** (better-sqlite3)
- **Gemini API** (`@google/genai`) — Gemini 3 Flash for adaptive questions & moderation, Gemini 3 Pro for insights & themes
- **Tailwind CSS** + **Framer Motion**
- **Recharts** for data visualisation

The app ships with a full security-header suite (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) configured in `next.config.mjs`, plus per-IP rate limiting on all API routes and the submit action.

## Getting Started

```bash
# Install dependencies
bun install

# Set up your Gemini API key
cp .env.example .env.local
# Edit .env.local with your key from https://aistudio.google.com/apikey

# Seed with sample data (optional)
bun run seed

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database and its tables are created automatically on first run — no migration step needed.

### Development

| Command | What it does |
|---------|--------------|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run lint` | ESLint via `next lint` |
| `bun run typecheck` | TypeScript check (`tsc --noEmit`) |
| `bun test` | Run the test suite |
| `bun run seed` | Seed the database with the sample data from the config (runs via `tsx` — `better-sqlite3` is a Node native module Bun can’t load) |

All checks run in CI on every push.

## Customisation

Everything domain-specific lives in `src/config/survey.config.ts`. Edit this single file to rebrand the app for any use case — tenant associations, planning consultations, foodbank demand analysis, etc.

The config has these sections:

| Section | What it controls |
|---------|-----------------|
| `branding` | App name, meta descriptions |
| `pages` | All page copy (hero, submit, thank-you, statistics, insights) |
| `questions.fixed` | Survey questions — typed as `choice`, `scale`, or `text` |
| `prompts` | AI prompt templates with `{{variable}}` markers |
| `fallbackThemeKeywords` | Keyword map for pre-AI theme extraction |
| `operational` | Intervals, cooldowns, thresholds, cache TTL |
| `seedData` | Optional example responses for development |

Questions use a discriminated union — add, remove, or reorder them freely:

```ts
{
  type: "choice",
  fieldName: "main_concern",
  label: "What's your biggest concern about the building?",
  options: [
    { value: "repairs", label: "Repairs & maintenance" },
    { value: "safety", label: "Safety issues" },
    // ...
  ],
}
```

AI prompts use `{{variable}}` markers (not JS template literals) so they stay readable and inspectable in the config file. They're rendered at runtime by `renderPrompt()`.

No database migration is needed when changing questions — the `submissions.responses` column stores a JSON blob keyed by whatever `fieldName` values the config defines.

## Project Structure

```
src/
├── config/
│   ├── schema.ts             # Zod schema for SurveyConfig type
│   ├── survey.config.ts      # All domain-specific content (edit this)
│   ├── index.ts              # Parse-once singleton
│   └── client.ts             # Convenience subset for client components
├── app/
│   ├── page.tsx              # Landing page
│   ├── submit/               # Survey form + server action
│   ├── statistics/           # Charts dashboard
│   ├── insights/             # AI-generated narrative
│   ├── thank-you/            # Post-submission
│   ├── error.tsx             # Route error boundary
│   ├── not-found.tsx         # Custom 404
│   ├── loading.tsx           # Route-level loading states
│   └── api/
│       ├── statistics/       # GET aggregated stats
│       ├── adaptive-questions/ # POST → Gemini Flash
│       ├── generate-insight/ # POST → Gemini Pro (streaming)
│       ├── extract-themes/   # POST → theme discovery
│       └── health/           # GET liveness check
├── components/
│   ├── survey/               # Data-driven form components
│   ├── stats/                # Chart + stats bar
│   ├── insights/             # Insight display
│   ├── landing/              # Hero, insight preview
│   └── ui/                   # Shared primitives (empty state, motion, grain)
├── db/
│   ├── schema.ts             # Drizzle schema
│   └── index.ts              # DB client singleton
├── lib/
│   ├── types.ts              # Dynamic Zod schemas built from config
│   ├── prompts.ts            # AI prompt builders using renderPrompt()
│   ├── prompt-renderer.ts    # {{key}} template replacement
│   ├── db-queries.ts         # Query helpers (parameterised field names)
│   ├── moderation.ts         # Content screening (free-text fields)
│   ├── theme-extraction.ts   # Automatic theme discovery
│   ├── insight-generation.ts # Narrative generation with cooldowns
│   ├── rate-limit.ts         # In-memory sliding-window rate limiter
│   ├── retry.ts              # Shared retry-with-backoff for AI calls
│   ├── api-utils.ts          # Client IP + rate-limit guard helpers
│   ├── logger.ts             # Minimal structured logger
│   └── gemini.ts             # Gemini client singleton
└── __tests__/                # Unit tests (bun test)
scripts/
└── seed.ts                   # Seed the DB from config.seedData
```

## How Gemini Is Used

| Feature | Model | Purpose |
|---------|-------|---------|
| Content moderation | Gemini 3 Flash | Screen free-text for PII, hate speech, spam — gates AI access until verified |
| Adaptive questions | Gemini 3 Flash | Fast structured follow-ups while user waits |
| Theme extraction | Gemini 3 Pro | Discover patterns across free-text responses |
| Community Voice narrative | Gemini 3 Pro | Deep analysis synthesising all community data |

## License

MIT
