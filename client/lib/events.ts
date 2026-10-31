import { connection } from "next/server";
import { cache } from "react";
import { ATLAS_CATEGORIES, type AtlasCategory, type AtlasEvent } from "@/constants/events";
import Event from "@/lib/models/Events";
import AtlasCategoryModel from "@/lib/models/AtlasCategory";
import connect from "@/lib/mongoose";
import type { IEvent } from "@/types/interface";

type AtlasEventRecord = Pick<IEvent, "slug" | "eventName" | "category" | "kind" | "description" | "clubs">;
export type EventSummary = Pick<IEvent, "slug" | "eventName" | "description">;

/** Fixed display order for the seven worlds. */
const CATEGORY_ORDER = [
  "kalakriti",
  "tandav",
  "natyam",
  "akshar",
  "roop-rang",
  "sargam",
  "brahmand",
] as const;

/**
 * Lookup filter for a Mongo id or atlas slug. Not `isValidObjectId`: it accepts
 * any 12-character string, which would swallow slugs like "general-quiz".
 */
export const eventLookup = (id: string) =>
  /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id.toLowerCase() };

/** The seven worlds — category copy from MongoDB, events from Mongo or canonical defaults. */
export async function getAtlasCategories(): Promise<AtlasCategory[]> {
  // Read per request: a prerender would need the database at build time.
  await connection();
  await connect();

  // Fetch categories from MongoDB; fall back to constants if collection is empty.
  const dbCategories = await AtlasCategoryModel.find()
    .lean<{ id: string; name: string; kind: string; line: string; image: string }[]>();

  // Build a lookup by id from the DB results.
  const dbCategoryById = new Map(dbCategories.map((c) => [c.id, c]));

  // Fetch events from MongoDB.
  const records = await Event.find()
    .select("slug eventName category kind description clubs")
    .sort({ eventName: 1 })
    .lean<AtlasEventRecord[]>();

  // Resolve each category in canonical order, merging DB data with constants fallback.
  return CATEGORY_ORDER.map((catId) => {
    const constant = ATLAS_CATEGORIES.find((c) => c.id === catId)!;
    const dbCat = dbCategoryById.get(catId);

    const categoryMeta = {
      id: catId,
      name: dbCat?.name ?? constant.name,
      kind: dbCat?.kind ?? constant.kind,
      line: dbCat?.line ?? constant.line,
    };

    const matchedRecords = records.filter((r) => r.category === categoryMeta.name);
    const recordBySlug = new Map(matchedRecords.map((r) => [r.slug.toLowerCase(), r]));

    const events: AtlasEvent[] = constant.events.map((defaultEvent) => {
      const record = recordBySlug.get(defaultEvent.id.toLowerCase());
      const dbClubs = record?.clubs && record.clubs.length > 0 ? record.clubs.join(", ") : "";
      return {
        ...defaultEvent,
        name: record?.eventName ?? defaultEvent.name,
        description: record?.description ?? defaultEvent.description,
        kind: record?.kind ?? defaultEvent.kind,
        club: dbClubs || defaultEvent.club || "",
      };
    });

    return {
      ...categoryMeta,
      events,
    };
  });
}

/** Cached per request: metadata and the page share one query. */
export const getEventSummary = cache(async (id: string) => {
  await connect();
  return Event.findOne(eventLookup(id))
    .select("slug eventName description")
    .lean<EventSummary | null>();
});
