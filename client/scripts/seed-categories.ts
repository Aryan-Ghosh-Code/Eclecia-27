/**
 * Seeds the atlascategories collection from the atlas line-up in constants/events.ts
 * and Cloudinary links in constants/assets.ts.
 *
 *   bun scripts/seed-categories.ts
 *   or: npx tsx --env-file=.env.local scripts/seed-categories.ts
 */
import mongoose from "mongoose";
import { ATLAS_CATEGORIES } from "../constants/events";
import { ASSETS } from "../constants/assets";
import AtlasCategory from "../lib/models/AtlasCategory";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI (put it in client/.env.local)");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Drop existing categories collection as requested
  try {
    await AtlasCategory.collection.drop();
    console.log("Dropped existing categories collection.");
  } catch (err: any) {
    if (err.code === 26 || err.message?.includes("ns not found")) {
      console.log("Categories collection does not exist, proceeding to insert.");
    } else {
      console.warn("Notice on dropping collection:", err.message);
    }
  }

  const ops = ATLAS_CATEGORIES.map((category) => {
    const cloudImage = ASSETS.cloudinary.categories[category.id] || "";

    const updateDoc: Record<string, any> = {
      $set: {
        name: category.name,
        kind: category.kind,
        line: category.line,
        ...(cloudImage ? { image: cloudImage } : {}),
      },
      $setOnInsert: {
        id: category.id,
        ...(!cloudImage ? { image: "" } : {}),
      },
    };

    return {
      updateOne: {
        filter: { id: category.id },
        update: updateDoc,
        upsert: true,
      },
    };
  });

  const result = await AtlasCategory.bulkWrite(ops);
  console.log(
    `categories: ${ops.length} in line-up, ${result.upsertedCount} inserted, ${result.modifiedCount} updated`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed to seed categories:", err);
  process.exit(1);
});
