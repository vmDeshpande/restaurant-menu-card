import { getRestaurantSettings, getCategories, getMenuItems } from "@/lib/queries";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [settings, categories, items] = await Promise.all([
    getRestaurantSettings(),
    getCategories(),
    getMenuItems(),
  ]);
  const visibleCategoryIds = new Set(categories.map((category) => category.id));
  const featured = items.filter((item) => !item.categoryId || visibleCategoryIds.has(item.categoryId)).slice(0, 6);
  return <HomeClient settings={settings} categories={categories} featured={featured} />;
}