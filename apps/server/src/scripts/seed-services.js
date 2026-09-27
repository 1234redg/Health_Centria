import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { Service } from '../models/service.model.js';

// Idempotent seed for the v1 service catalog (spec §3.1). Safe to re-run —
// matches by name and updates the schedule instead of duplicating.
//
// Usage: node src/scripts/seed-services.js

const CATALOG = [
  {
    name: 'Consultation',
    description: 'General checkups and medical consultations.',
    schedule: { mode: 'weekly', weekdays: [1] },
  },
  {
    name: 'Prenatal',
    description: 'Checkups for expecting mothers.',
    schedule: { mode: 'weekly', weekdays: [2] },
  },
  {
    name: 'Routine Immunization of Newborn Babies',
    description: 'Scheduled immunization for newborns. Staff manage the dose schedule; booking only reserves the visit day.',
    schedule: { mode: 'nth-weekday', nthWeek: 2, weekday: 3 },
  },
  {
    name: 'Family Planning',
    description: 'Counseling and family planning services.',
    schedule: { mode: 'weekly', weekdays: [4] },
  },
  {
    name: 'Postpartum Visit',
    description: 'Follow-up care after delivery. Staff confirm the date.',
    schedule: { mode: 'as-needed' },
  },
  {
    name: 'Follow-up Visit',
    description: 'Return visits as advised by staff. Staff confirm the date.',
    schedule: { mode: 'as-needed' },
  },
  {
    name: 'Hypertensive Patient Monitoring',
    description: 'Blood pressure checks and monitoring. Staff confirm the date.',
    schedule: { mode: 'as-needed' },
  },
  {
    name: 'Breastfeeding Mothers Support',
    description: 'Guidance and support for breastfeeding mothers. Staff confirm the date.',
    schedule: { mode: 'as-needed' },
  },
];

async function main() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<user>')) {
    console.error('MONGODB_URI is missing or still a placeholder — set it in apps/server/.env first.');
    process.exit(2);
  }
  await connectDB(process.env.MONGODB_URI);
  try {
    for (const item of CATALOG) {
      await Service.findOneAndUpdate(
        { name: item.name },
        { $set: { description: item.description, schedule: item.schedule, active: true } },
        { upsert: true },
      );
      console.log(`ok: ${item.name}`);
    }
    console.log(`Seeded ${CATALOG.length} services.`);
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
