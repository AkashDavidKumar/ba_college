"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Newspaper,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";
import { NoticesFeedSection } from "./notices-feed-section";

type NewsItem = {
  id: string;
  title: string;
  category: "Academic" | "Announcements" | "Events" | "Circulars" | "Achievements";
  date: string;
  readTime: string;
  summary: string;
  fullContent: string;
  featured?: boolean;
  hasAttachment?: boolean;
};

const NEWS_ARTICLES: NewsItem[] = [
  {
    id: "n-1",
    title: "Admissions Open for Undergraduate & Postgraduate Programmes (Academic Year 2026-27)",
    category: "Announcements",
    date: "May 10, 2026",
    readTime: "2 min read",
    featured: true,
    summary: "Bishop Ambrose College invites applications from eligible candidates for 13 undergraduate degree programmes including Computer Science, Commerce, Management, and Humanities.",
    fullContent: "Bishop Ambrose College, an autonomous institution affiliated with Bharathiar University, announces the commencement of online admissions for the academic year 2026-27. Prospective students can submit applications through the official college portal. Merit scholarships are available for deserving students, rural candidates, and state-level sports achievers.",
    hasAttachment: true,
  },
  {
    id: "n-2",
    title: "BAC Conferred with 'Best Autonomous College for Skill Excellence' Award",
    category: "Achievements",
    date: "April 28, 2026",
    readTime: "3 min read",
    summary: "The Higher Education Excellence Summit honored Bishop Ambrose College for pioneering Outcome-Based Education and high campus placement ratios.",
    fullContent: "At the 12th Annual Higher Education Leadership Conclave, Bishop Ambrose College was recognized with the prestigious Institutional Skill Excellence citation in recognition of its CBCS framework, industry internships, and 85%+ campus placement track record.",
    hasAttachment: false,
  },
  {
    id: "n-3",
    title: "Autonomous End Semester Examination Time Table (April/May 2026)",
    category: "Circulars",
    date: "April 15, 2026",
    readTime: "1 min read",
    summary: "Controller of Examinations releases detailed schedule for theory and practical autonomous semester exams. Hall tickets available on ERP.",
    fullContent: "All UG and PG students are hereby notified that the Autonomous End Semester Examinations will commence from May 2, 2026. Hall tickets can be downloaded through the BAC Student ERP portal after fee clearance. Examination instructions and seating charts will be displayed on department notice boards.",
    hasAttachment: true,
  },
  {
    id: "n-4",
    title: "International Symposium on Artificial Intelligence & Generative Technologies",
    category: "Academic",
    date: "March 22, 2026",
    readTime: "3 min read",
    summary: "Department of Computer Science & BCA hosts 2-day technical seminar featuring Google & Microsoft industry practitioners.",
    fullContent: "The Department of Computer Science organized a two-day symposium on AI architectures and generative workflows. Over 300 student delegates from 25 colleges participated in coding hackathons, paper presentations, and prompt engineering challenges.",
    hasAttachment: false,
  },
  {
    id: "n-5",
    title: "Annual Sports Meet 'Athlos 2026' Concludes with Record Participation",
    category: "Events",
    date: "February 18, 2026",
    readTime: "2 min read",
    summary: "St. Thomas House emerged overall champions in track and field events with over 600 student athletes participating.",
    fullContent: "The 31st Annual Sports Day of Bishop Ambrose College concluded with spirited athletic events. Rev. Fr. Secretary presided over the march past and presented rolling trophies to victorious student contingents.",
    hasAttachment: false,
  },
  {
    id: "n-6",
    title: "IQAC Quality Initiative: Faculty Development Programme on AI Pedagogy",
    category: "Academic",
    date: "January 14, 2026",
    readTime: "2 min read",
    summary: "Week-long national level FDP for higher education faculty on integrating modern pedagogical technology in autonomous classrooms.",
    fullContent: "The Internal Quality Assurance Cell (IQAC) of BAC organized a week-long faculty enhancement workshop on hybrid instructional design, digital rubric grading, and AI-assisted research publication.",
    hasAttachment: true,
  },
];

const CATEGORIES = ["All", "Announcements", "Academic", "Circulars", "Events", "Achievements"] as const;

export function NewsPage() {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const filtered = NEWS_ARTICLES.filter((item) => {
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const featured = NEWS_ARTICLES.find((n) => n.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="relative bg-navy-dark text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark/90 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-light">News & Circulars</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Newspaper className="w-3.5 h-3.5" /> Official Communications
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            BAC News, Circulars & Announcements
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Stay updated with the latest campus notifications, examination circulars, academic conferences, student achievements, and administrative press releases.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-10">
        {/* Featured Spotlight */}
        {featured && (
          <Reveal>
            <div className="bg-gradient-to-br from-navy via-navy-dark to-navy text-white rounded-3xl p-8 lg:p-10 border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
                <Bell className="w-72 h-72 text-gold" />
              </div>

              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <Badge variant="gold">Featured Announcement</Badge>
                  <span className="text-xs text-white/70">{featured.date}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  {featured.title}
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  {featured.summary}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveArticle(featured)}
                    className="px-5 py-2.5 bg-gold text-navy font-bold rounded-xl text-xs hover:bg-gold-light transition-colors shadow-md cursor-pointer"
                  >
                    Read Full Circular
                  </button>
                  {featured.hasAttachment && (
                    <button className="px-5 py-2.5 border border-white/20 text-white font-semibold rounded-xl text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-gold" /> Download PDF Notification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Filter and Search controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-navy text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-navy hover:text-navy"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search circulars or news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs bg-white focus:border-navy focus:outline-none"
            />
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold/40 transition-all flex flex-col justify-between h-full space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="navy">{item.category}</Badge>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>

                  <h3 className="font-bold text-base text-navy leading-snug hover:text-gold-dark transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{item.readTime}</span>
                  <button
                    onClick={() => setActiveArticle(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold-dark transition-colors cursor-pointer"
                  >
                    Read More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Official Campus Notices & Circulars Feed */}
      <NoticesFeedSection />

      {/* Detail Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 space-y-5 shadow-2xl border border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold">{activeArticle.category}</Badge>
                    <span className="text-xs text-slate-400">{activeArticle.date}</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-navy mt-2">
                    {activeArticle.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed space-y-3 py-2 border-y border-slate-100">
                <p>{activeArticle.fullContent}</p>
                <p>{activeArticle.summary}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {activeArticle.hasAttachment ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-dark transition-colors">
                    <Download className="w-3.5 h-3.5 text-gold" /> Download Official Notice (PDF)
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Official Bishop Ambrose College Release</span>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
