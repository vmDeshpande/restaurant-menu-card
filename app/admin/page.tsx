import { getDashboardMetrics } from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { RecentItems } from "@/components/recent-items";
import Link from "next/link";
import { ArrowRight, ExternalLink, FolderPlus, Settings2, Utensils, Menu } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminPage() {
  const user = await requireUser();
  const metrics = await getDashboardMetrics();
  return (
    <AdminShell user={user}>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-2xl bg-charcoal-900 p-5 text-white shadow-soft sm:p-7">
          <div aria-hidden="true" className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[32px] border-amber-400/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Restaurant workspace</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Good to see you, {user.fullName?.split(" ")[0] ?? "there"}.</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal-300">Keep your menu up to date and ready for your guests.</p>
            </div>
            <Link href="/admin/menu" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900">
              <Utensils aria-hidden="true" className="h-4 w-4" /> Manage menu
            </Link>
          </div>
        </section>

        <section aria-label="Menu summary" className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Menu items" value={metrics.totalItems} icon={Utensils} detail="Dishes currently stored in your menu" />
          <StatCard label="Categories" value={metrics.totalCategories} icon={Menu} detail="Sections available to organize dishes" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-charcoal-900">Recent menu updates</h2>
                <p className="mt-1 text-sm text-charcoal-500">The latest dishes changed in your menu.</p>
              </div>
              <Link href="/admin/menu" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-charcoal-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                View all <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <RecentItems items={metrics.recentItems} />
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-charcoal-900">Quick actions</h2>
              <p className="mt-1 text-sm text-charcoal-500">Jump straight into common tasks.</p>
            </div>
            <div className="divide-y divide-charcoal-100 overflow-hidden rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
              <Link href="/admin/menu" className="group flex min-h-[68px] items-center gap-3 p-4 transition hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-gold-800"><Utensils aria-hidden="true" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-charcoal-800">Add or edit dishes</span><span className="mt-0.5 block text-xs text-charcoal-500">Keep names, prices, and categories current</span></span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-charcoal-400 transition group-hover:translate-x-0.5 group-hover:text-charcoal-700" />
              </Link>
              <Link href="/admin/categories" className="group flex min-h-[68px] items-center gap-3 p-4 transition hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 text-charcoal-700"><FolderPlus aria-hidden="true" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-charcoal-800">Manage categories</span><span className="mt-0.5 block text-xs text-charcoal-500">Organize the menu into clear sections</span></span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-charcoal-400 transition group-hover:translate-x-0.5 group-hover:text-charcoal-700" />
              </Link>
              <Link href="/admin/settings" className="group flex min-h-[68px] items-center gap-3 p-4 transition hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 text-charcoal-700"><Settings2 aria-hidden="true" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-charcoal-800">Restaurant settings</span><span className="mt-0.5 block text-xs text-charcoal-500">Update restaurant information and hours</span></span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-charcoal-400 transition group-hover:translate-x-0.5 group-hover:text-charcoal-700" />
              </Link>
              <Link href="/" target="_blank" rel="noreferrer" className="group flex min-h-[68px] items-center gap-3 p-4 transition hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100 text-charcoal-700"><ExternalLink aria-hidden="true" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-charcoal-800">Preview public menu</span><span className="mt-0.5 block text-xs text-charcoal-500">See the guest-facing chalkboard menu</span></span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-charcoal-400 transition group-hover:translate-x-0.5 group-hover:text-charcoal-700" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}