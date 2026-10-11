import path from "node:path";
import Database from "better-sqlite3";
import { loadEnvConfig } from "@next/env";
import { type Document, type Db } from "mongodb";
import { closeMongoClient, getDb } from "../lib/db/mongo-client";
import { COLLECTIONS } from "../lib/db/constants";
import { ImportDataError, createDocuments } from "./sqlite-import";

loadEnvConfig(process.cwd());

async function importCollection(
  db: Db,
  collectionName: string,
  documents: Document[],
): Promise<{ source: number; inserted: number; unchanged: number; verified: number }> {
  const collection = db.collection<Document>(collectionName);
  let inserted = 0;
  let unchanged = 0;

  for (const document of documents) {
    const result = await collection.updateOne(
      { _id: document._id },
      { $setOnInsert: document },
      { upsert: true },
    );
    inserted += result.upsertedCount;
    unchanged += result.matchedCount;
  }

  const verified = documents.length
    ? await collection.countDocuments({ _id: { $in: documents.map((document) => document._id) } })
    : 0;
  if (verified !== documents.length) {
    throw new ImportDataError(`MongoDB verification failed for ${collectionName}.`);
  }
  return { source: documents.length, inserted, unchanged, verified };
}

async function main(): Promise<void> {
  const mongo = await getDb();
  const sqlitePath = path.resolve(
    process.argv[2] ?? process.env.SQLITE_SOURCE_PATH ?? "./data/restaurant.db",
  );
  const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });

  try {
    const documents = createDocuments(sqlite);
    for (const name of [
      COLLECTIONS.admins,
      COLLECTIONS.settings,
      COLLECTIONS.categories,
      COLLECTIONS.items,
    ]) {
      const result = await importCollection(mongo, name, documents[name]);
      console.log(
        `${name}: ${result.source} source, ${result.inserted} inserted, ${result.unchanged} unchanged, ${result.verified} verified.`,
      );
    }
    console.log("SQLite data import completed. The source database was left unchanged.");
  } finally {
    sqlite.close();
  }
}

async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    if (error instanceof ImportDataError) {
      console.error(`SQLite import stopped: ${error.message}`);
    } else if (error instanceof Error && error.message.startsWith("MONGODB_")) {
      console.error(error.message);
    } else {
      console.error("SQLite-to-MongoDB import failed. Verify the MongoDB connection and source database, then retry.");
    }
    process.exitCode = 1;
  } finally {
    try {
      await closeMongoClient();
    } catch {
      console.error("MongoDB connection did not close cleanly.");
      process.exitCode = 1;
    }
  }
}

void run();
