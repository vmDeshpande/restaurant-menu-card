import { beforeEach, describe, expect, it, vi } from "vitest";

const { queries, requireUser, authenticate, setSessionCookie, comparePassword, hashPassword } = vi.hoisted(() => ({
  queries: {
    createCategory: vi.fn(),
    createMenuItem: vi.fn(),
    deleteCategory: vi.fn(),
    deleteMenuItem: vi.fn(),
    getAdminById: vi.fn(),
    getCategoryById: vi.fn(),
    getCategoryBySlug: vi.fn(),
    getMenuItemById: vi.fn(),
    hasMenuItemsInCategory: vi.fn(),
    updateAdminPassword: vi.fn(),
    updateCategory: vi.fn(),
    updateMenuItem: vi.fn(),
    updateRestaurantSettings: vi.fn(),
  },
  requireUser: vi.fn(),
  authenticate: vi.fn(),
  setSessionCookie: vi.fn(),
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("./queries", () => queries);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("./auth", () => ({
  authenticate,
  clearSessionCookie: vi.fn(),
  requireUser,
  setSessionCookie,
}));
vi.mock("./passwords", () => ({ comparePassword, hashPassword }));

import {
  changePasswordAction,
  createCategoryAction,
  createMenuItemAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  loginAction,
  updateCategoryAction,
  updateMenuItemAction,
  updateRestaurantSettingsAction,
} from "./actions";

const categoryId = "0123456789abcdef01234567";
const dishId = "fedcba9876543210fedcba98";

describe("category persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "admin-id" });
  });

  it("stores a supplied description when creating a category", async () => {
    queries.getCategoryBySlug.mockResolvedValue(null);
    queries.createCategory.mockResolvedValue({
      id: categoryId,
      name: "Starters",
      description: "Small plates",
    });
    const formData = new FormData();
    formData.set("name", "Starters");
    formData.set("description", "Small plates");

    await expect(createCategoryAction({ success: "" }, formData)).resolves.toMatchObject({
      success: "Category created.",
    });
    expect(queries.createCategory).toHaveBeenCalledWith(expect.objectContaining({
      name: "Starters",
      description: "Small plates",
    }));
  });

  it("updates the supplied category description", async () => {
    queries.updateCategory.mockResolvedValue({
      id: categoryId,
      description: "Updated description",
    });
    const formData = new FormData();
    formData.set("id", categoryId);
    formData.set("description", "Updated description");

    await expect(updateCategoryAction({ success: "" }, formData)).resolves.toMatchObject({
      success: "Category updated.",
    });
    expect(queries.updateCategory).toHaveBeenCalledWith(categoryId, {
      description: "Updated description",
    });
  });
});

describe("dish category assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "admin-id" });
  });

  it("rejects invalid category IDs before inserting a dish", async () => {
    const formData = new FormData();
    formData.set("name", "Masala chai");
    formData.set("price", "45");
    formData.set("categoryId", "untrusted-category-id");

    await expect(createMenuItemAction(formData)).resolves.toHaveProperty("error");
    expect(queries.getCategoryById).not.toHaveBeenCalled();
    expect(queries.createMenuItem).not.toHaveBeenCalled();
  });

  it("rejects a category that is not active", async () => {
    queries.getCategoryById.mockResolvedValue({ id: categoryId, active: false });
    const formData = new FormData();
    formData.set("name", "Masala chai");
    formData.set("price", "45");
    formData.set("categoryId", categoryId);

    await expect(createMenuItemAction(formData)).resolves.toEqual({
      error: "Select an active menu category.",
    });
    expect(queries.createMenuItem).not.toHaveBeenCalled();
  });

  it("creates a dish with the selected active category", async () => {
    queries.getCategoryById.mockResolvedValue({ id: categoryId, active: true });
    queries.createMenuItem.mockResolvedValue({
      id: dishId,
      name: "Masala chai",
      price: 45,
      categoryId,
    });
    const formData = new FormData();
    formData.set("name", "Masala chai");
    formData.set("price", "45");
    formData.set("categoryId", categoryId);

    await expect(createMenuItemAction(formData)).resolves.toMatchObject({ success: "Dish added." });
    expect(queries.createMenuItem).toHaveBeenCalledWith({
      name: "Masala chai",
      price: 45,
      categoryId,
    });
  });

  it("updates a dish's category relationship", async () => {
    queries.getMenuItemById.mockResolvedValue({ id: dishId, categoryId: null });
    queries.getCategoryById.mockResolvedValue({ id: categoryId, active: true });
    queries.updateMenuItem.mockResolvedValue({ id: dishId, categoryId });
    const formData = new FormData();
    formData.set("id", dishId);
    formData.set("categoryId", categoryId);

    await expect(updateMenuItemAction(formData)).resolves.toMatchObject({ success: "Dish updated." });
    expect(queries.updateMenuItem).toHaveBeenCalledWith(dishId, { categoryId });
  });
});

describe("restaurant settings mutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "admin-id" });
  });

  it("rejects unsafe social URLs before updating settings", async () => {
    const formData = new FormData();
    formData.set("name", "Green Room");
    formData.set("openingHours", "{}");
    formData.set("instagramUrl", "javascript:alert(1)");

    const result = await updateRestaurantSettingsAction({ success: "" }, formData);
    expect(result).toHaveProperty("error");
    expect(queries.updateRestaurantSettings).not.toHaveBeenCalled();
  });

  it("saves configured social URLs without restoring editable footer text", async () => {
    const formData = new FormData();
    formData.set("name", "Green Room");
    formData.set("openingHours", "{}");
    formData.set("instagramUrl", "https://instagram.com/greenroom");
    formData.set("youtubeUrl", "https://youtube.com/@greenroom");
    formData.set("whatsappUrl", "https://wa.me/911234567890");
    formData.set("footerText", "Do not persist");

    await expect(updateRestaurantSettingsAction({ success: "" }, formData)).resolves.toEqual({
      success: "Settings saved.",
    });
    expect(queries.updateRestaurantSettings).toHaveBeenCalledOnce();
    expect(queries.updateRestaurantSettings.mock.calls[0][0]).toMatchObject({
      instagramUrl: "https://instagram.com/greenroom",
      youtubeUrl: "https://youtube.com/@greenroom",
      whatsappUrl: "https://wa.me/911234567890",
    });
    expect(queries.updateRestaurantSettings.mock.calls[0][0]).not.toHaveProperty("footerText");
  });
});

describe("authorization and login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("admin password change", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      requireUser.mockResolvedValue({ id: "signed-in-admin" });
    });

    function passwordForm(current: string, next: string, confirm = next) {
      const formData = new FormData();
      formData.set("currentPassword", current);
      formData.set("newPassword", next);
      formData.set("confirmPassword", confirm);
      return formData;
    }

    it("requires an authenticated admin before reading the account", async () => {
      requireUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(changePasswordAction({ success: "" }, passwordForm("current", "new-password"))).rejects.toThrow("Unauthorized");
      expect(queries.getAdminById).not.toHaveBeenCalled();
    });

    it("rejects an incorrect current password without updating the hash", async () => {
      queries.getAdminById.mockResolvedValue({ id: "signed-in-admin", passwordHash: "stored-hash" });
      comparePassword.mockResolvedValue(false);

      await expect(changePasswordAction({ success: "" }, passwordForm("wrong", "new-password"))).resolves.toEqual({
        error: "Current password is incorrect.",
      });
      expect(queries.updateAdminPassword).not.toHaveBeenCalled();
    });

    it("validates confirmation and minimum length before checking the password", async () => {
      await expect(changePasswordAction({ success: "" }, passwordForm("current", "short", "different"))).resolves.toEqual({
        error: "New password does not match confirmation.",
      });
      await expect(changePasswordAction({ success: "" }, passwordForm("current", "short"))).resolves.toEqual({
        error: "New password must be at least 8 characters.",
      });
      expect(queries.getAdminById).not.toHaveBeenCalled();
    });

    it("verifies and hashes the replacement password for the signed-in admin", async () => {
      queries.getAdminById.mockResolvedValue({ id: "signed-in-admin", passwordHash: "stored-hash" });
      comparePassword.mockResolvedValue(true);
      hashPassword.mockResolvedValue("replacement-hash");
      queries.updateAdminPassword.mockResolvedValue(true);

      await expect(changePasswordAction({ success: "" }, passwordForm("current", "new-password"))).resolves.toEqual({
        success: "Password updated.",
      });
      expect(queries.getAdminById).toHaveBeenCalledWith("signed-in-admin");
      expect(comparePassword).toHaveBeenCalledWith("current", "stored-hash");
      expect(hashPassword).toHaveBeenCalledWith("new-password");
      expect(queries.updateAdminPassword).toHaveBeenCalledWith("signed-in-admin", "replacement-hash");
    });

    it("reports when the account could not be updated", async () => {
      queries.getAdminById.mockResolvedValue({ id: "signed-in-admin", passwordHash: "stored-hash" });
      comparePassword.mockResolvedValue(true);
      hashPassword.mockResolvedValue("replacement-hash");
      queries.updateAdminPassword.mockResolvedValue(false);

      await expect(changePasswordAction({ success: "" }, passwordForm("current", "new-password"))).resolves.toEqual({
        error: "Admin account could not be updated. Please try again.",
      });
    });
  });

  it.each([
    ["create category", () => createCategoryAction({ success: "" }, new FormData())],
    ["update category", () => updateCategoryAction({ success: "" }, new FormData())],
    ["delete category", () => deleteCategoryAction({ success: "" }, new FormData())],
    ["create dish", () => createMenuItemAction(new FormData())],
    ["update dish", () => updateMenuItemAction(new FormData())],
    ["delete dish", () => deleteMenuItemAction(new FormData())],
    ["update settings", () => updateRestaurantSettingsAction({ success: "" }, new FormData())],
  ])("rejects unauthenticated %s before accessing application data", async (_name, action) => {
    requireUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(action()).rejects.toThrow("Unauthorized");
    expect(requireUser).toHaveBeenCalledOnce();
    expect(queries.createCategory).not.toHaveBeenCalled();
    expect(queries.createMenuItem).not.toHaveBeenCalled();
    expect(queries.updateRestaurantSettings).not.toHaveBeenCalled();
  });

  it("returns a generic error for invalid login credentials", async () => {
    authenticate.mockResolvedValue(null);
    const formData = new FormData();
    formData.set("email", "admin@example.com");
    formData.set("password", "wrong-password");

    await expect(loginAction({ success: "" }, formData)).resolves.toEqual({
      error: "Invalid email or password.",
    });
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
