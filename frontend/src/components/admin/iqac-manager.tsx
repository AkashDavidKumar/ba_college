"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, FileText, Users, BarChart3, BookOpen, Star, Download,
  Plus, Trash2, Edit3, Save, RefreshCw, Eye, ExternalLink, Calendar,
  TrendingUp, Layers, MessageSquare, Microscope, Bell, ImageIcon,
  CheckCircle, AlertCircle, Clock, X, Search, Filter, ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function IqacManager() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("dashboard");

  // Edit / Add Modal States
  const [modalType, setModalType] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Activity Logs
  const [logs, setLogs] = useState<Array<{ time: string; action: string; user: string }>>([
    { time: "Just now", action: "IQAC Portal synchronized with MongoDB", user: "Administrator" },
    { time: "10 mins ago", action: "Verified NAAC AQAR 2025-26 documentation", user: "IQAC Coordinator" },
    { time: "1 hour ago", action: "Published Student Curriculum Feedback ATR", user: "Dean Academics" },
    { time: "Yesterday", action: "Updated NIRF 2026 Ranking Dossier to #42", user: "Administrator" },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/iqac");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to load IQAC data from server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSection = async (sectionName: string, sectionData: any) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/iqac/section/${sectionName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData)
      });
      if (res.ok) {
        toast({
          title: "Changes Saved",
          description: `Successfully updated ${sectionName} in MongoDB.`
        });
        setLogs(prev => [
          { time: "Just now", action: `Updated ${sectionName} parameters`, user: "Administrator" },
          ...prev.slice(0, 7)
        ]);
        await fetchData();
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      toast({
        title: "Save Failed",
        description: "Could not persist changes to server.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEntireIqac = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/iqac", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast({
          title: "All Changes Published",
          description: "All IQAC data updated and live on public portal."
        });
        await fetchData();
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to publish full data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-bold text-slate-800">Loading IQAC Management Module</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to MongoDB store...</p>
      </div>
    );
  }

  const subTabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "about", label: "About & Vision", icon: ShieldCheck },
    { id: "members", label: "IQAC Members", icon: Users },
    { id: "aqar", label: "AQAR Reports", icon: FileText },
    { id: "ssr-iiqa", label: "SSR & IIQA", icon: BookOpen },
    { id: "nirf", label: "NIRF Reports", icon: TrendingUp },
    { id: "minutes", label: "Minutes & ATR", icon: Clock },
    { id: "initiatives", label: "Initiatives & Best Practices", icon: Star },
    { id: "feedback", label: "Feedback & Audits", icon: MessageSquare },
    { id: "monthly", label: "Monthly Reports", icon: Calendar },
    { id: "notices", label: "Notices & Circulars", icon: Bell },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1B5E20] via-[#246B2A] to-[#0E3511] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Admin Quality Assurance Management
          </div>
          <h1 className="text-2xl font-bold font-serif">Internal Quality Assurance Cell (IQAC) Portal</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Manage all 20 sections of BAC Global University's IQAC accreditation portal in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/iqac"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <button
            onClick={fetchData}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", saving && "animate-spin")} />
            Sync
          </button>
          <button
            onClick={saveEntireIqac}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Publishing..." : "Save All to DB"}
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-[#1B5E20] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TAB 1: DASHBOARD OVERVIEW
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Total AQAR Reports</div>
              <div className="text-3xl font-black text-[#14532D] mt-2">{data.aqarReports?.length || 0}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">2019-2026 Documented</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">IQAC Committee Members</div>
              <div className="text-3xl font-black text-[#14532D] mt-2">{data.members?.length || 0}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">All Roles Configured</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Quality Initiatives</div>
              <div className="text-3xl font-black text-[#14532D] mt-2">{data.qualityInitiatives?.length || 0}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Active Projects & Drives</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Total Public Downloads</div>
              <div className="text-3xl font-black text-[#14532D] mt-2">{data.stats?.totalDownloads || 3892}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Across all NAAC / NIRF PDFs</div>
            </div>
          </div>

          {/* Quick Stat Config */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Homepage Quick Statistics Counters</h3>
                <p className="text-xs text-slate-500">Edit the 4 animated counter values displayed on the public IQAC hero banner.</p>
              </div>
              <button
                onClick={() => saveSection("stats", data.stats)}
                className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all"
              >
                Save Stats
              </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">AQAR Reports Count</label>
                <input
                  type="number"
                  value={data.stats?.totalAqarReports || 0}
                  onChange={(e) => setData({ ...data, stats: { ...data.stats, totalAqarReports: parseInt(e.target.value) || 0 } })}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Total Documents Count</label>
                <input
                  type="number"
                  value={data.stats?.totalDocuments || 0}
                  onChange={(e) => setData({ ...data, stats: { ...data.stats, totalDocuments: parseInt(e.target.value) || 0 } })}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Quality Initiatives Count</label>
                <input
                  type="number"
                  value={data.stats?.qualityInitiatives || 0}
                  onChange={(e) => setData({ ...data, stats: { ...data.stats, qualityInitiatives: parseInt(e.target.value) || 0 } })}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Total Downloads</label>
                <input
                  type="number"
                  value={data.stats?.totalDownloads || 0}
                  onChange={(e) => setData({ ...data, stats: { ...data.stats, totalDownloads: parseInt(e.target.value) || 0 } })}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Activity Logs & Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B5E20]" />
                Recent System Activity Logs
              </h3>
              <div className="space-y-3">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{log.action}</div>
                      <div className="text-slate-400 mt-0.5">By {log.user}</div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                Accreditation Status & Credentials
              </h3>
              <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#D1E7D3] space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#14532D]">
                  <span>NAAC Grade:</span>
                  <span>A++ (CGPA 3.82)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Accreditation Cycle:</span>
                  <span>Cycle 4 Valid till 2029</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>NIRF Ranking:</span>
                  <span>Rank #42 (University Category)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>ISO Certification:</span>
                  <span>ISO 9001:2015 Compliant</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-1">Live Database Storage:</div>
                <div className="text-xs text-slate-500">
                  Backed by MongoDB `SiteContent` collection under key `default.iqacData`. All edits take effect instantly on `/iqac`.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 2: ABOUT & VISION MANAGEMENT
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "about" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">About, Vision & Objectives</h2>
              <p className="text-xs text-slate-500">Update the foundational philosophy and mandate of the IQAC.</p>
            </div>
            <button
              onClick={() => saveSection("about", data.about)}
              className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
            >
              Save Section
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Introduction Paragraph</label>
              <textarea
                rows={4}
                value={data.about?.introduction || ""}
                onChange={(e) => setData({ ...data, about: { ...data.about, introduction: e.target.value } })}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vision Statement</label>
                <textarea
                  rows={3}
                  value={data.about?.vision || ""}
                  onChange={(e) => setData({ ...data, about: { ...data.about, vision: e.target.value } })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mission Statement</label>
                <textarea
                  rows={3}
                  value={data.about?.mission || ""}
                  onChange={(e) => setData({ ...data, about: { ...data.about, mission: e.target.value } })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Core Objectives (One per line)</label>
              <textarea
                rows={5}
                value={(data.about?.objectives || []).join("\n")}
                onChange={(e) => setData({
                  ...data,
                  about: {
                    ...data.about,
                    objectives: e.target.value.split("\n").filter(Boolean)
                  }
                })}
                className="w-full p-3 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Operational Functions (One per line)</label>
              <textarea
                rows={5}
                value={(data.about?.functions || []).join("\n")}
                onChange={(e) => setData({
                  ...data,
                  about: {
                    ...data.about,
                    functions: e.target.value.split("\n").filter(Boolean)
                  }
                })}
                className="w-full p-3 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 3: MEMBERS MANAGEMENT
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "members" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">IQAC Committee Members</h2>
              <p className="text-xs text-slate-500">Add, edit, remove or re-order committee members.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newMember = {
                    id: `m-${Date.now()}`,
                    name: "New Member Name",
                    designation: "Professor",
                    role: "Faculty Member",
                    department: "Department Name",
                    email: "member@bac.edu",
                    phone: "+91 80 4967 0000",
                    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                    order: (data.members?.length || 0) + 1,
                    status: "active"
                  };
                  const updated = [...(data.members || []), newMember];
                  setData({ ...data, members: updated });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold hover:bg-[#D1E7D3] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </button>
              <button
                onClick={() => saveSection("members", data.members)}
                className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all"
              >
                Save Members
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(data.members || []).map((m: any, idx: number) => (
              <div key={m.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all grid md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-1 text-center font-bold text-xs text-slate-400">
                  #{idx + 1}
                </div>

                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={m.name}
                    placeholder="Full Name"
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].name = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={m.designation}
                    placeholder="Designation"
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].designation = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-xs text-slate-500 rounded-lg border border-slate-200 bg-white mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <select
                    value={m.role}
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].role = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Chairperson">Chairperson</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Faculty Member">Faculty Member</option>
                    <option value="Administrative Staff">Administrative Staff</option>
                    <option value="External Expert">External Expert</option>
                    <option value="Student Representative">Student Representative</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={m.department}
                    placeholder="Department"
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].department = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={m.email}
                    placeholder="Email"
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].email = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={m.photo}
                    placeholder="Photo URL"
                    onChange={(e) => {
                      const updated = [...data.members];
                      updated[idx].photo = e.target.value;
                      setData({ ...data, members: updated });
                    }}
                    className="w-full p-2 text-[11px] rounded-lg border border-slate-200 bg-white truncate"
                  />
                </div>

                <div className="md:col-span-1 text-right">
                  <button
                    onClick={() => {
                      const updated = data.members.filter((_: any, i: number) => i !== idx);
                      setData({ ...data, members: updated });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 4: AQAR REPORTS MANAGEMENT
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "aqar" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AQAR Reports Repository</h2>
              <p className="text-xs text-slate-500">Manage Annual Quality Assurance Reports submitted to NAAC.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newReport = {
                    id: `aqar-${Date.now()}`,
                    academicYear: "2026-27",
                    title: "AQAR 2026-27",
                    uploadDate: new Date().toISOString().split("T")[0],
                    fileUrl: "#",
                    fileSize: "4.0 MB",
                    downloads: 0,
                    status: "published"
                  };
                  setData({ ...data, aqarReports: [newReport, ...(data.aqarReports || [])] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold hover:bg-[#D1E7D3]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add AQAR Report
              </button>
              <button
                onClick={() => saveSection("aqarReports", data.aqarReports)}
                className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save AQAR
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(data.aqarReports || []).map((r: any, idx: number) => (
              <div key={r.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Year</label>
                  <input
                    type="text"
                    value={r.academicYear}
                    onChange={(e) => {
                      const updated = [...data.aqarReports];
                      updated[idx].academicYear = e.target.value;
                      setData({ ...data, aqarReports: updated });
                    }}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Report Title</label>
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => {
                      const updated = [...data.aqarReports];
                      updated[idx].title = e.target.value;
                      setData({ ...data, aqarReports: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">PDF Link / Document URL</label>
                  <input
                    type="text"
                    value={r.fileUrl}
                    onChange={(e) => {
                      const updated = [...data.aqarReports];
                      updated[idx].fileUrl = e.target.value;
                      setData({ ...data, aqarReports: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Downloads</label>
                  <input
                    type="number"
                    value={r.downloads || 0}
                    onChange={(e) => {
                      const updated = [...data.aqarReports];
                      updated[idx].downloads = parseInt(e.target.value) || 0;
                      setData({ ...data, aqarReports: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right pt-3 sm:pt-0">
                  <button
                    onClick={() => {
                      const updated = data.aqarReports.filter((_: any, i: number) => i !== idx);
                      setData({ ...data, aqarReports: updated });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 5: SSR & IIQA REPORTS
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "ssr-iiqa" && (
        <div className="space-y-6">
          {/* SSR Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Self Study Reports (SSR Cycles)</h3>
              <button
                onClick={() => saveSection("ssrReports", data.ssrReports)}
                className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save SSR Reports
              </button>
            </div>

            <div className="space-y-4">
              {(data.ssrReports || []).map((ssr: any, idx: number) => (
                <div key={ssr.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="grid sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={ssr.cycle}
                      placeholder="Cycle (e.g. Cycle 4)"
                      onChange={(e) => {
                        const updated = [...data.ssrReports];
                        updated[idx].cycle = e.target.value;
                        setData({ ...data, ssrReports: updated });
                      }}
                      className="p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={ssr.year}
                      placeholder="Year"
                      onChange={(e) => {
                        const updated = [...data.ssrReports];
                        updated[idx].year = e.target.value;
                        setData({ ...data, ssrReports: updated });
                      }}
                      className="p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={ssr.grade}
                      placeholder="Grade (e.g. A++)"
                      onChange={(e) => {
                        const updated = [...data.ssrReports];
                        updated[idx].grade = e.target.value;
                        setData({ ...data, ssrReports: updated });
                      }}
                      className="p-2 text-xs font-bold text-[#1B5E20] rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={ssr.fileUrl}
                      placeholder="File URL"
                      onChange={(e) => {
                        const updated = [...data.ssrReports];
                        updated[idx].fileUrl = e.target.value;
                        setData({ ...data, ssrReports: updated });
                      }}
                      className="p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={ssr.executiveSummary}
                    placeholder="Executive Summary"
                    onChange={(e) => {
                      const updated = [...data.ssrReports];
                      updated[idx].executiveSummary = e.target.value;
                      setData({ ...data, ssrReports: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* IIQA Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Institutional Information for Quality Assessment (IIQA)</h3>
              <button
                onClick={() => saveSection("iiqaReports", data.iiqaReports)}
                className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save IIQA Reports
              </button>
            </div>

            <div className="space-y-3">
              {(data.iiqaReports || []).map((iiqa: any, idx: number) => (
                <div key={iiqa.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid sm:grid-cols-4 gap-3 items-center">
                  <input
                    type="text"
                    value={iiqa.cycle}
                    onChange={(e) => {
                      const updated = [...data.iiqaReports];
                      updated[idx].cycle = e.target.value;
                      setData({ ...data, iiqaReports: updated });
                    }}
                    className="p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={iiqa.submissionDate}
                    onChange={(e) => {
                      const updated = [...data.iiqaReports];
                      updated[idx].submissionDate = e.target.value;
                      setData({ ...data, iiqaReports: updated });
                    }}
                    className="p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={iiqa.documentUrl}
                    onChange={(e) => {
                      const updated = [...data.iiqaReports];
                      updated[idx].documentUrl = e.target.value;
                      setData({ ...data, iiqaReports: updated });
                    }}
                    className="p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                  <select
                    value={iiqa.status}
                    onChange={(e) => {
                      const updated = [...data.iiqaReports];
                      updated[idx].status = e.target.value;
                      setData({ ...data, iiqaReports: updated });
                    }}
                    className="p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white capitalize"
                  >
                    <option value="approved">Approved</option>
                    <option value="submitted">Submitted</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 6: NIRF REPORTS
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "nirf" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">NIRF Rankings & Submission Reports</h2>
              <p className="text-xs text-slate-500">Configure published NIRF rank positions and parameter scores.</p>
            </div>
            <button
              onClick={() => saveSection("nirfReports", data.nirfReports)}
              className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
            >
              Save NIRF
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {(data.nirfReports || []).map((nirf: any, idx: number) => (
              <div key={nirf.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">Category</label>
                    <input
                      type="text"
                      value={nirf.category}
                      onChange={(e) => {
                        const updated = [...data.nirfReports];
                        updated[idx].category = e.target.value;
                        setData({ ...data, nirfReports: updated });
                      }}
                      className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">Year</label>
                    <input
                      type="text"
                      value={nirf.year}
                      onChange={(e) => {
                        const updated = [...data.nirfReports];
                        updated[idx].year = e.target.value;
                        setData({ ...data, nirfReports: updated });
                      }}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">Rank Position</label>
                    <input
                      type="text"
                      value={nirf.rank}
                      onChange={(e) => {
                        const updated = [...data.nirfReports];
                        updated[idx].rank = e.target.value;
                        setData({ ...data, nirfReports: updated });
                      }}
                      className="w-full p-2 text-base font-black text-[#14532D] rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">Score</label>
                    <input
                      type="text"
                      value={nirf.score}
                      onChange={(e) => {
                        const updated = [...data.nirfReports];
                        updated[idx].score = e.target.value;
                        setData({ ...data, nirfReports: updated });
                      }}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block">Dossier File URL</label>
                  <input
                    type="text"
                    value={nirf.documentUrl}
                    onChange={(e) => {
                      const updated = [...data.nirfReports];
                      updated[idx].documentUrl = e.target.value;
                      setData({ ...data, nirfReports: updated });
                    }}
                    className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 7: MINUTES & ATR
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "minutes" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Meeting Minutes & ATR</h2>
              <p className="text-xs text-slate-500">Record of quarterly IQAC meetings and Action Taken Reports.</p>
            </div>
            <button
              onClick={() => saveSection("meetingMinutes", data.meetingMinutes)}
              className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
            >
              Save Minutes
            </button>
          </div>

          <div className="space-y-4">
            {(data.meetingMinutes || []).map((m: any, idx: number) => (
              <div key={m.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="grid sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={m.meetingNo}
                    placeholder="Meeting No"
                    onChange={(e) => {
                      const updated = [...data.meetingMinutes];
                      updated[idx].meetingNo = e.target.value;
                      setData({ ...data, meetingMinutes: updated });
                    }}
                    className="p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={m.date}
                    placeholder="Date"
                    onChange={(e) => {
                      const updated = [...data.meetingMinutes];
                      updated[idx].date = e.target.value;
                      setData({ ...data, meetingMinutes: updated });
                    }}
                    className="p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={m.minutesFileUrl}
                    placeholder="Minutes PDF URL"
                    onChange={(e) => {
                      const updated = [...data.meetingMinutes];
                      updated[idx].minutesFileUrl = e.target.value;
                      setData({ ...data, meetingMinutes: updated });
                    }}
                    className="p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={m.atrFileUrl}
                    placeholder="ATR PDF URL"
                    onChange={(e) => {
                      const updated = [...data.meetingMinutes];
                      updated[idx].atrFileUrl = e.target.value;
                      setData({ ...data, meetingMinutes: updated });
                    }}
                    className="p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={m.keyDecisions}
                  placeholder="Key decisions and resolutions"
                  onChange={(e) => {
                    const updated = [...data.meetingMinutes];
                    updated[idx].keyDecisions = e.target.value;
                    setData({ ...data, meetingMinutes: updated });
                  }}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 8: INITIATIVES & BEST PRACTICES
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "initiatives" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Quality Initiatives</h3>
              <button
                onClick={() => saveSection("qualityInitiatives", data.qualityInitiatives)}
                className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save Initiatives
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(data.qualityInitiatives || []).map((qi: any, idx: number) => (
                <div key={qi.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qi.title}
                      placeholder="Title"
                      onChange={(e) => {
                        const updated = [...data.qualityInitiatives];
                        updated[idx].title = e.target.value;
                        setData({ ...data, qualityInitiatives: updated });
                      }}
                      className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={qi.category}
                      placeholder="Category"
                      onChange={(e) => {
                        const updated = [...data.qualityInitiatives];
                        updated[idx].category = e.target.value;
                        setData({ ...data, qualityInitiatives: updated });
                      }}
                      className="w-32 p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={qi.description}
                    placeholder="Description"
                    onChange={(e) => {
                      const updated = [...data.qualityInitiatives];
                      updated[idx].description = e.target.value;
                      setData({ ...data, qualityInitiatives: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={qi.outcomes}
                    placeholder="Outcomes"
                    onChange={(e) => {
                      const updated = [...data.qualityInitiatives];
                      updated[idx].outcomes = e.target.value;
                      setData({ ...data, qualityInitiatives: updated });
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={qi.image}
                    placeholder="Image URL"
                    onChange={(e) => {
                      const updated = [...data.qualityInitiatives];
                      updated[idx].image = e.target.value;
                      setData({ ...data, qualityInitiatives: updated });
                    }}
                    className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 9: NOTICES & CIRCULARS
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "notices" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notices & Circulars</h2>
              <p className="text-xs text-slate-500">Publish alerts and official notification orders.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newNotice = {
                    id: `n-${Date.now()}`,
                    title: "New IQAC Notification",
                    category: "circular",
                    date: new Date().toISOString().split("T")[0],
                    referenceNo: `IQAC/2026/CIRC/${Math.floor(Math.random() * 100)}`,
                    urgency: "high",
                    fileUrl: "#",
                    status: "published"
                  };
                  setData({ ...data, notices: [newNotice, ...(data.notices || [])] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold hover:bg-[#D1E7D3]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Notice
              </button>
              <button
                onClick={() => saveSection("notices", data.notices)}
                className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save Notices
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(data.notices || []).map((n: any, idx: number) => (
              <div key={n.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={n.title}
                    onChange={(e) => {
                      const updated = [...data.notices];
                      updated[idx].title = e.target.value;
                      setData({ ...data, notices: updated });
                    }}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={n.category}
                    onChange={(e) => {
                      const updated = [...data.notices];
                      updated[idx].category = e.target.value;
                      setData({ ...data, notices: updated });
                    }}
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white capitalize"
                  >
                    <option value="circular">Circular</option>
                    <option value="notice">Notice</option>
                    <option value="order">Order</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={n.urgency}
                    onChange={(e) => {
                      const updated = [...data.notices];
                      updated[idx].urgency = e.target.value;
                      setData({ ...data, notices: updated });
                    }}
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white capitalize"
                  >
                    <option value="high">High Urgency</option>
                    <option value="medium">Medium</option>
                    <option value="low">Standard</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={n.referenceNo}
                    onChange={(e) => {
                      const updated = [...data.notices];
                      updated[idx].referenceNo = e.target.value;
                      setData({ ...data, notices: updated });
                    }}
                    className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    onClick={() => {
                      const updated = data.notices.filter((_: any, i: number) => i !== idx);
                      setData({ ...data, notices: updated });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 10: GALLERY MANAGEMENT
         ────────────────────────────────────────────────────────── */}
      {activeSubTab === "gallery" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">IQAC Gallery & Event Photos</h2>
              <p className="text-xs text-slate-500">Upload and categorize accreditation and audit photos.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newItem = {
                    id: `g-${Date.now()}`,
                    title: "New Event Photo",
                    category: "workshop",
                    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
                    date: new Date().toISOString().split("T")[0],
                    description: "Event description details.",
                    status: "published"
                  };
                  setData({ ...data, gallery: [newItem, ...(data.gallery || [])] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold hover:bg-[#D1E7D3]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Photo
              </button>
              <button
                onClick={() => saveSection("gallery", data.gallery)}
                className="px-5 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C]"
              >
                Save Gallery
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(data.gallery || []).map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <img src={item.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                <input
                  type="text"
                  value={item.title}
                  placeholder="Photo Title"
                  onChange={(e) => {
                    const updated = [...data.gallery];
                    updated[idx].title = e.target.value;
                    setData({ ...data, gallery: updated });
                  }}
                  className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  value={item.imageUrl}
                  placeholder="Image URL"
                  onChange={(e) => {
                    const updated = [...data.gallery];
                    updated[idx].imageUrl = e.target.value;
                    setData({ ...data, gallery: updated });
                  }}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex justify-between items-center pt-2">
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const updated = [...data.gallery];
                      updated[idx].category = e.target.value;
                      setData({ ...data, gallery: updated });
                    }}
                    className="p-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white capitalize"
                  >
                    <option value="visit">Visit</option>
                    <option value="seminar">Seminar</option>
                    <option value="audit">Audit</option>
                    <option value="workshop">Workshop</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <button
                    onClick={() => {
                      const updated = data.gallery.filter((_: any, i: number) => i !== idx);
                      setData({ ...data, gallery: updated });
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
