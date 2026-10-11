import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function RecentItems({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-charcoal-300 bg-white px-5 py-10 text-center">
        <p className="text-sm font-medium text-charcoal-700">No menu updates yet</p>
        <p className="mt-1 text-sm text-charcoal-500">New and updated dishes will appear here.</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-charcoal-100 overflow-hidden rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
      {items.map((item) => (
        <div key={item.id} className="flex min-h-[68px] items-center justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal-800">{item.name}</p>
            <p className="mt-1 text-xs text-charcoal-500">{item.category?.name ?? "Uncategorized"}</p>
          </div>
          <span className="shrink-0 rounded-lg bg-cream-50 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-charcoal-800">{formatPrice(item.price, "INR")}</span>
        </div>
      ))}
    </div>
  );
}