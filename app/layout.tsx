import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import { getRestaurantSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "SSK Khau Galli",
  description: "An elegant, responsive menu.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getRestaurantSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-cream-50 text-charcoal-800 antialiased">
        <ClientLayout settings={settings}>{children}</ClientLayout>
      </body>
    </html>
  );
}