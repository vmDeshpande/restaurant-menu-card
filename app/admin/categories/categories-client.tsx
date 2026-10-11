"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import type { MenuCategory } from "@/lib/types";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions";

export function CategoriesClient({
  categories,
  itemCounts,
}: {
  categories: MenuCategory[];
  itemCounts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MenuCategory | null>(null);
  const { push: toast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function runAction(action: () => Promise<{ success?: string; error?: string }>) {
    setPending(true);
    try {
      const result = await action();
      if (result.error) {
        toast({ type: "error", title: "Category was not saved", description: result.error });
        return false;
      }
      toast({ type: "success", title: result.success ?? "Category updated." });
      router.refresh();
      return true;
    } catch (error) {
      console.error("Category action failed.", error);
      toast({ type: "error", title: "Category was not saved", description: "Please try again." });
      return false;
    } finally {
      setPending(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(category: MenuCategory) {
    setEditing(category);
    setOpen(true);
  }

  function closeEdit() {
    setOpen(false);
    setEditing(null);
  }

  async function submitCategory(formData: FormData) {
    const action = editing
      ? () => updateCategoryAction({ success: "" }, formData)
      : () => createCategoryAction({ success: "" }, formData);
    if (await runAction(action)) closeEdit();
  }

  async function submitDelete(formData: FormData) {
    if (await runAction(() => deleteCategoryAction({ success: "" }, formData))) {
      setDeleteConfirm(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-charcoal-200/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-gold-800">
            <FolderOpen aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-charcoal-900">{categories.length} {categories.length === 1 ? "category" : "categories"}</p>
            <p className="mt-0.5 text-xs text-charcoal-500">Categories organize dishes on your public menu.</p>
          </div>
        </div>
        <Button onClick={openCreate} className="min-h-11 w-full sm:w-auto">
          <Plus aria-hidden="true" className="h-4 w-4" /> New category
        </Button>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {categories.map((category) => (
            <article key={category.id} className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-soft sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-semibold text-charcoal-900">{category.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${category.active ? "bg-emerald-50 text-emerald-800" : "bg-charcoal-100 text-charcoal-600"}`}>
                      {category.active ? "Active" : "Inactive"}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${category.published ? "bg-amber-50 text-gold-800" : "bg-charcoal-100 text-charcoal-600"}`}>
                      {category.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-500">Display order {category.displayOrder}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-cream-50 px-3 py-2 text-xs font-medium text-charcoal-600">
                  <FolderOpen aria-hidden="true" className="h-4 w-4 text-gold-700" />
                  {itemCounts[category.id] ?? 0} {(itemCounts[category.id] ?? 0) === 1 ? "dish" : "dishes"}
                </span>
              </div>

              <p className={`mt-4 min-h-10 text-sm leading-5 ${category.description?.trim() ? "text-charcoal-600" : "italic text-charcoal-400"}`}>
                {category.description?.trim() || "No category description"}
              </p>

              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-charcoal-100 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`}>
                  <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteConfirm(category)} aria-label={`Delete ${category.name}`} className="text-red-700 hover:bg-red-50 hover:text-red-800">
                  <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-charcoal-300 bg-white px-5 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-gold-800">
            <FolderOpen aria-hidden="true" className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-charcoal-800">Start with a menu category</h2>
          <p className="mt-1 text-sm text-charcoal-500">Create sections such as the ones your guests see on the menu.</p>
          <Button onClick={openCreate} className="mt-4"><Plus aria-hidden="true" className="h-4 w-4" /> Create category</Button>
        </div>
      )}

      <CategoryDialog
        key={editing?.id ?? "new-category"}
        open={open}
        category={editing}
        onClose={closeEdit}
        onSubmit={submitCategory}
        pending={pending}
      />

      <Dialog open={Boolean(deleteConfirm)} onOpenChange={(value) => { if (!value) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle aria-hidden="true" className="h-5 w-5" /> Delete category
            </DialogTitle>
            <DialogDescription>
              Delete <span className="font-semibold text-charcoal-800">{deleteConfirm?.name}</span>? Assigned dishes will not be deleted. Reassign them first if the category contains dishes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              type="button"
              variant="danger"
              disabled={pending}
              onClick={() => {
                const formData = new FormData();
                if (deleteConfirm) formData.set("id", deleteConfirm.id);
                void submitDelete(formData);
              }}
            >
              {pending ? "Deleting…" : "Delete category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CategoryDialog({
  open,
  category,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  category: MenuCategory | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [desc, setDesc] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
  const [active, setActive] = useState(category?.active ?? true);
  const [published, setPublished] = useState(category?.published ?? true);

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>{category ? "Update the name, description, and menu visibility." : "Create a section to organize dishes on your menu."}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          {category && <input type="hidden" name="id" value={category.id} />}
          <div>
            <label className="field-label" htmlFor="cat-name">Category name</label>
            <Input id="cat-name" name="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
          </div>
          <div>
            <label className="field-label" htmlFor="cat-desc">Description</label>
            <Textarea id="cat-desc" name="description" value={desc} onChange={(event) => setDesc(event.target.value)} rows={3} maxLength={500} />
            <p className="mt-1 text-xs text-charcoal-500">Shown beneath the category heading on the public menu.</p>
          </div>
          <details className="rounded-xl border border-charcoal-200/70 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-charcoal-700">More category options</summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="cat-image">Image URL (optional)</label>
                <Input id="cat-image" name="image" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="field-label" htmlFor="cat-order">Display order</label>
                <Input id="cat-order" name="displayOrder" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} />
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-charcoal-700">
                <input type="hidden" name="active" value="false" />
                <label className="flex min-h-10 items-center gap-2">
                  <input type="checkbox" name="active" value="true" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-4 w-4 rounded border-charcoal-300 accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                  Active
                </label>
                <input type="hidden" name="published" value="false" />
                <label className="flex min-h-10 items-center gap-2">
                  <input type="checkbox" name="published" value="true" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4 rounded border-charcoal-300 accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                  Published
                </label>
              </div>
            </div>
          </details>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : category ? "Save changes" : "Create category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
