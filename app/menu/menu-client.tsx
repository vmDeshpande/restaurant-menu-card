"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { MenuSections } from "@/components/menu-sections";
import type { MenuCategory, MenuItem, RestaurantSettings } from "@/lib/types";

export function MenuPageClient({
  settings,
  categories,
  items,
  activeSlug,
  search,
}: {
  settings: RestaurantSettings | null;
  categories: MenuCategory[];
  items: MenuItem[];
  activeSlug?: string;
  search?: string;
}) {
  const [query, setQuery] = useState(search ?? "");
  const [sort, setSort] = useState("name");
  const filtered = useMemo(() => {
    const matches = items.filter((item) => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    return matches.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price || a.name.localeCompare(b.name);
      if (sort === "price-desc") return b.price - a.price || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [items, query, sort]);

  return (
    <main className="chalkboard-menu min-h-[65vh] px-5 py-9 sm:px-8 sm:py-14">
      <svg className="chalk-doodle chalk-doodle--left" viewBox="0 0 100 150" fill="none" aria-hidden="true">
        <path d="M50 138V58m0 0C19 55 13 32 12 10c24 2 40 15 38 48Zm0 21c29-2 39-23 41-45-24 1-42 16-41 45Zm-3-21C24 53 18 35 18 20m30 43c21-4 32-18 38-34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 141c-2 4-7 5-11 5m13-5c2 4 7 5 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <svg className="chalk-doodle chalk-doodle--right" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M28 31c8-11 20-16 32-16s24 5 32 16c8 10 8 30 2 47-6 16-18 27-34 27S32 94 26 78c-6-17-6-37 2-47Z" stroke="currentColor" strokeWidth="2.5" />
        <path d="M60 15c-7-8-17-9-25-6m25 6c7-8 17-9 25-6M43 62c3-3 6-3 9 0m16 0c3-3 6-3 9 0m-32 20c11 9 27 9 38 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
          {categories.length > 0 && (
            <nav aria-label="Menu categories" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold uppercase tracking-[0.12em]">
              <Link aria-current={!activeSlug ? "page" : undefined} className="chalk-filter-link" href="/menu">All dishes</Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  aria-current={activeSlug === category.slug ? "page" : undefined}
                  className="chalk-filter-link"
                  href={`/menu?category=${encodeURIComponent(category.slug)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}
          <div className="grid w-full gap-3 sm:grid-cols-[minmax(14rem,1fr)_13rem] lg:max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dishes"
                className="menu-filter-input pl-9 pr-10"
                aria-label="Search menu by dish name"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-[#ffb51b]" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select aria-label="Sort menu" className="menu-filter-input" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name">Name: A–Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
        {filtered.length > 0 ? (
          <MenuSections
            categories={categories}
            items={filtered}
            currency={settings?.currency ?? "INR"}
            posterTitle
            restaurantName={settings?.name ?? "SSK Khau Galli"}
          />
        ) : (
          <div className="menu-poster-grid">
            <header className="menu-poster-title">
              <p className="menu-poster-brand mb-4">{settings?.name ?? "SSK Khau Galli"}</p>
              <h1 aria-label="The menu"><span>THE</span><span>MENU</span></h1>
            </header>
            <p className="self-center border-y border-white/20 py-8 text-center font-serif text-xl text-white/65">
              {items.length ? "No dishes match your search." : "There are no dishes in this selection yet."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
