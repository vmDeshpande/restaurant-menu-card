import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./providers";
import { ToastProvider } from "@/components/toast";
import { SiteShell } from "@/components/site-shell";
import type { RestaurantSettings } from "@/lib/types";

export function ClientLayout({
  children,
  settings,
}: {
  children: ReactNode;
  settings: RestaurantSettings | null;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <MotionConfig reducedMotion="user">
          <SiteShell settings={settings}>{children}</SiteShell>
        </MotionConfig>
      </ToastProvider>
    </AuthProvider>
  );
}