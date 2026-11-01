"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useCMSStore } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

export function WebsiteSettingsCMS() {
  const { data, updateGeneralSettings } = useSiteData();
  const { logAction } = useCMSStore();
  const { toast } = useToast();

  const [form, setForm] = useState({
    text1: data?.logo?.text1 || "Bishop Ambrose",
    text2: data?.logo?.text2 || "College",
    logoImage: data?.logo?.image || "",
    address: data?.footer?.address || "56, Sungam Bypass Road, Sungam, Alwin Nagar, Coimbatore, Tamil Nadu – 641045",
    phone: data?.footer?.phone || "0422-2316731 / 0422-2310655",
    email: data?.footer?.email || "bishopambrosecollege1@gmail.com",
    facebook: data?.footer?.facebook || "https://facebook.com/bishopambrosecollege",
    twitter: data?.footer?.twitter || "https://twitter.com/bac_cbe",
    instagram: data?.footer?.instagram || "https://instagram.com/bishopambrosecollege",
    linkedin: data?.footer?.linkedin || "https://linkedin.com/school/bishop-ambrose-college",
    youtube: data?.footer?.youtube || "https://youtube.com/@bishopambrosecollege",
    aboutFooter: data?.footer?.aboutText || "Bishop Ambrose College, Coimbatore, is an Autonomous Institution affiliated to Bharathiar University, offering quality education in Science, Commerce and Arts.",
  });

  const handleSave = async () => {
    try {
      await updateGeneralSettings({
        logo: {
          text1: form.text1,
          text2: form.text2,
          image: form.logoImage,
        },
        footer: {
          ...data?.footer,
          address: form.address,
          phone: form.phone,
          email: form.email,
          aboutText: form.aboutFooter,
          facebook: form.facebook,
          twitter: form.twitter,
          instagram: form.instagram,
          linkedin: form.linkedin,
          youtube: form.youtube,
          ctaBadge: data?.footer?.ctaBadge || "Admissions Open 2026-27",
          ctaTitle: data?.footer?.ctaTitle || "Begin Your Academic Journey at BAC",
          ctaDescription: data?.footer?.ctaDescription || "Join thousands of students who chose Bishop Ambrose College for quality higher education.",
          infoEmail: form.email,
        },
      });

      logAction({
        action: "UPDATE",
        module: "Website Settings",
        recordId: "global-settings",
        recordTitle: "Updated college branding, contact, and social links",
      });

      toast({
        title: "Settings Saved",
        description: "Institutional website settings have been published.",
      });
    } catch {
      toast({
        title: "Error Saving",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="College Website & Institutional Settings"
        subtitle="Manage global college branding, logos, official contact numbers, email directories, and footer configurations."
        badge="Global Settings"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Settings" },
        ]}
        action={{
          label: "Save & Publish Settings",
          icon: Save,
          onClick: handleSave,
        }}
      />

      <div className="space-y-6">
        {/* Branding & Logo */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-base text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#009688]" /> Institutional Branding & Logo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Name Line 1
              </label>
              <input
                type="text"
                value={form.text1}
                onChange={(e) => setForm({ ...form, text1: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Name Line 2 (Subtext)
              </label>
              <input
                type="text"
                value={form.text2}
                onChange={(e) => setForm({ ...form, text2: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Custom Logo Image URL (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to use default crest emblem"
              value={form.logoImage}
              onChange={(e) => setForm({ ...form, logoImage: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-base text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#009688]" /> Official Address & Contact Info
          </h3>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Campus Physical Address *
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Numbers / Admission Helpline *
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Footer About Paragraph
            </label>
            <textarea
              rows={3}
              value={form.aboutFooter}
              onChange={(e) => setForm({ ...form, aboutFooter: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-bold text-base text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#009688]" /> Official Social Media Handles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Page
              </label>
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn University Page
              </label>
              <input
                type="text"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Channel
              </label>
              <input
                type="text"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
