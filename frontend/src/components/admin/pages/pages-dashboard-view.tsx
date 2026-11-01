"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  ExternalLink,
  Edit3,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  department?: string;
  status: "Published" | "Draft" | "Review";
  lastUpdated: string;
  views: number;
}

const DEFAULT_PAGES: PageItem[] = [
  { id: "1", title: "Home Page", slug: "/", status: "Published", lastUpdated: "Today, 11:20 AM", views: 18450 },
  { id: "2", title: "About Bishop Ambrose College", slug: "/#about", status: "Published", lastUpdated: "Yesterday", views: 9240 },
  { id: "3", title: "Academic Departments & Programs", slug: "/#departments", status: "Published", lastUpdated: "2 days ago", views: 12100 },
  { id: "4", title: "Undergraduate & Postgraduate Admissions", slug: "/#admissions", status: "Published", lastUpdated: "Today, 09:15 AM", views: 15300 },
  { id: "5", title: "Career Guidance & Campus Placements", slug: "/#placements", status: "Published", lastUpdated: "3 days ago", views: 8400 },
  { id: "6", title: "Infrastructure & Campus Facilities", slug: "/#facilities", status: "Published", lastUpdated: "5 days ago", views: 6720 },
  { id: "7", title: "Campus Events & Academic Seminars", slug: "/#events", status: "Published", lastUpdated: "Today, 02:40 PM", views: 11200 },
  { id: "8", title: "Internal Quality Assurance Cell (IQAC)", slug: "/iqac", status: "Published", lastUpdated: "Sep 22, 2026", views: 4890 },
  { id: "9", title: "Campus Media & Photo Gallery", slug: "/#gallery", status: "Published", lastUpdated: "Sep 20, 2026", views: 7650 },
  { id: "10", title: "Location, Contact & Helpdesk", slug: "/#contact", status: "Published", lastUpdated: "Sep 18, 2026", views: 5310 },
  { id: "11", title: "NAAC SSR Documentation 2026", slug: "/iqac#naac", status: "Published", lastUpdated: "Sep 15, 2026", views: 3200 },
  { id: "12", title: "Alumni Relations & Network Portal", slug: "/#alumni", status: "Published", lastUpdated: "Sep 14, 2026", views: 4120 },
];

export function PagesDashboardView({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageItem[]>(DEFAULT_PAGES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const newPage: PageItem = {
      id: Date.now().toString(),
      title: newPageTitle.trim(),
      slug: newPageSlug.trim() ? (newPageSlug.startsWith("/") ? newPageSlug : `/${newPageSlug}`) : `/${newPageTitle.toLowerCase().replace(/\s+/g, "-")}`,
      status: "Published",
      lastUpdated: "Just now",
      views: 0,
    };

    setPages([newPage, ...pages]);
    setShowNewModal(false);
    setNewPageTitle("");
    setNewPageSlug("");

    toast({
      title: "Page Created Successfully",
      description: `"${newPage.title}" has been created and published.`,
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      setPages(pages.filter((p) => p.id !== id));
      toast({
        title: "Page Removed",
        description: `"${title}" has been deleted.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Website Pages Manager</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage all 247 published and draft pages across Bishop Ambrose College portals.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-[#081526] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by name or slug..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Status:</span>
          {["All", "Published", "Draft", "Review"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Pages table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Page Name & Route</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Views</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{page.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-300" />
                          {page.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle className="w-3 h-3" />
                      {page.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {page.lastUpdated}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-slate-900">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={page.slug.startsWith("/") ? page.slug : `/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          toast({
                            title: `Editing ${page.title}`,
                            description: "Opening content editor for this section...",
                          });
                          if (page.slug.includes("about") && onNavigate) onNavigate("about");
                          else if (page.slug.includes("departments") && onNavigate) onNavigate("departments");
                          else if (page.slug.includes("admissions") && onNavigate) onNavigate("admissions");
                          else if (page.slug.includes("events") && onNavigate) onNavigate("events");
                          else if (page.slug.includes("iqac") && onNavigate) onNavigate("iqac");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Page Content"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Page Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create New Web Page</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add a new dynamic page to the BAC portal with custom URL routing.
              </p>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research & Innovation Cell"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL Route / Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. /research"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-[#081526] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create & Publish Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
