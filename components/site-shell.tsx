"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer, Navbar } from "./layout";
import type { RestaurantSettings } from "@/lib/types";

export function SiteShell({ children, settings }: { children: ReactNode; settings: RestaurantSettings | null }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <div className="admin-site min-h-screen bg-[#f6f5f2]">{children}</div>;
  }

  return (
    <div className="chalkboard-site">
      <Navbar name={settings?.name ?? "Name"} dark />
      {children}
      <Footer settings={settings} dark />
    </div>
  );
}