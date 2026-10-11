import { getMenuItems, getCategories } from "@/lib/queries";
import { MenuItemsClient } from "./menu-items-client";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function MenuItemsPage() {
  const user = await requireUser();
  const [items, categories] = await Promise.all([
    getMenuItems(),
    getCategories({ includeInactive: true, includeUnpublished: true }),
  ]);
  return <AdminShell user={user}><MenuItemsClient items={items} categories={categories} /></AdminShell>;
}