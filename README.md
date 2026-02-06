# Community Pulse

Anonymous community feedback on the cost of living, powered by AI-generated insights.

Community Pulse collects anonymous responses about financial pressures, uses Gemini to generate personalised follow-up questions, and synthesises all responses into a narrative "Community Voice" insight.

## Features

- **Fixed survey questions** — three quick questions everyone answers (biggest pressure, change trajectory, sacrifice)
- **Adaptive AI follow-ups** — Gemini Flash generates 1-2 personalised questions based on your answers and the dataset
- **Streaming AI insights** — Gemini Pro with Google Search grounding generates a narrative from all community data
- **Statistics dashboard** — real-time charts showing pressure distribution and sacrifice themes

## Tech Stack

- **Next.js 14** (App Router, Server Actions, Route Handlers)
- **TypeScript** + **Zod** validation
- **Drizzle ORM** + **SQLite** (better-sqlite3)
- **Gemini API** (`@google/genai`) — Flash for adaptive questions, Pro for insights
- **Tailwind CSS**
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

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── submit/               # Survey form
│   ├── statistics/           # Charts dashboard
│   ├── insights/             # AI-generated narrative
│   ├── thank-you/            # Post-submission
│   └── api/
│       ├── statistics/       # GET aggregated stats
│       ├── adaptive-questions/ # POST → Gemini Flash
│       ├── generate-insight/ # POST → Gemini Pro (streaming)
│       └── analyse/          # POST → generate + store insight
├── components/
│   ├── survey/               # Form components
│   ├── stats/                # Chart + stats bar
│   ├── insights/             # Streaming text renderer
│   └── landing/              # Hero, insight preview
├── db/
│   ├── schema.ts             # Drizzle schema
│   └── index.ts              # DB client singleton
└── lib/
    ├── types.ts              # Zod schemas, TypeScript types, UI labels
    ├── prompts.ts            # AI prompt builders
    ├── db-queries.ts         # Query helpers
    └── gemini.ts             # Gemini client singleton
```

## How Gemini Is Used

| Feature | Model | Thinking | Purpose |
|---------|-------|----------|---------|
| Adaptive questions | Flash | Low | Fast structured follow-ups while user waits |
| Community Voice narrative | Pro | High | Deep analysis with Google Search grounding |
| Insight snapshots | Pro | High | Cached batch generation for landing page |

## License

MIT
