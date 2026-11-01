"use client";

import React, { useState } from "react";
import { useCMSStore, AdminUser, RoleType } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Users, Plus, ShieldCheck, UserCheck, UserX, 
  Key, Mail, Phone, Lock, Trash2, Edit3, ShieldAlert 
} from "lucide-react";

export function UsersCMS() {
  const { users, saveUser, deleteUser, currentUser, logAction } = useCMSStore();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const handleOpenEditor = (user?: AdminUser) => {
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser({
        id: "user-" + Date.now(),
        name: "",
        email: "",
        role: "staff",
        departmentId: "",
        clubId: "",
        permissions: ["view"],
        status: "active",
        phone: "",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const isNew = !users.some((u) => u.id === selectedUser.id);
    saveUser(selectedUser, isNew);
    setIsEditorOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  const handleToggleStatus = (u: AdminUser) => {
    const updatedStatus = u.status === "active" ? "deactivated" : "active";
    saveUser({ ...u, status: updatedStatus }, false);
  };

  const roleColors: Record<RoleType, { label: string; bg: string; text: string }> = {
    master_admin: { label: "Master Admin", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300" },
    sub_admin: { label: "Sub Admin", bg: "bg-purple-50 dark:bg-purple-950/60", text: "text-purple-700 dark:text-purple-300" },
    hod: { label: "HOD", bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300" },
    club_head: { label: "Club Head", bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300" },
    content_editor: { label: "Content Editor", bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300" },
    staff: { label: "Staff", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Administrator Account",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-xs shrink-0">
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              u.name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              {u.name}
              {u.id === currentUser.id && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 px-1.5 py-0.2 rounded">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Assigned Role",
      sortable: true,
      render: (u) => {
        const r = roleColors[u.role] || roleColors.staff;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${r.bg} ${r.text} border border-current/10`}>
            {r.label}
          </span>
        );
      },
    },
    {
      key: "departmentId",
      header: "Scope Access",
      render: (u) => {
        if (u.role === "master_admin" || u.role === "sub_admin") {
          return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All Modules</span>;
        }
        if (u.departmentId) {
          return (
            <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-300">
              Dept: {u.departmentId.replace("-", " ")}
            </span>
          );
        }
        if (u.clubId) {
          return (
            <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-300">
              Club: {u.clubId.replace("-", " ")}
            </span>
          );
        }
        return <span className="text-xs text-slate-400">Global Limited</span>;
      },
    },
    {
      key: "status",
      header: "Account State",
      sortable: true,
      render: (u) => (
        u.status === "active" ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-3.5 h-3.5" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
            <UserX className="w-3.5 h-3.5" /> Deactivated
          </span>
        )
      ),
    },
    {
      key: "lastLogin",
      header: "Last Session",
      render: (u) => <span className="text-xs font-mono text-slate-500">{u.lastLogin || "Never"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleToggleStatus(u)}
            className={`p-1.5 rounded transition-colors ${
              u.status === "active"
                ? "text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
            title={u.status === "active" ? "Deactivate Account" : "Activate Account"}
          >
            {u.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleOpenEditor(u)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit User"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {u.id !== currentUser.id && (
            <button
              onClick={() => setUserToDelete(u)}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin User Management & Scoped Roles"
        description="Provision administrative accounts, assign departmental or club-level scoping, and configure role-based permissions."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "System", href: "#" },
          { label: "Users" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Administrator
          </button>
        }
      />

      {/* Role Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {["all", "master_admin", "sub_admin", "hod", "club_head", "content_editor", "staff"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors capitalize ${
              roleFilter === r
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {r === "all" ? "All Users" : r.replace("_", " ")}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search users by name or email..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {users.some((u) => u.id === selectedUser.id) ? "Edit Administrator Account" : "Create New Administrator"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    placeholder="e.g. Dr. K. Senthil Kumar"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    placeholder="senthilkumar.cs@bac.edu.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Privilege Level *
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as RoleType })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="master_admin">Master Admin (Complete Website Control)</option>
                    <option value="sub_admin">Sub Admin (Assistant Administrator)</option>
                    <option value="hod">HOD (Department Scoped)</option>
                    <option value="club_head">Club Head (Club Scoped)</option>
                    <option value="content_editor">Content Editor (Website Pages)</option>
                    <option value="staff">Staff (Limited Contributor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={selectedUser.phone || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                    placeholder="+91 94432 10981"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Scoping Fields */}
              {selectedUser.role === "hod" && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                    Assigned Department Scope *
                  </label>
                  <select
                    value={selectedUser.departmentId || "computer-science"}
                    onChange={(e) => setSelectedUser({ ...selectedUser, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="computer-science">Computer Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="management">Management</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    This user will only have editing rights for this specific department.
                  </p>
                </div>
              )}

              {selectedUser.role === "club_head" && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                    Assigned Student Club / Cell *
                  </label>
                  <select
                    value={selectedUser.clubId || "cultural-club"}
                    onChange={(e) => setSelectedUser({ ...selectedUser, clubId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="cultural-club">Cultural Club</option>
                    <option value="sports-club">Sports & Athletics Cell</option>
                    <option value="nss">National Service Scheme (NSS)</option>
                    <option value="rotaract">Rotaract Club</option>
                    <option value="aicuf">AICUF Student Wing</option>
                  </select>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                    This user will only have editing rights for this specific club.
                  </p>
                </div>
              )}

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
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Administrator Account"
        description={`Are you sure you want to delete ${userToDelete?.name}'s account? They will lose all access to the CMS.`}
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  );
}
