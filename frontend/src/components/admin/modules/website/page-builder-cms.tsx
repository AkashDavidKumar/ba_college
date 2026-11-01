"use client";

import React, { useState } from "react";
import { useCMSStore, DynamicPage, PageBlock } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  Heading,
  Type,
  Video,
  List,
  CheckSquare,
  HelpCircle,
  Table as TableIcon,
  FolderOpen,
  Calendar,
  Users,
  GraduationCap,
  Mail,
  Sparkles,
  Save,
  Globe,
  Copy,
  ChevronLeft,
} from "lucide-react";

const AVAILABLE_BLOCK_TYPES = [
  { type: "heading", label: "Section Heading", icon: Heading, desc: "Title with optional eyebrow tag & description" },
  { type: "text", label: "Paragraph / Text", icon: Type, desc: "Clean body text and academic narrative" },
  { type: "image", label: "Image Banner", icon: ImageIcon, desc: "Full-width or framed responsive image" },
  { type: "cards", label: "Feature Cards Grid", icon: Layers, desc: "3 or 4-column cards with icons & text" },
  { type: "stats", label: "Statistics Counters", icon: Sparkles, desc: "Numerical metrics and milestone indicators" },
  { type: "faq", label: "FAQ & Accordion", icon: HelpCircle, desc: "Expandable questions and answers" },
  { type: "documents", label: "Document Downloads", icon: FolderOpen, desc: "List of downloadable PDFs with file size" },
  { type: "gallery", label: "Photo Gallery", icon: ImageIcon, desc: "Multi-photo grid with captions" },
  { type: "video", label: "Video Player", icon: Video, desc: "YouTube / MP4 embedded video player" },
  { type: "table", label: "Data Table", icon: TableIcon, desc: "Tabular syllabus or fee matrix" },
  { type: "cta", label: "Call to Action", icon: CheckSquare, desc: "Bold banner with action button" },
];

export function PageBuilderCMS() {
  const { pages, savePage, deletePage, currentUser } = useCMSStore();
  const { toast } = useToast();

  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form State for Page Editing
  const [formData, setFormData] = useState<Partial<DynamicPage>>({
    title: "",
    slug: "",
    description: "",
    pageType: "standard",
    bannerImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    blocks: [],
    seo: { metaTitle: "", metaDescription: "" },
    status: "published",
  });

  const handleCreateNew = () => {
    setFormData({
      id: "page-" + Date.now(),
      title: "",
      slug: "",
      description: "",
      pageType: "standard",
      bannerImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
      blocks: [
        { id: "b-1", type: "heading", content: { title: "Welcome to this Page", subtitle: "Bishop Ambrose College" }, order: 1, visible: true },
        { id: "b-2", type: "text", content: { text: "Provide detailed institutional information here..." }, order: 2, visible: true },
      ],
      seo: { metaTitle: "", metaDescription: "" },
      status: currentUser.role === "master_admin" ? "published" : "submitted",
    });
    setEditingPage(null);
    setIsCreating(true);
  };

  const handleEdit = (page: DynamicPage) => {
    setFormData({ ...page });
    setEditingPage(page);
    setIsCreating(true);
  };

  const handleAddBlock = (type: string) => {
    const newBlock: PageBlock = {
      id: "b-" + Date.now(),
      type: type as any,
      order: (formData.blocks?.length || 0) + 1,
      visible: true,
      content:
        type === "heading"
          ? { title: "New Section Title", subtitle: "Brief description of section" }
          : type === "text"
          ? { text: "Add your text content here." }
          : type === "cards"
          ? { cards: [{ title: "Feature 1", desc: "Feature details..." }, { title: "Feature 2", desc: "Feature details..." }] }
          : type === "stats"
          ? { stats: [{ label: "Students", value: "5,000+" }, { label: "Faculty", value: "95+" }] }
          : type === "faq"
          ? { faqs: [{ q: "What is the eligibility?", a: "Minimum 50% in +2 examination." }] }
          : { title: "New Block", text: "Sample content" },
    };
    setFormData({
      ...formData,
      blocks: [...(formData.blocks || []), newBlock],
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.filter((b) => b.id !== blockId),
    });
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const blocks = [...(formData.blocks || [])];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const target = direction === "up" ? index - 1 : index + 1;
    const temp = blocks[index];
    blocks[index] = blocks[target];
    blocks[target] = temp;
    blocks.forEach((b, i) => (b.order = i + 1));
    setFormData({ ...formData, blocks });
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.slug?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both a page title and a unique URL slug.",
        variant: "destructive",
      });
      return;
    }

    savePage(formData, !editingPage);
    toast({
      title: editingPage ? "Page Updated" : "Page Created",
      description: `Page '${formData.title}' has been successfully ${
        currentUser.role === "master_admin" ? "published" : "submitted for review"
      }.`,
    });
    setIsCreating(false);
  };

  const columns: Column<DynamicPage>[] = [
    {
      key: "title",
      header: "Page Title & URL",
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-800 text-sm">{p.title}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{p.slug}</div>
        </div>
      ),
    },
    {
      key: "pageType",
      header: "Type",
      render: (p) => (
        <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
          {p.pageType}
        </span>
      ),
    },
    {
      key: "blocks",
      header: "Blocks",
      render: (p) => <span className="font-semibold text-xs">{p.blocks?.length || 0} blocks</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (p) => (
        <span className="text-slate-500 text-[11px]">
          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-IN") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleEdit(p)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Edit Page"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(p.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
            title="Delete Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {!isCreating ? (
        <>
          <PageHeader
            title="Dynamic Page Builder"
            subtitle="Create and publish custom institutional pages with rich modular blocks without writing code."
            badge={`${pages.length} Custom Pages`}
            breadcrumbs={[
              { label: "Dashboard", onClick: () => {} },
              { label: "Website" },
              { label: "Pages" },
            ]}
            action={{
              label: "Create New Page",
              icon: Plus,
              onClick: handleCreateNew,
            }}
          />

          <DataTable
            data={pages}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search custom pages by title or slug..."
            filterKey="status"
            filterLabel="Status"
            filterOptions={[
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
              { label: "Submitted", value: "submitted" },
            ]}
            emptyTitle="No custom pages created yet"
            emptyDescription="Create your first custom academic, research, or department landing page."
            emptyActionLabel="Create First Page"
            onEmptyAction={handleCreateNew}
            onRowClick={handleEdit}
          />
        </>
      ) : (
        /* Page Builder Editor View */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  {editingPage ? `Editing: ${formData.title}` : "New Custom Page"}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure page metadata, banner, modular content blocks, and SEO settings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" /> Save & Publish
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: General Meta */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-serif border-b border-slate-100 pb-2">
                Page Metadata
              </h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research & Development Centre"
                  value={formData.title}
                  onChange={(e) => {
                    const t = e.target.value;
                    const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, title: t, slug: formData.slug || slug });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 text-xs">/</span>
                  <input
                    type="text"
                    required
                    placeholder="research-centre"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-r-xl border border-slate-200 text-xs focus:border-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary displayed on listings..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-800 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-slate-800 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted for Approval</option>
                </select>
              </div>
            </div>

            {/* Right: Modular Block Builder */}
            <div className="lg:col-span-2 space-y-4">
              {/* Add Block Bar */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Add Content Blocks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BLOCK_TYPES.map((b) => {
                    const Icon = b.icon;
                    return (
                      <button
                        key={b.type}
                        onClick={() => handleAddBlock(b.type)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        title={b.desc}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#009688]" />
                        <span>{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blocks Stack */}
              <div className="space-y-3">
                {formData.blocks?.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-10 text-center text-xs text-slate-500">
                    No content blocks added yet. Click one of the buttons above to insert your first section.
                  </div>
                ) : (
                  formData.blocks?.map((block, idx) => (
                    <div
                      key={block.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#009688]/10 text-[#009688] font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                            {block.type.replace("_", " ")} Block
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveBlock(idx, "up")}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === (formData.blocks?.length || 1) - 1}
                            onClick={() => handleMoveBlock(idx, "down")}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Block Specific Form Fields */}
                      {block.type === "heading" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Section Title"
                            value={block.content.title || ""}
                            onChange={(e) => {
                              const updated = [...(formData.blocks || [])];
                              updated[idx].content.title = e.target.value;
                              setFormData({ ...formData, blocks: updated });
                            }}
                            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle / Tagline"
                            value={block.content.subtitle || ""}
                            onChange={(e) => {
                              const updated = [...(formData.blocks || [])];
                              updated[idx].content.subtitle = e.target.value;
                              setFormData({ ...formData, blocks: updated });
                            }}
                            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                          />
                        </div>
                      )}

                      {block.type === "text" && (
                        <textarea
                          rows={4}
                          placeholder="Enter body text..."
                          value={block.content.text || ""}
                          onChange={(e) => {
                            const updated = [...(formData.blocks || [])];
                            updated[idx].content.text = e.target.value;
                            setFormData({ ...formData, blocks: updated });
                          }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                        />
                      )}

                      {block.type !== "heading" && block.type !== "text" && (
                        <p className="text-xs text-slate-500 italic">
                          Block configured with standard Bishop Ambrose College theme styling.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deletePage(deleteConfirmId);
            toast({ title: "Page Deleted", description: "Custom page has been removed." });
          }
        }}
        title="Delete Custom Page"
        description="Are you sure you want to permanently delete this page? This action will remove it from the public website navigation."
        confirmLabel="Delete Page"
        confirmVariant="danger"
      />
    </div>
  );
}
