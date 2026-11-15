"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Newspaper,
  Megaphone,
  Trophy,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { useSiteData, NewsArticle, NewsEventsConfig, defaultNewsEventsConfig } from "@/lib/site-context";
import { universityEvents } from "@/lib/university-data";
import { cn } from "@/lib/utils";

// ─── Category config ──────────────────────────────────────────────────────────

const NEWS_CATEGORIES = ["All", "News", "Events", "Announcements", "Achievements", "Campus Life"] as const;
type FilterCategory = (typeof NEWS_CATEGORIES)[number];

const CATEGORY_BADGE: Record<string, { label: string; color: string }> = {
  "University News": { label: "University News", color: "text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0]" },
  Achievement:       { label: "Achievement",      color: "text-purple-700   bg-purple-50   border border-purple-200" },
  Announcement:      { label: "Announcement",     color: "text-blue-700     bg-blue-50     border border-blue-200"   },
  "Campus Life":     { label: "Campus Life",      color: "text-rose-700     bg-rose-50     border border-rose-200"   },
  Research:          { label: "Research",          color: "text-violet-700   bg-violet-50   border border-violet-200" },
  Events:            { label: "Events",            color: "text-amber-700    bg-amber-50    border border-amber-200"  },
};

const NEWS_TO_FILTER_MAP: Record<string, FilterCategory> = {
  "University News": "News",
  Achievement:       "Achievements",
  Announcement:      "Announcements",
  "Campus Life":     "Campus Life",
  Research:          "News",
  Events:            "Events",
};

// ─── Fallback news ────────────────────────────────────────────────────────────

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "f1",
    title: "BAC Global University Ranked Among Top 50 Institutions in Asia",
    excerpt: "BAC has secured a place in the prestigious QS Asia University Rankings 2026, marking a significant milestone in academic excellence, research impact, and global student satisfaction.",
    category: "Achievement",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 2, 2026",
    dateISO: "2026-09-02",
    featured: true,
    published: true,
  },
  {
    id: "f2",
    title: "State-of-the-art Robotics Lab Inaugurated for Engineering",
    excerpt: "The ₹120-crore research centre opens its doors to faculty and students this semester.",
    category: "University News",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    date: "Aug 28, 2026",
    dateISO: "2026-08-28",
    featured: false,
    published: true,
  },
  {
    id: "f3",
    title: "Annual Commencement Ceremony 2026 Registration Open",
    excerpt: "Applications now accepted for UG, PG, and doctoral programs. Early-bird scholarships available.",
    category: "Announcement",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    date: "Aug 24, 2026",
    dateISO: "2026-08-24",
    featured: false,
    published: true,
  },
  {
    id: "f4",
    title: "BAC Students Win International Innovation Hackathon",
    excerpt: "Five undergrads from Computer Science clinched gold at the International Innovation Championship.",
    category: "Achievement",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80",
    date: "Aug 19, 2026",
    dateISO: "2026-08-19",
    featured: false,
    published: true,
  },
  {
    id: "f5",
    title: "Green Campus Initiative Achieves 100% Renewable Transition",
    excerpt: "Solar installations and smart building management across campuses reduce operational carbon emissions and energy consumption by over 70%, setting a new benchmark.",
    category: "Campus Life",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    date: "Aug 15, 2026",
    dateISO: "2026-08-15",
    readTime: "3 min read",
    featured: false,
    published: true,
  },
  {
    id: "f6",
    title: "Global AI in Healthcare Symposium Registration Opens",
    excerpt: "Distinguished speakers and clinical researchers convene for a 3-day hybrid conference on applied machine learning in diagnostics and treatment planning.",
    category: "Events",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    date: "Aug 12, 2026",
    eventDate: "Sep 18 – 20, 2026",
    dateISO: "2026-08-12",
    featured: false,
    published: true,
  },
  {
    id: "f7",
    title: "$4.2M Multi-Year Grant Awarded for Clean Energy Storage",
    excerpt: "The national science foundation backs BAC faculty consortium for scalable sodium-ion battery grid storage solutions, boosting clean energy research.",
    category: "Research",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    date: "Aug 08, 2026",
    dateISO: "2026-08-08",
    readTime: "4 min read",
    featured: false,
    published: true,
  },
];

// ─── Main Section ─────────────────────────────────────────────────────────────

export function NewsEventsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const { goEvents } = useNav();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");

  const cfg: NewsEventsConfig = data?.newsConfig || defaultNewsEventsConfig;

  const allArticles = (data?.news && data.news.length > 0 ? data.news : FALLBACK_NEWS)
    .filter((a) => a.published);

  // Featured article
  const featured = allArticles.find((a) => a.id === cfg.featuredArticleId && a.featured)
    || allArticles.find((a) => a.featured)
    || allArticles[0];

  // Sidebar articles (top-right 3 cards)
  const sidebarArticles = useMemo(() => {
    return allArticles
      .filter((a) => a.id !== featured?.id)
      .slice(0, 3);
  }, [allArticles, featured]);

  // Bottom grid articles (3 cards below the featured+sidebar layout)
  const bottomArticles = useMemo(() => {
    const usedIds = new Set([featured?.id, ...sidebarArticles.map((a) => a.id)]);
    let articles = allArticles.filter((a) => !usedIds.has(a.id));
    if (activeFilter !== "All") {
      articles = articles.filter((a) => {
        if (activeFilter === "Events") return a.category === "Events";
        if (activeFilter === "News") return NEWS_TO_FILTER_MAP[a.category] === "News";
        if (activeFilter === "Achievements") return a.category === "Achievement";
        if (activeFilter === "Announcements") return a.category === "Announcement";
        if (activeFilter === "Campus Life") return a.category === "Campus Life";
        return true;
      });
    }
    return articles.slice(0, 3);
  }, [allArticles, featured, sidebarArticles, activeFilter]);

  if (!cfg.sectionEnabled) return null;

  return (
    <section id="news-events" className="relative py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-50/60 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-50/40 blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">

        {/* ── Section Header ──────────────────────────────────────────── */}
        <Reveal>
          <div className="text-center mb-8 sm:mb-10">
            {/* Eyebrow pill */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#DCE8DE] bg-[#F1F8F2] text-[#2E7D32] text-xs font-bold uppercase tracking-widest mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              Latest from BAC
            </span>

            <h2 className="font-serif font-bold text-[#14532D] text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight mb-4">
              News &amp; Events
            </h2>
            <p className="text-[#68766C] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest news, events, achievements, and activities at BAC Global University.
            </p>
          </div>
        </Reveal>

        {/* ── Category Filter Pills ────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer",
                  activeFilter === cat
                    ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm"
                    : "bg-white text-[#26352B] border-[#DCE8DE] hover:border-[#2E7D32] hover:bg-[#F1F8F2]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── Main Two-Column Layout: Featured Left + Sidebar Right ──── */}
        {featured && (activeFilter === "All" || activeFilter === "News" || activeFilter === "Achievements" || activeFilter === "Announcements" || activeFilter === "Campus Life") && (
          <div className="grid lg:grid-cols-[3fr_2fr] gap-6 mb-6">

            {/* Featured Large Card (Left) */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onClick={goEvents}
              className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer bg-white flex flex-col"
            >
              {/* Large Image */}
              <div className="relative h-[280px] sm:h-[340px] overflow-hidden bg-slate-100">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {/* Featured label badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-[#14532D] shadow-sm border border-white/80">
                    <Newspaper className="w-3.5 h-3.5" />
                    Featured Story
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-7 flex flex-col flex-1">
                <h3 className="font-serif font-bold text-[#14532D] text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-[#166534] transition-colors">
                  {featured.title}
                </h3>
                <p className="text-[#374151] text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#166534]" />
                    {featured.date}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); goEvents(); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Read Full Story
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sidebar: 3 compact list cards (Right) */}
            <div className="flex flex-col gap-4">
              {sidebarArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : idx * 0.1, ease: "easeOut" }}
                  onClick={goEvents}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#C8E6C9] transition-all duration-300 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <span className={cn(
                      "inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2",
                      CATEGORY_BADGE[article.category]?.color || "text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0]"
                    )}>
                      {CATEGORY_BADGE[article.category]?.label || article.category}
                    </span>
                    <h4 className="font-serif font-bold text-[#14532D] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#166534] transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] group-hover:gap-1.5 transition-all">
                        Read
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom 3-Column Cards ────────────────────────────────────── */}
        {bottomArticles.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {bottomArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : idx * 0.1, ease: "easeOut" }}
                onClick={goEvents}
                className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#C8E6C9] transition-all duration-300 cursor-pointer flex flex-col p-5"
              >
                {/* Top row: category tag + date */}
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "inline-block text-[11px] font-bold px-3 py-1 rounded-full",
                    CATEGORY_BADGE[article.category]?.color || "text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0]"
                  )}>
                    {CATEGORY_BADGE[article.category]?.label || article.category}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] font-medium">
                    {article.date}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-[#14532D] text-base leading-snug mb-3 line-clamp-2 group-hover:text-[#166534] transition-colors flex-1">
                  {article.title}
                </h4>

                {/* Excerpt */}
                <p className="text-[#374151] text-xs leading-relaxed line-clamp-3 mb-4">
                  {article.excerpt}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {(article as any).readTime ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium">
                      <Clock className="w-3 h-3" />
                      {(article as any).readTime}
                    </span>
                  ) : (article as any).eventDate ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium">
                      <Calendar className="w-3 h-3" />
                      {(article as any).eventDate}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#374151] group-hover:text-[#15803D] group-hover:gap-1.5 transition-all">
                    {article.category === "Events" ? "Details" : "Read"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── View All CTA Button ──────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="text-center">
            <button
              onClick={goEvents}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border-2 border-[#14532D]/20 bg-white text-[#14532D] text-sm font-bold hover:border-[#14532D] hover:bg-[#F0FDF4] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              View all university announcements &amp; events
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Helpers unused inline — kept for tree-shaking friendliness ───────────────
export { };
