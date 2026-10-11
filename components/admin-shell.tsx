"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu items", icon: Utensils },
  { href: "/admin/categories", label: "Categories", icon: Menu },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const pageCopy: Record<string, { title: string; description: string }> = {
  "/admin": { title: "Overview", description: "A clear view of your restaurant menu." },
  "/admin/menu": { title: "Menu items", description: "Create, organize, and update the dishes guests see." },
  "/admin/categories": { title: "Categories", description: "Organize dishes into sections for your menu." },
  "/admin/settings": { title: "Restaurant settings", description: "Manage your restaurant details and account." },
};

function Navigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin"
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
              active
                ? "bg-amber-400 font-semibold text-charcoal-900 shadow-sm"
                : "text-charcoal-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon aria-hidden="true" className={`h-[18px] w-[18px] ${active ? "text-charcoal-900" : "text-charcoal-400 group-hover:text-amber-300"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountFooter({ user }: { user: SessionUser }) {
  return (
    <div className="border-t border-white/10 px-4 py-4">
      <p className="truncate text-xs font-medium text-charcoal-300">{user.email}</p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-sm text-charcoal-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentPage = pageCopy[pathname] ?? pageCopy["/admin"];

  return (
    <div className="admin-app min-h-screen bg-[#f6f5f2] text-charcoal-800 md:flex">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-charcoal-900 text-white md:flex">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-black tracking-tight text-charcoal-900">SK</span>
          <span className="min-w-0">
            <span className="block truncate font-semibold tracking-tight">SSK Khau Galli</span>
            <span className="mt-0.5 block text-xs text-charcoal-400">Restaurant workspace</span>
          </span>
        </Link>

        <div className="px-4 pt-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-charcoal-500">Manage</p>
          <Navigation pathname={pathname} />
        </div>

        <div className="mt-auto space-y-3 px-4 pb-4">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 px-3.5 text-sm text-charcoal-300 transition hover:border-amber-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span>View public menu</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-amber-300" />
          </Link>
          <AccountFooter user={user} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-charcoal-200/70 bg-white/95 shadow-sm backdrop-blur">
          <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-9">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-charcoal-200 text-charcoal-700 transition hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 md:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-gold-700 sm:block">SSK Khau Galli · Admin</p>
              <h1 className="truncate text-lg font-semibold tracking-tight text-charcoal-900 sm:mt-0.5 sm:text-xl">{currentPage.title}</h1>
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-charcoal-900 px-3.5 text-xs font-semibold text-white transition hover:bg-charcoal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:text-sm md:hidden"
            >
              <span>View menu</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-amber-300" />
            </Link>
            <span className="hidden max-w-48 truncate text-sm text-charcoal-500 lg:block">{user.email}</span>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          <div className="mb-6 sm:mb-8">
            <p className="text-sm leading-6 text-charcoal-500">{currentPage.description}</p>
          </div>
          {children}
        </div>
      </main>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="!left-0 !top-0 !h-dvh !w-[min(20rem,88vw)] !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !bg-charcoal-900 !p-0 !text-white">
          <DialogTitle className="sr-only">Admin navigation</DialogTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-charcoal-900">SK</span>
                <span>
                  <span className="block font-semibold">SSK Khau Galli</span>
                  <span className="text-xs text-charcoal-400">Restaurant workspace</span>
                </span>
              </div>
            </div>
            <div className="px-4 pt-6">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-charcoal-500">Manage</p>
              <Navigation pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            </div>
            <div className="mt-auto space-y-3 px-4 pb-4">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 px-3.5 text-sm text-charcoal-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span>View public menu</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-amber-300" />
              </Link>
              <AccountFooter user={user} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
