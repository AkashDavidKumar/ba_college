"use client";

import React, { useState, useMemo } from "react";
import {
  useCMSStore,
  CMSForm,
  CMSFormSubmission,
  FormField,
  FormFieldType,
} from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  Search,
  Filter,
  Copy,
  Check,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Inbox,
  Send,
  MessageSquare,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";

const FIELD_TYPES: { type: FormFieldType; label: string }[] = [
  { type: "text", label: "Single-line Text" },
  { type: "textarea", label: "Multi-line Text" },
  { type: "email", label: "Email Address" },
  { type: "phone", label: "Phone Number" },
  { type: "number", label: "Number" },
  { type: "select", label: "Dropdown Select" },
  { type: "radio", label: "Radio Selection" },
  { type: "checkbox", label: "Checkbox (Multi-select)" },
  { type: "date", label: "Date Picker" },
  { type: "url", label: "Website URL" },
];

const FORM_CATEGORIES: CMSForm["category"][] = [
  "general",
  "admissions",
  "academics",
  "feedback",
  "events",
  "department",
  "club",
];

export function FormsInquiriesCMS() {
  const {
    forms,
    formSubmissions,
    saveForm,
    deleteForm,
    publishForm,
    archiveForm,
    updateInquiryStatus,
    deleteInquiry,
    currentUser,
    canAccessDepartment,
    canAccessClub,
  } = useCMSStore();

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"forms" | "inquiries">("forms");

  // Scoped view of forms
  const scopedForms = useMemo(() => {
    return forms.filter((f) => {
      if (f.departmentId && !canAccessDepartment(f.departmentId)) return false;
      if (f.clubId && !canAccessClub(f.clubId)) return false;
      return true;
    });
  }, [forms, canAccessDepartment, canAccessClub]);

  // Scoped view of submissions
  const scopedSubmissions = useMemo(() => {
    const validFormIds = new Set(scopedForms.map((f) => f.id));
    return formSubmissions.filter((s) => validFormIds.has(s.formId) || !s.formId);
  }, [formSubmissions, scopedForms]);

  // ── Form Filter & Search State ──
  const [formSearch, setFormSearch] = useState("");
  const [formCategoryFilter, setFormCategoryFilter] = useState("all");
  const [formStatusFilter, setFormStatusFilter] = useState("all");

  const filteredForms = useMemo(() => {
    return scopedForms.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(formSearch.toLowerCase()) ||
        f.slug.toLowerCase().includes(formSearch.toLowerCase());
      const matchCategory = formCategoryFilter === "all" || f.category === formCategoryFilter;
      const matchStatus = formStatusFilter === "all" || f.status === formStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [scopedForms, formSearch, formCategoryFilter, formStatusFilter]);

  // ── Inquiry Filter & Search State ──
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryFormFilter, setInquiryFormFilter] = useState("all");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");

  const filteredSubmissions = useMemo(() => {
    return scopedSubmissions.filter((s) => {
      const answersText = Object.values(s.answers || {}).join(" ").toLowerCase();
      const matchSearch =
        s.submissionReference.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        s.formTitle.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        answersText.includes(inquirySearch.toLowerCase());
      const matchForm = inquiryFormFilter === "all" || s.formId === inquiryFormFilter;
      const matchStatus = inquiryStatusFilter === "all" || s.status === inquiryStatusFilter;
      return matchSearch && matchForm && matchStatus;
    });
  }, [scopedSubmissions, inquirySearch, inquiryFormFilter, inquiryStatusFilter]);

  // ── Form Modal State ──
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CMSForm>>({
    title: "",
    slug: "",
    description: "",
    category: "general",
    status: "draft",
    isActive: true,
    submitButtonText: "Submit",
    successMessage: "Thank you for reaching out to Bishop Ambrose College.",
    fields: [],
  });

  // ── Preview Modal State ──
  const [previewForm, setPreviewForm] = useState<CMSForm | null>(null);

  // ── Triage Modal State ──
  const [triageSubmission, setTriageSubmission] = useState<CMSFormSubmission | null>(null);
  const [triageStatus, setTriageStatus] = useState<CMSFormSubmission["status"]>("new");
  const [triageNotes, setTriageNotes] = useState("");

  // ── Delete Confirmation Dialog State ──
  const [deleteTarget, setDeleteTarget] = useState<{ type: "form" | "inquiry"; id: string; name: string } | null>(null);
  const [conflictPrompt, setConflictPrompt] = useState<{ formId: string; formTitle: string } | null>(null);

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const canManageForms =
    currentUser.role === "master_admin" ||
    currentUser.role === "sub_admin" ||
    currentUser.role === "hod" ||
    currentUser.role === "club_head" ||
    currentUser.permissions?.includes("forms:manage") ||
    currentUser.permissions?.includes("forms:write") ||
    currentUser.permissions?.includes("all") ||
    currentUser.permissions?.includes("*");

  // ── Handler: Open Create Form ──
  const handleOpenCreateForm = () => {
    setEditingFormId(null);
    setFormData({
      id: "form-" + Date.now(),
      title: "",
      slug: "",
      description: "",
      category: "general",
      status: currentUser.role === "master_admin" ? "published" : "draft",
      isActive: true,
      departmentId: currentUser.role === "hod" ? currentUser.departmentId : undefined,
      clubId: currentUser.role === "club_head" ? currentUser.clubId : undefined,
      submitButtonText: "Submit Application",
      successMessage: "Thank you for reaching out. We have received your submission.",
      fields: [
        {
          id: "fld_full_name",
          label: "Full Name",
          type: "text",
          required: true,
          order: 1,
          placeholder: "e.g. John Doe",
        },
        {
          id: "fld_email",
          label: "Email Address",
          type: "email",
          required: true,
          order: 2,
          placeholder: "e.g. john@example.com",
        },
      ],
    });
    setIsEditingForm(true);
  };

  // ── Handler: Open Edit Form ──
  const handleOpenEditForm = (form: CMSForm) => {
    setEditingFormId(form.id);
    setFormData({
      ...form,
      fields: [...form.fields],
    });
    setIsEditingForm(true);
  };

  // ── Handler: Save Form ──
  const handleSaveForm = async () => {
    if (!formData.title?.trim()) {
      toast({ title: "Validation Error", description: "Form title is required.", variant: "destructive" });
      return;
    }
    const cleanSlug = (formData.slug || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      toast({ title: "Validation Error", description: "Valid form slug is required.", variant: "destructive" });
      return;
    }

    if (!formData.fields || formData.fields.length === 0) {
      toast({ title: "Validation Error", description: "At least one form field is required.", variant: "destructive" });
      return;
    }

    try {
      const payload: Partial<CMSForm> = {
        ...formData,
        slug: cleanSlug,
        fields: formData.fields.map((f, idx) => ({ ...f, order: idx + 1 })),
      };

      await saveForm(payload, !editingFormId);
      toast({
        title: editingFormId ? "Form Updated" : "Form Created",
        description: `Successfully saved "${formData.title}".`,
      });
      setIsEditingForm(false);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "Failed to save form to backend.",
        variant: "destructive",
      });
    }
  };

  // ── Field Builder Helpers ──
  const handleAddField = () => {
    const currentFields = formData.fields || [];
    const newFieldId = `fld_${Date.now().toString(36)}`;
    const newField: FormField = {
      id: newFieldId,
      label: `Field ${currentFields.length + 1}`,
      type: "text",
      required: false,
      order: currentFields.length + 1,
      placeholder: "",
    };
    setFormData({
      ...formData,
      fields: [...currentFields, newField],
    });
  };

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    const currentFields = [...(formData.fields || [])];
    currentFields[index] = { ...currentFields[index], ...updates };
    setFormData({ ...formData, fields: currentFields });
  };

  const handleDeleteField = (index: number) => {
    const currentFields = [...(formData.fields || [])];
    currentFields.splice(index, 1);
    setFormData({ ...formData, fields: currentFields });
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const currentFields = [...(formData.fields || [])];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === currentFields.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = currentFields[index];
    currentFields[index] = currentFields[targetIdx];
    currentFields[targetIdx] = temp;
    setFormData({ ...formData, fields: currentFields });
  };

  // ── Handler: Delete Form with Conflict Protection ──
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "inquiry") {
      try {
        await deleteInquiry(deleteTarget.id);
        toast({ title: "Inquiry Deleted", description: "Submission record removed." });
      } catch (err: any) {
        toast({ title: "Deletion Failed", description: err?.message || "Failed to delete submission.", variant: "destructive" });
      }
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.type === "form") {
      try {
        await deleteForm(deleteTarget.id, false);
        toast({ title: "Form Deleted", description: `"${deleteTarget.name}" was permanently deleted.` });
        setDeleteTarget(null);
      } catch (err: any) {
        // If 409 Conflict (FORM_HAS_SUBMISSIONS), show conflict prompt
        if (err?.status === 409 || err?.message?.includes("submission")) {
          setDeleteTarget(null);
          setConflictPrompt({ formId: deleteTarget.id, formTitle: deleteTarget.name });
        } else {
          toast({
            title: "Delete Failed",
            description: err?.message || "Cannot delete form.",
            variant: "destructive",
          });
          setDeleteTarget(null);
        }
      }
    }
  };

  const handleArchiveConflictForm = async () => {
    if (!conflictPrompt) return;
    try {
      await deleteForm(conflictPrompt.formId, true);
      toast({
        title: "Form Archived",
        description: `"${conflictPrompt.formTitle}" has been safely archived to protect existing applicant submissions.`,
      });
    } catch (err: any) {
      toast({ title: "Archive Failed", description: err?.message || "Could not archive form.", variant: "destructive" });
    }
    setConflictPrompt(null);
  };

  // ── Handler: Open Triage Modal ──
  const handleOpenTriage = (sub: CMSFormSubmission) => {
    setTriageSubmission(sub);
    setTriageStatus(sub.status);
    setTriageNotes(sub.notes || "");
  };

  const handleSaveTriage = async () => {
    if (!triageSubmission) return;
    try {
      await updateInquiryStatus(triageSubmission.id, triageStatus, triageNotes);
      toast({
        title: "Inquiry Updated",
        description: `Status changed to ${triageStatus.toUpperCase()} for ${triageSubmission.submissionReference}.`,
      });
      setTriageSubmission(null);
    } catch (err: any) {
      toast({ title: "Update Failed", description: err?.message || "Failed to update triage status.", variant: "destructive" });
    }
  };

  const copySlugUrl = (slug: string) => {
    const url = `/forms/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedSlug(slug);
    toast({ title: "Link Copied", description: `Path "${url}" copied to clipboard.` });
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms & Inquiries Engine"
        subtitle="Design dynamic institutional inquiry forms, manage validation schemas, and triage incoming submissions with full reference tracking."
        actions={
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab("forms")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "forms" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Forms Builder ({scopedForms.length})
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "inquiries" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Submissions ({scopedSubmissions.length})
              </button>
            </div>

            {activeTab === "forms" && canManageForms && (
              <button
                onClick={handleOpenCreateForm}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Form
              </button>
            )}
          </div>
        }
      />

      {/* ── TAB 1: FORMS BUILDER ── */}
      {activeTab === "forms" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search forms by title or slug..."
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={formCategoryFilter}
                onChange={(e) => setFormCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {FORM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={formStatusFilter}
                onChange={(e) => setFormStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Forms Grid */}
          {filteredForms.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No Forms Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {formSearch || formCategoryFilter !== "all" || formStatusFilter !== "all"
                  ? "Try adjusting your search query or category filters."
                  : "No dynamic forms have been created yet. Click 'Create Form' to build one."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((form) => {
                const subCount = formSubmissions.filter((s) => s.formId === form.id || s.formSlug === form.slug).length;
                return (
                  <div
                    key={form.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                              form.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : form.status === "archived"
                                ? "bg-slate-100 text-slate-600 border border-slate-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {form.status}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                            {form.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Inbox className="w-3 h-3" /> {subCount}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{form.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {form.description || "No public description specified."}
                      </p>

                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 mb-3 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-600 truncate">/forms/{form.slug}</span>
                        <button
                          onClick={() => copySlugUrl(form.slug)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          title="Copy Public URL"
                        >
                          {copiedSlug === form.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>{form.fields.length} dynamic fields</span>
                        <span>•</span>
                        <span>{form.isActive ? "Active Submissions" : "Submissions Paused"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewForm(form)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview Form"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageForms && (
                          <button
                            onClick={() => handleOpenEditForm(form)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Form"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {canManageForms && form.status !== "published" && (
                          <button
                            onClick={() => publishForm(form.id)}
                            className="text-[11px] text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        {canManageForms && form.status === "published" && (
                          <button
                            onClick={() => archiveForm(form.id)}
                            className="text-[11px] text-slate-500 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                          >
                            Archive
                          </button>
                        )}
                        {canManageForms && (
                          <button
                            onClick={() => setDeleteTarget({ type: "form", id: form.id, name: form.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: INQUIRIES & SUBMISSIONS ── */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total Inquiries", count: scopedSubmissions.length, color: "text-slate-900", bg: "bg-slate-50" },
              { label: "New", count: scopedSubmissions.filter((s) => s.status === "new").length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "In Review", count: scopedSubmissions.filter((s) => s.status === "in_review").length, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Responded", count: scopedSubmissions.filter((s) => s.status === "responded").length, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Resolved", count: scopedSubmissions.filter((s) => s.status === "resolved").length, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat, i) => (
              <div key={i} className={`p-3 rounded-xl border border-slate-200 ${stat.bg}`}>
                <div className="text-[11px] font-medium text-slate-500">{stat.label}</div>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.count}</div>
              </div>
            ))}
          </div>

          {/* Inquiry Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, form, or answers..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={inquiryFormFilter}
                onChange={(e) => setInquiryFormFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Forms</option>
                {scopedForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>

              <select
                value={inquiryStatusFilter}
                onChange={(e) => setInquiryStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No Submissions Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No inquiry submissions match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Form</th>
                      <th className="py-3 px-4">Answers Preview</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub) => {
                      const answersPreview = Object.entries(sub.answers || {})
                        .slice(0, 2)
                        .map(([k, v]) => `${k.replace("fld_", "")}: ${String(v)}`)
                        .join(" • ");

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {sub.submissionReference}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{sub.formTitle || sub.formSlug}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{answersPreview || "—"}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{sub.submittedAt}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                                sub.status === "new"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : sub.status === "in_review"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : sub.status === "responded"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : sub.status === "resolved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {sub.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenTriage(sub)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md font-medium text-xs transition-colors"
                              >
                                Triage
                              </button>
                              {canManageForms && (
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "inquiry",
                                      id: sub.id,
                                      name: sub.submissionReference,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT FORM BUILDER ── */}
      {isEditingForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {editingFormId ? "Edit Form Configuration" : "Create New Institutional Form"}
              </h2>
              <button
                onClick={() => setIsEditingForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Form Title *</label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData({
                        ...formData,
                        title: newTitle,
                        slug: !editingFormId
                          ? newTitle
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9-]/g, "-")
                              .replace(/-+/g, "-")
                          : formData.slug,
                      });
                    }}
                    placeholder="e.g. Undergraduate Admissions Query 2026"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. ug-admissions-query"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || "general"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CMSForm["category"] })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {FORM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Submit Button Label</label>
                  <input
                    type="text"
                    value={formData.submitButtonText || "Submit"}
                    onChange={(e) => setFormData({ ...formData, submitButtonText: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Explain the purpose of this inquiry form to applicants..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmation / Success Message</label>
                <input
                  type="text"
                  value={formData.successMessage || ""}
                  onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                  placeholder="e.g. Thank you! Our admissions office will respond within 2 business days."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Form Fields & Schema</h3>
                    <p className="text-[11px] text-slate-500">Configure inputs, requirements, and options.</p>
                  </div>
                  <button
                    onClick={handleAddField}
                    type="button"
                    className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Input Field
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.fields || []).map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-[11px] font-mono text-slate-400 w-5">#{idx + 1}</span>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                            placeholder="Field Label (e.g. Mobile Number)"
                            className="text-xs font-medium p-1.5 bg-white border border-slate-200 rounded-lg flex-1 focus:outline-none"
                          />
                        </div>

                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, { type: e.target.value as FormFieldType })}
                          className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.type} value={t.type}>
                              {t.label}
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0"
                          />
                          Required
                        </label>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, "down")}
                            disabled={idx === (formData.fields?.length || 0) - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div>
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                            placeholder="Optional Placeholder text"
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                          />
                        </div>

                        {["select", "radio", "checkbox"].includes(field.type) && (
                          <div>
                            <input
                              type="text"
                              value={(field.options || []).join(", ")}
                              onChange={(e) =>
                                handleUpdateField(idx, {
                                  options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                })
                              }
                              placeholder="Options (comma-separated, e.g. B.Sc, B.Com, BCA)"
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                            />
                          </div>
                        )}

                        {field.type === "number" && (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={field.validation?.min ?? ""}
                              onChange={(e) =>
                                handleUpdateField(idx, {
                                  validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined },
                                })
                              }
                              placeholder="Min Value"
                              className="w-1/2 text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                            />
                            <input
                              type="number"
                              value={field.validation?.max ?? ""}
                              onChange={(e) =>
                                handleUpdateField(idx, {
                                  validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined },
                                })
                              }
                              placeholder="Max Value"
                              className="w-1/2 text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsEditingForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INTERACTIVE FORM PREVIEW ── */}
      {previewForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant View Preview</span>
              <button onClick={() => setPreviewForm(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-base font-bold text-slate-900">{previewForm.title}</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">{previewForm.description}</p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {previewForm.fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>

                  {f.type === "textarea" ? (
                    <textarea
                      placeholder={f.placeholder}
                      disabled
                      rows={3}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  ) : f.type === "select" ? (
                    <select disabled className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <option>Select an option...</option>
                      {(f.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "radio" ? (
                    <div className="space-y-1.5 pt-1">
                      {(f.options || []).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="radio" disabled name={f.id} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : f.type === "checkbox" ? (
                    <div className="space-y-1.5 pt-1">
                      {(f.options || []).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" disabled />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={f.type === "phone" ? "tel" : f.type}
                      placeholder={f.placeholder}
                      disabled
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                disabled
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm opacity-90 cursor-not-allowed"
              >
                {previewForm.submitButtonText || "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INQUIRY TRIAGE & DETAILS ── */}
      {triageSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {triageSubmission.submissionReference}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{triageSubmission.formTitle}</h3>
              </div>
              <button onClick={() => setTriageSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Submitted Responses</h4>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                  {Object.entries(triageSubmission.answers || {}).map(([key, val]) => (
                    <div key={key} className="text-xs border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                      <span className="font-medium text-slate-500 block text-[11px]">{key.replace("fld_", "").replace(/_/g, " ")}:</span>
                      <span className="text-slate-900 font-semibold whitespace-pre-wrap">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Triage Status</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as CMSFormSubmission["status"])}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="new">New (Unassigned / Pending Review)</option>
                  <option value="in_review">In Review (Under Administrative Evaluation)</option>
                  <option value="responded">Responded (Applicant Contacted)</option>
                  <option value="resolved">Resolved (Completed)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Response Notes & Remarks</label>
                <textarea
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  rows={3}
                  placeholder="Record administrative actions, counselor remarks, or telephone follow-up notes..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setTriageSubmission(null)}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveTriage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Save Triage Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFLICT CONFIRMATION DIALOG (409 SUBMISSION PROTECTION) ── */}
      {conflictPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-amber-200 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Form Has Existing Submissions</h3>
                <p className="text-xs text-slate-600 mt-1">
                  "{conflictPrompt.formTitle}" cannot be hard-deleted because candidate inquiries are attached to it.
                  Hard-deleting would orphan applicant records.
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Would you like to <strong>Archive</strong> this form instead? Archiving stops new submissions while
                  safely preserving all existing historical records.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setConflictPrompt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConflictForm}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors"
              >
                Archive Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STANDARD DELETE CONFIRMATION DIALOG ── */}
      <ConfirmationDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === "form" ? "Delete Form" : "Delete Submission"}
        description={
          deleteTarget?.type === "form"
            ? `Are you sure you want to delete "${deleteTarget?.name}"? If inquiries exist, deletion will be blocked to protect data integrity.`
            : `Are you sure you want to delete inquiry submission "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
