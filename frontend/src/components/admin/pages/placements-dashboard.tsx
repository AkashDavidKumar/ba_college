"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  Briefcase,
  BarChart3,
  Building2,
  Star,
  Plus,
  Save,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlacementStats {
  year: string;
  totalPlaced: number;
  highestPackage: string;
  averagePackage: string;
  placementRate: string;
}

interface Recruiter {
  id: string;
  name: string;
  logo: string;
  sector: string;
  hiringCount?: number;
  website?: string;
}

interface SuccessStory {
  id: string;
  studentName: string;
  program: string;
  company: string;
  package: string;
  batch: string;
  photo?: string;
  quote?: string;
}

interface PlacementsData {
  overview: string;
  stats: PlacementStats[];
  recruiters: Recruiter[];
  successStories: SuccessStory[];
  placementProcess: string[];
  trainingPrograms: string[];
}

const TABS = [
  { id: "overview",   label: "Overview & Stats",    icon: BarChart3 },
  { id: "recruiters", label: "Top Recruiters",       icon: Building2 },
  { id: "stories",    label: "Success Stories",      icon: Star },
  { id: "process",    label: "Placement Process",    icon: TrendingUp },
];

interface PlacementsDashboardProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlacementsDashboard({ nav, setNav }: PlacementsDashboardProps) {
  const [data, setData] = useState<PlacementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const activeTab = nav.section || "overview";
  const setTab = (id: string) => setNav({ page: "placements", section: id });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await apiClient.get<any>("/placements");
      setData(json?.data || json);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError(`Access denied: ${err.message}`);
      } else {
        setError("Failed to load placements data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updated: PlacementsData) => {
    setSaving(true);
    setError("");
    try {
      await apiClient.put("/placements", updated);
      setData(updated);
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 403 ? "Forbidden: You lack placements:update permission." : err.message);
      } else {
        setError("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageDashboard
      pageName="Placement Management"
      pageDescription="Manage placement statistics, recruiters, success stories, and career development content"
    >
      {/* ── Tab Bar ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-amber-400 text-amber-700 bg-amber-50/60"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {loading ? (
        <LoadingSkeleton />
      ) : !data ? (
        <div className="text-center py-12 text-slate-400">No data available.</div>
      ) : (
        <>
          {/* ── Overview & Stats ──────────────────────── */}
          {activeTab === "overview" && (
            <OverviewTab data={data} onSave={saveData} saving={saving} />
          )}

          {/* ── Top Recruiters ────────────────────────── */}
          {activeTab === "recruiters" && (
            <RecruitersTab data={data} onSave={saveData} saving={saving} />
          )}

          {/* ── Success Stories ───────────────────────── */}
          {activeTab === "stories" && (
            <StoriesTab data={data} onSave={saveData} saving={saving} />
          )}

          {/* ── Placement Process ─────────────────────── */}
          {activeTab === "process" && (
            <ProcessTab data={data} onSave={saveData} saving={saving} />
          )}
        </>
      )}
    </PageDashboard>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  data,
  onSave,
  saving,
}: {
  data: PlacementsData;
  onSave: (d: PlacementsData) => void;
  saving: boolean;
}) {
  const [overview, setOverview] = useState(data.overview);
  const [stats, setStats] = useState<PlacementStats[]>(data.stats);
  const [addingRow, setAddingRow] = useState(false);
  const [newRow, setNewRow] = useState<PlacementStats>({
    year: "",
    totalPlaced: 0,
    highestPackage: "",
    averagePackage: "",
    placementRate: "",
  });

  const addStat = () => {
    if (!newRow.year) return;
    const updated = [newRow, ...stats];
    setStats(updated);
    setNewRow({ year: "", totalPlaced: 0, highestPackage: "", averagePackage: "", placementRate: "" });
    setAddingRow(false);
  };

  const deleteStat = (idx: number) =>
    setStats(stats.filter((_, i) => i !== idx));

  const handleSave = () =>
    onSave({ ...data, overview, stats });

  return (
    <div className="space-y-6">
      {/* Overview text */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-600" /> Placement Overview Text
        </h3>
        <textarea
          className={inputCls + " resize-none"}
          rows={4}
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          placeholder="Brief overview shown at the top of the Placements page…"
        />
      </div>

      {/* Year-wise stats table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" /> Year-wise Statistics
          </h3>
          <button
            onClick={() => setAddingRow(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Year
          </button>
        </div>

        {addingRow && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            {[
              { key: "year",            placeholder: "2024-25",    label: "Academic Year" },
              { key: "totalPlaced",     placeholder: "850",        label: "Total Placed" },
              { key: "highestPackage",  placeholder: "₹45 LPA",   label: "Highest Package" },
              { key: "averagePackage",  placeholder: "₹18 LPA",   label: "Average Package" },
              { key: "placementRate",   placeholder: "98%",        label: "Placement Rate" },
            ].map(({ key, placeholder, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                <input
                  className={inputCls}
                  placeholder={placeholder}
                  value={(newRow as any)[key]}
                  onChange={(e) => setNewRow({ ...newRow, [key]: key === "totalPlaced" ? Number(e.target.value) : e.target.value })}
                />
              </div>
            ))}
            <div className="flex gap-2 items-end">
              <button onClick={addStat} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">Add</button>
              <button onClick={() => setAddingRow(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Year", "Total Placed", "Highest Pkg", "Average Pkg", "Rate", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 pr-4 font-semibold text-slate-800">{row.year}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{row.totalPlaced}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{row.highestPackage}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{row.averagePackage}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{row.placementRate}</td>
                  <td className="py-2.5">
                    <button onClick={() => deleteStat(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400 text-xs">No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaveBar onSave={handleSave} saving={saving} />
    </div>
  );
}

// ─── Recruiters Tab ───────────────────────────────────────────────────────────

function RecruitersTab({
  data,
  onSave,
  saving,
}: {
  data: PlacementsData;
  onSave: (d: PlacementsData) => void;
  saving: boolean;
}) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>(data.recruiters);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Recruiter, "id">>({ name: "", logo: "", sector: "", hiringCount: 0, website: "" });

  const add = () => {
    if (!form.name) return;
    setRecruiters([...recruiters, { ...form, id: "r-" + Date.now() }]);
    setForm({ name: "", logo: "", sector: "", hiringCount: 0, website: "" });
    setShowForm(false);
  };

  const remove = (id: string) => setRecruiters(recruiters.filter((r) => r.id !== id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" /> Recruiter List
          </h3>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Recruiter
          </button>
        </div>

        {showForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            {[
              { key: "name",    label: "Company Name", placeholder: "Google" },
              { key: "sector",  label: "Sector",       placeholder: "Technology" },
              { key: "website", label: "Website URL",  placeholder: "https://google.com" },
              { key: "hiringCount", label: "Hiring Count", placeholder: "50" },
              { key: "logo",    label: "Logo URL",     placeholder: "https://…" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                <input className={inputCls} placeholder={placeholder} value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: key === "hiringCount" ? Number(e.target.value) : e.target.value })} />
              </div>
            ))}
            <div className="flex gap-2 items-end">
              <button onClick={add} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">Add</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recruiters.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 group">
              {r.logo ? (
                <img src={r.logo} alt={r.name} className="w-10 h-10 object-contain rounded-lg bg-slate-50" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{r.name}</p>
                <p className="text-xs text-slate-400">{r.sector}{r.hiringCount ? ` · ${r.hiringCount} hired` : ""}</p>
              </div>
              <button onClick={() => remove(r.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {recruiters.length === 0 && (
            <div className="col-span-3 py-8 text-center text-slate-400 text-sm">No recruiters added yet.</div>
          )}
        </div>
      </div>
      <SaveBar onSave={() => onSave({ ...data, recruiters })} saving={saving} />
    </div>
  );
}

// ─── Success Stories Tab ──────────────────────────────────────────────────────

function StoriesTab({
  data,
  onSave,
  saving,
}: {
  data: PlacementsData;
  onSave: (d: PlacementsData) => void;
  saving: boolean;
}) {
  const [stories, setStories] = useState<SuccessStory[]>(data.successStories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<SuccessStory, "id">>({
    studentName: "", program: "", company: "", package: "", batch: "", photo: "", quote: "",
  });

  const add = () => {
    if (!form.studentName || !form.company) return;
    setStories([...stories, { ...form, id: "s-" + Date.now() }]);
    setForm({ studentName: "", program: "", company: "", package: "", batch: "", photo: "", quote: "" });
    setShowForm(false);
  };

  const remove = (id: string) => setStories(stories.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600" /> Student Success Stories
          </h3>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Story
          </button>
        </div>

        {showForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            {[
              { key: "studentName", label: "Student Name",   placeholder: "Arjun Sharma" },
              { key: "company",     label: "Company",        placeholder: "Google" },
              { key: "program",     label: "Program",        placeholder: "B.Tech CSE" },
              { key: "package",     label: "Package",        placeholder: "₹42 LPA" },
              { key: "batch",       label: "Batch",          placeholder: "2024" },
              { key: "photo",       label: "Photo URL",      placeholder: "https://…" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                <input className={inputCls} placeholder={placeholder} value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Quote / Testimonial</label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Student's brief quote about placement experience…" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button onClick={add} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">Add Story</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {stories.map((s) => (
            <div key={s.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 group">
              {s.photo ? (
                <img src={s.photo} alt={s.studentName} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-0.5">
                  <span className="font-bold text-slate-800 text-sm">{s.studentName}</span>
                  <span className="text-xs text-green-600 font-semibold">{s.package}</span>
                </div>
                <p className="text-xs text-slate-500">{s.program} · {s.company} · Batch {s.batch}</p>
                {s.quote && <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">"{s.quote}"</p>}
              </div>
              <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {stories.length === 0 && (
            <p className="py-8 text-center text-slate-400 text-sm">No stories added yet.</p>
          )}
        </div>
      </div>
      <SaveBar onSave={() => onSave({ ...data, successStories: stories })} saving={saving} />
    </div>
  );
}

// ─── Process Tab ──────────────────────────────────────────────────────────────

function ProcessTab({
  data,
  onSave,
  saving,
}: {
  data: PlacementsData;
  onSave: (d: PlacementsData) => void;
  saving: boolean;
}) {
  const [process, setProcess] = useState<string[]>(data.placementProcess);
  const [training, setTraining] = useState<string[]>(data.trainingPrograms);
  const [newStep, setNewStep] = useState("");
  const [newTraining, setNewTraining] = useState("");

  const addStep = () => {
    if (!newStep.trim()) return;
    setProcess([...process, newStep.trim()]);
    setNewStep("");
  };

  const addTraining = () => {
    if (!newTraining.trim()) return;
    setTraining([...training, newTraining.trim()]);
    setNewTraining("");
  };

  return (
    <div className="space-y-6">
      {/* Placement Process Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" /> Placement Process Steps
        </h3>
        <div className="flex gap-2">
          <input className={inputCls} value={newStep} onChange={(e) => setNewStep(e.target.value)}
            placeholder="e.g. Resume Shortlisting" onKeyDown={(e) => e.key === "Enter" && addStep()} />
          <button onClick={addStep} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <ol className="space-y-2">
          {process.map((step, i) => (
            <li key={i} className="flex items-center gap-3 group">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-slate-700">{step}</span>
              <button onClick={() => setProcess(process.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
          {process.length === 0 && <p className="text-xs text-slate-400">No steps added.</p>}
        </ol>
      </div>

      {/* Training & Career Programs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" /> Training & Career Development
        </h3>
        <div className="flex gap-2">
          <input className={inputCls} value={newTraining} onChange={(e) => setNewTraining(e.target.value)}
            placeholder="e.g. Aptitude & Technical Training" onKeyDown={(e) => e.key === "Enter" && addTraining()} />
          <button onClick={addTraining} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-2">
          {training.map((item, i) => (
            <li key={i} className="flex items-center gap-3 group">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="flex-1 text-sm text-slate-700">{item}</span>
              <button onClick={() => setTraining(training.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
          {training.length === 0 && <p className="text-xs text-slate-400">No programs added.</p>}
        </ul>
      </div>

      <SaveBar onSave={() => onSave({ ...data, placementProcess: process, trainingPrograms: training })} saving={saving} />
    </div>
  );
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors shadow-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function Alert({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return (
    <div className={`px-4 py-3 rounded-xl text-sm border ${
      type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
    }`}>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-40" />
      ))}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
