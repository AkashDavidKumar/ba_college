"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCMSStore } from "@/lib/cms-store";
import { clubService } from "@/lib/api/club-service";
import {
  Club,
  AdminClubMembership,
  ClubCategory,
  ClubStatus,
  MembershipRole,
  MembershipStatus,
  CLUB_CATEGORIES,
  CLUB_STATUSES,
  MEMBERSHIP_ROLES,
  MEMBERSHIP_STATUSES,
} from "@/types/club";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { StatCard } from "@/components/admin/core/stat-card";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";
import {
  Users,
  Plus,
  Award,
  Mail,
  CheckCircle,
  XCircle,
  Trash2,
  Edit3,
  Shield,
  Star,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  MapPin,
  Check,
} from "lucide-react";

export function ClubsCMS() {
  const { currentUser, users } = useCMSStore();
  const { toast } = useToast();

  // Navigation tab: 'clubs' | 'memberships'
  const [activeTab, setActiveTab] = useState<"clubs" | "memberships">("clubs");

  // ── Clubs State ─────────────────────────────────────────────────────────────
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [clubsError, setClubsError] = useState<string | null>(null);

  // Filters for Clubs
  const [clubCategoryFilter, setClubCategoryFilter] = useState<string>("All");
  const [clubStatusFilter, setClubStatusFilter] = useState<string>("All");

  // Modals / Actions for Clubs
  const [isClubEditorOpen, setIsClubEditorOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Partial<Club> | null>(null);
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);

  const [clubToArchive, setClubToArchive] = useState<Club | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const [clubForHeadAssignment, setClubForHeadAssignment] = useState<Club | null>(null);
  const [selectedHeadUserId, setSelectedHeadUserId] = useState<string>("");
  const [studentHeadNameInput, setStudentHeadNameInput] = useState<string>("");
  const [isAssigningHead, setIsAssigningHead] = useState(false);

  const [reconcilingClubId, setReconcilingClubId] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState("");

  // ── Memberships State ───────────────────────────────────────────────────────
  const [selectedClubForMembers, setSelectedClubForMembers] = useState<string>("");
  const [memberships, setMemberships] = useState<AdminClubMembership[]>([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);
  const [membershipsError, setMembershipsError] = useState<string | null>(null);

  // Filters for Memberships
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>("All");
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>("All");

  // Membership Modals / Actions
  const [memberToApprove, setMemberToApprove] = useState<AdminClubMembership | null>(null);
  const [memberToReject, setMemberToReject] = useState<AdminClubMembership | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [memberToEdit, setMemberToEdit] = useState<AdminClubMembership | null>(null);
  const [updatedMemberRole, setUpdatedMemberRole] = useState<MembershipRole>("member");
  const [updatedMemberStatus, setUpdatedMemberStatus] = useState<MembershipStatus>("active");
  const [updatedMemberNotes, setUpdatedMemberNotes] = useState("");
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  // ── Permissions Helpers ─────────────────────────────────────────────────────
  const isInstitutionalAdmin = useMemo(() => {
    return (
      currentUser.role === "master_admin" ||
      currentUser.role === "sub_admin" ||
      (currentUser.role as string) === "ADMIN"
    );
  }, [currentUser.role]);

  const isClubHead = useMemo(() => {
    return currentUser.role === "club_head";
  }, [currentUser.role]);

  const userAssignedClubSlug = useMemo(() => {
    return (currentUser.clubId || "").toLowerCase().trim();
  }, [currentUser.clubId]);

  // ── 1. Fetch Clubs ──────────────────────────────────────────────────────────
  const fetchClubs = useCallback(async () => {
    setIsLoadingClubs(true);
    setClubsError(null);
    try {
      const res = await clubService.getAdminClubs({
        category: clubCategoryFilter,
        status: clubStatusFilter,
      });
      const data = res.data || [];

      // Club heads only see their own assigned club
      const filtered = isClubHead && userAssignedClubSlug
        ? data.filter((c) => c.slug.toLowerCase() === userAssignedClubSlug)
        : data;

      setClubs(filtered);

      // Auto-select first available club for membership view if not set
      if (filtered.length > 0 && !selectedClubForMembers) {
        setSelectedClubForMembers(filtered[0].slug);
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load clubs from server.";
      setClubsError(msg);
      toast({ title: "Error Loading Clubs", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingClubs(false);
    }
  }, [clubCategoryFilter, clubStatusFilter, isClubHead, userAssignedClubSlug, selectedClubForMembers, toast]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // ── 2. Fetch Memberships for Selected Club ──────────────────────────────────
  const fetchMemberships = useCallback(async (clubSlugOrId: string) => {
    if (!clubSlugOrId) {
      setMemberships([]);
      return;
    }
    setIsLoadingMemberships(true);
    setMembershipsError(null);
    try {
      const res = await clubService.getClubMemberships(clubSlugOrId, {
        status: memberStatusFilter,
        role: memberRoleFilter,
      });
      setMemberships(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load club memberships.";
      setMembershipsError(msg);
      toast({ title: "Error Loading Memberships", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingMemberships(false);
    }
  }, [memberStatusFilter, memberRoleFilter, toast]);

  useEffect(() => {
    if (selectedClubForMembers) {
      fetchMemberships(selectedClubForMembers);
    }
  }, [selectedClubForMembers, fetchMemberships]);

  // ── 3. Club Editor Actions ──────────────────────────────────────────────────
  const handleOpenCreateClub = () => {
    if (!isInstitutionalAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only institutional administrators may create new clubs.",
        variant: "destructive",
      });
      return;
    }
    setEditingClub({
      name: "",
      slug: "",
      code: "",
      category: "Cultural",
      description: "",
      facultyCoordinator: currentUser.name || "Faculty Coordinator",
      facultyCoordinatorEmail: "",
      contactEmail: "",
      bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      logoUrl: "",
      meetingSchedule: "Weekly on Wednesdays, 4:00 PM",
      roomOrVenue: "Auditorium / Seminar Hall 2",
      isRecruiting: true,
      isPublished: true,
      achievements: [],
    });
    setIsClubEditorOpen(true);
  };

  const handleOpenEditClub = (club: Club) => {
    setEditingClub({ ...club });
    setIsClubEditorOpen(true);
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;

    setIsSubmittingClub(true);
    try {
      const isNew = !editingClub._id;
      if (isNew) {
        if (!isInstitutionalAdmin) {
          throw new Error("Only institutional administrators may create new clubs.");
        }
        await clubService.createClub({
          name: editingClub.name || "",
          slug: editingClub.slug || "",
          code: editingClub.code || "",
          category: editingClub.category || "Cultural",
          description: editingClub.description || "",
          departmentId: editingClub.departmentId || undefined,
          facultyCoordinator: editingClub.facultyCoordinator || "",
          facultyCoordinatorEmail: editingClub.facultyCoordinatorEmail || undefined,
          contactEmail: editingClub.contactEmail || "",
          logoUrl: editingClub.logoUrl || undefined,
          bannerImage: editingClub.bannerImage || undefined,
          meetingSchedule: editingClub.meetingSchedule || undefined,
          roomOrVenue: editingClub.roomOrVenue || undefined,
          isRecruiting: editingClub.isRecruiting ?? true,
          isPublished: editingClub.isPublished ?? true,
          featuredOrder: editingClub.featuredOrder ?? 0,
        });
        toast({ title: "Club Created", description: `Club '${editingClub.name}' was created successfully.` });
      } else {
        const targetId = editingClub.slug || editingClub._id!;
        await clubService.updateClub(targetId, {
          name: editingClub.name,
          slug: isInstitutionalAdmin ? editingClub.slug : undefined,
          code: isInstitutionalAdmin ? editingClub.code : undefined,
          category: isInstitutionalAdmin ? editingClub.category : undefined,
          description: editingClub.description,
          facultyCoordinator: editingClub.facultyCoordinator,
          facultyCoordinatorEmail: editingClub.facultyCoordinatorEmail,
          contactEmail: editingClub.contactEmail,
          logoUrl: editingClub.logoUrl,
          bannerImage: editingClub.bannerImage,
          meetingSchedule: editingClub.meetingSchedule,
          roomOrVenue: editingClub.roomOrVenue,
          isRecruiting: editingClub.isRecruiting,
          isPublished: isInstitutionalAdmin ? editingClub.isPublished : undefined,
          status: isInstitutionalAdmin ? editingClub.status : undefined,
          achievements: editingClub.achievements,
        });
        toast({ title: "Club Updated", description: `Club '${editingClub.name}' was updated successfully.` });
      }
      setIsClubEditorOpen(false);
      setEditingClub(null);
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save club details.";
      toast({ title: "Error Saving Club", description: msg, variant: "destructive" });
    } finally {
      setIsSubmittingClub(false);
    }
  };

  // ── 4. Archival Handling ────────────────────────────────────────────────────
  const handleArchiveClub = async () => {
    if (!clubToArchive) return;
    setIsArchiving(true);
    try {
      // If club has active members, send force=true with user notice
      const hasActive = (clubToArchive.memberCount || 0) > 0;
      await clubService.archiveClub(clubToArchive.slug || clubToArchive._id, hasActive);
      toast({
        title: "Club Archived",
        description: `Club '${clubToArchive.name}' has been soft-archived.${
          hasActive ? ` Active members were transitioned to inactive.` : ""
        }`,
      });
      setClubToArchive(null);
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to archive club.";
      toast({ title: "Archival Failed", description: msg, variant: "destructive" });
    } finally {
      setIsArchiving(false);
    }
  };

  // ── 5. Leadership Assignment Handling ───────────────────────────────────────
  const handleAssignHead = async () => {
    if (!clubForHeadAssignment || !selectedHeadUserId) {
      toast({ title: "User Required", description: "Please select a user to assign as Club Head.", variant: "destructive" });
      return;
    }
    setIsAssigningHead(true);
    try {
      await clubService.assignClubHead(clubForHeadAssignment.slug || clubForHeadAssignment._id, {
        userId: selectedHeadUserId,
        studentHeadName: studentHeadNameInput.trim() || undefined,
      });
      toast({
        title: "Leadership Assigned",
        description: `Assigned new Club Head for '${clubForHeadAssignment.name}'. Previous head was demoted safely.`,
      });
      setClubForHeadAssignment(null);
      setSelectedHeadUserId("");
      setStudentHeadNameInput("");
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to assign club leadership.";
      toast({ title: "Assignment Failed", description: msg, variant: "destructive" });
    } finally {
      setIsAssigningHead(false);
    }
  };

  // ── 6. Member Count Reconciliation ──────────────────────────────────────────
  const handleReconcile = async (club: Club) => {
    setReconcilingClubId(club._id);
    try {
      const res = await clubService.reconcileMemberCount(club.slug || club._id);
      const diff = res.data?.difference ?? 0;
      toast({
        title: "Member Count Reconciled",
        description:
          diff === 0
            ? `Member count is accurate (${res.data.memberCount} active members).`
            : `Corrected drift: Member count adjusted by ${diff > 0 ? `+${diff}` : diff} to ${res.data.memberCount}.`,
      });
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Reconciliation failed.";
      toast({ title: "Reconciliation Error", description: msg, variant: "destructive" });
    } finally {
      setReconcilingClubId(null);
    }
  };

  // ── 7. Membership Review Handlers ───────────────────────────────────────────
  const handleApproveMembership = async (membership: AdminClubMembership) => {
    try {
      await clubService.approveMembership(membership.clubSlug, membership._id);
      toast({
        title: "Application Approved",
        description: `${membership.studentName} is now an active member. Member counter incremented.`,
      });
      setMemberToApprove(null);
      await fetchMemberships(membership.clubSlug);
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to approve membership.";
      toast({ title: "Approval Failed", description: msg, variant: "destructive" });
    }
  };

  const handleRejectMembership = async (reason?: string) => {
    if (!memberToReject) return;
    const finalReason = reason || rejectionReasonInput;
    if (!finalReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "You must provide a clear reason when rejecting an application.",
        variant: "destructive",
      });
      return;
    }
    try {
      await clubService.rejectMembership(memberToReject.clubSlug, memberToReject._id, {
        rejectionReason: finalReason.trim(),
      });
      toast({
        title: "Application Rejected",
        description: `Rejected application for ${memberToReject.studentName}.`,
      });
      setMemberToReject(null);
      setRejectionReasonInput("");
      await fetchMemberships(memberToReject.clubSlug);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to reject membership.";
      toast({ title: "Rejection Failed", description: msg, variant: "destructive" });
    }
  };

  const handleOpenEditMember = (member: AdminClubMembership) => {
    setMemberToEdit(member);
    setUpdatedMemberRole(member.role);
    setUpdatedMemberStatus(member.status);
    setUpdatedMemberNotes(member.internalNotes || "");
  };

  const handleSaveMemberUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit) return;

    setIsUpdatingMember(true);
    try {
      await clubService.updateMembership(memberToEdit.clubSlug, memberToEdit._id, {
        role: updatedMemberRole,
        status: updatedMemberStatus,
        internalNotes: updatedMemberNotes.trim() || undefined,
      });
      toast({
        title: "Membership Updated",
        description: `Updated role and lifecycle status for ${memberToEdit.studentName}.`,
      });
      setMemberToEdit(null);
      await fetchMemberships(memberToEdit.clubSlug);
      await fetchClubs();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update membership.";
      toast({ title: "Update Failed", description: msg, variant: "destructive" });
    } finally {
      setIsUpdatingMember(false);
    }
  };

  // ── Achievements Helpers ────────────────────────────────────────────────────
  const handleAddAchievement = () => {
    if (!editingClub || !newAchievement.trim()) return;
    setEditingClub({
      ...editingClub,
      achievements: [...(editingClub.achievements || []), newAchievement.trim()],
    });
    setNewAchievement("");
  };

  const handleRemoveAchievement = (idx: number) => {
    if (!editingClub || !editingClub.achievements) return;
    setEditingClub({
      ...editingClub,
      achievements: editingClub.achievements.filter((_, i) => i !== idx),
    });
  };

  // ── Stats Summary ───────────────────────────────────────────────────────────
  const totalClubs = clubs.length;
  const totalMembers = useMemo(() => clubs.reduce((acc, c) => acc + (c.memberCount || 0), 0), [clubs]);
  const recruitingClubs = useMemo(() => clubs.filter((c) => c.isRecruiting).length, [clubs]);

  // ── Table Columns: Clubs ────────────────────────────────────────────────────
  const clubColumns: Column<Club>[] = [
    {
      key: "name",
      header: "Club / Committee",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
            <img
              src={c.bannerImage || c.logoUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"}
              alt={c.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span>{c.name}</span>
              {c.isRecruiting && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-medium">
                  Recruiting
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
                {c.code}
              </span>
              <span>•</span>
              <span className="capitalize">{c.category}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-slate-400">/{c.slug}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "facultyCoordinator",
      header: "Leadership",
      sortable: true,
      render: (c) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            Faculty: <span className="font-semibold">{c.facultyCoordinator}</span>
          </div>
          <div className="text-slate-500">
            Student Head: <span className="font-medium text-slate-700 dark:text-slate-300">{c.studentHeadName || "Unassigned"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "memberCount",
      header: "Active Members",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {c.memberCount || 0}
          </span>
          <button
            onClick={() => handleReconcile(c)}
            disabled={reconcilingClubId === c._id}
            title="Reconcile member count from database"
            className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconcilingClubId === c._id ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
              c.status === "active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : c.status === "archived"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {c.status}
          </span>
          {!c.isPublished && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1 rounded font-medium">Unpublished</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Memberships Button */}
          <button
            onClick={() => {
              setSelectedClubForMembers(c.slug);
              setActiveTab("memberships");
            }}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
            title="View Applications & Rosters"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Edit Club */}
          <button
            onClick={() => handleOpenEditClub(c)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Club Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Assign Head (Institutional Admin only) */}
          {isInstitutionalAdmin && (
            <button
              onClick={() => {
                setClubForHeadAssignment(c);
                setSelectedHeadUserId(c.studentHeadUserId || "");
                setStudentHeadNameInput(c.studentHeadName || "");
              }}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
              title="Assign or Replace Club Head"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {/* Archive Club (Institutional Admin only) */}
          {isInstitutionalAdmin && (
            <button
              onClick={() => setClubToArchive(c)}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              title="Soft Archive Club"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ── Table Columns: Memberships ──────────────────────────────────────────────
  const membershipColumns: Column<AdminClubMembership>[] = [
    {
      key: "studentName",
      header: "Student Applicant",
      sortable: true,
      render: (m) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{m.studentName}</div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span>{m.registerNumber}</span>
            <span>•</span>
            <span>{m.degree} (Yr {m.yearOfStudy})</span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Club Role",
      sortable: true,
      render: (m) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
            m.role === "president" || m.role === "vice_president"
              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200"
              : m.role === "secretary" || m.role === "treasurer" || m.role === "executive"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {m.role.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Lifecycle Status",
      sortable: true,
      render: (m) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
            m.status === "active"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : m.status === "pending"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 animate-pulse"
              : m.status === "rejected"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {m.status}
        </span>
      ),
    },
    {
      key: "isPublicDirectoryOptIn",
      header: "Consent",
      render: (m) => (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            m.isPublicDirectoryOptIn
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {m.isPublicDirectoryOptIn ? "Opted In" : "Private"}
        </span>
      ),
    },
    {
      key: "personalEmail",
      header: "Contact Details",
      render: (m) => (
        <div className="text-xs">
          <div className="text-slate-700 dark:text-slate-300 font-mono truncate max-w-[160px]">{m.personalEmail}</div>
          <div className="text-slate-400 font-mono text-[11px]">{m.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Review / Manage",
      className: "text-right",
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          {m.status === "pending" && (
            <>
              <button
                onClick={() => setMemberToApprove(m)}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
                title="Approve Membership"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => {
                  setMemberToReject(m);
                  setRejectionReasonInput("");
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors flex items-center gap-1"
                title="Reject Membership"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          )}

          {m.status !== "pending" && (
            <button
              onClick={() => handleOpenEditMember(m)}
              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Edit Role or Lifecycle Status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Clubs & Student Committees"
        description="Comprehensive management of student organizations, recruitment lifecycles, leadership assignments, and verified member rosters."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Student Life", href: "#" },
          { label: "Clubs Management" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchClubs}
              className="p-2 text-slate-600 hover:text-amber-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
              title="Refresh Clubs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingClubs ? "animate-spin text-amber-600" : ""}`} />
            </button>

            {isInstitutionalAdmin && (
              <button
                onClick={handleOpenCreateClub}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-semibold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Register New Club
              </button>
            )}
          </div>
        }
      />

      {/* ── Summary Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Clubs"
          value={totalClubs}
          subtitle="Registered institutional clubs"
          icon={Layers}
          variant="gold"
        />
        <StatCard
          title="Active Members"
          value={totalMembers}
          subtitle="Aggregate participating students"
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Recruiting Now"
          value={recruitingClubs}
          subtitle="Open for student applications"
          icon={UserCheck}
          variant="emerald"
        />
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("clubs")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "clubs"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Clubs Directory ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab("memberships")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "memberships"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Membership Applications & Rosters
          </button>
        </div>

        {/* Selected Club Badge for Club Head */}
        {isClubHead && (
          <div className="text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full font-medium mb-2">
            Scoped to: <span className="font-bold uppercase">{userAssignedClubSlug}</span>
          </div>
        )}
      </div>

      {/* ── TAB 1: CLUBS MANAGEMENT ──────────────────────────────────────────── */}
      {activeTab === "clubs" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </div>
              <select
                value={clubCategoryFilter}
                onChange={(e) => setClubCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="All">All Categories</option>
                {CLUB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
                Status:
              </div>
              <select
                value={clubStatusFilter}
                onChange={(e) => setClubStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="All">All Statuses</option>
                {CLUB_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <DataTable
            data={clubs}
            columns={clubColumns}
            searchKey="name"
            searchPlaceholder="Search clubs by name, code or coordinator..."
            pageSize={10}
          />
        </div>
      )}

      {/* ── TAB 2: MEMBERSHIP APPLICATIONS & ROSTERS ─────────────────────────── */}
      {activeTab === "memberships" && (
        <div className="space-y-4">
          {/* Club Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Club:
              </label>
              <select
                value={selectedClubForMembers}
                onChange={(e) => setSelectedClubForMembers(e.target.value)}
                disabled={isClubHead}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
              >
                {clubs.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={memberStatusFilter}
                  onChange={(e) => setMemberStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  {MEMBERSHIP_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-slate-500 ml-2">Role:</span>
                <select
                  value={memberRoleFilter}
                  onChange={(e) => setMemberRoleFilter(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Roles</option>
                  {MEMBERSHIP_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => selectedClubForMembers && fetchMemberships(selectedClubForMembers)}
              className="p-1.5 text-slate-600 hover:text-amber-600 rounded bg-slate-100 dark:bg-slate-800"
              title="Refresh Memberships"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMemberships ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Memberships Table */}
          <DataTable
            data={memberships}
            columns={membershipColumns}
            searchKey="studentName"
            searchPlaceholder="Search applicants by student name, register number or degree..."
            pageSize={10}
          />
        </div>
      )}

      {/* ── MODAL 1: Club Editor (Create / Edit) ─────────────────────────────── */}
      {isClubEditorOpen && editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSaveClub} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingClub._id ? "Edit Club Details" : "Register New Club"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClubEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Protected Fields Notice for Club Heads */}
              {isClubHead && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Club Head Scope:</span> Category, code, slug, and publishing statuses are institutional parameters and can only be modified by master administrators.
                  </div>
                </div>
              )}

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClub.name || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                    placeholder="e.g. Fine Arts & Cultural Club"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Canonical Slug * {!isInstitutionalAdmin && "(Locked)"}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isInstitutionalAdmin && !!editingClub._id}
                    value={editingClub.slug || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, slug: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. fine-arts-club"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60 font-mono"
                  />
                </div>
              </div>

              {/* Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Code * {!isInstitutionalAdmin && "(Locked)"}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isInstitutionalAdmin && !!editingClub._id}
                    value={editingClub.code || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, code: e.target.value.toUpperCase().trim() })}
                    placeholder="e.g. FACC"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category * {!isInstitutionalAdmin && "(Locked)"}
                  </label>
                  <select
                    disabled={!isInstitutionalAdmin && !!editingClub._id}
                    value={editingClub.category || "Cultural"}
                    onChange={(e) => setEditingClub({ ...editingClub, category: e.target.value as ClubCategory })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
                  >
                    {CLUB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club Mission & Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingClub.description || ""}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  placeholder="Outline the club objectives, weekly activities, and societal impact..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Coordinator & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Coordinator *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClub.facultyCoordinator || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, facultyCoordinator: e.target.value })}
                    placeholder="Prof. Name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingClub.contactEmail || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, contactEmail: e.target.value })}
                    placeholder="club@bac.edu.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Meeting Schedule & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={editingClub.meetingSchedule || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, meetingSchedule: e.target.value })}
                    placeholder="e.g. Wednesdays at 4:00 PM"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room or Venue
                  </label>
                  <input
                    type="text"
                    value={editingClub.roomOrVenue || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, roomOrVenue: e.target.value })}
                    placeholder="e.g. Auditorium / Seminar Hall 2"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Cover URL
                  </label>
                  <input
                    type="text"
                    value={editingClub.bannerImage || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, bannerImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={editingClub.logoUrl || ""}
                    onChange={(e) => setEditingClub({ ...editingClub, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Recruitment & Publishing Flags */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingClub.isRecruiting ?? true}
                    onChange={(e) => setEditingClub({ ...editingClub, isRecruiting: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Recruitment Active (Accepting applications)</span>
                </label>

                {isInstitutionalAdmin && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClub.isPublished ?? true}
                      onChange={(e) => setEditingClub({ ...editingClub, isPublished: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Published to Public Website</span>
                  </label>
                )}
              </div>

              {/* Key Achievements */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Achievements & Trophies
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add award or inter-college championship..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAchievement())}
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {editingClub.achievements?.map((ach, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    >
                      <Award className="w-3 h-3 text-amber-600" />
                      {ach}
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-amber-800 dark:text-amber-300 hover:text-red-500 font-bold ml-1"
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
                  onClick={() => setIsClubEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClub}
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmittingClub ? "Saving..." : "Save Club Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Assign Club Head (Institutional Admin only) ─────────────── */}
      {clubForHeadAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign Club Head: {clubForHeadAssignment.name}
            </h3>
            <p className="text-xs text-slate-500">
              Assigning a new Club Head automatically promotes the selected user and safely demotes any existing head back to staff with compensating rollback safeguards.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select User Account *
                </label>
                <select
                  value={selectedHeadUserId}
                  onChange={(e) => {
                    setSelectedHeadUserId(e.target.value);
                    const selected = users.find((u) => u.id === e.target.value);
                    if (selected && !studentHeadNameInput) {
                      setStudentHeadNameInput(selected.name);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — [{u.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Head Name (Student / Faculty)
                </label>
                <input
                  type="text"
                  value={studentHeadNameInput}
                  onChange={(e) => setStudentHeadNameInput(e.target.value)}
                  placeholder="e.g. Siddharth Menon (III BCA)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setClubForHeadAssignment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAssigningHead || !selectedHeadUserId}
                onClick={handleAssignHead}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
              >
                {isAssigningHead ? "Assigning..." : "Confirm Leadership"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Edit Membership Lifecycle / Role ────────────────────────── */}
      {memberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Membership: {memberToEdit.studentName}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Register No: {memberToEdit.registerNumber} • Club: {memberToEdit.clubSlug}
            </p>

            <form onSubmit={handleSaveMemberUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Membership Role
                </label>
                <select
                  value={updatedMemberRole}
                  onChange={(e) => setUpdatedMemberRole(e.target.value as MembershipRole)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {MEMBERSHIP_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={updatedMemberStatus}
                  onChange={(e) => setUpdatedMemberStatus(e.target.value as MembershipStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {MEMBERSHIP_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={2}
                  value={updatedMemberNotes}
                  onChange={(e) => setUpdatedMemberNotes(e.target.value)}
                  placeholder="Notes for coordinators..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMemberToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMember}
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isUpdatingMember ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DIALOG 1: Soft Archival Confirmation ─────────────────────────────── */}
      <ConfirmationDialog
        isOpen={!!clubToArchive}
        onClose={() => setClubToArchive(null)}
        onConfirm={handleArchiveClub}
        title="Archive Club"
        description={
          (clubToArchive?.memberCount || 0) > 0
            ? `Club '${clubToArchive?.name}' currently has ${clubToArchive?.memberCount} active member(s). Proceeding with forced archival will automatically transition all active members to 'inactive' and reset memberCount to 0.`
            : `Are you sure you want to soft-archive '${clubToArchive?.name}'? It will be unpublished and hidden from recruitment.`
        }
        confirmText={
          (clubToArchive?.memberCount || 0) > 0
            ? "Force Archive & Deactivate Members"
            : "Archive Club"
        }
        variant="danger"
      />

      {/* ── DIALOG 2: Approve Membership Confirmation ────────────────────────── */}
      <ConfirmationDialog
        isOpen={!!memberToApprove}
        onClose={() => setMemberToApprove(null)}
        onConfirm={() => memberToApprove && handleApproveMembership(memberToApprove)}
        title="Approve Membership Application"
        description={`Approve application for ${memberToApprove?.studentName} (${memberToApprove?.registerNumber})? This will transition status to active and atomically increment active club membership count.`}
        confirmText="Approve Member"
        variant="success"
      />

      {/* ── DIALOG 3: Reject Membership (Mandatory Reason) ───────────────────── */}
      <ConfirmationDialog
        isOpen={!!memberToReject}
        onClose={() => setMemberToReject(null)}
        onConfirm={handleRejectMembership}
        title="Reject Membership Application"
        description={`Reject application for ${memberToReject?.studentName}? You must provide a valid rejection reason for student audit record.`}
        confirmText="Reject Application"
        variant="danger"
        requiresReason={true}
        reasonPlaceholder="Specify reason for rejection (e.g. Ineligible year of study, recruitment cap reached)..."
      />
    </div>
  );
}
