import { Utensils, type LucideIcon } from "lucide-react";

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      {eyebrow && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a84a]">{eyebrow}</span>}
      <h2 className="mt-2 font-serif text-3xl font-bold text-[#f5f3ee] md:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-white/60">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Utensils, title, description }: { icon?: LucideIcon; title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <Icon className="h-10 w-10 text-cream-400" />
      <h3 className="mt-3 font-serif text-lg font-semibold text-charcoal-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-charcoal-500">{description}</p>}
    </div>
  );
}