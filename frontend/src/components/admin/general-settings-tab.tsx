"use client";

import React, { useState, useEffect } from "react";
import { useSiteData } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import { PremiumButton } from "@/components/site/primitives";
import { Save, Plus, Trash2, Loader2, Upload } from "lucide-react";
import { HomepageStatisticsManager } from "./statistics-manager";
import { AboutPageManager } from "./about-manager";
import { HeroVideoManager } from "./hero-video-manager";
import { ThemeToggleSwitch } from "./theme-toggle-switch";

export function GeneralSettingsTab() {
  const { data, updateGeneralSettings } = useSiteData();
  const { toast } = useToast();

  const [logoText1, setLogoText1] = useState("");
  const [logoText2, setLogoText2] = useState("");
  const [logoImage, setLogoImage] = useState("");

  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaLink, setHeroCtaLink] = useState("");
  const [heroSecCtaText, setHeroSecCtaText] = useState("");
  const [heroSecCtaLink, setHeroSecCtaLink] = useState("");
  const [heroVirtualTourUrl, setHeroVirtualTourUrl] = useState("");

  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutText1, setAboutText1] = useState("");
  const [aboutText2, setAboutText2] = useState("");

  const [footerAddress, setFooterAddress] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerInfoEmail, setFooterInfoEmail] = useState("");
  const [footerCtaBadge, setFooterCtaBadge] = useState("");
  const [footerCtaTitle, setFooterCtaTitle] = useState("");
  const [footerCtaDescription, setFooterCtaDescription] = useState("");
  const [footerAboutText, setFooterAboutText] = useState("");
  const [footerFacebook, setFooterFacebook] = useState("");
  const [footerTwitter, setFooterTwitter] = useState("");
  const [footerInstagram, setFooterInstagram] = useState("");
  const [footerLinkedin, setFooterLinkedin] = useState("");
  const [footerYoutube, setFooterYoutube] = useState("");

  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Sync state when data is loaded
  useEffect(() => {
    if (data) {
      setLogoText1(data.logo?.text1 || "");
      setLogoText2(data.logo?.text2 || "");
      setLogoImage(data.logo?.image || "");

      setHeroBadge(data.hero?.badge || "");
      setHeroTitle(data.hero?.title || "");
      setHeroSubtitle(data.hero?.subtitle || "");
      setHeroCtaText(data.hero?.ctaText || "");
      setHeroCtaLink(data.hero?.ctaLink || "");
      setHeroSecCtaText(data.hero?.secondaryCtaText || "");
      setHeroSecCtaLink(data.hero?.secondaryCtaLink || "");
      setHeroVirtualTourUrl(data.hero?.virtualTourUrl || "");

      setAboutTitle(data.about?.title || "");
      setAboutText1(data.about?.text1 || "");
      setAboutText2(data.about?.text2 || "");

      setFooterAddress(data.footer?.address || "");
      setFooterPhone(data.footer?.phone || "");
      setFooterEmail(data.footer?.email || "");
      setFooterInfoEmail(data.footer?.infoEmail || "");
      setFooterCtaBadge(data.footer?.ctaBadge || "");
      setFooterCtaTitle(data.footer?.ctaTitle || "");
      setFooterCtaDescription(data.footer?.ctaDescription || "");
      setFooterAboutText(data.footer?.aboutText || "");
      setFooterFacebook(data.footer?.facebook || "");
      setFooterTwitter(data.footer?.twitter || "");
      setFooterInstagram(data.footer?.instagram || "");
      setFooterLinkedin(data.footer?.linkedin || "");
      setFooterYoutube(data.footer?.youtube || "");

      setAnnouncements(data.announcements || []);
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);


    const payload = {
      logo: {
        text1: logoText1,
        text2: logoText2,
        image: logoImage
      },
      hero: {
        badge: heroBadge,
        title: heroTitle,
        subtitle: heroSubtitle,
        ctaText: heroCtaText,
        ctaLink: heroCtaLink,
        secondaryCtaText: heroSecCtaText,
        secondaryCtaLink: heroSecCtaLink,
        virtualTourUrl: heroVirtualTourUrl
      },
      about: {
        title: aboutTitle,
        text1: aboutText1,
        text2: aboutText2,
        stats: data?.about?.stats || []
      },
      footer: {
        ctaBadge: footerCtaBadge,
        ctaTitle: footerCtaTitle,
        ctaDescription: footerCtaDescription,
        aboutText: footerAboutText,
        address: footerAddress,
        phone: footerPhone,
        email: footerEmail,
        infoEmail: footerInfoEmail,
        facebook: footerFacebook,
        twitter: footerTwitter,
        instagram: footerInstagram,
        linkedin: footerLinkedin,
        youtube: footerYoutube
      },
      announcements: announcements
    };

    try {
      const ok = await updateGeneralSettings(payload);
      if (ok) {
        toast({
          title: "Settings Updated",
          description: "All sitewide texts, buttons, and alert banner ticker have been synced live.",
        });
      } else {
        throw new Error("Update failed");
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: "An error occurred while saving site settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: "Direct Upload Unavailable",
      description: "Direct binary file upload is not configured on this server. Please enter a hosted image URL into the Logo Image URL field.",
      variant: "destructive"
    });
    e.target.value = "";
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements([...announcements, newAnnouncement.trim()]);
    setNewAnnouncement("");
  };

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-8">
      {/* Global Color Theme Toggle Card */}
      <ThemeToggleSwitch variant="card" />

      {/* Hero Video Management Module */}
      <HeroVideoManager />

      {/* Homepage Statistics / Key Numbers Management */}
      <HomepageStatisticsManager />

      {/* About Page Management */}
      <AboutPageManager />

      <form onSubmit={handleSave} className="space-y-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      {/* Title */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-100">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900">General Website Content</h3>
          <p className="text-xs text-slate-400">Manage headlines, CTA options, stories, alert headers, and footer details.</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-100 disabled:text-slate-400 text-xs font-bold text-slate-950 transition-all shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Navbar Branding Section */}
      <div className="space-y-5">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Navbar Branding Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Logo Text Line 1 (Main Brand name)
            </label>
            <input
              type="text"
              value={logoText1}
              onChange={(e) => setLogoText1(e.target.value)}
              placeholder="e.g. Bishop Ambrose"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Logo Text Line 2 (Sub-heading)
            </label>
            <input
              type="text"
              value={logoText2}
              onChange={(e) => setLogoText2(e.target.value)}
              placeholder="e.g. College"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Custom Logo Image
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                value={logoImage}
                onChange={(e) => setLogoImage(e.target.value)}
                placeholder="Fallback default vector icon is used if blank (e.g. /uploads/my-logo.png)"
                className="flex-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <label className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                {logoImage && (
                  <button
                    type="button"
                    onClick={() => setLogoImage("")}
                    className="px-3 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            </div>
            {logoImage && (
              <div className="mt-2.5 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 max-w-max">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Preview:</span>
                <img src={logoImage} alt="Logo preview" className="h-10 w-10 object-contain rounded border border-slate-200 bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="space-y-5">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Homepage Hero banner
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Top Gold Badge Text
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="Admissions Open 2026-27"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Main Headline (Title)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Empowering Future Leaders"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Subtitle (Description)
            </label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Description text displayed below the main heading..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Primary CTA Button Label
            </label>
            <input
              type="text"
              value={heroCtaText}
              onChange={(e) => setHeroCtaText(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Primary CTA Action
            </label>
            <select
              value={heroCtaLink}
              onChange={(e) => setHeroCtaLink(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
            >
              <option value="admissions">Go to Admissions Application</option>
              <option value="departments">Scroll to Departments</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Secondary CTA Button Label
            </label>
            <input
              type="text"
              value={heroSecCtaText}
              onChange={(e) => setHeroSecCtaText(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Secondary CTA Action
            </label>
            <select
              value={heroSecCtaLink}
              onChange={(e) => setHeroSecCtaLink(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
            >
              <option value="admissions">Go to Admissions Application</option>
              <option value="departments">Scroll to Departments</option>
            </select>
          </div>

        </div>
      </div>

      {/* Campus Virtual Tour Section — now managed in the Virtual Tour tab */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Campus Virtual Tour
        </h4>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Moved to dedicated Virtual Tour Manager</p>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              All virtual tour settings (media type, URL, branding, campus stats) are now managed in the
              <strong> Virtual Tour</strong> tab in the left sidebar — for a richer, premium configuration experience.
            </p>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Alert Banner Announcements
        </h4>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Type new notice or announcement banner message..."
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={addAnnouncement}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <ul className="space-y-2">
            {announcements.map((ann, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <span className="text-slate-700">{ann}</span>
                <button
                  type="button"
                  onClick={() => removeAnnouncement(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-5 pt-6 border-t border-slate-100">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          About Story Section
        </h4>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              About Heading Title
            </label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              First Paragraph Story Text
            </label>
            <textarea
              rows={4}
              value={aboutText1}
              onChange={(e) => setAboutText1(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Second Paragraph Story Text
            </label>
            <textarea
              rows={4}
              value={aboutText2}
              onChange={(e) => setAboutText2(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Branding & Call-To-Action */}
      <div className="space-y-5 pt-6 border-t border-slate-100">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Footer Banner & Branding Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Footer CTA Badge Text
            </label>
            <input
              type="text"
              value={footerCtaBadge}
              onChange={(e) => setFooterCtaBadge(e.target.value)}
              placeholder="e.g. Admissions Open 2026"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Footer CTA Headline
            </label>
            <input
              type="text"
              value={footerCtaTitle}
              onChange={(e) => setFooterCtaTitle(e.target.value)}
              placeholder="e.g. Ready to shape your future?"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Footer CTA Description
            </label>
            <textarea
              rows={2}
              value={footerCtaDescription}
              onChange={(e) => setFooterCtaDescription(e.target.value)}
              placeholder="Join 20,000+ students who chose BAC..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Footer About Description
            </label>
            <textarea
              rows={3}
              value={footerAboutText}
              onChange={(e) => setFooterAboutText(e.target.value)}
              placeholder="BAC is a globally connected research university..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Contact Details & Socials */}
      <div className="space-y-5 pt-6 border-t border-slate-100">
        <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
          Footer Contact & Socials
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Campus Address
            </label>
            <input
              type="text"
              value={footerAddress}
              onChange={(e) => setFooterAddress(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={footerPhone}
              onChange={(e) => setFooterPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Admissions Email
            </label>
            <input
              type="email"
              value={footerEmail}
              onChange={(e) => setFooterEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              General Info Email
            </label>
            <input
              type="email"
              value={footerInfoEmail}
              onChange={(e) => setFooterInfoEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Facebook URL
            </label>
            <input
              type="text"
              value={footerFacebook}
              onChange={(e) => setFooterFacebook(e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Twitter / X URL
            </label>
            <input
              type="text"
              value={footerTwitter}
              onChange={(e) => setFooterTwitter(e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Instagram URL
            </label>
            <input
              type="text"
              value={footerInstagram}
              onChange={(e) => setFooterInstagram(e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={footerLinkedin}
              onChange={(e) => setFooterLinkedin(e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              YouTube URL
            </label>
            <input
              type="text"
              value={footerYoutube}
              onChange={(e) => setFooterYoutube(e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </form>
    </div>
  );
}
