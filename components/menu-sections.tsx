import { motion } from "framer-motion";
import { MenuRow } from "@/components/menu-row";
import type { MenuCategory, MenuItem } from "@/lib/types";

function BrushHeading({ children, id }: { children: string; id: string }) {
  return (
    <motion.h2
      id={id}
      className="menu-brush-heading"
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 280 56" preserveAspectRatio="none" aria-hidden="true">
        <path d="M5 13 28 9 62 12 89 7 121 11 157 8 190 12 224 9 273 14 268 40 243 43 212 41 178 47 145 42 112 46 82 41 51 45 8 39Z" fill="#e89b12" />
        <path d="m13 16 48-2 45 2 56-3 44 4 56-1-7 19-48 3-42-3-53 5-49-4-60 4Z" fill="#ffb51b" />
      </svg>
      <span>{children}</span>
    </motion.h2>
  );
}

export function MenuSections({
  categories,
  items,
  currency = "INR",
  posterTitle = false,
  restaurantName,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
  currency?: string;
  posterTitle?: boolean;
  restaurantName?: string;
}) {
  let itemIndex = 0;
  const groups = categories
    .map((category) => ({
      category,
      dishes: items.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.dishes.length > 0);
  const uncategorized = items.filter((item) => !item.categoryId);

  const sections = [
    ...groups.map(({ category, dishes }) => ({
      id: category.id,
      title: category.name,
      description: category.description,
      dishes,
    })),
    ...(uncategorized.length > 0 ? [{
      id: "uncategorized",
      title: "Uncategorized",
      description: null,
      dishes: uncategorized,
    }] : []),
  ];

  return (
    <div className={posterTitle ? "menu-poster-grid" : "space-y-10"}>
      {posterTitle && (
        <motion.header
          className="menu-poster-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {restaurantName && <p className="menu-poster-brand mb-4">{restaurantName}</p>}
          <h1 aria-label="The menu"><span>THE</span><span>MENU</span></h1>
        </motion.header>
      )}
      {sections.map(({ id, title, description, dishes }) => (
        <section key={id} className="menu-group" aria-labelledby={`menu-category-${id}`}>
          <BrushHeading id={`menu-category-${id}`}>{title}</BrushHeading>
          {description?.trim() && <p className="menu-category-description">{description.trim()}</p>}
          {dishes.map((item) => (
            <MenuRow key={item.id} item={item} index={itemIndex++} currency={currency} />
          ))}
        </section>
      ))}
    </div>
  );
}
