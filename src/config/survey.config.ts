import type { SurveyConfig } from "./schema";

const config: SurveyConfig = {
  // ─── Branding ───────────────────────────────────────────────
  branding: {
    appName: "Community Pulse",
    tagline: "The cost of living is changing how we live.",
    metaDescription:
      "Anonymous community feedback on the cost of living, powered by AI-generated insights.",
    ogDescription:
      "Share your experience anonymously. AI turns individual voices into a collective picture.",
  },

  // ─── Page copy ──────────────────────────────────────────────
  pages: {
    hero: {
      headline: "The cost of living is changing how we live.",
      subtext:
        "Share your experience anonymously. Our AI turns individual voices into a collective picture of what communities are really going through.",
      ctaText: "Add Your Voice \u2014 90 seconds, anonymous",
    },
    submit: {
      heading: "Add Your Voice",
      subtext:
        "Anonymous. 90 seconds. Your answers shape the community picture.",
    },
    thankYou: {
      heading: "Your voice has been added",
      body: "Thank you for sharing. Every response helps build a clearer picture of what our community is going through.",
      ctaInsights: "See What We\u2019re All Saying",
      ctaStats: "View Statistics",
    },
    statistics: {
      heading: "Community Statistics",
      subtext: "An overview of what our community is experiencing.",
      pressuresHeading: "Biggest Pressures",
      themesHeading: "What People Are Giving Up",
      emptyHeading: "No submissions yet",
      emptyBody: "Be the first to add your voice.",
    },
    insights: {
      heading: "Community Voice",
      subtext:
        "AI-generated insights from what our community is telling us.",
      previewHeading: "What the community is saying",
      previewLink: "Read the full Community Voice",
      emptyHeading: "No community voice yet",
      emptyBody:
        "Insights are generated automatically as responses come in.",
    },
  },

  // ─── Fixed questions ────────────────────────────────────────
  questions: {
    fixed: [
      {
        type: "choice",
        fieldName: "biggest_pressure",
        label: "What\u2019s your biggest financial pressure right now?",
        options: [
          { value: "housing", label: "Housing costs" },
          { value: "food", label: "Food & groceries" },
          { value: "energy", label: "Energy bills" },
          { value: "transport", label: "Getting around" },
          { value: "childcare", label: "Childcare" },
          { value: "healthcare", label: "Healthcare" },
          { value: "debt", label: "Debt & borrowing" },
          { value: "other", label: "Other" },
        ],
      },
      {
        type: "scale",
        fieldName: "change_direction",
        label: "Compared to a year ago, how are things?",
        min: 1,
        max: 5,
        labels: {
          "1": "Much better",
          "2": "A bit better",
          "3": "Same",
          "4": "Worse",
          "5": "Much worse",
        },
      },
      {
        type: "text",
        fieldName: "sacrifice",
        label: "What\u2019s the one thing you\u2019ve had to cut back on or give up?",
        placeholder: 'e.g. "Heating", "Seeing friends", "Fresh fruit"',
        minLength: 2,
        maxLength: 200,
      },
    ],
  },

  // ─── AI prompt templates ────────────────────────────────────
  // Use {{variable}} markers — replaced at runtime by renderPrompt()

  prompts: {
    adaptiveQuestions: `You are designing follow-up questions for an anonymous cost-of-living survey.

This person just answered:
- Biggest financial pressure: {{biggest_pressure}}
- How things have changed (1=much better, 5=much worse): {{change_direction}}
- What they've sacrificed: "{{sacrifice}}"

Current dataset overview ({{total_responses}} responses so far):
- Top pressure: {{top_pressure}} ({{top_pressure_pct}}%)
- Average change score: {{avg_change}}/5
- Most common sacrifice themes: {{sacrifice_themes}}
{{emerging_gap_line}}

Generate 1-2 follow-up questions that:
1. DIG DEEPER into this person's specific situation (based on their pressure + sacrifice)
2. FILL GAPS in the dataset — ask about something the community hasn't told us much about yet
3. Are QUICK to answer (single choice with 3-5 options, a 1-5 scale, or a short text under 100 chars)
4. Feel CONVERSATIONAL and empathetic, not clinical
5. NEVER ask for identifying information (no name, postcode, employer, income figures)

{{volume_guidance}}

Return exactly 1-2 questions as structured JSON.`,

    insightSystem: `You are a community research analyst synthesising anonymous feedback data
into a narrative insight report. You write as the voice of the community —
using "we" and "our" language.

Your role is to:
- Identify dominant themes and their relative weight
- Note emerging concerns or shifts in the data
- Maintain a constructive, forward-looking tone
- Ground every claim in the actual numbers provided
- NEVER invent specific stories, quotes, or individual experiences
- NEVER speculate beyond what the data supports

Style: Clear, accessible prose. No jargon. Write for a community notice board,
not an academic paper. Use short paragraphs. Be warm but honest.

Format your response as:
1. Opening statement (1 sentence capturing the overall picture)
2. Key themes (2-3 short paragraphs on dominant concerns)
3. Community aspirations (what improvements people want)
4. Closing observation (1 sentence, forward-looking)`,

    insightUser: `Analyse this community feedback data and generate a Community Voice insight.

DATASET: {{total_responses}} anonymous responses collected.
{{recency_line}}
BIGGEST PRESSURES (ranked):
{{pressures_ranked}}

DIRECTION OF CHANGE: Average score {{avg_change}}/5
(1=much better, 5=much worse)
{{ai_themes_block}}
WHAT PEOPLE HAVE SACRIFICED (their own words):
{{all_sacrifices}}

DEEPER INSIGHTS (from adaptive follow-up questions):
{{adaptive_answers}}

Generate a 250-350 word Community Voice narrative.

IMPORTANT: The "sacrifice" answers are the emotional core. A list
showing "heating", "seeing friends", "fresh fruit", "my career"
tells a more powerful story than any percentage. Use them.

Do NOT invent stories. Do NOT add data you weren't given.
Write like a community leader addressing a council meeting —
warm, direct, evidence-based.`,

    themeExtraction: `You are analysing anonymous free-text responses to the question:
"What have you had to cut back on or give up because of rising costs?"

Here are all {{count}} responses:
{{responses}}

Discover the dominant themes that emerge from these responses. Do NOT use predefined categories — let the patterns emerge from the actual language people use.

For each theme:
- Give it a short, plain-language name (2-4 words)
- Write a one-sentence description of what this theme captures
- Count how many responses relate to this theme (a response can belong to multiple themes)
- Include 1-3 verbatim quotes that best represent this theme

Rules:
- Return between 1 and 12 themes, ranked by frequency (most common first)
- Only create a theme if at least 2 responses relate to it
- Use the respondents' own language where possible
- Do not invent or embellish quotes — use exact text from the responses above

Return valid JSON matching the schema.`,
  },

  // ─── Fallback theme keywords (pre-AI extraction) ──────────
  fallbackThemeKeywords: {
    socialising: ["friends", "social", "going out", "pub", "restaurant"],
    heating: ["heating", "heat", "warm", "thermostat"],
    "food quality": ["fresh", "fruit", "organic", "meat", "quality"],
    hobbies: ["gym", "hobby", "sport", "club", "membership"],
    holidays: ["holiday", "travel", "vacation", "trip"],
    transport: ["car", "petrol", "bus", "train", "commute"],
    childcare: ["childcare", "nursery", "school"],
    entertainment: ["streaming", "netflix", "cinema", "entertainment"],
  },

  // ─── Operational constants ──────────────────────────────────
  operational: {
    themeExtractionInterval: 5,
    insightInterval: 5,
    insightCooldownMs: 60 * 60 * 1000, // 1 hour
    statisticsCacheTtlMs: 60_000, // 60 seconds
    minSubmissionsForAI: 5,
  },

  // ─── Seed data (development) ────────────────────────────────
  seedData: [
    // Housing cluster (dominant)
    { responses: { biggest_pressure: "housing", change_direction: 5, sacrifice: "Heating — we keep it off until 7pm now" } },
    { responses: { biggest_pressure: "housing", change_direction: 5, sacrifice: "Social life, can't afford to go out anymore" } },
    { responses: { biggest_pressure: "housing", change_direction: 4, sacrifice: "Moved back in with parents at 28" } },
    { responses: { biggest_pressure: "housing", change_direction: 5, sacrifice: "Saving for a house — gave up completely" } },
    { responses: { biggest_pressure: "housing", change_direction: 4, sacrifice: "My gym membership and eating out" } },
    { responses: { biggest_pressure: "housing", change_direction: 3, sacrifice: "Switched to a smaller flat" } },
    { responses: { biggest_pressure: "housing", change_direction: 5, sacrifice: "Holidays — haven't been away in two years" },
      adaptiveData: [{ question: "What's driving your housing costs up?", answer: "Rent increase", input_type: "single_choice" }] },
    { responses: { biggest_pressure: "housing", change_direction: 4, sacrifice: "New clothes — everything from charity shops now" },
      adaptiveData: [{ question: "What's driving your housing costs up?", answer: "Mortgage rate rise", input_type: "single_choice" }] },

    // Food cluster
    { responses: { biggest_pressure: "food", change_direction: 4, sacrifice: "Fresh fruit and vegetables" } },
    { responses: { biggest_pressure: "food", change_direction: 5, sacrifice: "Meat — we've gone mostly vegetarian out of necessity" } },
    { responses: { biggest_pressure: "food", change_direction: 4, sacrifice: "Lunch at work, I just skip it now" } },
    { responses: { biggest_pressure: "food", change_direction: 3, sacrifice: "Organic food, switched to cheapest brands" } },
    { responses: { biggest_pressure: "food", change_direction: 4, sacrifice: "Treats for the kids" },
      adaptiveData: [{ question: "How has this affected your household?", answer: 4, input_type: "scale" }] },

    // Energy cluster
    { responses: { biggest_pressure: "energy", change_direction: 5, sacrifice: "Keeping the house warm" } },
    { responses: { biggest_pressure: "energy", change_direction: 5, sacrifice: "Hot baths — we shower quick and cold" } },
    { responses: { biggest_pressure: "energy", change_direction: 4, sacrifice: "Using the tumble dryer" } },
    { responses: { biggest_pressure: "energy", change_direction: 4, sacrifice: "Cooking from scratch — microwave meals use less energy" },
      adaptiveData: [{ question: "What worries you most about winter?", answer: "Not being able to heat the house", input_type: "short_text" }] },

    // Transport
    { responses: { biggest_pressure: "transport", change_direction: 4, sacrifice: "Driving to see family — too expensive" } },
    { responses: { biggest_pressure: "transport", change_direction: 3, sacrifice: "My car — sold it, bus only now" } },

    // Debt
    { responses: { biggest_pressure: "debt", change_direction: 5, sacrifice: "Peace of mind" } },
    { responses: { biggest_pressure: "debt", change_direction: 5, sacrifice: "My credit score — had to use BNPL for essentials" },
      adaptiveData: [{ question: "What kind of debt is most stressful?", answer: "Credit card debt", input_type: "single_choice" }] },

    // Healthcare
    { responses: { biggest_pressure: "healthcare", change_direction: 4, sacrifice: "Dental checkups — can't afford private" } },
    { responses: { biggest_pressure: "healthcare", change_direction: 3, sacrifice: "Physiotherapy sessions" } },

    // Childcare
    { responses: { biggest_pressure: "childcare", change_direction: 5, sacrifice: "My career — had to go part-time" } },

    // Other
    { responses: { biggest_pressure: "other", change_direction: 4, sacrifice: "University savings for my daughter" } },
  ],
};

export default config;
