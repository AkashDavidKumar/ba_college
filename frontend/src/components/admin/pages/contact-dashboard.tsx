"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  MessageSquare,
  Building2,
  Save,
  Plus,
  Trash2,
  Globe,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactData {
  address: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phones: { label: string; number: string }[];
  emails: { label: string; address: string }[];
  admissionHelpline?: string;
  officeHours: string;
  mapsEmbedUrl: string;
  socialLinks: { platform: string; url: string; icon?: string }[];
  formRecipientEmail?: string;
  formAutoReply?: boolean;
  departmentContacts: { dept: string; person: string; phone: string; email: string }[];
}

const DEFAULT_DATA: ContactData = {
  address: "",
  phones: [],
  emails: [],
  officeHours: "Mon – Sat: 9:00 AM – 5:00 PM",
  mapsEmbedUrl: "",
  socialLinks: [],
  departmentContacts: [],
};

const SECTIONS = [
  { id: "info",       label: "Contact Info",        icon: Phone         },
  { id: "social",     label: "Social Media",        icon: Share2        },
  { id: "map",        label: "Google Maps",         icon: MapPin        },
  { id: "form",       label: "Contact Form",        icon: MessageSquare },
  { id: "depts",      label: "Dept. Contacts",      icon: Building2     },
];

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "Twitter/X", "YouTube", "WhatsApp", "Website"];

interface ContactDashboardProps {
  nav: NavState;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContactDashboard({ nav }: ContactDashboardProps) {
  const [data, setData] = useState<ContactData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("info");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const json = await res.json();
      setData({ ...DEFAULT_DATA, ...json });
    } catch {
      setError("Failed to load contact data.");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSuccess("Contact page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save contact data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageDashboard
      pageName="Contact Page Management"
      pageDescription="Manage address, phones, emails, social links, Google Maps embed, and contact form settings"
    >
      {/* ── Section Tabs ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive ? "border-amber-400 text-amber-700 bg-amber-50/60" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 h-64" />
        </div>
      ) : (
        <>
          {/* ── Contact Info ──────────────────────────── */}
          {activeSection === "info" && (
            <div className="space-y-5">
              {/* Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" /> Address
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Address Line 1</label>
                    <input className={inputCls} value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} placeholder="BAC Campus, Knowledge City" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address Line 2</label>
                    <input className={inputCls} value={data.addressLine2 || ""} onChange={(e) => setData({ ...data, addressLine2: e.target.value })} placeholder="Near…" />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className={inputCls} value={data.city || ""} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="Bangalore" />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input className={inputCls} value={data.state || ""} onChange={(e) => setData({ ...data, state: e.target.value })} placeholder="Karnataka" />
                  </div>
                  <div>
                    <label className="label">PIN Code</label>
                    <input className={inputCls} value={data.pincode || ""} onChange={(e) => setData({ ...data, pincode: e.target.value })} placeholder="560100" />
                  </div>
                </div>
              </div>

              {/* Phone Numbers */}
              <EditableList
                title="Phone Numbers"
                icon={<Phone className="w-4 h-4 text-amber-600" />}
                items={data.phones}
                fields={[
                  { key: "label",  label: "Label",  placeholder: "Main Office" },
                  { key: "number", label: "Number", placeholder: "+91 80 4967 0000" },
                ]}
                onAdd={(item) => setData({ ...data, phones: [...data.phones, item as any] })}
                onRemove={(i) => setData({ ...data, phones: data.phones.filter((_, j) => j !== i) })}
                renderItem={(item: any) => `${item.label}: ${item.number}`}
              />

              {/* Email Addresses */}
              <EditableList
                title="Email Addresses"
                icon={<Mail className="w-4 h-4 text-amber-600" />}
                items={data.emails}
                fields={[
                  { key: "label",   label: "Label",   placeholder: "Admissions" },
                  { key: "address", label: "Email",   placeholder: "admissions@bac.edu" },
                ]}
                onAdd={(item) => setData({ ...data, emails: [...data.emails, item as any] })}
                onRemove={(i) => setData({ ...data, emails: data.emails.filter((_, j) => j !== i) })}
                renderItem={(item: any) => `${item.label}: ${item.address}`}
              />

              {/* Office Hours & Helpline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Office Hours & Helpline
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Office Hours</label>
                    <input className={inputCls} value={data.officeHours} onChange={(e) => setData({ ...data, officeHours: e.target.value })} placeholder="Mon – Sat: 9:00 AM – 5:00 PM" />
                  </div>
                  <div>
                    <label className="label">Admission Helpline</label>
                    <input className={inputCls} value={data.admissionHelpline || ""} onChange={(e) => setData({ ...data, admissionHelpline: e.target.value })} placeholder="+91 99999 00000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Social Media ──────────────────────────── */}
          {activeSection === "social" && (
            <SocialMediaSection data={data} onUpdate={setData} />
          )}

          {/* ── Google Maps ───────────────────────────── */}
          {activeSection === "map" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" /> Google Maps Embed
                </h3>
                <p className="text-xs text-slate-400">
                  Go to Google Maps → Share → Embed a map → Copy the <code className="bg-slate-100 px-1 rounded">src</code> URL from the iframe code.
                </p>
                <div>
                  <label className="label">Maps Embed URL</label>
                  <textarea className={inputCls + " resize-none"} rows={3} value={data.mapsEmbedUrl}
                    onChange={(e) => setData({ ...data, mapsEmbedUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=…" />
                </div>
                {data.mapsEmbedUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <iframe src={data.mapsEmbedUrl} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" title="Campus Location" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Contact Form Settings ─────────────────── */}
          {activeSection === "form" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" /> Contact Form Settings
              </h3>
              <div>
                <label className="label">Form Submission Recipient Email</label>
                <input className={inputCls} value={data.formRecipientEmail || ""}
                  onChange={(e) => setData({ ...data, formRecipientEmail: e.target.value })}
                  placeholder="admin@bac.edu" />
                <p className="text-xs text-slate-400 mt-1">All contact form submissions will be sent to this email address.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${data.formAutoReply ? "bg-amber-400" : "bg-slate-200"}`}
                  onClick={() => setData({ ...data, formAutoReply: !data.formAutoReply })}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${data.formAutoReply ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">Auto-reply to enquiries</span>
                  <p className="text-xs text-slate-400">Automatically send a confirmation email to visitors who submit the contact form.</p>
                </div>
              </label>
            </div>
          )}

          {/* ── Department Contacts ───────────────────── */}
          {activeSection === "depts" && (
            <DeptContactsSection data={data} onUpdate={setData} />
          )}

          {/* ── Save Bar ──────────────────────────────── */}
          <div className="flex justify-end pt-2">
            <button onClick={saveData} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </PageDashboard>
  );
}

// ─── Social Media Section ─────────────────────────────────────────────────────

function SocialMediaSection({ data, onUpdate }: { data: ContactData; onUpdate: (d: ContactData) => void }) {
  const [links, setLinks] = useState(data.socialLinks);
  const [form, setForm] = useState({ platform: "Facebook", url: "" });

  const add = () => {
    if (!form.url) return;
    const updated = [...links, { platform: form.platform, url: form.url }];
    setLinks(updated);
    onUpdate({ ...data, socialLinks: updated });
    setForm({ platform: "Facebook", url: "" });
  };

  const remove = (i: number) => {
    const updated = links.filter((_, j) => j !== i);
    setLinks(updated);
    onUpdate({ ...data, socialLinks: updated });
  };

  const updateUrl = (i: number, url: string) => {
    const updated = links.map((l, j) => j === i ? { ...l, url } : l);
    setLinks(updated);
    onUpdate({ ...data, socialLinks: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Share2 className="w-4 h-4 text-amber-600" /> Social Media Links
      </h3>

      {/* Existing links */}
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 text-sm font-semibold text-slate-600 shrink-0">{link.platform}</span>
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input className={inputCls + " pl-9"} value={link.url} onChange={(e) => updateUrl(i, e.target.value)} placeholder="https://…" />
            </div>
            <button onClick={() => remove(i)} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <select className={inputCls + " w-36 shrink-0"} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
          {SOCIAL_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Profile URL…" />
        <button onClick={add} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Department Contacts Section ──────────────────────────────────────────────

function DeptContactsSection({ data, onUpdate }: { data: ContactData; onUpdate: (d: ContactData) => void }) {
  const [contacts, setContacts] = useState(data.departmentContacts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dept: "", person: "", phone: "", email: "" });

  const add = () => {
    if (!form.dept) return;
    const updated = [...contacts, form];
    setContacts(updated);
    onUpdate({ ...data, departmentContacts: updated });
    setForm({ dept: "", person: "", phone: "", email: "" });
    setShowForm(false);
  };

  const remove = (i: number) => {
    const updated = contacts.filter((_, j) => j !== i);
    setContacts(updated);
    onUpdate({ ...data, departmentContacts: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" /> Department Contact Information
        </h3>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {showForm && (
        <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          {[
            { key: "dept",   label: "Department",   placeholder: "Computer Science" },
            { key: "person", label: "Contact Person",placeholder: "Dr. A. Sharma" },
            { key: "phone",  label: "Phone",        placeholder: "+91 80 4967 0001" },
            { key: "email",  label: "Email",        placeholder: "cse@bac.edu" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className={inputCls} placeholder={placeholder} value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={add} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">Add</button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Department", "Contact Person", "Phone", "Email", ""].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-slate-500 pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{c.dept}</td>
                <td className="py-2.5 pr-4 text-slate-600">{c.person}</td>
                <td className="py-2.5 pr-4 text-slate-500 text-xs">{c.phone}</td>
                <td className="py-2.5 pr-4 text-slate-500 text-xs">{c.email}</td>
                <td className="py-2.5">
                  <button onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No department contacts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reusable Editable List ───────────────────────────────────────────────────

function EditableList<T extends Record<string, string>>({
  title,
  icon,
  items,
  fields,
  onAdd,
  onRemove,
  renderItem,
}: {
  title: string;
  icon: React.ReactNode;
  items: T[];
  fields: { key: string; label: string; placeholder: string }[];
  onAdd: (item: T) => void;
  onRemove: (i: number) => void;
  renderItem: (item: T) => string;
}) {
  const [showForm, setShowForm] = useState(false);
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, ""])) as T;
  const [form, setForm] = useState<T>(emptyForm);

  const add = () => {
    if (!form[fields[0].key]) return;
    onAdd(form);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">{icon} {title}</h3>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {showForm && (
        <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className={inputCls} placeholder={placeholder} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={add} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-500 transition-colors">Add</button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 group">
            <span className="flex-1 text-sm text-slate-700">{renderItem(item)}</span>
            <button onClick={() => onRemove(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-slate-400">None added yet.</li>}
      </ul>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
