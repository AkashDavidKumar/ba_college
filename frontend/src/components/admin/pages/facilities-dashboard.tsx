"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  Landmark,
  FlaskConical,
  BookOpen,
  Trophy,
  Building,
  Bus,
  Plus,
  Save,
  Pencil,
  Trash2,
  X,
  Image,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Facility {
  id: string;
  name: string;
  category: string;
  description: string;
  amenities: string[];
  images: string[];
  details?: string;
  published: boolean;
}

const CATEGORY_TABS = [
  { id: "all",       label: "All",          icon: Landmark     },
  { id: "lab",       label: "Laboratories", icon: FlaskConical },
  { id: "library",   label: "Library",      icon: BookOpen     },
  { id: "sports",    label: "Sports",       icon: Trophy       },
  { id: "hostel",    label: "Hostels",      icon: Building     },
  { id: "transport", label: "Transport",    icon: Bus          },
];

const EMPTY: Omit<Facility, "id"> = {
  name: "", category: "lab", description: "",
  amenities: [], images: [], details: "", published: true,
};

interface FacilitiesDashboardProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FacilitiesDashboard({ nav, setNav }: FacilitiesDashboardProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<Facility | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<Facility, "id">>(EMPTY);
  const [newAmenity, setNewAmenity] = useState("");
  const [newImage, setNewImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCategory = nav.section || "all";
  const setCategory = (id: string) => setNav({ page: "facilities", section: id });

  useEffect(() => { fetchFacilities(); }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>("/facilities");
      setFacilities(Array.isArray(data) ? data : data?.data || data?.facilities || []);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError(`Access denied: ${err.message}`);
      } else {
        setError("Failed to load facilities.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      setError("Name and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = !!editItem;
      const url = isEdit ? `/facilities/${editItem!.id}` : "/facilities";
      const payload = isEdit ? { ...form, id: editItem!.id } : form;
      if (isEdit) {
        await apiClient.put(url, payload);
      } else {
        await apiClient.post(url, payload);
      }
      setSuccess(isEdit ? "Facility updated!" : "Facility added!");
      cancelEdit();
      fetchFacilities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 403 ? "Forbidden: You lack facilities:create/update permission." : err.message);
      } else {
        setError("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this facility?")) return;
    try {
      await apiClient.delete(`/facilities/${id}`);
      fetchFacilities();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 403 ? "Forbidden: You lack facilities:delete permission." : err.message);
      } else {
        setError("Delete failed.");
      }
    }
  };

  const openEdit = (f: Facility) => {
    setEditItem(f);
    setForm({ name: f.name, category: f.category, description: f.description, amenities: [...f.amenities], images: [...f.images], details: f.details || "", published: f.published });
    setIsAdding(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY, category: activeCategory === "all" ? "lab" : activeCategory });
    setIsAdding(true);
  };

  const cancelEdit = () => { setEditItem(null); setIsAdding(false); setForm(EMPTY); setError(""); };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    setForm({ ...form, amenities: [...form.amenities, newAmenity.trim()] });
    setNewAmenity("");
  };
  const removeAmenity = (i: number) => setForm({ ...form, amenities: form.amenities.filter((_, j) => j !== i) });

  const addImage = () => {
    if (!newImage.trim()) return;
    setForm({ ...form, images: [...form.images, newImage.trim()] });
    setNewImage("");
  };
  const removeImage = (i: number) => setForm({ ...form, images: form.images.filter((_, j) => j !== i) });

  const filtered = facilities.filter((f) => activeCategory === "all" || f.category === activeCategory);
  const showForm = isAdding || !!editItem;

  return (
    <PageDashboard
      pageName="Facilities Management"
      pageDescription="Manage campus infrastructure, facilities, amenities, and media for the public website"
    >
      {/* ── Category Tabs ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button key={tab.id} onClick={() => setCategory(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive ? "border-amber-400 text-amber-700 bg-amber-50/60" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {/* ── Add / Edit Form ───────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-600" />
              {editItem ? "Edit Facility" : "Add New Facility"}
            </h3>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Facility Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Advanced Computing Lab" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="lab">Laboratory</option>
                <option value="library">Library</option>
                <option value="sports">Sports</option>
                <option value="hostel">Hostel</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className={inputCls + " resize-none"} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this facility…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Infrastructure / Details</label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Capacity, equipment, specifications…" />
            </div>

            {/* Amenities */}
            <div className="sm:col-span-2 space-y-2">
              <label className="label">Amenities</label>
              <div className="flex gap-2">
                <input className={inputCls} value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAmenity()} placeholder="e.g. 24/7 Access, Air-conditioned" />
                <button onClick={addAmenity} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((a, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                    {a}
                    <button onClick={() => removeAmenity(i)} className="hover:text-red-600 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="sm:col-span-2 space-y-2">
              <label className="label">Gallery Images (URLs)</label>
              <div className="flex gap-2">
                <input className={inputCls} value={newImage} onChange={(e) => setNewImage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addImage()} placeholder="https://…" />
                <button onClick={addImage} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                      <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              Published
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : editItem ? "Update" : "Add Facility"}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Facility Cards ────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500 mb-1">No facilities in this category</p>
          <button onClick={openAdd} className="mt-3 px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">Add Facility</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-amber-200 transition-all overflow-hidden group">
              {f.images[0] ? (
                <img src={f.images[0]} alt={f.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <Image className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {f.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">{f.category}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{f.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{f.description}</p>
                {f.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.amenities.slice(0, 3).map((a, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{a}</span>
                    ))}
                    {f.amenities.length > 3 && <span className="text-[10px] text-slate-400">+{f.amenities.length - 3}</span>}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(f)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageDashboard>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
