import { db } from "../src/db";
import { submissions } from "../src/db/schema";
import config from "../src/config/survey.config";

const SEED_DATA = config.seedData ?? [];

async function seed() {
  if (SEED_DATA.length === 0) {
    console.log("No seed data defined in config — skipping.");
    return;
  }

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
