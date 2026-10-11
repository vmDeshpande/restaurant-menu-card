"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  authenticate,
  setSessionCookie,
  clearSessionCookie,
  requireUser,
  type SessionUser,
} from "./auth";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  DuplicateCategoryError,
  getAdminById,
  getCategoryById,
  getCategoryBySlug,
  getMenuItemById,
  hasMenuItemsInCategory,
  updateAdminPassword,
  updateCategory,
  updateMenuItem,
  updateRestaurantSettings,
} from "./queries";
import { slugify } from "./utils";
import {
  CreateCategorySchema,
  CreateMenuItemSchema,
  ObjectIdSchema,
  RestaurantSettingsSchema,
  UpdateCategorySchema,
  UpdateMenuItemSchema,
} from "./validation";

export type LoginState = { error: string; success?: undefined } | { success: string; error?: undefined };

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  const user = await authenticate(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }
  await setSessionCookie(user);
  return { success: "ok" };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export type PasswordState = { error: string; success?: undefined } | { success: string; error?: undefined };

export async function changePasswordAction(prevState: PasswordState, formData: FormData): Promise<PasswordState> {
  const { comparePassword, hashPassword } = await import("./passwords");
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (!current || !next) {
    return { error: "Current and new password are required." };
  }
  if (next !== confirm) {
    return { error: "New password does not match confirmation." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  const admin = await getAdminById(user.id);
  if (!admin || !(await comparePassword(current, admin.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  const passwordHash = await hashPassword(next);
  const updated = await updateAdminPassword(user.id, passwordHash);
  if (!updated) {
    return { error: "Admin account could not be updated. Please try again." };
  }
  return { success: "Password updated." };
}

export type ActionResult<T = unknown> = { success: string; data?: T } | { error: string };

async function validateAndRequireUser(): Promise<SessionUser> {
  return requireUser();
}

export async function createCategoryAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const rawData = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    image: String(formData.get("image") ?? ""),
    displayOrder: Number(formData.get("displayOrder") ?? 0),
    active: formData.getAll("active").includes("true"),
    published: formData.getAll("published").includes("true"),
  };
  const parsed = CreateCategorySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  const slug = slugify(parsed.data.name);
  if (await getCategoryBySlug(slug)) {
    return { error: "A category with this name already exists." };
  }
  try {
    const category = await createCategory({ ...parsed.data, slug });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/menu");
    return { success: "Category created.", data: category };
  } catch (error) {
    if (error instanceof DuplicateCategoryError) return { error: error.message };
    throw error;
  }
}

export async function updateCategoryAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const rawData = {
    id: String(formData.get("id") ?? ""),
    name: formData.has("name") ? String(formData.get("name") ?? "") : undefined,
    description: formData.has("description") ? String(formData.get("description") ?? "") : undefined,
    image: formData.has("image") ? String(formData.get("image") ?? "") : undefined,
    displayOrder: formData.has("displayOrder") ? Number(formData.get("displayOrder") ?? 0) : undefined,
    active: formData.has("active") ? formData.getAll("active").includes("true") : undefined,
    published: formData.has("published") ? formData.getAll("published").includes("true") : undefined,
  };
  const parsed = UpdateCategorySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  const { id, ...data } = parsed.data;
  if (data.name) {
    const slug = slugify(data.name);
    const existing = await getCategoryBySlug(slug);
    if (existing && existing.id !== id.toLowerCase()) {
      return { error: "A category with this name already exists." };
    }
  }
  try {
    const category = await updateCategory(id, data);
    if (!category) return { error: "Category not found." };
    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/menu");
    return { success: "Category updated.", data: category };
  } catch (error) {
    if (error instanceof DuplicateCategoryError) return { error: error.message };
    throw error;
  }
}

export async function deleteCategoryAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const parsedId = ObjectIdSchema.safeParse(String(formData.get("id") ?? ""));
  if (!parsedId.success) return { error: "A valid category ID is required." };
  const id = parsedId.data;
  if (await hasMenuItemsInCategory(id)) {
    return { error: "Cannot delete category: menu items still reference this category. Reassign or delete those items first." };
  }
  const deleted = await deleteCategory(id);
  if (!deleted) return { error: "Category not found or currently in use." };
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/categories");
  return { success: "Category deleted." };
}

export async function createMenuItemAction(formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const rawPrice = String(formData.get("price") ?? "");
  const rawData = {
    name: String(formData.get("name") ?? ""),
    price: rawPrice.trim() === "" ? Number.NaN : Number(rawPrice),
    categoryId: String(formData.get("categoryId") ?? "").trim() || null,
  };
  const parsed = CreateMenuItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  if (parsed.data.categoryId) {
    const category = await getCategoryById(parsed.data.categoryId);
    if (!category || !category.active) {
      return { error: "Select an active menu category." };
    }
  }
  const item = await createMenuItem(parsed.data);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  return { success: "Dish added.", data: item };
}

export async function updateMenuItemAction(formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const rawPrice = formData.has("price") ? String(formData.get("price") ?? "") : undefined;
  const rawData = {
    id: String(formData.get("id") ?? ""),
    name: formData.has("name") ? String(formData.get("name") ?? "") : undefined,
    price: rawPrice === undefined ? undefined : rawPrice.trim() === "" ? Number.NaN : Number(rawPrice),
    categoryId: formData.has("categoryId")
      ? String(formData.get("categoryId") ?? "").trim() || null
      : undefined,
  };
  const parsed = UpdateMenuItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  const { id, ...data } = parsed.data;
  const existingDish = await getMenuItemById(id);
  if (!existingDish) return { error: "Dish not found." };
  if (data.categoryId) {
    const category = await getCategoryById(data.categoryId);
    if (!category || (!category.active && existingDish.categoryId !== category.id)) {
      return { error: "Select an active menu category." };
    }
  }
  const updated = await updateMenuItem(id, data);
  if (!updated) return { error: "Dish not found." };
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  return { success: "Dish updated." };
}

export async function deleteMenuItemAction(formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const parsedId = ObjectIdSchema.safeParse(String(formData.get("id") ?? ""));
  if (!parsedId.success) return { error: "A valid menu item ID is required." };
  const deleted = await deleteMenuItem(parsedId.data);
  if (!deleted) return { error: "Dish not found." };
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  return { success: "Dish deleted." };
}

export async function updateRestaurantSettingsAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await validateAndRequireUser();
  const rawData = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    currency: String(formData.get("currency") ?? "INR"),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
    whatsappUrl: String(formData.get("whatsappUrl") ?? ""),
    twitterUrl: String(formData.get("twitterUrl") ?? ""),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    logo: String(formData.get("logo") ?? ""),
    heroImage: String(formData.get("heroImage") ?? ""),
    openingHours: {},
  };
  const openingHours = String(formData.get("openingHours") ?? "{}");
  try {
    rawData.openingHours = JSON.parse(openingHours);
  } catch {
    return { error: "Opening hours must be valid JSON." };
  }
  const parsed = RestaurantSettingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  await updateRestaurantSettings(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/menu");
  return { success: "Settings saved." };
}
