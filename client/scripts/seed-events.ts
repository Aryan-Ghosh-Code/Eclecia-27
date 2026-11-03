/**
 * Seeds the events collection from the atlas line-up in constants/events.ts
 * and Cloudinary links in constants/assets.ts.
 *
 *   bun scripts/seed-events.ts
 *   or: npx tsx --env-file=.env.local scripts/seed-events.ts
 */
import mongoose from "mongoose";
import { ATLAS_CATEGORIES } from "../constants/events";
import { ASSETS } from "../constants/assets";
import Event from "../lib/models/Events";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI (put it in client/.env.local)");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Drop existing events collection if requested/re-seeding
  try {
    await Event.collection.drop();
    console.log("Dropped existing events collection.");
  } catch (err: any) {
    if (err.code === 26 || err.message?.includes("ns not found")) {
      console.log("Events collection does not exist, proceeding to insert.");
    } else {
      console.warn("Notice on dropping events collection:", err.message);
    }
  }

  const ops = ATLAS_CATEGORIES.flatMap((category) =>
    category.events.map((event) => {
      const catEvents = ASSETS.cloudinary.events[category.id];
      const cloudBanner = catEvents ? catEvents[event.id] || "" : "";

      const updateDoc: Record<string, any> = {
        $set: {
          eventName: event.name,
          category: category.name,
          kind: event.kind,
          description: event.description,
          // Always sync clubs from constants so the DB stays up-to-date.
          clubs: event.club ? [event.club] : [],
          // If a Cloudinary artwork URL is listed in ASSETS, sync it to banner
          ...(cloudBanner ? { banner: cloudBanner } : {}),
        },
        $setOnInsert: {
          slug: event.id,
          ...(!cloudBanner ? { banner: "" } : {}),
          date: "TBA",
          time: "TBA",
          duration: "TBA",
          venue: "TBA",
          isTeamEvent: false,
          minMembersPerTeam: 1,
          maxMembersPerTeam: 1,
          isPaidEvent: false,
          isActive: false,
        },
      };

      return {
        updateOne: {
          filter: { slug: event.id },
          update: updateDoc,
          upsert: true,
        },
      };
    }),
  );

  const result = await Event.bulkWrite(ops);
  console.log(
    `events: ${ops.length} in line-up, ${result.upsertedCount} inserted, ${result.modifiedCount} updated`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed to seed events:", err);
  process.exit(1);
});
