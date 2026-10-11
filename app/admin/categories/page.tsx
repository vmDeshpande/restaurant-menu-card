import { getCategories, getMenuItems } from "@/lib/queries";
import { CategoriesClient } from "./categories-client";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function CategoriesPage() {
  const user = await requireUser();
  const [categories, items] = await Promise.all([
    getCategories({ includeInactive: true, includeUnpublished: true }),
    getMenuItems(),
  ]);
  const itemCounts = Object.fromEntries(categories.map((category) => [
    category.id,
    items.filter((item) => item.categoryId === category.id).length,
  ]));
  return <AdminShell user={user}><CategoriesClient categories={categories} itemCounts={itemCounts} /></AdminShell>;
}