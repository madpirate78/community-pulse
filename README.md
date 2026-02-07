# Community Pulse

Anonymous community feedback powered by AI-generated insights.

Community Pulse collects anonymous survey responses, uses Gemini to generate personalised follow-up questions, and synthesises all responses into a narrative "Community Voice" insight. The entire survey — questions, branding, AI prompts, and page copy — is driven by a single config file, making it reusable for any community feedback scenario.

## Features

- **Config-driven surveys** — define questions, branding, prompts, and copy in one TypeScript file
- **Typed question system** — choice, scale, and free-text questions with Zod validation
- **Adaptive AI follow-ups** — Gemini Flash generates 1-2 personalised questions based on answers and the dataset
- **Streaming AI insights** — Gemini 2.5 Flash synthesises all community data into a narrative
- **Content moderation** — Gemini Flash screens free-text for PII, hate speech, and spam (store-and-gate: submissions always stored, but unmoderated free-text is excluded from AI queries until moderation passes)
- **Theme extraction** — automatic discovery of dominant themes from free-text responses
- **Statistics dashboard** — real-time charts showing response distribution and sacrifice themes

## Tech Stack

- **Next.js 14** (App Router, Server Actions, Route Handlers)
- **TypeScript** + **Zod** validation
- **Drizzle ORM** + **SQLite** (better-sqlite3)
- **Gemini API** (`@google/genai`) — Gemini 3 Flash for adaptive questions & moderation, Gemini 2.5 Flash for insights & themes
- **Tailwind CSS** + **Framer Motion**
- **Recharts** for data visualisation

## Getting Started

```bash
# Install dependencies
bun install

# Set up your Gemini API key
cp .env.example .env.local
# Edit .env.local with your key from https://aistudio.google.com/apikey

# Push the database schema
npx drizzle-kit push

# Seed with sample data (optional)
npx tsx scripts/seed.ts

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customisation

Everything domain-specific lives in `src/config/survey.config.ts`. Edit this single file to rebrand the app for any use case — tenant associations, planning consultations, foodbank demand analysis, etc.

The config has these sections:

| Section | What it controls |
|---------|-----------------|
| `branding` | App name, tagline, meta descriptions |
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
│   └── client.ts             # Client-safe subset (branding, pages, questions)
├── app/
│   ├── page.tsx              # Landing page
│   ├── submit/               # Survey form + server action
│   ├── statistics/           # Charts dashboard
│   ├── insights/             # AI-generated narrative
│   ├── thank-you/            # Post-submission
│   └── api/
│       ├── statistics/       # GET aggregated stats
│       ├── adaptive-questions/ # POST → Gemini Flash
│       ├── generate-insight/ # POST → Gemini Pro (streaming)
│       └── extract-themes/   # POST → theme discovery
├── components/
│   ├── survey/               # Data-driven form components
│   ├── stats/                # Chart + stats bar
│   ├── insights/             # Insight display
│   └── landing/              # Hero, insight preview
├── db/
│   ├── schema.ts             # Drizzle schema
│   └── index.ts              # DB client singleton
└── lib/
    ├── types.ts              # Dynamic Zod schemas built from config
    ├── prompts.ts            # AI prompt builders using renderPrompt()
    ├── prompt-renderer.ts    # {{key}} template replacement
    ├── db-queries.ts         # Query helpers (parameterised field names)
    ├── moderation.ts         # Content screening (free-text fields)
    ├── theme-extraction.ts   # Automatic theme discovery
    ├── insight-generation.ts # Narrative generation with cooldowns
    └── gemini.ts             # Gemini client singleton
```

## How Gemini Is Used

| Feature | Model | Purpose |
|---------|-------|---------|
| Content moderation | Gemini 3 Flash | Screen free-text for PII, hate speech, spam — gates AI access until verified |
| Adaptive questions | Gemini 3 Flash | Fast structured follow-ups while user waits |
| Theme extraction | Gemini 2.5 Flash | Discover patterns across free-text responses |
| Community Voice narrative | Gemini 2.5 Flash | Deep analysis synthesising all community data |

## License

MIT
