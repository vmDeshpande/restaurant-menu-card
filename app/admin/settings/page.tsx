import { getRestaurantSettings } from "@/lib/queries";
import { SettingsClient } from "./settings-client";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getRestaurantSettings();
  return <AdminShell user={user}><SettingsClient settings={settings} /></AdminShell>;
}