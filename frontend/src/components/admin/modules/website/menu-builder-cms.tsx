"use client";

import React, { useState } from "react";
import { useCMSStore, MenuItem } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Menu as MenuIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  ExternalLink,
  Save,
  Link,
  CheckCircle2,
  Layers,
  FolderTree,
} from "lucide-react";

export function MenuBuilderCMS() {
  const { menuItems, saveMenuItem, deleteMenuItem, reorderMenuItems, pages } = useCMSStore();
  const { toast } = useToast();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    label: "",
    path: "/",
    parentId: "",
    target: "_self",
    visible: true,
  });

  const handleOpenCreate = (parentId?: string) => {
    setFormData({
      id: "menu-" + Date.now(),
      label: "",
      path: "/",
      parentId: parentId || "",
      target: "_self",
      visible: true,
    });
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setFormData({ ...item });
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.label?.trim()) {
      toast({ title: "Validation Error", description: "Menu item label is required.", variant: "destructive" });
      return;
    }
    saveMenuItem(formData, !editingItem);
    toast({ title: editingItem ? "Menu Updated" : "Menu Item Added", description: `Saved '${formData.label}'.` });
    setModalOpen(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === menuItems.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((m, i) => (m.order = i + 1));
    reorderMenuItems(updated);
  };

  const mainMenus = menuItems.filter((m) => !m.parentId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Visual Menu Builder"
        subtitle="Manage primary navigation, submenus, nested links, and assign custom pages directly to the website header."
        badge={`${menuItems.length} Nav Links`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Menu Builder" },
        ]}
        action={{
          label: "Add Main Menu",
          icon: Plus,
          onClick: () => handleOpenCreate(),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Menu Tree */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#009688]" /> Navigation Structure
            </h3>
            <span className="text-xs text-slate-500">Drag/reorder & attach submenus</span>
          </div>

          {menuItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No custom menu items configured yet. Primary website defaults are active. Click "Add Main Menu" to add custom navigation tabs.
            </div>
          ) : (
            <div className="space-y-3">
              {mainMenus.map((main, idx) => {
                const subItems = menuItems.filter((m) => m.parentId === main.id);
                return (
                  <div key={main.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{main.label}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{main.path}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenCreate(main.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#009688]" /> Add Submenu
                        </button>
                        <button
                          onClick={() => handleOpenEdit(main)}
                          className="p-1.5 rounded-lg hover:bg-white text-slate-600 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(main.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Submenu Children */}
                    {subItems.length > 0 && (
                      <div className="pl-6 border-l-2 border-slate-200 space-y-2 pt-1">
                        {subItems.map((sub, sIdx) => (
                          <div
                            key={sub.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">{sub.label}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{sub.path}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 text-slate-500 hover:text-slate-800"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteId(sub.id)}
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Helpful Presets / Page Attacher */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-serif border-b border-slate-100 pb-2">
            Link to Dynamic Pages
          </h3>
          <p className="text-xs text-slate-500">
            Quickly create navigation menu entries for any newly published custom pages:
          </p>

          <div className="space-y-2">
            {pages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom pages created yet.</p>
            ) : (
              pages.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">/{p.slug}</p>
                  </div>
                  <button
                    onClick={() => {
                      saveMenuItem({
                        label: p.title,
                        path: `/${p.slug}`,
                        target: "_self",
                        visible: true,
                        pageId: p.id,
                      }, true);
                      toast({ title: "Menu Added", description: `Added '${p.title}' to top menu.` });
                    }}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800"
                  >
                    + Add to Nav
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-serif">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Menu Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research & Innovation"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Destination URL / Route *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /research or https://external.org"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Window
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="_self">Same Tab (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer"
              >
                Save Menu Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMenuItem(deleteId);
            toast({ title: "Deleted", description: "Menu item removed from navigation." });
          }
        }}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu entry? Any nested submenu items will also be removed."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
