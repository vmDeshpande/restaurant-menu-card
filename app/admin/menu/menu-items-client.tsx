"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Utensils, X } from "lucide-react";
import { createMenuItemAction, deleteMenuItemAction, updateMenuItemAction } from "@/lib/actions";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuCategory, MenuItem } from "@/lib/types";

type SortOrder = "name" | "price-asc" | "price-desc";
type DeleteTarget = Pick<MenuItem, "id" | "name">;

export function MenuItemsClient({ items, categories }: { items: MenuItem[]; categories: MenuCategory[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("name");
  const [pending, setPending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const router = useRouter();
  const { push: toast } = useToast();

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const matchesSearch = item.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
      const matchesCategory = !category || item.categoryId === category;
      return matchesSearch && matchesCategory;
    });
    return result.sort((a, b) => {
      if (sortOrder === "price-asc") return a.price - b.price || a.name.localeCompare(b.name);
      if (sortOrder === "price-desc") return b.price - a.price || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [items, search, category, sortOrder]);

  async function runAction(action: () => Promise<{ success?: string; error?: string }>) {
    setPending(true);
    try {
      const result = await action();
      if (result.error) {
        toast({ type: "error", title: "Could not save menu", description: result.error });
        return false;
      }
      toast({ type: "success", title: result.success ?? "Menu updated." });
      router.refresh();
      return true;
    } catch (error) {
      console.error("Menu action failed.", error);
      toast({ type: "error", title: "Could not save menu", description: "Please try again." });
      return false;
    } finally {
      setPending(false);
    }
  }

  async function createDish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await runAction(() => createMenuItemAction(new FormData(form)))) form.reset();
  }

  async function editDish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await runAction(() => updateMenuItemAction(new FormData(form)));
  }

  async function deleteDish() {
    if (!deleteTarget) return;
    const formData = new FormData();
    formData.set("id", deleteTarget.id);
    if (await runAction(() => deleteMenuItemAction(formData))) setDeleteTarget(null);
  }

  return (
    <section className="space-y-6">
      <form onSubmit={createDish} className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-gold-800">
            <Plus aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-charcoal-900">Add a menu item</h2>
            <p className="mt-1 text-sm text-charcoal-500">Enter the dish name, price, and menu category.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem_minmax(11rem,0.75fr)_auto] lg:items-end">
          <div>
            <label className="field-label" htmlFor="new-dish-name">Dish name</label>
            <Input id="new-dish-name" name="name" autoComplete="off" required maxLength={120} placeholder="e.g. Saffron paneer tikka" />
          </div>
          <div>
            <label className="field-label" htmlFor="new-dish-price">Price (₹)</label>
            <Input id="new-dish-price" name="price" type="number" inputMode="decimal" min="0" step="0.01" required placeholder="0.00" />
          </div>
          <div>
            <label className="field-label" htmlFor="new-dish-category">Category</label>
            <select id="new-dish-category" name="categoryId" defaultValue="" className="field-input">
              <option value="">Uncategorized</option>
              {categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={pending} className="min-h-11 w-full lg:w-auto">
            <Plus aria-hidden="true" className="h-4 w-4" /> {pending ? "Adding…" : "Add dish"}
          </Button>
        </div>
        {!categories.some((item) => item.active) && (
          <p className="mt-3 text-sm text-charcoal-600">
            No active categories yet. <Link href="/admin/categories" className="font-semibold text-gold-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Create a category</Link> or leave this dish uncategorized.
          </p>
        )}
      </form>

      <div className="rounded-2xl border border-charcoal-200/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input aria-label="Search dishes by name" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes by name" className="pl-9" />
          </div>
          <select aria-label="Filter by category" className="field-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select aria-label="Sort menu items" className="field-input" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
            <option value="name">Name: A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-4">
          <p className="text-sm font-medium text-charcoal-700">
            {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
            {filtered.length !== items.length && <span className="font-normal text-charcoal-500"> of {items.length}</span>}
          </p>
          {(search || category) && (
            <button type="button" onClick={() => { setSearch(""); setCategory(""); }} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
              <X aria-hidden="true" className="h-4 w-4" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <form key={item.id} onSubmit={editDish} className="rounded-2xl border border-charcoal-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-soft sm:p-5">
              <input type="hidden" name="id" value={item.id} />
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-100 pb-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Utensils aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-700" />
                  <span className="truncate text-sm font-semibold text-charcoal-800">{item.name}</span>
                </div>
                <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.category ? "bg-cream-100 text-charcoal-700" : "bg-charcoal-100 text-charcoal-500"}`}>
                  {item.category?.name ?? "Uncategorized"}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_10rem_minmax(11rem,0.8fr)_auto] xl:items-end">
                <div>
                  <label className="field-label" htmlFor={`dish-name-${item.id}`}>Dish name</label>
                  <Input id={`dish-name-${item.id}`} name="name" defaultValue={item.name} required maxLength={120} />
                </div>
                <div>
                  <label className="field-label" htmlFor={`dish-price-${item.id}`}>Price (₹)</label>
                  <Input id={`dish-price-${item.id}`} name="price" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={item.price} required />
                </div>
                <div>
                  <label className="field-label" htmlFor={`dish-category-${item.id}`}>Category</label>
                  <select id={`dish-category-${item.id}`} name="categoryId" defaultValue={item.categoryId ?? ""} className="field-input">
                    <option value="">Uncategorized</option>
                    {item.categoryId && item.category && !item.category.active && (
                      <option value={item.categoryId}>{item.category.name} (inactive)</option>
                    )}
                    {categories.filter((option) => option.active).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 md:col-span-2 xl:col-span-1">
                  <Button type="submit" variant="outline" disabled={pending} className="min-h-11 flex-1 xl:flex-initial">
                    {pending ? "Saving…" : "Save changes"}
                  </Button>
                  <Button type="button" variant="ghost" aria-label={`Delete ${item.name}`} disabled={pending} onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="min-h-11 min-w-11 text-red-700 hover:bg-red-50">
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </form>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-charcoal-300 bg-white px-5 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-charcoal-500">
            <Search aria-hidden="true" className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-charcoal-800">{items.length === 0 ? "Your menu is ready for its first dish" : "No dishes match these filters"}</h2>
          <p className="mt-1 text-sm text-charcoal-500">{items.length === 0 ? "Use the form above to add your first item." : "Try a different search or clear the selected category."}</p>
          {items.length > 0 && (search || category) && (
            <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setCategory(""); }} className="mt-4">Clear filters</Button>
          )}
        </div>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 aria-hidden="true" className="h-5 w-5" /> Delete dish
            </DialogTitle>
            <DialogDescription>
              Delete <span className="font-semibold text-charcoal-800">{deleteTarget?.name}</span> from the menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="danger" disabled={pending} onClick={() => void deleteDish()}>
              {pending ? "Deleting…" : "Delete dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
