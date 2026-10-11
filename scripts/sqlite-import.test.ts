import Database from "better-sqlite3";
import { ObjectId } from "mongodb";
import { afterEach, describe, expect, it } from "vitest";
import { COLLECTIONS } from "../lib/db/constants";
import { createDocuments } from "./sqlite-import";

describe("SQLite import document conversion", () => {
  let sqlite: Database.Database | undefined;

  afterEach(() => {
    sqlite?.close();
    sqlite = undefined;
  });

  function createSourceDatabase(): Database.Database {
    const db = new Database(":memory:");
    sqlite = db;
    db.exec(`
      CREATE TABLE admins (
        id TEXT PRIMARY KEY, email TEXT, password_hash TEXT, full_name TEXT,
        created_at TEXT, updated_at TEXT
      );
      CREATE TABLE restaurant_settings (
        id INTEGER PRIMARY KEY, name TEXT, logo TEXT, hero_image TEXT, description TEXT,
        address TEXT, phone TEXT, email TEXT, currency TEXT, facebook_url TEXT,
        instagram_url TEXT, youtube_url TEXT, whatsapp_url TEXT, twitter_url TEXT,
        google_maps_url TEXT, opening_hours TEXT, updated_at TEXT
      );
      CREATE TABLE menu_categories (
        id TEXT PRIMARY KEY, name TEXT, slug TEXT, description TEXT, image TEXT,
        display_order INTEGER, active INTEGER, published INTEGER, created_at TEXT, updated_at TEXT
      );
      CREATE TABLE menu_items (
        id TEXT PRIMARY KEY, category_id TEXT, name TEXT, price REAL,
        created_at TEXT, updated_at TEXT
      );
      INSERT INTO admins VALUES (
        'legacy-admin', 'ADMIN@example.test', '$2b$12$test-hash', 'Test Admin',
        '2026-10-11 10:00:00', '2026-10-11 11:00:00'
      );
      INSERT INTO restaurant_settings VALUES (
        1, 'Test Restaurant', NULL, NULL, 'Test description', '1 Test St',
        NULL, NULL, 'INR', NULL, 'https://instagram.com/test', NULL, NULL,
        NULL, NULL, '{"monday":{"isClosed":true}}', '2026-10-11 12:00:00'
      );
      INSERT INTO menu_categories VALUES (
        'legacy-category', 'Snacks', 'snacks', 'Small plates', NULL, 1, 1, 1,
        '2026-10-11 10:00:00', '2026-10-11 11:00:00'
      );
      INSERT INTO menu_items VALUES (
        'categorized-dish', 'legacy-category', 'Paneer tikka', 180,
        '2026-10-11 10:00:00', '2026-10-11 11:00:00'
      );
      INSERT INTO menu_items VALUES (
        'uncategorized-dish', NULL, 'Masala chai', 45,
        '2026-10-11 10:00:00', '2026-10-11 11:00:00'
      );
    `);
    return db;
  }

  it("preserves hashes, timestamps, settings, category relationships and uncategorized dishes", () => {
    const db = createSourceDatabase();
    const documents = createDocuments(db);
    const [admin] = documents[COLLECTIONS.admins];
    const [category] = documents[COLLECTIONS.categories];
    const [categorizedDish, uncategorizedDish] = documents[COLLECTIONS.items];
    const [settings] = documents[COLLECTIONS.settings];

    expect(admin).toMatchObject({
      email: "admin@example.test",
      passwordHash: "$2b$12$test-hash",
      fullName: "Test Admin",
    });
    expect(admin._id).toBeInstanceOf(ObjectId);
    expect(admin.createdAt).toEqual(new Date("2026-10-11T10:00:00.000Z"));
    expect(category.description).toBe("Small plates");
    expect(categorizedDish.categoryId).toEqual(category._id);
    expect(categorizedDish).toHaveProperty("name", "Paneer tikka");
    expect(categorizedDish).toHaveProperty("price", 180);
    expect(Object.keys(categorizedDish).sort()).toEqual([
      "_id",
      "categoryId",
      "createdAt",
      "name",
      "price",
      "updatedAt",
    ]);
    expect(uncategorizedDish.categoryId).toBeNull();
    expect(settings).toMatchObject({
      name: "Test Restaurant",
      instagramUrl: "https://instagram.com/test",
      openingHours: { monday: { isClosed: true } },
    });
    expect(db.prepare("SELECT count(*) AS count FROM menu_items").get()).toEqual({ count: 2 });
  });

  it("generates repeatable ObjectIds for legacy record and category references", () => {
    const db = createSourceDatabase();
    const firstImport = createDocuments(db);
    const secondImport = createDocuments(db);

    expect(secondImport[COLLECTIONS.admins][0]._id).toEqual(firstImport[COLLECTIONS.admins][0]._id);
    expect(secondImport[COLLECTIONS.categories][0]._id).toEqual(firstImport[COLLECTIONS.categories][0]._id);
    expect(secondImport[COLLECTIONS.items][0].categoryId).toEqual(firstImport[COLLECTIONS.items][0].categoryId);
  });

  it("stops before import when a dish points at a missing category", () => {
    const db = createSourceDatabase();
    db.prepare("UPDATE menu_items SET category_id = ? WHERE id = ?")
      .run("missing-category", "categorized-dish");

    expect(() => createDocuments(db)).toThrow(/references a category that is missing/);
  });
});
