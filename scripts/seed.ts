import { db } from "../src/db";
import { submissions } from "../src/db/schema";

const SEED_DATA: Array<{
  responses: { biggest_pressure: string; change_direction: number; sacrifice: string };
  adaptiveData?: Record<string, unknown>[];
}> = [
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
];

async function seed() {
  console.log("Seeding database...");

  // Spread creation dates across the last 30 days for realistic time distribution
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < SEED_DATA.length; i++) {
    const { responses, adaptiveData } = SEED_DATA[i];
    const createdAt = new Date(now - (thirtyDays * (SEED_DATA.length - i)) / SEED_DATA.length)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);

    await db.insert(submissions).values({
      responses,
      adaptiveData: adaptiveData ?? null,
      consentGiven: true,
      createdAt,
    });
  }

  console.log(`Seeded ${SEED_DATA.length} submissions`);
}

seed().catch(console.error);
