"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Newspaper,
  Megaphone,
  Trophy,
  BookOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  SectionHeading,
  Reveal,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { useSiteData, NewsArticle, NewsEventsConfig, defaultNewsEventsConfig } from "@/lib/site-context";
import { universityEvents } from "@/lib/university-data";
import { cn } from "@/lib/utils";

// ─── Category config ──────────────────────────────────────────────────────────

const NEWS_CATEGORIES = ["All", "News", "Events", "Announcements", "Achievements", "Campus Life"] as const;
type FilterCategory = (typeof NEWS_CATEGORIES)[number];

const CATEGORY_BADGE: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "University News":  { bg: "bg-white/95 border border-emerald-200/90", text: "text-[#14532D]", icon: BookOpen   },
  Achievement:        { bg: "bg-white/95 border border-amber-300/90",   text: "text-amber-800",  icon: Trophy     },
  Announcement:       { bg: "bg-white/95 border border-blue-200/90",    text: "text-blue-800",   icon: Megaphone  },
  "Campus Life":      { bg: "bg-white/95 border border-rose-200/90",    text: "text-rose-800",   icon: Sparkles   },
  Research:           { bg: "bg-white/95 border border-emerald-200/90", text: "text-[#14532D]", icon: BookOpen  },
};

const NEWS_TO_FILTER_MAP: Record<string, FilterCategory> = {
  "University News": "News",
  Achievement:       "Achievements",
  Announcement:      "Announcements",
  "Campus Life":     "Campus Life",
  Research:          "News",
};

const EVENT_CATEGORY_COLORS: Record<string, string> = {
  Seminars:        "bg-navy text-white",
  Workshops:       "bg-emerald-600 text-white",
  Hackathons:      "bg-violet-600 text-white",
  "Guest Lectures":"bg-gold text-navy",
  Cultural:        "bg-rose-500 text-white",
  Sports:          "bg-amber-600 text-white",
  Placements:      "bg-teal-600 text-white",
};

// ─── Fallback news (shown when API is unavailable) ────────────────────────────

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "f1",
    title: "BAC Global University Ranked Among Top 50 Institutions in Asia",
    excerpt: "BAC has secured a place in the prestigious QS Asia University Rankings 2026, marking a significant milestone.",
    category: "Achievement",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 2, 2026",
    dateISO: "2026-09-02",
    featured: true,
    published: true,
  },
  {
    id: "f2",
    title: "New AI & Quantum Engineering Centre Inaugurated",
    excerpt: "The ₹120-crore research centre opens its doors to faculty and students this semester.",
    category: "University News",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 28, 2026",
    dateISO: "2026-08-28",
    featured: false,
    published: true,
  },
  {
    id: "f3",
    title: "Admissions Open for Academic Year 2026–27",
    excerpt: "Applications now accepted for UG, PG, and doctoral programs. Early-bird scholarships available.",
    category: "Announcement",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 15, 2026",
    dateISO: "2026-08-15",
    featured: false,
    published: true,
  },
  {
    id: "f4",
    title: "BAC Students Win Gold at National Robotics Championship",
    excerpt: "Five undergrads from Mechanical Engineering clinched gold at the All-India Robotics Championships.",
    category: "Achievement",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 10, 2026",
    dateISO: "2026-08-10",
    featured: false,
    published: true,
  },
  {
    id: "f5",
    title: "Annual Cultural Festival 'Rangmanch 2026' Sets Record",
    excerpt: "The four-day extravaganza hosted 8,000+ participants and featured performances by leading national artists.",
    category: "Campus Life",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    date: "Apr 10, 2026",
    dateISO: "2026-04-10",
    featured: false,
    published: true,
  },
  {
    id: "f6",
    title: "MoU Signed with MIT for Joint Research Programs",
    excerpt: "A five-year collaboration covering joint PhD supervision, faculty exchange, and shared lab access.",
    category: "University News",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    date: "Mar 22, 2026",
    dateISO: "2026-03-22",
    featured: false,
    published: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NewsEventsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const { goEvents } = useNav();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");

  const cfg: NewsEventsConfig = data?.newsConfig || defaultNewsEventsConfig;

  // Hide section if disabled in admin
  if (!cfg.sectionEnabled) return null;

  const allArticles = (data?.news && data.news.length > 0 ? data.news : FALLBACK_NEWS)
    .filter((a) => a.published);

  const allEvents = (data?.events && data.events.length > 0 ? data.events : universityEvents)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .slice(0, cfg.maxEventsVisible);

  // Featured article
  const featured = allArticles.find((a) => a.id === cfg.featuredArticleId && a.featured)
    || allArticles.find((a) => a.featured)
    || allArticles[0];

  // Filtered news grid (excludes featured to avoid duplicate)
  const filteredNews = useMemo(() => {
    let articles = allArticles.filter((a) => a.id !== featured?.id);
    if (activeFilter === "Events") return [];
    if (activeFilter !== "All") {
      articles = articles.filter((a) => {
        const mapped = NEWS_TO_FILTER_MAP[a.category];
        if (activeFilter === "News") return mapped === "News";
        if (activeFilter === "Achievements") return a.category === "Achievement";
        if (activeFilter === "Announcements") return a.category === "Announcement";
        if (activeFilter === "Campus Life") return a.category === "Campus Life";
        return true;
      });
    }
    return articles.slice(0, cfg.maxNewsVisible);
  }, [allArticles, featured, activeFilter, cfg.maxNewsVisible]);

  const showEvents = activeFilter === "All" || activeFilter === "Events";

  return (
    <section id="news-events" className="relative py-12 sm:py-20 lg:py-28 bg-white border-b border-border overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] blob bg-gold/8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 blob bg-navy/5 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">

        {/* ── Section Header ─────────────────────────────────── */}
        <SectionHeading
          eyebrow="Latest from BAC"
          title={
            <>
              {cfg.heading.split("&")[0]}
              <span className="text-gold-gradient">&amp;</span>
              {cfg.heading.split("&")[1] ?? " Events"}
            </>
          }
          description={cfg.subtitle}
        />

        {/* ── Category Filter Pills ───────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap gap-2 mt-10 justify-center">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200",
                  activeFilter === cat
                    ? "bg-[#14532D] text-white border-[#14532D] shadow-sm"
                    : "bg-white text-[#1F2937] border-gray-300 hover:border-[#14532D] hover:bg-emerald-50/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── Featured News Card ──────────────────────────────── */}
        {cfg.showFeatured && featured && (activeFilter === "All" || activeFilter === "News" || activeFilter === NEWS_TO_FILTER_MAP[featured.category]) && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            whileHover={{ y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: "easeOut" } }}
            className="mt-14 group rounded-3xl overflow-hidden bg-white border border-border shadow-premium hover:shadow-xl transition-all duration-500 grid lg:grid-cols-[3fr_2fr] cursor-pointer"
            onClick={goEvents}
          >
            {/* Image */}
            <div className="relative h-64 lg:h-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 lg:bg-gradient-to-t" />
              {/* Floating badge on image */}
              <div className="absolute top-5 left-5">
                <CategoryBadge category={featured.category} />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#14532D] uppercase tracking-widest mb-4">
                <Newspaper className="w-3.5 h-3.5 text-[#166534]" />
                Featured Story
              </div>
              <h3 className="font-serif font-bold text-2xl lg:text-3xl text-[#14532D] leading-tight mb-4 group-hover:text-[#166534] transition-colors">
                {featured.title}
              </h3>
              <p className="text-[#374151] text-sm leading-relaxed mb-6 line-clamp-3">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#374151] font-medium mb-7">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#166534]" />
                  {featured.date}
                </span>
                {featured.author && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[#1F2937] font-semibold">{featured.author}</span>
                  </>
                )}
              </div>
              <div>
                <PremiumButton
                  variant="navy"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={goEvents}
                >
                  Read Full Story
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── News Grid ───────────────────────────────────────── */}
        {cfg.showNewsGrid && filteredNews.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredNews.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : 25,
                  x: shouldReduceMotion ? 0 : idx % 2 === 0 ? -6 : 6,
                }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
                className="h-full"
              >
                <NewsCard article={article} onReadMore={goEvents} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Upcoming Events ─────────────────────────────────── */}
        {cfg.showEvents && showEvents && allEvents.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy/5 text-navy border border-navy/10 text-xs font-semibold uppercase tracking-widest mb-3">
                    <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                    Upcoming Events
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-navy">
                    What&apos;s Coming Up
                  </h3>
                </div>
                <button
                  onClick={goEvents}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-navy transition-colors"
                >
                  View All Events
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 25,
                    x: shouldReduceMotion ? 0 : idx % 2 === 0 ? 6 : -6,
                  }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="h-full"
                >
                  <EventCard event={event} onView={goEvents} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── View All CTA ────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <PremiumButton
              variant="navy"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={goEvents}
            >
              View All News &amp; Events
            </PremiumButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ article, onReadMore }: { article: NewsArticle; onReadMore: () => void }) {
  return (
    <div
      onClick={onReadMore}
      className="group h-full rounded-2xl overflow-hidden bg-white border border-border hover:border-gold-dark hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image with zoom */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <CategoryBadge category={article.category} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-[#374151] font-medium mb-3">
          <Calendar className="w-3 h-3 text-[#166534]" />
          {article.date}
        </div>
        <h4 className="font-serif font-bold text-[#14532D] text-lg leading-snug mb-2 group-hover:text-[#166534] transition-colors line-clamp-2">
          {article.title}
        </h4>
        <p className="text-[#374151] text-sm leading-relaxed line-clamp-3 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-sm font-bold text-[#166534] group-hover:gap-2.5 transition-all">
          Read More
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onView }: { event: any; onView: () => void }) {
  // Parse day/month from dateISO
  const d = new Date(event.dateISO);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const badgeCls = EVENT_CATEGORY_COLORS[event.category] || "bg-navy text-white";

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-border hover:border-gold-dark hover:shadow-premium transition-all duration-300 flex flex-col">
      {/* Top strip with date box */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Date box */}
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#14532D] text-white shadow-lg border border-white/20">
          <span className="font-serif font-black text-xl leading-none">{day}</span>
          <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5 text-emerald-200">{month}</span>
        </div>

        {/* Category badge */}
        <div className={cn("absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm", badgeCls)}>
          {event.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h4 className="font-serif font-bold text-[#14532D] text-base leading-snug mb-3 group-hover:text-[#166534] transition-colors line-clamp-2">
          {event.title}
        </h4>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-[#374151] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#166534] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#374151] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#166534] shrink-0" />
            {event.date}
          </div>
        </div>
        <p className="text-[#374151] text-xs leading-relaxed line-clamp-2 flex-1">
          {event.description}
        </p>
        <button
          onClick={onView}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#14532D]/30 text-[#14532D] text-xs font-bold hover:bg-[#14532D] hover:text-white transition-all duration-200 shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Event
        </button>
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_BADGE[category] ?? { bg: "bg-navy/80", text: "text-white", icon: Newspaper };
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm", cfg.bg, cfg.text)}>
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
}
