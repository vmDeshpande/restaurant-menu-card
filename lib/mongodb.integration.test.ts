import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const testUri = process.env.MONGODB_TEST_URI;
const testDatabasePrefix = process.env.MONGODB_TEST_DB_NAME;
const runIntegrationTests = Boolean(testUri && testDatabasePrefix);

describe.skipIf(!runIntegrationTests)("MongoDB persistence integration", () => {
  const originalUri = process.env.MONGODB_URI;
  const originalDatabaseName = process.env.MONGODB_DB_NAME;
  let databaseName: string | undefined;

  beforeAll(() => {
    if (!testUri || !testDatabasePrefix || !/^test_[a-zA-Z0-9_-]+$/.test(testDatabasePrefix)) {
      throw new Error("MONGODB_TEST_DB_NAME must begin with test_ and contain only letters, digits, underscores, or hyphens.");
    }
    databaseName = `${testDatabasePrefix}_${randomUUID().replace(/-/g, "")}`;
    process.env.MONGODB_URI = testUri;
    process.env.MONGODB_DB_NAME = databaseName;
  });

  afterAll(async () => {
    if (databaseName) {
      const { getDb, closeMongoClient } = await import("./db");
      const db = await getDb();
      await db.dropDatabase();
      await closeMongoClient();
    }
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
    if (originalDatabaseName === undefined) delete process.env.MONGODB_DB_NAME;
    else process.env.MONGODB_DB_NAME = originalDatabaseName;
  });

  it("persists admins, categories, dishes, settings and category references across client connections", async () => {
    const { createAdmin, authenticate } = await import("./auth");
    const { closeMongoClient } = await import("./db");
    const {
      createCategory,
      createMenuItem,
      deleteCategory,
      deleteMenuItem,
      getAdminById,
      getCategories,
      getDashboardMetrics,
      getMenuItems,
      getRestaurantSettings,
      insertAdmin,
      updateMenuItem,
      updateRestaurantSettings,
    } = await import("./queries");
    const { hashPassword } = await import("./passwords");

    const adminId = await createAdmin(
      "menu-admin@example.test",
      "test-only-password-123",
      "Menu Admin",
    );
    expect(adminId).toMatch(/^[0-9a-f]{24}$/);
    await expect(authenticate("MENU-ADMIN@example.test", "test-only-password-123"))
      .resolves.toMatchObject({ id: adminId, email: "menu-admin@example.test" });
    await expect(getAdminById(adminId)).resolves.toMatchObject({ id: adminId, fullName: "Menu Admin" });
    await expect(insertAdmin({
      email: "menu-admin@example.test",
      passwordHash: await hashPassword("another-test-password"),
    })).rejects.toThrow(/already exists/);

    const starters = await createCategory({
      name: "Starters",
      slug: "starters",
      description: "Small plates",
      displayOrder: 0,
      active: true,
      published: true,
    });
    const mains = await createCategory({
      name: "Mains",
      slug: "mains",
      description: null,
      displayOrder: 1,
      active: true,
      published: true,
    });
    const dish = await createMenuItem({
      name: "Paneer tikka",
      price: 180,
      categoryId: starters.id,
    });
    expect(dish.categoryId).toBe(starters.id);
    expect(dish.category?.description).toBe("Small plates");
    expect(dish.id).toMatch(/^[0-9a-f]{24}$/);
    await expect(deleteCategory(starters.id)).resolves.toBe(false);

    const uncategorized = await createMenuItem({ name: "Masala chai", price: 45 });
    expect(uncategorized.categoryId).toBeNull();
    expect((await getMenuItems({ search: "PANEER" })).map((item) => item.id)).toEqual([dish.id]);
    expect((await getCategories()).map((category) => category.name)).toEqual(["Starters", "Mains"]);

    await expect(updateMenuItem(dish.id, { categoryId: mains.id, price: 190 }))
      .resolves.toMatchObject({ categoryId: mains.id, price: 190 });
    await expect(updateMenuItem(dish.id, { categoryId: null }))
      .resolves.toMatchObject({ categoryId: null, category: null });

    await updateRestaurantSettings({
      name: "Test Restaurant",
      currency: "INR",
      instagramUrl: "https://instagram.com/test-restaurant",
      openingHours: { monday: { isClosed: true } },
    });
    await expect(getRestaurantSettings()).resolves.toMatchObject({
      name: "Test Restaurant",
      instagramUrl: "https://instagram.com/test-restaurant",
      openingHours: { monday: { isClosed: true } },
    });

    await closeMongoClient();
    await expect(getMenuItems({ search: "Paneer tikka" })).resolves.toHaveLength(1);

    const metrics = await getDashboardMetrics();
    expect(metrics).toMatchObject({ totalItems: 2, totalCategories: 2 });
    await expect(deleteMenuItem(dish.id)).resolves.toBe(true);
    await expect(deleteMenuItem(dish.id)).resolves.toBe(false);
  });
});
