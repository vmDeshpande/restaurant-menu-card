"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category-pill";
import { Hero } from "@/components/hero";
import { MenuSections } from "@/components/menu-sections";
import { SectionHeading } from "@/components/section-heading";
import type { MenuCategory, MenuItem, RestaurantSettings } from "@/lib/types";

export function HomeClient({
  settings,
  categories,
  featured,
}: {
  settings: RestaurantSettings | null;
  categories: MenuCategory[];
  featured: MenuItem[];
}) {
  return (
    <main>
      <Hero
        name={settings?.name ?? "Name"}
        description={settings?.description ?? "A thoughtful menu, shaped by the season and served with intention."}
      />
      <section id="menu" className="chalkboard-menu mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <SectionHeading eyebrow="From our kitchen" title="A menu in season" subtitle="Prepared with care. Best enjoyed at the table." />
        </motion.div>
        {categories.length > 0 && (
          <nav aria-label="Menu categories" className="mt-8 flex flex-wrap gap-2.5">
            <CategoryPill active label="All dishes" href="/menu" />
            {categories.map((category, index) => (
              <motion.div key={category.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <CategoryPill label={category.name} href={`/menu?category=${category.slug}`} />
              </motion.div>
            ))}
          </nav>
        )}
        {featured.length > 0 ? (
          <div className="mt-8">
            <MenuSections categories={categories} items={featured} currency={settings?.currency ?? "INR"} />
          </div>
        ) : (
          <p className="mt-8 border-y border-white/20 py-10 text-center font-serif text-xl text-white/65">
            Our menu is being prepared. Please check back soon.
          </p>
        )}
        {featured.length > 0 && (
          <Link href="/menu" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#ffcf69] transition hover:text-white">
            Explore the full menu <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>
      <section className="border-y border-white/10 bg-[#202020]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffcf69]">Good food, unhurried</p>
            <p className="mt-2 font-serif text-xl text-white">We look forward to welcoming you.</p>
          </div>
          <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffcf69] hover:text-white">
            View menu <ArrowDownRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
