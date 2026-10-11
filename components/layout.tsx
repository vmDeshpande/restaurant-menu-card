import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube, MessageCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { RestaurantSettings } from "@/lib/types";
import { isSafeSocialUrl } from "@/lib/validation";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export function Footer({ settings, dark = false }: { settings: RestaurantSettings | null; dark?: boolean }) {
  const hours: NonNullable<RestaurantSettings["openingHours"]> = settings?.openingHours ?? {};
  const socials: { label: string; href: string; Icon: LucideIcon }[] = [];
  if (settings?.instagramUrl && isSafeSocialUrl("instagram", settings.instagramUrl)) {
    socials.push({ label: "Instagram", href: settings.instagramUrl, Icon: Instagram });
  }
  if (settings?.facebookUrl && isSafeSocialUrl("facebook", settings.facebookUrl)) {
    socials.push({ label: "Facebook", href: settings.facebookUrl, Icon: Facebook });
  }
  if (settings?.youtubeUrl && isSafeSocialUrl("youtube", settings.youtubeUrl)) {
    socials.push({ label: "YouTube", href: settings.youtubeUrl, Icon: Youtube });
  }
  if (settings?.whatsappUrl && isSafeSocialUrl("whatsapp", settings.whatsappUrl)) {
    socials.push({ label: "WhatsApp", href: settings.whatsappUrl, Icon: MessageCircle });
  }
  if (settings?.twitterUrl && isSafeSocialUrl("twitter", settings.twitterUrl)) {
    socials.push({ label: "X / Twitter", href: settings.twitterUrl, Icon: Twitter });
  }
  const restaurantName = settings?.name ?? "The Emerald Table";
  return (
    <footer className={`mt-20 border-t ${dark ? "border-white/10 bg-[#1b1b1b] text-[#f5f3ee]" : "border-cream-200 bg-charcoal-900 text-cream-200"}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">{restaurantName}</h3>
            <p className={`mt-2 text-sm ${dark ? "text-white/60" : "text-cream-400"}`}>{settings?.description ?? "Seasonal, locally sourced cuisine."}</p>
          </div>
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-[#d4a84a]" : "text-cream-400"}`}>Hours</h4>
            <ul className="mt-3 space-y-1 text-sm">
              {DAYS.map((d) => {
                const h = hours[d];
                if (!h || h.isClosed) return <li key={d} className={dark ? "text-white/45" : "text-cream-500"}>{d}: Closed</li>;
                return <li key={d} className={dark ? "text-white/75" : "text-cream-300"}>{d}: {h.open} – {h.close}</li>;
              })}
            </ul>
          </div>
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-[#d4a84a]" : "text-cream-400"}`}>Visit</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {settings?.address && <li className={`flex items-start gap-2 ${dark ? "text-white/75" : ""}`}><MapPin className={`mt-0.5 h-4 w-4 ${dark ? "text-[#d4a84a]" : "text-cream-500"}`} />{settings.address}</li>}
              {settings?.phone && <li className={`flex items-center gap-2 ${dark ? "text-white/75" : ""}`}><Phone className={`h-4 w-4 ${dark ? "text-[#d4a84a]" : "text-cream-500"}`} />{settings.phone}</li>}
              {settings?.email && <li className={`flex items-center gap-2 ${dark ? "text-white/75" : ""}`}><Mail className={`h-4 w-4 ${dark ? "text-[#d4a84a]" : "text-cream-500"}`} />{settings.email}</li>}
            </ul>
          </div>
          {socials.length > 0 && (
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-[#d4a84a]" : "text-cream-400"}`}>Follow</h4>
              <div className="mt-3 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#ffb51b]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb51b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1b1b]">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={`mt-10 border-t pt-6 text-center text-xs ${dark ? "border-white/10 text-white/45" : "border-white/10 text-cream-500"}`}>
          {dark
            ? `© ${new Date().getFullYear()} ${restaurantName}. All rights reserved.`
            : <>Made with ♡ by <Link href="https://vmDeshpande.github.io/vedant-deshpande-portfolio" className="text-forest-600 hover:text-white">Vedant Deshpande</Link></>}
        </div>
      </div>
    </footer>
  );
}

export function Navbar({ name, dark = false }: { name: string; dark?: boolean }) {
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur ${dark ? "border-white/10 bg-[#202020]/95 text-[#f5f3ee]" : "border-cream-200 bg-cream-50/90 text-charcoal-800"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className={`font-serif text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-forest-900"}`}>{name}</Link>
        <nav aria-label="Main navigation" className={`flex items-center gap-4 text-sm font-medium sm:gap-6 ${dark ? "text-white/80" : "text-charcoal-700"}`}>
          <Link href="/menu" className={dark ? "transition-colors hover:text-[#ffb51b]" : "hover:text-forest-600"}>Menu</Link>
          <Link href="/admin" className={dark ? "transition-colors hover:text-[#ffb51b]" : "hover:text-forest-600"}>Admin</Link>
        </nav>
        <Link href="/menu" className={`hidden border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition sm:inline-flex ${dark ? "border-[#ffb51b]/70 text-[#ffcf69] hover:bg-[#ffb51b] hover:text-[#202020]" : "border-forest-800 text-forest-900 hover:bg-forest-900 hover:text-white"}`}>View menu</Link>
      </div>
    </header>
  );
}