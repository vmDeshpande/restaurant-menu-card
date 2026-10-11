"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Facebook, Instagram, MessageCircle, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { changePasswordAction, updateRestaurantSettingsAction } from "@/lib/actions";
import type { RestaurantSettings } from "@/lib/types";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const SOCIAL_LINKS = [
  { id: "s-instagram", name: "instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/yourrestaurant", Icon: Instagram },
  { id: "s-facebook", name: "facebookUrl", label: "Facebook URL", placeholder: "https://facebook.com/yourrestaurant", Icon: Facebook },
  { id: "s-youtube", name: "youtubeUrl", label: "YouTube URL", placeholder: "https://youtube.com/@yourrestaurant", Icon: Youtube },
  { id: "s-whatsapp", name: "whatsappUrl", label: "WhatsApp URL", placeholder: "https://wa.me/911234567890", Icon: MessageCircle },
  { id: "s-twitter", name: "twitterUrl", label: "X / Twitter URL", placeholder: "https://x.com/yourrestaurant", Icon: Twitter },
] as const;

type OpeningHoursValue = { open?: string; close?: string; isClosed?: boolean };

export function SettingsClient({ settings }: { settings: RestaurantSettings | null }) {
  const router = useRouter();
  const { push: toast } = useToast();
  const [pending, setPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [form, setForm] = useState({
    name: settings?.name ?? "SSK Khau Galli",
    description: settings?.description ?? "",
    address: settings?.address ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    openingHours: (settings?.openingHours ?? {}) as Record<string, OpeningHoursValue>,
  });

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedChanges]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("openingHours", JSON.stringify(form.openingHours));
    data.set("googleMapsUrl", settings?.googleMapsUrl ?? "");
    data.set("logo", settings?.logo ?? "");
    data.set("heroImage", settings?.heroImage ?? "");
    setPending(true);
    try {
      const result = await updateRestaurantSettingsAction({ success: "" }, data);
      if ("error" in result) {
        toast({ type: "error", title: "Settings were not saved", description: result.error });
        return;
      }
      setHasUnsavedChanges(false);
      toast({ type: "success", title: result.success });
      router.refresh();
    } catch (error) {
      console.error("Restaurant settings update failed.", error);
      toast({ type: "error", title: "Settings were not saved", description: "Please try again." });
    } finally {
      setPending(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordForm = event.currentTarget;
    setPasswordPending(true);
    try {
      const result = await changePasswordAction({ success: "" }, new FormData(passwordForm));
      if ("error" in result) {
        toast({ type: "error", title: "Password was not changed", description: result.error });
        return;
      }
      passwordForm.reset();
      toast({ type: "success", title: result.success });
    } catch (error) {
      console.error("Admin password change failed.", error);
      toast({ type: "error", title: "Password was not changed", description: "Please try again." });
    } finally {
      setPasswordPending(false);
    }
  }

  function updateDay(day: string, field: keyof OpeningHoursValue, value: string | boolean) {
    setHasUnsavedChanges(true);
    setForm((current) => ({
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: { ...(current.openingHours[day] ?? {}), [field]: value },
      },
    }));
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={saveSettings} onChange={() => setHasUnsavedChanges(true)}>
        <input type="hidden" name="currency" value="INR" />
        <section className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-charcoal-100 pb-4">
            <h2 className="text-base font-semibold text-charcoal-900">Restaurant information</h2>
            <p className="mt-1 text-sm text-charcoal-500">These details help guests identify and contact your restaurant.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="s-name">Restaurant name</label>
              <Input id="s-name" name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} />
            </div>
            <div>
              <label className="field-label" htmlFor="s-desc">Description</label>
              <Textarea id="s-desc" name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} maxLength={2000} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="s-address">Address</label>
                <Input id="s-address" name="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} maxLength={500} />
              </div>
              <div>
                <label className="field-label" htmlFor="s-phone">Phone</label>
                <Input id="s-phone" name="phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} maxLength={40} />
              </div>
            </div>
            <div className="max-w-xl">
              <label className="field-label" htmlFor="s-email">Email</label>
              <Input id="s-email" name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-charcoal-100 pb-4">
            <h2 className="text-base font-semibold text-charcoal-900">Social media</h2>
            <p className="mt-1 text-sm text-charcoal-500">Optional links appear in the public footer when configured.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {SOCIAL_LINKS.map(({ id, name, label, placeholder, Icon }) => (
              <div key={id}>
                <label className="field-label flex items-center gap-2" htmlFor={id}>
                  <Icon aria-hidden="true" className="h-4 w-4 text-charcoal-500" />
                  {label}
                </label>
                <Input id={id} name={name} type="url" defaultValue={settings?.[name] ?? ""} placeholder={placeholder} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-charcoal-100 pb-4">
            <h2 className="text-base font-semibold text-charcoal-900">Opening hours</h2>
            <p className="mt-1 text-sm text-charcoal-500">Set your regular hours for each day of the week.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {DAYS.map((day) => {
              const hours = form.openingHours[day] ?? {};
              const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
              return (
                <div key={day} className="rounded-xl border border-charcoal-200/70 p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-charcoal-800">{dayLabel}</span>
                    <label className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium text-charcoal-600 hover:bg-cream-50">
                      <input
                        type="checkbox"
                        checked={hours.isClosed ?? false}
                        onChange={(event) => updateDay(day, "isClosed", event.target.checked)}
                        className="h-4 w-4 rounded border-charcoal-300 accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      />
                      Closed
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-charcoal-500" htmlFor={`open-${day}`}>Opens</label>
                      <Input id={`open-${day}`} type="time" value={hours.open ?? ""} disabled={hours.isClosed} onChange={(event) => updateDay(day, "open", event.target.value)} className="px-2.5" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-charcoal-500" htmlFor={`close-${day}`}>Closes</label>
                      <Input id={`close-${day}`} type="time" value={hours.close ?? ""} disabled={hours.isClosed} onChange={(event) => updateDay(day, "close", event.target.value)} className="px-2.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-charcoal-200/70 bg-white/95 p-3 shadow-soft backdrop-blur sm:px-4">
          <p className="text-xs text-charcoal-500" aria-live="polite">
            {hasUnsavedChanges ? "You have unsaved changes." : "All changes are saved."}
          </p>
          <Button type="submit" disabled={pending} className="min-h-11">
            {pending ? "Saving settings…" : "Save settings"}
          </Button>
        </div>
      </form>

      <section className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 border-b border-charcoal-100 pb-4">
          <h2 className="text-base font-semibold text-charcoal-900">Change admin password</h2>
          <p className="mt-1 text-sm text-charcoal-500">Update the password for your signed-in administrator account.</p>
        </div>
        <form className="space-y-4" onSubmit={changePassword}>
          <div className="max-w-xl">
            <label className="field-label" htmlFor="current-password">Current password</label>
            <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="new-password">New password</label>
              <Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div>
              <label className="field-label" htmlFor="confirm-password">Confirm new password</label>
              <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={passwordPending} className="min-h-11">
              {passwordPending ? "Updating password…" : "Change password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
