import { createHash } from "node:crypto";
import Database from "better-sqlite3";
import { type Document, ObjectId } from "mongodb";
import { COLLECTIONS, RESTAURANT_SETTINGS_ID } from "../lib/db/constants";
import { slugify } from "../lib/utils";

type SqliteRow = Record<string, unknown>;

export class ImportDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportDataError";
  }
}

function legacyObjectId(collection: string, legacyId: string): ObjectId {
  const bytes = createHash("sha256").update(`${collection}\0${legacyId}`).digest().subarray(0, 12);
  return new ObjectId(bytes);
}

function requiredString(row: SqliteRow, field: string, table: string): string {
  const value = row[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new ImportDataError(`A row in ${table} has an empty or invalid ${field} value.`);
  }
  return value;
}

function optionalString(row: SqliteRow, field: string): string | null {
  const value = row[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new ImportDataError(`The SQLite ${field} field contains an unexpected value.`);
  }
  return value;
}

function timestamp(value: unknown, table: string, field: string): Date {
  if (value === null || value === undefined || value === "") return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value < 100_000_000_000 ? value * 1000 : value);
  }
  if (typeof value === "string") {
    const utcValue = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
    const date = new Date(utcValue);
    if (!Number.isNaN(date.getTime())) return date;
  }
  throw new ImportDataError(`A row in ${table} has an invalid ${field} timestamp.`);
}

function numericValue(value: unknown, table: string, field: string): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new ImportDataError(`A row in ${table} has an invalid ${field} value.`);
  }
  return number;
}

function booleanValue(value: unknown, fallback = true): boolean {
  if (value === null || value === undefined) return fallback;
  return value === true || value === 1 || value === "1";
}

function rowsFrom(sqlite: Database.Database, table: string): SqliteRow[] {
  const exists = sqlite.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
  ).get(table);
  if (!exists) throw new ImportDataError(`The SQLite database is missing the ${table} table.`);
  return sqlite.prepare(`SELECT * FROM "${table}"`).all() as SqliteRow[];
}

function parseOpeningHours(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new ImportDataError("Restaurant opening hours must be stored as JSON text in SQLite.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new ImportDataError("Restaurant opening hours contain invalid JSON; fix the source record before importing.");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ImportDataError("Restaurant opening hours must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function createDocuments(sqlite: Database.Database): Record<string, Document[]> {
  const adminRows = rowsFrom(sqlite, "admins");
  const categoryRows = rowsFrom(sqlite, "menu_categories");
  const itemRows = rowsFrom(sqlite, "menu_items");
  const settingsRows = rowsFrom(sqlite, "restaurant_settings");

  if (settingsRows.length > 1) {
    throw new ImportDataError("The SQLite database has multiple restaurant settings rows; resolve the singleton settings record before importing.");
  }

  const emails = new Set<string>();
  const admins: Document[] = adminRows.map((row) => {
    const legacyId = requiredString(row, "id", "admins");
    const email = requiredString(row, "email", "admins").trim().toLowerCase();
    if (emails.has(email)) {
      throw new ImportDataError("The SQLite database contains duplicate administrator email addresses.");
    }
    emails.add(email);
    const passwordHash = requiredString(row, "password_hash", "admins");
    return {
      _id: legacyObjectId(COLLECTIONS.admins, legacyId),
      email,
      passwordHash,
      fullName: optionalString(row, "full_name"),
      createdAt: timestamp(row.created_at, "admins", "created_at"),
      updatedAt: timestamp(row.updated_at, "admins", "updated_at"),
    };
  });

  const categoryIds = new Map<string, ObjectId>();
  const slugs = new Set<string>();
  const categories: Document[] = categoryRows.map((row) => {
    const legacyId = requiredString(row, "id", "menu_categories");
    const id = legacyObjectId(COLLECTIONS.categories, legacyId);
    categoryIds.set(legacyId, id);
    const name = requiredString(row, "name", "menu_categories");
    const slug = optionalString(row, "slug") || slugify(name);
    if (slugs.has(slug)) {
      throw new ImportDataError("The SQLite database contains duplicate category slugs.");
    }
    slugs.add(slug);
    return {
      _id: id,
      name,
      slug,
      description: optionalString(row, "description"),
      image: optionalString(row, "image"),
      displayOrder: numericValue(row.display_order ?? 0, "menu_categories", "display_order"),
      active: booleanValue(row.active),
      published: booleanValue(row.published),
      createdAt: timestamp(row.created_at, "menu_categories", "created_at"),
      updatedAt: timestamp(row.updated_at, "menu_categories", "updated_at"),
    };
  });

  const items: Document[] = itemRows.map((row) => {
    const legacyId = requiredString(row, "id", "menu_items");
    const legacyCategoryId = optionalString(row, "category_id");
    const categoryId = legacyCategoryId ? categoryIds.get(legacyCategoryId) : null;
    if (legacyCategoryId && !categoryId) {
      throw new ImportDataError("A dish references a category that is missing from the SQLite database.");
    }
    const name = requiredString(row, "name", "menu_items").trim();
    const price = numericValue(row.price, "menu_items", "price");
    if (name.length > 120 || price < 0) {
      throw new ImportDataError("A dish in SQLite violates the current name or price constraints.");
    }
    return {
      _id: legacyObjectId(COLLECTIONS.items, legacyId),
      categoryId,
      name,
      price,
      createdAt: timestamp(row.created_at, "menu_items", "created_at"),
      updatedAt: timestamp(row.updated_at, "menu_items", "updated_at"),
    };
  });

  const settings: Document[] = settingsRows.map((row) => ({
    _id: RESTAURANT_SETTINGS_ID,
    name: optionalString(row, "name") || "Name",
    logo: optionalString(row, "logo"),
    heroImage: optionalString(row, "hero_image"),
    description: optionalString(row, "description"),
    address: optionalString(row, "address"),
    phone: optionalString(row, "phone"),
    email: optionalString(row, "email"),
    currency: optionalString(row, "currency") || "INR",
    facebookUrl: optionalString(row, "facebook_url"),
    instagramUrl: optionalString(row, "instagram_url"),
    youtubeUrl: optionalString(row, "youtube_url"),
    whatsappUrl: optionalString(row, "whatsapp_url"),
    twitterUrl: optionalString(row, "twitter_url"),
    googleMapsUrl: optionalString(row, "google_maps_url"),
    openingHours: parseOpeningHours(row.opening_hours),
    updatedAt: timestamp(row.updated_at, "restaurant_settings", "updated_at"),
  }));

  return {
    [COLLECTIONS.admins]: admins,
    [COLLECTIONS.settings]: settings,
    [COLLECTIONS.categories]: categories,
    [COLLECTIONS.items]: items,
  };
}
