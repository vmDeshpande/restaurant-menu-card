import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, detail }: { label: string; value: number | string; icon?: LucideIcon; detail?: string }) {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-charcoal-500">{label}</span>
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-gold-800">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-1 font-serif text-3xl font-bold tracking-tight text-charcoal-900">{value}</div>
      {detail && <p className="mt-1 text-xs text-charcoal-500">{detail}</p>}
    </div>
  );
}