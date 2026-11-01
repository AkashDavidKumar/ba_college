"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, ClubItem, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Users, Plus, Award, Mail, Sparkles, CheckCircle, 
  ExternalLink, Trash2, Edit3, Shield, Star 
} from "lucide-react";

export function ClubsCMS() {
  const { clubs, saveClub, deleteClub, canAccessClub, currentUser } = useCMSStore();
  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<ClubItem | null>(null);
  const [newAchievement, setNewAchievement] = useState("");

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => canAccessClub(c.id));
  }, [clubs, canAccessClub]);

  const handleOpenEditor = (club?: ClubItem) => {
    if (club) {
      setSelectedClub(club);
    } else {
      setSelectedClub({
        id: "club-" + Date.now(),
        name: "",
        code: "CLUB",
        category: "Cultural",
        description: "",
        facultyCoordinator: currentUser.name,
        studentHead: "",
        contactEmail: "",
        memberCount: 20,
        bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        achievements: [],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;

    const isNew = !clubs.some((c) => c.id === selectedClub.id);
    saveClub(selectedClub, isNew);
    setIsEditorOpen(false);
    setSelectedClub(null);
  };

  const handleDelete = () => {
    if (!clubToDelete) return;
    deleteClub(clubToDelete.id);
    setClubToDelete(null);
  };

  const handleAddAchievement = () => {
    if (!selectedClub || !newAchievement.trim()) return;
    setSelectedClub({
      ...selectedClub,
      achievements: [...(selectedClub.achievements || []), newAchievement.trim()],
    });
    setNewAchievement("");
  };

  const handleRemoveAchievement = (index: number) => {
    if (!selectedClub) return;
    setSelectedClub({
      ...selectedClub,
      achievements: selectedClub.achievements.filter((_, i) => i !== index),
    });
  };

  const columns: Column<ClubItem>[] = [
    {
      key: "name",
      header: "Club / Committee",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img src={c.bannerImage} alt={c.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-mono text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                {c.code}
              </span>
              <span>•</span>
              <span>{c.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "facultyCoordinator",
      header: "Faculty Coordinator",
      sortable: true,
      render: (c) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{c.facultyCoordinator}</div>
          <div className="text-slate-500">Student Head: {c.studentHead || "TBD"}</div>
        </div>
      ),
    },
    {
      key: "memberCount",
      header: "Active Members",
      sortable: true,
      render: (c) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {c.memberCount} Members
        </span>
      ),
    },
    {
      key: "contactEmail",
      header: "Contact Email",
      render: (c) => <span className="text-xs text-slate-500 font-mono">{c.contactEmail || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(c)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Club"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setClubToDelete(c)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Club"
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
        title="Clubs & Student Committees"
        description="Manage campus cultural clubs, NSS, NCC, Rotaract, AICUF, fine arts associations, and student leadership."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Student Life", href: "#" },
          { label: "Clubs" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Student Club
          </button>
        }
      />

      <DataTable
        data={filteredClubs}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search clubs by name, category or coordinator..."
        pageSize={8}
      />

      {/* Club Editor Modal */}
      {isEditorOpen && selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {clubs.some((c) => c.id === selectedClub.id) ? "Edit Club Profile" : "Register New Club"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedClub.name}
                    onChange={(e) => setSelectedClub({ ...selectedClub, name: e.target.value })}
                    placeholder="e.g. National Service Scheme (NSS)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={selectedClub.code}
                    onChange={(e) => setSelectedClub({ ...selectedClub, code: e.target.value })}
                    placeholder="e.g. NSS"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedClub.category}
                    onChange={(e) => setSelectedClub({ ...selectedClub, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cultural">Cultural Club</option>
                    <option value="Sports">Sports & Athletics</option>
                    <option value="Social Service">Social Service (NSS / YRC / RRC)</option>
                    <option value="Academic">Academic / Science Club</option>
                    <option value="Leadership">Leadership & AICUF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Active Member Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedClub.memberCount}
                    onChange={(e) => setSelectedClub({ ...selectedClub, memberCount: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club Mission & Activities Description
                </label>
                <textarea
                  rows={3}
                  value={selectedClub.description}
                  onChange={(e) => setSelectedClub({ ...selectedClub, description: e.target.value })}
                  placeholder="Describe the objective, weekly activities, and societal impact..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Coordinator *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedClub.facultyCoordinator}
                    onChange={(e) => setSelectedClub({ ...selectedClub, facultyCoordinator: e.target.value })}
                    placeholder="Prof. Name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student President / Head
                  </label>
                  <input
                    type="text"
                    value={selectedClub.studentHead}
                    onChange={(e) => setSelectedClub({ ...selectedClub, studentHead: e.target.value })}
                    placeholder="Student Name & Year"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={selectedClub.contactEmail}
                    onChange={(e) => setSelectedClub({ ...selectedClub, contactEmail: e.target.value })}
                    placeholder="club@bac.edu.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cover Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={selectedClub.bannerImage}
                    onChange={(e) => setSelectedClub({ ...selectedClub, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Achievements list */}
              <div className="space-y-2 pt-2">
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
                  {selectedClub.achievements?.map((ach, idx) => (
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
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!clubToDelete}
        onClose={() => setClubToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Club"
        description={`Are you sure you want to delete ${clubToDelete?.name}?`}
        confirmText="Delete Club"
        variant="danger"
      />
    </div>
  );
}
