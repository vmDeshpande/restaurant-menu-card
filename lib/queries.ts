import {
  COLLECTIONS,
  ObjectId,
  RESTAURANT_SETTINGS_ID,
  getDb,
} from "./db";
import { slugify } from "./utils";
import type {
  Admin,
  DashboardMetrics,
  MenuCategory,
  MenuItem,
  RestaurantSettings,
} from "./types";
import {
  MongoServerError,
  type Document,
  type Filter,
} from "mongodb";

interface AdminDocument extends Omit<Admin, "id">, Document {
  _id: ObjectId;
}

interface RestaurantSettingsDocument extends Omit<RestaurantSettings, "id">, Document {
  _id: ObjectId;
}

interface MenuCategoryDocument extends Omit<MenuCategory, "id">, Document {
  _id: ObjectId;
}

interface MenuItemDocument extends Omit<MenuItem, "id" | "category" | "categoryId">, Document {
  _id: ObjectId;
  categoryId: ObjectId | null;
}

export type NewAdmin = Pick<Admin, "email" | "passwordHash"> & { fullName?: string | null };
export type CategoryInput = Partial<Omit<MenuCategory, "id" | "createdAt" | "updatedAt">>;
export type MenuItemInput = Pick<MenuItem, "name" | "price"> & { categoryId?: string | null };
export type RestaurantSettingsInput = Partial<Omit<RestaurantSettings, "id">>;

const objectIdPattern = /^[0-9a-f]{24}$/i;

function toObjectId(id: string): ObjectId | null {
  return objectIdPattern.test(id) ? new ObjectId(id) : null;
}

function mapAdmin(document: AdminDocument): Admin {
  const { _id, ...admin } = document;
  return { ...admin, id: _id.toHexString() };
}

function mapSettings(document: RestaurantSettingsDocument): RestaurantSettings {
  const { _id, ...settings } = document;
  return { ...settings, id: _id.toHexString() };
}

function mapCategory(document: MenuCategoryDocument): MenuCategory {
  const { _id, ...category } = document;
  return { ...category, id: _id.toHexString() };
}

function mapMenuItem(document: MenuItemDocument, category: MenuCategory | null): MenuItem {
  const { _id, categoryId, ...item } = document;
  return {
    ...item,
    id: _id.toHexString(),
    categoryId: categoryId?.toHexString() ?? null,
    category,
  };
}

function isDuplicateKey(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000;
}

export class DuplicateAdminError extends Error {
  constructor() {
    super("An administrator with this email already exists.");
    this.name = "DuplicateAdminError";
  }
}

export class DuplicateCategoryError extends Error {
  constructor() {
    super("A category with this name already exists.");
    this.name = "DuplicateCategoryError";
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  const admin = await db.collection<AdminDocument>(COLLECTIONS.admins).findOne({ _id: objectId });
  return admin ? mapAdmin(admin) : null;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const db = await getDb();
  const admin = await db.collection<AdminDocument>(COLLECTIONS.admins).findOne({
    email: email.trim().toLowerCase(),
  });
  return admin ? mapAdmin(admin) : null;
}

export async function insertAdmin(input: NewAdmin): Promise<Admin> {
  const db = await getDb();
  const now = new Date();
  const document: AdminDocument = {
    _id: new ObjectId(),
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    fullName: input.fullName ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.collection<AdminDocument>(COLLECTIONS.admins).insertOne(document);
  } catch (error) {
    if (isDuplicateKey(error)) throw new DuplicateAdminError();
    throw error;
  }

  return mapAdmin(document);
}

export async function updateAdminPassword(id: string, passwordHash: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  const db = await getDb();
  const result = await db.collection<AdminDocument>(COLLECTIONS.admins).updateOne(
    { _id: objectId },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
  return result.matchedCount > 0;
}

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  const db = await getDb();
  const settings = await db.collection<RestaurantSettingsDocument>(COLLECTIONS.settings)
    .findOne({ _id: RESTAURANT_SETTINGS_ID });
  return settings ? mapSettings(settings) : null;
}

export async function updateRestaurantSettings(
  data: RestaurantSettingsInput,
): Promise<RestaurantSettings | null> {
  const db = await getDb();
  const document = await db.collection<RestaurantSettingsDocument>(COLLECTIONS.settings).findOneAndUpdate(
    { _id: RESTAURANT_SETTINGS_ID },
    {
      $set: { ...data, updatedAt: new Date() },
    },
    { upsert: true, returnDocument: "after" },
  );
  return document ? mapSettings(document) : null;
}

export async function getCategories(options: {
  includeInactive?: boolean;
  includeUnpublished?: boolean;
} = {}): Promise<MenuCategory[]> {
  const db = await getDb();
  const filter: Filter<MenuCategoryDocument> = {};
  if (!options.includeInactive) filter.active = true;
  if (!options.includeUnpublished) filter.published = true;

  const categories = await db.collection<MenuCategoryDocument>(COLLECTIONS.categories)
    .find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .toArray();
  return categories.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<MenuCategory | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  const category = await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).findOne({ _id: objectId });
  return category ? mapCategory(category) : null;
}

export async function getCategoryBySlug(slug: string): Promise<MenuCategory | null> {
  const db = await getDb();
  const category = await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).findOne({ slug });
  return category ? mapCategory(category) : null;
}

export async function createCategory(
  input: Omit<CategoryInput, "slug"> & { name: string; slug: string },
): Promise<MenuCategory> {
  const db = await getDb();
  const now = new Date();
  const document: MenuCategoryDocument = {
    _id: new ObjectId(),
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description ?? null,
    image: input.image || null,
    displayOrder: input.displayOrder ?? 0,
    active: input.active ?? true,
    published: input.published ?? true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).insertOne(document);
  } catch (error) {
    if (isDuplicateKey(error)) throw new DuplicateCategoryError();
    throw error;
  }

  return mapCategory(document);
}

export async function updateCategory(
  id: string,
  data: CategoryInput,
): Promise<MenuCategory | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  const updates: Partial<MenuCategoryDocument> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== "id" && key !== "createdAt" && key !== "updatedAt") {
      Object.assign(updates, { [key]: value });
    }
  }
  if (data.name && !data.slug) updates.slug = slugify(data.name);
  updates.updatedAt = new Date();

  let category: MenuCategoryDocument | null;
  try {
    category = await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: "after" },
    );
  } catch (error) {
    if (isDuplicateKey(error)) throw new DuplicateCategoryError();
    throw error;
  }
  return category ? mapCategory(category) : null;
}

export async function hasMenuItemsInCategory(id: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  const db = await getDb();
  return Boolean(await db.collection<MenuItemDocument>(COLLECTIONS.items).findOne(
    { categoryId: objectId },
    { projection: { _id: 1 } },
  ));
}

export async function deleteCategory(id: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  const db = await getDb();
  if (await hasMenuItemsInCategory(id)) return false;
  const result = await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).deleteOne({ _id: objectId });
  if (result.deletedCount > 0) {
    await db.collection<MenuItemDocument>(COLLECTIONS.items).updateMany(
      { categoryId: objectId },
      { $set: { categoryId: null, updatedAt: new Date() } },
    );
  }
  return result.deletedCount > 0;
}

async function attachCategories(items: MenuItemDocument[]): Promise<MenuItem[]> {
  if (items.length === 0) return [];
  const db = await getDb();
  const categoryIds = [...new Map(
    items.flatMap((item) => item.categoryId ? [[item.categoryId.toHexString(), item.categoryId] as const] : []),
  ).values()];
  const categories = categoryIds.length
    ? await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).find({ _id: { $in: categoryIds } }).toArray()
    : [];
  const byId = new Map(categories.map((category) => [category._id.toHexString(), mapCategory(category)]));

  return items.map((item) => {
    const categoryId = item.categoryId?.toHexString();
    return mapMenuItem(item, categoryId ? byId.get(categoryId) ?? null : null);
  });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getMenuItems(options: {
  categoryId?: string | null;
  search?: string | null;
  limit?: number;
  orderBy?: "name" | "updatedAt";
  descending?: boolean;
} = {}): Promise<MenuItem[]> {
  const filter: Filter<MenuItemDocument> = {};
  if (options.categoryId) {
    const categoryId = toObjectId(options.categoryId);
    if (!categoryId) return [];
    filter.categoryId = categoryId;
  }
  const search = options.search?.trim();
  if (search) filter.name = { $regex: escapeRegex(search.slice(0, 120)), $options: "i" };
  if (options.limit !== undefined && options.limit <= 0) return [];

  const db = await getDb();
  const sortField = options.orderBy ?? "name";
  let cursor = db.collection<MenuItemDocument>(COLLECTIONS.items)
    .find(filter)
    .sort({ [sortField]: options.descending ? -1 : 1 });
  if (options.limit !== undefined) cursor = cursor.limit(Math.floor(options.limit));
  return attachCategories(await cursor.toArray());
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  const item = await db.collection<MenuItemDocument>(COLLECTIONS.items).findOne({ _id: objectId });
  if (!item) return null;
  return (await attachCategories([item]))[0] ?? null;
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  const db = await getDb();
  const now = new Date();
  const categoryId = input.categoryId ? toObjectId(input.categoryId) : null;
  if (input.categoryId && !categoryId) throw new Error("Invalid menu category ID.");
  const document: MenuItemDocument = {
    _id: new ObjectId(),
    categoryId,
    name: input.name,
    price: input.price,
    createdAt: now,
    updatedAt: now,
  };
  const items = db.collection<MenuItemDocument>(COLLECTIONS.items);
  await items.insertOne(document);
  if (categoryId && !await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).findOne({ _id: categoryId })) {
    await items.updateOne(
      { _id: document._id },
      { $set: { categoryId: null, updatedAt: new Date() } },
    );
    document.categoryId = null;
  }
  return (await attachCategories([document]))[0];
}

export async function updateMenuItem(
  id: string,
  data: Partial<MenuItemInput>,
): Promise<MenuItem | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const db = await getDb();
  const updates: Partial<MenuItemDocument> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.price !== undefined) updates.price = data.price;
  if (data.categoryId !== undefined) {
    const categoryId = data.categoryId ? toObjectId(data.categoryId) : null;
    if (data.categoryId && !categoryId) throw new Error("Invalid menu category ID.");
    updates.categoryId = categoryId;
  }

  const item = await db.collection<MenuItemDocument>(COLLECTIONS.items).findOneAndUpdate(
    { _id: objectId },
    { $set: updates },
    { returnDocument: "after" },
  );
  if (!item) return null;
  if (item.categoryId && !await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).findOne({
    _id: item.categoryId,
  })) {
    const result = await db.collection<MenuItemDocument>(COLLECTIONS.items).updateOne(
      { _id: item._id, categoryId: item.categoryId },
      { $set: { categoryId: null, updatedAt: new Date() } },
    );
    if (result.modifiedCount > 0) item.categoryId = null;
    else return getMenuItemById(id);
  }
  return (await attachCategories([item]))[0] ?? null;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  const db = await getDb();
  const result = await db.collection<MenuItemDocument>(COLLECTIONS.items).deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = await getDb();
  const items = db.collection<MenuItemDocument>(COLLECTIONS.items);
  const categories = db.collection<MenuCategoryDocument>(COLLECTIONS.categories);
  const [totalItems, totalCategories, recentRows] = await Promise.all([
    items.countDocuments(),
    categories.countDocuments(),
    items.find({}).sort({ updatedAt: -1 }).limit(5).toArray(),
  ]);
  return {
    totalItems,
    totalCategories,
    recentItems: await attachCategories(recentRows),
  };
}

export async function reorderCategories(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  const validItems = items.flatMap((item) => {
    const _id = toObjectId(item.id);
    return _id ? [{ updateOne: { filter: { _id }, update: { $set: { displayOrder: item.displayOrder, updatedAt: new Date() } } } }] : [];
  });
  if (validItems.length === 0) return;
  const db = await getDb();
  await db.collection<MenuCategoryDocument>(COLLECTIONS.categories).bulkWrite(validItems);
}
