import { getCategories, getMenuItems, getRestaurantSettings } from "@/lib/queries";
import { MenuPageClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const [settings, categories, items] = await Promise.all([
    getRestaurantSettings(),
    getCategories(),
    getMenuItems({ search }),
  ]);

  // Filter by category slug on server side
  const selectedCategory = categories.find((category) => category.slug === categorySlug);
  const publicCategoryIds = new Set(categories.map((category) => category.id));
  const filtered = items.filter((item) => {
    if (selectedCategory) return item.categoryId === selectedCategory.id;
    return !item.categoryId || publicCategoryIds.has(item.categoryId);
  });

  return <MenuPageClient settings={settings} categories={categories} items={filtered} activeSlug={selectedCategory?.slug} search={search} />;
}