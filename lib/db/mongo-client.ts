import { MongoClient, ObjectId, type Db } from "mongodb";
import { getMongoConfig } from "./config";
import { COLLECTIONS } from "./constants";

type MongoGlobal = typeof globalThis & {
  restaurantMenuMongoClient?: Promise<MongoClient>;
  restaurantMenuMongoIndexes?: Map<string, Promise<void>>;
};

const mongoGlobal = globalThis as MongoGlobal;

async function getClient(uri: string): Promise<MongoClient> {
  if (!mongoGlobal.restaurantMenuMongoClient) {
    const clientPromise = Promise.resolve()
      .then(() => new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10_000,
      }).connect())
      .catch(() => {
        mongoGlobal.restaurantMenuMongoClient = undefined;
        throw new Error("Could not connect to MongoDB. Verify MONGODB_URI and the Atlas network-access configuration.");
      });
    mongoGlobal.restaurantMenuMongoClient = clientPromise;
  }

  return mongoGlobal.restaurantMenuMongoClient;
}

async function initializeIndexes(db: Db): Promise<void> {
  const indexPromises = mongoGlobal.restaurantMenuMongoIndexes ?? new Map<string, Promise<void>>();
  mongoGlobal.restaurantMenuMongoIndexes = indexPromises;

  let indexPromise = indexPromises.get(db.databaseName);
  if (!indexPromise) {
    indexPromise = Promise.all([
      db.collection(COLLECTIONS.admins).createIndex({ email: 1 }, { unique: true, name: "admin_email_unique" }),
      db.collection(COLLECTIONS.categories).createIndex({ slug: 1 }, { unique: true, name: "category_slug_unique" }),
      db.collection(COLLECTIONS.categories).createIndex(
        { active: 1, published: 1, displayOrder: 1, name: 1 },
        { name: "public_category_order" },
      ),
      db.collection(COLLECTIONS.items).createIndex({ categoryId: 1, name: 1 }, { name: "menu_category_name" }),
      db.collection(COLLECTIONS.items).createIndex({ name: 1 }, { name: "menu_name" }),
    ])
      .then(() => undefined)
      .catch(() => {
        indexPromises.delete(db.databaseName);
        throw new Error("Could not initialize MongoDB indexes. Resolve any duplicate admin emails or category slugs and retry.");
      });
    indexPromises.set(db.databaseName, indexPromise);
  }

  await indexPromise;
}

export async function getDb(): Promise<Db> {
  const { uri, databaseName } = getMongoConfig();
  const client = await getClient(uri);
  const db = client.db(databaseName);
  await initializeIndexes(db);
  return db;
}

export async function closeMongoClient(): Promise<void> {
  const clientPromise = mongoGlobal.restaurantMenuMongoClient;
  try {
    if (clientPromise) await (await clientPromise).close();
  } finally {
    mongoGlobal.restaurantMenuMongoClient = undefined;
    mongoGlobal.restaurantMenuMongoIndexes?.clear();
  }
}

export { ObjectId };
