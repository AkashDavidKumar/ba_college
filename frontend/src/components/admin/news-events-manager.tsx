"use client";

import React, { useState } from "react";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Star,
  Eye,
  EyeOff,
  Calendar,
  Settings2,
  Trophy,
  Megaphone,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useSiteData, NewsArticle, NewsEventsConfig, defaultNewsEventsConfig } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import { EventsTab } from "./events-tab";

// ─── Constants ────────────────────────────────────────────────────────────────

const NEWS_CATEGORIES: NewsArticle["category"][] = [
  "University News",
  "Achievement",
  "Announcement",
  "Campus Life",
  "Research",
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "University News": BookOpen,
  Achievement: Trophy,
  Announcement: Megaphone,
  "Campus Life": Sparkles,
  Research: BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  "University News": "bg-navy/10 text-navy",
  Achievement: "bg-gold/15 text-gold-dark",
  Announcement: "bg-blue-50 text-blue-700",
  "Campus Life": "bg-rose-50 text-rose-600",
  Research: "bg-emerald-50 text-emerald-700",
};

const EMPTY_ARTICLE: Omit<NewsArticle, "id"> = {
  title: "",
  excerpt: "",
  content: "",
  category: "University News",
  image: "",
  date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  dateISO: new Date().toISOString().split("T")[0],
  author: "",
  featured: false,
  published: true,
};

// ─── Sub-tab types ────────────────────────────────────────────────────────────

type SubTab = "news" | "events" | "config";

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: "news",   label: "News Articles",   icon: Newspaper    },
  { id: "events", label: "Events Calendar", icon: Calendar     },
  { id: "config", label: "Homepage Config", icon: Settings2    },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function NewsEventsManager() {
  const [subTab, setSubTab] = useState<SubTab>("news");

  return (
    <div className="space-y-5">
      {/* ── Sub-tab Bar ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {SUB_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = subTab === id;
            return (
              <button
                key={id}
                onClick={() => setSubTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-amber-400 text-amber-700 bg-amber-50/60"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      {subTab === "news"   && <NewsArticlesManager />}
      {subTab === "events" && <EventsTab />}
      {subTab === "config" && <HomepageConfigManager />}
    </div>
  );
}

// ─── News Articles Manager ────────────────────────────────────────────────────

function NewsArticlesManager() {
  const { data, saveNewsArticle, deleteNewsArticle } = useSiteData();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<NewsArticle, "id">>(EMPTY_ARTICLE);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const articles = data?.news || [];

  const filtered = articles.filter((a) => {
    if (filter === "published") return a.published;
    if (filter === "draft") return !a.published;
    return true;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_ARTICLE });
    setShowForm(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      category: article.category,
      image: article.image,
      date: article.date,
      dateISO: article.dateISO,
      author: article.author || "",
      featured: article.featured,
      published: article.published,
      readMoreUrl: article.readMoreUrl,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.category) {
      toast({ title: "Required fields missing", description: "Title, excerpt and category are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = editingId ? { ...form, id: editingId } : form;
      const ok = await saveNewsArticle(payload, !editingId);
      if (ok) {
        toast({ title: editingId ? "Article Updated" : "Article Created", description: `"${form.title}" was saved successfully.` });
        setShowForm(false);
        setEditingId(null);
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Save Failed", description: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const ok = await deleteNewsArticle(id);
    if (ok) toast({ title: "Article Deleted", description: `"${title}" was removed.` });
    else toast({ title: "Delete Failed", variant: "destructive" });
  };

  const handleTogglePublish = async (article: NewsArticle) => {
    await saveNewsArticle({ ...article, published: !article.published }, false);
  };

  const handleToggleFeatured = async (article: NewsArticle) => {
    await saveNewsArticle({ ...article, featured: !article.featured }, false);
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_ARTICLE); };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors capitalize ${
                filter === f ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}>
              {f} {f === "all" ? `(${articles.length})` : f === "published" ? `(${articles.filter(a => a.published).length})` : `(${articles.filter(a => !a.published).length})`}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Article
        </button>
      </div>

      {/* ── Add / Edit Form ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-600" />
              {editingId ? "Edit Article" : "New News Article"}
            </h3>
            <button onClick={cancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Title *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. BAC Ranked Among Top 50 Universities in Asia" required />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as NewsArticle["category"] })}>
                  {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Author</label>
                <input className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Communications Office" />
              </div>
              <div>
                <label className={labelCls}>Publication Date</label>
                <input type="date" className={inputCls} value={form.dateISO}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    const humanDate = isNaN(d.getTime()) ? e.target.value : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    setForm({ ...form, dateISO: e.target.value, date: humanDate });
                  }} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input className={inputCls + " pl-9"} value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
                  </div>
                  {form.image && (
                    <img src={form.image} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Excerpt / Short Description *</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="A brief summary shown on cards (150–200 characters ideal)…" required />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6 pt-2 pb-1">
              <ToggleSwitch
                label="Published"
                sublabel="Visible on public website"
                checked={form.published}
                onChange={(v) => setForm({ ...form, published: v })}
              />
              <ToggleSwitch
                label="Featured"
                sublabel="Shown as the large featured card"
                checked={form.featured}
                onChange={(v) => setForm({ ...form, featured: v })}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : editingId ? "Update Article" : "Publish Article"}
              </button>
              <button type="button" onClick={cancel}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Articles List ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-500">No articles yet</p>
            <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
              Write First Article
            </button>
          </div>
        ) : (
          filtered.map((article) => {
            const CatIcon = CATEGORY_ICONS[article.category] || BookOpen;
            const catColor = CATEGORY_COLORS[article.category] || "bg-slate-100 text-slate-600";
            return (
              <div key={article.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all p-4 flex items-start gap-4 group">
                {/* Thumbnail */}
                {article.image ? (
                  <img src={article.image} alt={article.title} className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-100" />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${catColor}`}>
                      <CatIcon className="w-3 h-3" /> {article.category}
                    </span>
                    {article.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400" /> Featured
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${article.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {article.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-slate-400">{article.date}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{article.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{article.excerpt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleToggleFeatured(article)}
                    title={article.featured ? "Remove featured" : "Set as featured"}
                    className={`p-2 rounded-lg border transition-colors ${article.featured ? "bg-amber-50 border-amber-200 text-amber-500" : "border-slate-200 text-slate-300 hover:border-amber-200 hover:text-amber-400"}`}>
                    <Star className={`w-3.5 h-3.5 ${article.featured ? "fill-amber-400" : ""}`} />
                  </button>
                  <button onClick={() => handleTogglePublish(article)}
                    title={article.published ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                    {article.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openEdit(article)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Homepage Config Manager ──────────────────────────────────────────────────

function HomepageConfigManager() {
  const { data, updateNewsEventsConfig } = useSiteData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<NewsEventsConfig>(data?.newsConfig || defaultNewsEventsConfig);

  // Sync if data loads
  React.useEffect(() => {
    if (data?.newsConfig) setCfg(data.newsConfig);
  }, [data?.newsConfig]);

  const articles = data?.news || [];
  const featuredArticle = articles.find((a) => a.id === cfg.featuredArticleId);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await updateNewsEventsConfig(cfg);
      if (ok) toast({ title: "Configuration Saved", description: "Homepage News & Events settings updated." });
      else throw new Error();
    } catch {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Text */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-amber-600" /> Section Text
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Section Heading</label>
            <input className={inputCls} value={cfg.heading} onChange={(e) => setCfg({ ...cfg, heading: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Subtitle</label>
            <textarea className={inputCls + " resize-none"} rows={2} value={cfg.subtitle}
              onChange={(e) => setCfg({ ...cfg, subtitle: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600" /> Visibility Controls
        </h3>
        <div className="space-y-3">
          <ToggleSwitch label="Show entire section" sublabel="Toggle the entire News & Events section on/off" checked={cfg.sectionEnabled} onChange={(v) => setCfg({ ...cfg, sectionEnabled: v })} />
          <ToggleSwitch label="Show featured article" sublabel="Large highlighted article card at the top" checked={cfg.showFeatured} onChange={(v) => setCfg({ ...cfg, showFeatured: v })} />
          <ToggleSwitch label="Show news grid" sublabel="Grid of news cards below the featured article" checked={cfg.showNewsGrid} onChange={(v) => setCfg({ ...cfg, showNewsGrid: v })} />
          <ToggleSwitch label="Show upcoming events" sublabel="Event cards strip with date, location, and time" checked={cfg.showEvents} onChange={(v) => setCfg({ ...cfg, showEvents: v })} />
        </div>
      </div>

      {/* Count Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-amber-600" /> Display Limits
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Max News Articles (1–12)</label>
            <input type="number" min={1} max={12} className={inputCls} value={cfg.maxNewsVisible}
              onChange={(e) => setCfg({ ...cfg, maxNewsVisible: Math.min(12, Math.max(1, Number(e.target.value))) })} />
          </div>
          <div>
            <label className={labelCls}>Max Upcoming Events (1–6)</label>
            <input type="number" min={1} max={6} className={inputCls} value={cfg.maxEventsVisible}
              onChange={(e) => setCfg({ ...cfg, maxEventsVisible: Math.min(6, Math.max(1, Number(e.target.value))) })} />
          </div>
        </div>
      </div>

      {/* Featured Article Selector */}
      {cfg.showFeatured && articles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600" /> Featured Article
          </h3>
          <p className="text-xs text-slate-400">
            Select which article appears as the large featured card. If none is selected, the article with "Featured" toggled on will be used.
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {articles.filter((a) => a.published).map((article) => {
              const isSelected = cfg.featuredArticleId === article.id;
              return (
                <button key={article.id} onClick={() => setCfg({ ...cfg, featuredArticleId: article.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-200 hover:bg-slate-50"
                  }`}>
                  {article.image && (
                    <img src={article.image} alt={article.title} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{article.title}</p>
                    <p className="text-xs text-slate-400">{article.category} · {article.date}</p>
                  </div>
                  {isSelected && <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          {featuredArticle && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Currently featuring: &quot;{featuredArticle.title}&quot;
            </p>
          )}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function ToggleSwitch({ label, sublabel, checked, onChange }: {
  label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!checked)}>
      <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${checked ? "bg-amber-400" : "bg-slate-200"}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
