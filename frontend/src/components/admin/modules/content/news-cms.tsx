"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Newspaper, Plus, Eye, Calendar, User, 
  Trash2, Edit3, Image, Tag, Share2 
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  category: "Campus News" | "Press Release" | "Research & Innovation" | "Student Life" | "Alumni Spotlight";
  summary: string;
  content: string;
  author: string;
  publishDate: string;
  coverImage: string;
  tags: string[];
  viewsCount: number;
  featured: boolean;
  status: ContentStatus;
}

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Bishop Ambrose College Accorded Autonomous Status by UGC with Top Accreditation",
    category: "Campus News",
    summary: "The University Grants Commission (UGC) confers Fresh Autonomous Status to Bishop Ambrose College starting from the current academic session.",
    content: "The Autonomous status allows the institution to design outcome-based curricula, introduce state-of-the-art industry certifications, modern continuous internal assessment systems, and conduct autonomous end-semester examinations under Bharathiar University.",
    author: "College Information Bureau",
    publishDate: "2025-01-05",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
    tags: ["UGC Autonomy", "Accreditation", "Bharathiar University", "Milestone"],
    viewsCount: 1420,
    featured: true,
    status: "published",
  },
  {
    id: "news-2",
    title: "Over 85% Students Placed in Phase-1 Campus Recruitment Drive 2024–25",
    category: "Campus News",
    summary: "Leading tech firms and banks recruit final year students with attractive CTC packages.",
    content: "Prominent recruiters including Infosys, TCS, Wipro, HCL, Cognizant, and South Indian Bank offered coveted job positions to our graduates during the first wave of on-campus interviews.",
    author: "Placement Bureau",
    publishDate: "2024-12-22",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    tags: ["Placements", "Career Success", "MNCs", "Recruitment"],
    viewsCount: 980,
    featured: true,
    status: "published",
  },
  {
    id: "news-3",
    title: "Faculty Research Team Secures Major DST-SERB Innovation Project Grant",
    category: "Research & Innovation",
    summary: "Department of Computer Science faculty awarded ₹28 Lakh research fund for AI healthcare diagnosis model.",
    content: "The grant aims to build deep learning computer vision architectures for early detection of diabetic retinopathy using edge computing devices in rural healthcare centers.",
    author: "Research Cell",
    publishDate: "2024-11-18",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
    tags: ["Research", "DST SERB", "AI Healthcare", "Innovation"],
    viewsCount: 650,
    featured: false,
    status: "published",
  },
];

export function NewsCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const [tagInput, setTagInput] = useState("");

  const handleOpenEditor = (art?: NewsArticle) => {
    if (art) {
      setSelectedArticle(art);
    } else {
      setSelectedArticle({
        id: "news-" + Date.now(),
        title: "",
        category: "Campus News",
        summary: "",
        content: "",
        author: currentUser.name,
        publishDate: new Date().toISOString().split("T")[0],
        coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
        tags: ["Campus"],
        viewsCount: 0,
        featured: false,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    if (articles.some((a) => a.id === selectedArticle.id)) {
      setArticles((prev) => prev.map((a) => (a.id === selectedArticle.id ? selectedArticle : a)));
      logAction({
        action: "UPDATE",
        module: "News & Press Releases",
        recordId: selectedArticle.id,
        recordTitle: selectedArticle.title,
      });
    } else {
      setArticles((prev) => [selectedArticle, ...prev]);
      logAction({
        action: "CREATE",
        module: "News & Press Releases",
        recordId: selectedArticle.id,
        recordTitle: selectedArticle.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedArticle(null);
  };

  const handleDelete = () => {
    if (!articleToDelete) return;
    setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
    logAction({
      action: "DELETE",
      module: "News & Press Releases",
      recordId: articleToDelete.id,
      recordTitle: articleToDelete.title,
    });
    setArticleToDelete(null);
  };

  const handleAddTag = () => {
    if (!selectedArticle || !tagInput.trim()) return;
    setSelectedArticle({
      ...selectedArticle,
      tags: [...(selectedArticle.tags || []), tagInput.trim()],
    });
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    if (!selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      tags: selectedArticle.tags.filter((_, i) => i !== index),
    });
  };

  const columns: Column<NewsArticle>[] = [
    {
      key: "title",
      header: "News Headline & Summary",
      sortable: true,
      render: (art) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 flex items-center gap-2">
              {art.title}
              {art.featured && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Featured
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{art.summary}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (art) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {art.category}
        </span>
      ),
    },
    {
      key: "publishDate",
      header: "Published On",
      sortable: true,
      render: (art) => (
        <div className="text-xs">
          <div className="font-mono text-slate-700 dark:text-slate-300">{art.publishDate}</div>
          <div className="text-slate-400 text-[11px]">{art.author}</div>
        </div>
      ),
    },
    {
      key: "viewsCount",
      header: "Views",
      sortable: true,
      render: (art) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{art.viewsCount} reads</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (art) => <StatusBadge status={art.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (art) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(art)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Article"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setArticleToDelete(art)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Article"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus News & Press Releases"
        description="Publish institutional updates, media releases, faculty research milestones, and campus spotlights."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Content", href: "#" },
          { label: "News" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Write News Article
          </button>
        }
      />

      <DataTable
        data={articles}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search news by headline or tag..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {articles.some((a) => a.id === selectedArticle.id) ? "Edit News Story" : "Write New Article"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  value={selectedArticle.title}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                  placeholder="e.g. Bishop Ambrose College Accorded Autonomous Status"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    News Category *
                  </label>
                  <select
                    value={selectedArticle.category}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Campus News">Campus News</option>
                    <option value="Press Release">Official Press Release</option>
                    <option value="Research & Innovation">Research & Innovation</option>
                    <option value="Student Life">Student Life</option>
                    <option value="Alumni Spotlight">Alumni Spotlight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author / Desk
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.author}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, author: e.target.value })}
                    placeholder="e.g. College Information Bureau"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Excerpt / Lead Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={selectedArticle.summary}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, summary: e.target.value })}
                  placeholder="1-2 sentences summarizing the key announcement..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Article Body *
                </label>
                <textarea
                  required
                  rows={6}
                  value={selectedArticle.content}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content: e.target.value })}
                  placeholder="Enter full news report, quotes, quotes from the Principal/Secretary, statistics..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.coverImage}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedArticle.featured}
                      onChange={(e) => setSelectedArticle({ ...selectedArticle, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Feature on Homepage Top News Carousel
                    </span>
                  </label>
                </div>
              </div>

              {/* Tag editing */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tags & Keywords
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (e.g. Autonomy, Placements)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedArticle.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Publish News
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete News Article"
        description={`Are you sure you want to delete "${articleToDelete?.title}"?`}
        confirmText="Delete Article"
        variant="danger"
      />
    </div>
  );
}
