import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileText, Users, BarChart3, BookOpen, Star, Download,
  ChevronDown, ChevronRight, Search, Eye, X, Calendar, Award, Target,
  CheckCircle, Image as ImageIcon, FileDown, ClipboardList, TrendingUp, Layers,
  MessageSquare, Microscope, Bell, Building2, Info, Phone, Mail, MapPin, Clock,
  Filter, Check, Sparkles
} from "lucide-react";
import { useIqacData } from "@/lib/iqac-context";
import { cn } from "@/lib/utils";

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const duration = 1800;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }
    }, { threshold: 0.2 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

// Section wrapper with smooth reveal
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn("py-10 px-5 sm:px-8 md:px-10 scroll-mt-24", className)}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold uppercase tracking-widest mb-3 border border-[#D1E7D3]">
        {badge}
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#14532D] tracking-tight mb-2 font-serif">{title}</h2>
      {subtitle && <p className="text-gray-600 text-sm md:text-base max-w-3xl leading-relaxed">{subtitle}</p>}
      <div className="h-1 w-16 bg-gradient-to-r from-[#1B5E20] to-[#388E3C] rounded-full mt-3" />
    </div>
  );
}

// PDF & Document Preview Modal
function DocumentModal({ item, onClose }: { item: { title: string; url?: string; type?: string; details?: string }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-[#D1E7D3]"
      >
        <div className="flex items-center justify-between p-4 bg-[#F5FBF6] border-b border-[#D1E7D3]">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-[#1B5E20] shrink-0" />
            <h3 className="font-bold text-[#14532D] text-base truncate">{item.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#E8F5E9] border border-[#D1E7D3] flex items-center justify-center text-[#1B5E20] mb-4 shadow-sm">
            <FileText className="w-10 h-10" />
          </div>
          <h4 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h4>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            {item.details || "Official Internal Quality Assurance Cell document published by BAC Global University. Verified & Approved for NAAC Accreditation / NIRF Audit records."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={item.url || "#"}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white font-semibold text-sm hover:bg-[#388E3C] transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Download Document (PDF)
            </a>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Lightbox Modal for Gallery
function GalleryModal({ item, onClose }: { item: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20"
      >
        <div className="relative max-h-[60vh] overflow-hidden bg-black flex items-center justify-center">
          <img src={item.imageUrl} alt={item.title} className="max-h-[60vh] w-full object-contain" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold uppercase">
              {item.category}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {item.date}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#14532D] mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

// Navigation sidebar list
const navItems = [
  { id: "about", label: "About IQAC", icon: Info },
  { id: "vision-mission", label: "Vision & Mission", icon: Target },
  { id: "members", label: "IQAC Members", icon: Users },
  { id: "aqar", label: "AQAR Reports", icon: FileText },
  { id: "ssr", label: "SSR Reports", icon: BookOpen },
  { id: "iiqa", label: "IIQA Reports", icon: Shield },
  { id: "nirf", label: "NIRF Reports", icon: BarChart3 },
  { id: "minutes", label: "Meeting Minutes & ATR", icon: ClipboardList },
  { id: "initiatives", label: "Quality Initiatives", icon: TrendingUp },
  { id: "best-practices", label: "Best Practices", icon: Star },
  { id: "distinctiveness", label: "Institutional Distinctiveness", icon: Award },
  { id: "feedback", label: "Curriculum Feedback", icon: MessageSquare },
  { id: "audit", label: "Academic Audit", icon: Microscope },
  { id: "monthly", label: "Monthly Reports", icon: Calendar },
  { id: "notices", label: "Notices & Circulars", icon: Bell },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "downloads", label: "Download Center", icon: FileDown },
];

export function IqacPageContent() {
  const { data, loading, recordDownload } = useIqacData();
  const [activeSection, setActiveSection] = useState("about");
  const [modalItem, setModalItem] = useState<any | null>(null);
  const [galleryItem, setGalleryItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAboutTab, setActiveAboutTab] = useState<"intro" | "objectives" | "functions">("intro");
  const [expandedYear, setExpandedYear] = useState<string | null>("2026");
  const [galleryCategory, setGalleryCategory] = useState<string>("all");
  const [feedbackTab, setFeedbackTab] = useState<string>("students");
  const [activeMemberRole, setActiveMemberRole] = useState<string>("all");
  const [iiqaFilter, setIiqaFilter] = useState<string>("all");
  const [downloadSearch, setDownloadSearch] = useState<string>("");
  const [activeDownloadTab, setActiveDownloadTab] = useState<string>("all");

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(item.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDownload = (section: string, id: string, fileUrl: string) => {
    if (recordDownload) {
      recordDownload(section, id);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5FBF6]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-[#D1E7D3] max-w-sm">
          <div className="w-16 h-16 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-[#14532D] text-lg mb-1">Loading IQAC Portal</h3>
          <p className="text-xs text-gray-500">Promoting Quality Education & Institutional Excellence...</p>
        </div>
      </div>
    );
  }

  const d = data || {};
  const hero = d.hero || {};
  const stats = d.stats || {};
  const about = d.about || {};
  const contact = d.contact || {};
  const members = d.members || [];
  const aqarReports = d.aqarReports || [];
  const ssrReports = d.ssrReports || [];
  const iiqaReports = d.iiqaReports || [];
  const nirfReports = d.nirfReports || [];
  const meetingMinutes = d.meetingMinutes || [];
  const qualityInitiatives = d.qualityInitiatives || [];
  const bestPractices = d.bestPractices || [];
  const institutionalDistinctiveness = d.institutionalDistinctiveness || [];
  const curriculumFeedback = d.curriculumFeedback || [];
  const academicAudits = d.academicAudits || [];
  const monthlyReports = d.monthlyReports || [];
  const notices = d.notices || [];
  const gallery = d.gallery || [];

  // Filtered AQAR
  const filteredAqar = aqarReports.filter((r: any) =>
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Members
  const filteredMembers = activeMemberRole === "all"
    ? members
    : members.filter((m: any) => m.role?.toLowerCase().includes(activeMemberRole.toLowerCase()));

  // Filtered Gallery
  const filteredGallery = galleryCategory === "all"
    ? gallery
    : gallery.filter((g: any) => g.category?.toLowerCase() === galleryCategory.toLowerCase());

  // Filtered IIQA
  const filteredIiqa = iiqaFilter === "all"
    ? iiqaReports
    : iiqaReports.filter((i: any) => i.status === iiqaFilter);

  // All Downloads list compiled
  const allDownloadDocuments: Array<{ id: string; title: string; category: string; year?: string; url: string; size?: string }> = [
    ...aqarReports.map((a: any) => ({ id: a.id, title: a.title, category: "AQAR", year: a.academicYear, url: a.fileUrl, size: a.fileSize })),
    ...ssrReports.map((s: any) => ({ id: s.id, title: s.title, category: "SSR", year: s.year, url: s.fileUrl, size: "6.4 MB" })),
    ...iiqaReports.map((i: any) => ({ id: i.id, title: `IIQA Report (${i.cycle})`, category: "IIQA", year: i.submissionDate, url: i.documentUrl, size: "2.1 MB" })),
    ...nirfReports.map((n: any) => ({ id: n.id, title: `NIRF ${n.category} Ranking Dossier ${n.year}`, category: "NIRF", year: n.year, url: n.documentUrl, size: "1.8 MB" })),
    ...meetingMinutes.map((m: any) => ({ id: m.id, title: `Minutes of Meeting ${m.meetingNo}`, category: "Meeting Minutes", year: m.date, url: m.minutesFileUrl, size: "1.2 MB" })),
    ...meetingMinutes.map((m: any) => ({ id: `atr-${m.id}`, title: `Action Taken Report (ATR) - ${m.meetingNo}`, category: "ATR Reports", year: m.date, url: m.atrFileUrl, size: "980 KB" })),
    ...academicAudits.map((a: any) => ({ id: a.id, title: `${a.auditType} (${a.auditorType.toUpperCase()}) - ${a.year}`, category: "Academic Audit", year: a.year, url: a.fileUrl, size: "2.4 MB" })),
    ...monthlyReports.flatMap((yr: any) =>
      (yr.months || []).flatMap((m: any) =>
        (m.files || []).map((f: any, idx: number) => ({
          id: `month-${yr.year}-${m.monthIndex}-${idx}`,
          title: f.label,
          category: "Monthly Reports",
          year: yr.year,
          url: f.fileUrl,
          size: "1.5 MB"
        }))
      )
    )
  ];

  const filteredDownloads = allDownloadDocuments.filter(doc => {
    const matchCat = activeDownloadTab === "all" || doc.category.toLowerCase().replace(/\s+/g, "-") === activeDownloadTab;
    const matchSearch = !downloadSearch || doc.title.toLowerCase().includes(downloadSearch.toLowerCase()) || (doc.year && doc.year.includes(downloadSearch));
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-[#F5FBF6] min-h-screen text-slate-800 font-sans">
      
      {/* ──────────────────────────────────────────────────────────
          1. HERO SECTION
         ────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1B5E20] via-[#246B2A] to-[#0E3511] text-white overflow-hidden py-14 lg:py-20 border-b border-[#14532D]">
        {/* Background Subtle Geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#388E3C]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-[#C8E6C9]">
                <Shield className="w-4 h-4 text-emerald-300" />
                BAC Global University · Quality Benchmark
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
                {hero.title || "Internal Quality Assurance Cell (IQAC)"}
              </h1>

              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                {hero.subtitle || "Promoting Quality Education, Academic Excellence, and Continuous Institutional Improvement across teaching, research, and governance."}
              </p>

              {/* Accreditation Badges */}
              <div className="pt-1 flex flex-wrap gap-2.5 items-center">
                {(hero.accreditationBadges || ["NAAC A++", "NIRF Top 50", "NBA", "AICTE", "UGC"]).map((badge: string) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-bold text-white shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="pt-3 flex flex-wrap gap-3.5">
                <button
                  onClick={() => scrollTo("aqar")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1B5E20] font-bold text-sm shadow-xl hover:bg-[#E8F5E9] hover:shadow-2xl transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4 text-[#1B5E20]" />
                  View AQAR Reports
                </button>
                <button
                  onClick={() => scrollTo("downloads")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#388E3C] text-white font-bold text-sm border border-white/20 shadow-lg hover:bg-[#2E7D32] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download Documents
                </button>
              </div>
            </div>

            {/* Right Campus Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80"
                    alt="BAC Global University Academic Block"
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="px-2.5 py-1 rounded-md bg-[#1B5E20]/90 text-[11px] font-bold uppercase tracking-wider mb-2 inline-block">
                      Knowledge City Campus
                    </span>
                    <h4 className="text-lg font-bold">Center for Academic Excellence</h4>
                    <p className="text-xs text-white/80 mt-1">Home of BAC University IQAC Secretariat & Research Directorate</p>
                  </div>
                </div>

                {/* Floating Accreditation Badge */}
                <div className="absolute -bottom-5 -left-5 bg-white text-slate-800 p-4 rounded-2xl shadow-xl border border-[#D1E7D3] flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] shrink-0 font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NAAC Cycle-4 Accredited</div>
                    <div className="text-lg font-black text-[#14532D] leading-none">Grade A++ (CGPA 3.82)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          2. QUICK STATISTICS SECTION
         ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#D1E7D3] py-8 relative shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Total AQAR Reports", value: stats.totalAqarReports || 7, icon: FileText, suffix: "" },
              { label: "Total IQAC Documents", value: stats.totalDocuments || 148, icon: Layers, suffix: "+" },
              { label: "Total Quality Initiatives", value: stats.qualityInitiatives || 24, icon: TrendingUp, suffix: "" },
              { label: "Total Downloads", value: stats.totalDownloads || 3892, icon: Download, suffix: "+" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-[#F5FBF6] border border-[#D1E7D3] hover:border-[#388E3C] hover:shadow-md transition-all flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] mb-3 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#14532D] tracking-tight">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          3. MAIN LAYOUT: STICKY SIDEBAR + 17 CORE SECTIONS
         ────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Sticky Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#D1E7D3] shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#1B5E20] to-[#388E3C] p-4 text-white">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-200" />
                  <h3 className="font-serif font-bold text-base">IQAC Directory</h3>
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">Quality Assurance Framework & Reports</p>
              </div>

              <nav className="p-2 max-h-[calc(100vh-170px)] overflow-y-auto scrollbar-premium space-y-0.5 text-xs font-medium">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left font-semibold",
                        isActive
                          ? "bg-[#1B5E20] text-white shadow-sm"
                          : "text-slate-600 hover:bg-[#E8F5E9] hover:text-[#1B5E20]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 bg-[#F5FBF6] border-t border-[#D1E7D3] text-center">
                <div className="text-[11px] text-slate-500 font-medium">NAAC Accreditation Helpdesk</div>
                <a href="mailto:iqac@bac.edu" className="text-xs font-bold text-[#1B5E20] hover:underline">
                  iqac@bac.edu
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Sections (Col 9) */}
          <div className="lg:col-span-9 space-y-8">

            {/* ── 4. ABOUT IQAC SECTION ── */}
            <Section id="about" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Mandate & Framework"
                title="About Internal Quality Assurance Cell"
                subtitle="Established as per NAAC guidelines to institutionalize quality benchmarks and continuous performance enhancement."
              />

              {/* Sub-tabs: Intro / Objectives / Functions */}
              <div className="flex flex-wrap gap-2 border-b border-[#D1E7D3] pb-3 mb-6">
                {[
                  { id: "intro", label: "Introduction" },
                  { id: "objectives", label: "Core Objectives" },
                  { id: "functions", label: "Operational Functions" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAboutTab(tab.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      activeAboutTab === tab.id
                        ? "bg-[#1B5E20] text-white shadow-sm"
                        : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeAboutTab === "intro" && (
                <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <p>{about.introduction}</p>
                  <div className="grid sm:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-[#F5FBF6] border border-[#D1E7D3]">
                      <div className="text-xs font-bold text-[#1B5E20] uppercase">Established</div>
                      <div className="text-xl font-extrabold text-[#14532D] mt-1">2004</div>
                      <div className="text-xs text-slate-500 mt-1">22+ Years of Quality Operations</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F5FBF6] border border-[#D1E7D3]">
                      <div className="text-xs font-bold text-[#1B5E20] uppercase">NAAC Grade</div>
                      <div className="text-xl font-extrabold text-[#14532D] mt-1">A++ (CGPA 3.82)</div>
                      <div className="text-xs text-slate-500 mt-1">Highest Level Accreditation</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F5FBF6] border border-[#D1E7D3]">
                      <div className="text-xs font-bold text-[#1B5E20] uppercase">NIRF Benchmark</div>
                      <div className="text-xl font-extrabold text-[#14532D] mt-1">Top 50 Rank</div>
                      <div className="text-xs text-slate-500 mt-1">Among Best Universities in India</div>
                    </div>
                  </div>
                </div>
              )}

              {activeAboutTab === "objectives" && (
                <div className="grid gap-3">
                  {(about.objectives || []).map((obj: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#F5FBF6] border border-[#D1E7D3]">
                      <div className="w-6 h-6 rounded-full bg-[#1B5E20] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed font-medium">{obj}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeAboutTab === "functions" && (
                <div className="grid gap-3">
                  {(about.functions || []).map((fn: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5FBF6] border border-[#D1E7D3]">
                      <CheckCircle className="w-5 h-5 text-[#388E3C] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{fn}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>


            {/* ── 5. VISION & MISSION SECTION ── */}
            <Section id="vision-mission" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader badge="Guiding Philosophy" title="Vision & Mission" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E8F5E9] via-[#F5FBF6] to-white border border-[#D1E7D3] relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center mb-4 shadow-md">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#14532D] mb-3">Our Vision</h3>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{about.vision}</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#246B2A] to-[#0E3511] text-white shadow-md relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 shadow-inner">
                    <Target className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">{about.mission}</p>
                </div>
              </div>
            </Section>


            {/* ── 6. IQAC MEMBERS SECTION ── */}
            <Section id="members" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
                <SectionHeader
                  badge="Institutional Leadership"
                  title="IQAC Committee Members"
                  subtitle="Multidisciplinary committee comprising university leaders, distinguished professors, industry experts, and student scholars."
                />

                {/* Filter roles */}
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {["all", "Chairperson", "Coordinator", "Faculty", "Alumni"].map(role => (
                    <button
                      key={role}
                      onClick={() => setActiveMemberRole(role)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                        activeMemberRole === role
                          ? "bg-[#1B5E20] text-white"
                          : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] p-5 hover:shadow-lg hover:border-[#388E3C] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <img
                          src={member.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                          alt={member.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1B5E20] shadow-sm shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-bold uppercase tracking-wider mb-1 border border-[#D1E7D3]">
                            {member.role}
                          </span>
                          <h4 className="font-bold text-[#14532D] text-sm leading-snug truncate">{member.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{member.designation}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-[#D1E7D3]">
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                          <span className="truncate">{member.department}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                          <a href={`mailto:${member.email}`} className="text-[#1B5E20] hover:underline truncate">
                            {member.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 7. AQAR REPORTS SECTION ── */}
            <Section id="aqar" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="NAAC Compliance"
                title="Annual Quality Assurance Reports (AQAR)"
                subtitle="Official annual reports submitted to NAAC documenting key performance indicators, outcomes, and progress."
              />

              {/* Search Bar */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by academic year or title..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#D1E7D3] bg-[#F5FBF6] focus:outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                  />
                </div>
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="text-xs text-gray-500 hover:text-red-500 font-semibold">
                    Clear
                  </button>
                )}
              </div>

              {/* Searchable Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#D1E7D3] shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#E8F5E9] text-[#14532D] font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Academic Year</th>
                      <th className="px-4 py-3.5">Report Title</th>
                      <th className="px-4 py-3.5">Upload Date</th>
                      <th className="px-4 py-3.5">Size</th>
                      <th className="px-4 py-3.5">Downloads</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1E7D3] bg-white">
                    {filteredAqar.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500 text-sm">
                          No AQAR reports match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAqar.map((report: any) => (
                        <tr key={report.id} className="hover:bg-[#F5FBF6] transition-colors">
                          <td className="px-4 py-3.5 font-bold text-[#14532D]">{report.academicYear}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{report.title}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">{report.uploadDate}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">{report.fileSize || "3.5 MB"}</td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-[#1B5E20]">
                            {(report.downloads || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setModalItem({ title: report.title, url: report.fileUrl, type: "AQAR" })}
                                className="px-2.5 py-1.5 rounded-lg border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9] transition-colors"
                              >
                                View
                              </button>
                              <a
                                href={report.fileUrl || "#"}
                                download
                                onClick={() => handleDownload("aqarReports", report.id, report.fileUrl)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-colors inline-flex items-center gap-1 shadow-sm"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Section>


            {/* ── 8. SSR REPORTS SECTION ── */}
            <Section id="ssr" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="NAAC Accreditation"
                title="Self Study Reports (SSR)"
                subtitle="Comprehensive institutional Self Study Reports for multi-year accreditation cycles."
              />

              <div className="grid md:grid-cols-2 gap-6">
                {ssrReports.map((ssr: any) => (
                  <div
                    key={ssr.id}
                    className="rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] p-6 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full bg-[#1B5E20] text-white text-xs font-bold uppercase">
                          {ssr.cycle} · {ssr.year}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                          Grade {ssr.grade}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[#14532D] mb-2">{ssr.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">{ssr.executiveSummary}</p>
                    </div>

                    <div className="pt-4 border-t border-[#D1E7D3] flex items-center justify-between">
                      <span className="text-xs text-gray-500">{(ssr.downloads || 0).toLocaleString()} downloads</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalItem({ title: ssr.title, url: ssr.fileUrl, type: "SSR" })}
                          className="px-3 py-1.5 rounded-lg border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9]"
                        >
                          Preview
                        </button>
                        <a
                          href={ssr.fileUrl || "#"}
                          download
                          onClick={() => handleDownload("ssrReports", ssr.id, ssr.fileUrl)}
                          className="px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 9. IIQA REPORTS SECTION ── */}
            <Section id="iiqa" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <SectionHeader
                  badge="NAAC Pre-requisite"
                  title="Institutional Information for Quality Assessment (IIQA)"
                  subtitle="Official eligibility assessment reports submitted to NAAC ahead of SSR cycles."
                />

                <div className="flex gap-2">
                  {["all", "approved", "submitted"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setIiqaFilter(st)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                        iiqaFilter === st
                          ? "bg-[#1B5E20] text-white"
                          : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#D1E7D3] shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#E8F5E9] text-[#14532D] font-bold text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Cycle</th>
                      <th className="px-4 py-3">Submission Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total Downloads</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1E7D3] bg-white">
                    {filteredIiqa.map((iiqa: any) => (
                      <tr key={iiqa.id} className="hover:bg-[#F5FBF6]">
                        <td className="px-4 py-3.5 font-bold text-[#14532D]">{iiqa.cycle}</td>
                        <td className="px-4 py-3.5 text-slate-600 text-xs">{iiqa.submissionDate}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {iiqa.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{iiqa.downloads || 0}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setModalItem({ title: `IIQA ${iiqa.cycle} Submission`, url: iiqa.documentUrl, type: "IIQA" })}
                              className="px-2.5 py-1 rounded-lg border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9]"
                            >
                              View
                            </button>
                            <a
                              href={iiqa.documentUrl || "#"}
                              download
                              onClick={() => handleDownload("iiqaReports", iiqa.id, iiqa.documentUrl)}
                              className="px-2.5 py-1 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>


            {/* ── 10. NIRF REPORTS SECTION ── */}
            <Section id="nirf" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="National Benchmarks"
                title="NIRF Rankings & Submission Dossiers"
                subtitle="National Institutional Ranking Framework data, ranking milestones, and certified reports."
              />

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nirfReports.map((nirf: any) => (
                  <div
                    key={nirf.id}
                    className="p-5 rounded-2xl bg-[#F5FBF6] border border-[#D1E7D3] hover:border-[#388E3C] hover:shadow-md transition-all text-center flex flex-col justify-between"
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[11px] font-bold uppercase">
                        {nirf.category}
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-[#14532D] my-2 tracking-tight">
                        #{nirf.rank}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">Year {nirf.year}</div>
                      <div className="text-xs text-emerald-700 font-bold mt-1">Score: {nirf.score}</div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#D1E7D3]">
                      <a
                        href={nirf.documentUrl || "#"}
                        download
                        onClick={() => handleDownload("nirfReports", nirf.id, nirf.documentUrl)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Dossier
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 11. MEETING MINUTES & ATR SECTION ── */}
            <Section id="minutes" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Institutional Governance"
                title="Meeting Minutes & Action Taken Reports (ATR)"
                subtitle="Transparent chronological record of quarterly IQAC committee meetings and measurable action taken."
              />

              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#1B5E20] space-y-6">
                {meetingMinutes.map((meeting: any) => (
                  <div key={meeting.id} className="relative">
                    {/* Circle Node on Timeline */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#1B5E20] border-2 border-white shadow-sm ring-4 ring-[#E8F5E9]" />

                    <div className="bg-[#F5FBF6] border border-[#D1E7D3] rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E9] text-[#1B5E20] text-xs font-black uppercase tracking-wider">
                          {meeting.meetingNo}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {meeting.date}
                        </span>
                      </div>

                      <div className="text-sm text-slate-700 leading-relaxed mb-4">
                        <span className="font-bold text-[#14532D]">Key Decisions & Deliberations: </span>
                        {meeting.keyDecisions}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#D1E7D3]">
                        <button
                          onClick={() => setModalItem({ title: `Minutes of ${meeting.meetingNo}`, url: meeting.minutesFileUrl, type: "Minutes" })}
                          className="px-3 py-1.5 rounded-lg border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9] transition-colors"
                        >
                          View Minutes PDF
                        </button>
                        <button
                          onClick={() => setModalItem({ title: `ATR for ${meeting.meetingNo}`, url: meeting.atrFileUrl, type: "ATR" })}
                          className="px-3 py-1.5 rounded-lg border border-[#388E3C] text-[#388E3C] text-xs font-bold hover:bg-[#E8F5E9] transition-colors"
                        >
                          View ATR PDF
                        </button>
                        <a
                          href={meeting.minutesFileUrl || "#"}
                          download
                          onClick={() => handleDownload("meetingMinutes", meeting.id, meeting.minutesFileUrl)}
                          className="px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          Download All
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 12. QUALITY INITIATIVES SECTION ── */}
            <Section id="initiatives" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Continuous Transformation"
                title="Quality Initiatives & Benchmarks"
                subtitle="Targeted strategic drives that enhance pedagogical quality, research footprint, and eco-campus standards."
              />

              <div className="grid md:grid-cols-2 gap-6">
                {qualityInitiatives.map((qi: any) => (
                  <div
                    key={qi.id}
                    className="rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={qi.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"}
                          alt={qi.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1B5E20]/90 text-white text-xs font-bold backdrop-blur-sm">
                          {qi.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {qi.date}
                        </div>
                        <h4 className="font-bold text-lg text-[#14532D] leading-snug">{qi.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{qi.description}</p>

                        <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#D1E7D3] text-xs text-[#14532D]">
                          <span className="font-bold">Measurable Outcomes: </span>
                          {qi.outcomes}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <a
                        href={qi.documentUrl || "#"}
                        download
                        onClick={() => handleDownload("qualityInitiatives", qi.id, qi.documentUrl)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Initiative Report
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 13. BEST PRACTICES SECTION ── */}
            <Section id="best-practices" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Institutional Excellence"
                title="Institutional Best Practices"
                subtitle="Documented institutional best practices recognized for high impact, student outcomes, and academic sustainability."
              />

              <div className="space-y-6">
                {bestPractices.map((bp: any, idx: number) => (
                  <div key={bp.id} className="rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-[#1B5E20] text-white text-xs font-bold uppercase">
                        Practice #{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#14532D] mb-4">{bp.title}</h3>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-700 leading-relaxed mb-4">
                      <div className="p-4 rounded-xl bg-white border border-[#D1E7D3]">
                        <div className="text-xs font-bold text-[#1B5E20] uppercase mb-1">1. Objective of the Practice</div>
                        <p>{bp.objective}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-[#D1E7D3]">
                        <div className="text-xs font-bold text-[#1B5E20] uppercase mb-1">2. The Context</div>
                        <p>{bp.context}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-[#D1E7D3]">
                        <div className="text-xs font-bold text-[#1B5E20] uppercase mb-1">3. The Practice Description</div>
                        <p>{bp.practice}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-[#D1E7D3]">
                        <div className="text-xs font-bold text-[#1B5E20] uppercase mb-1">4. Evidence of Success</div>
                        <p>{bp.evidence}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#D1E7D3] text-xs text-[#14532D] mb-4">
                      <span className="font-bold">Resources Required & Deployed: </span>
                      {bp.resources}
                    </div>

                    <a
                      href={bp.documentUrl || "#"}
                      download
                      onClick={() => handleDownload("bestPractices", bp.id, bp.documentUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Supporting Documentation
                    </a>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 14. INSTITUTIONAL DISTINCTIVENESS SECTION ── */}
            <Section id="distinctiveness" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Signature Characteristic"
                title="Institutional Distinctiveness"
                subtitle="The distinct identity and defining hallmark that sets BAC Global University apart in higher education."
              />

              {institutionalDistinctiveness.map((item: any) => (
                <div key={item.id} className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E8F5E9] via-white to-[#F5FBF6] border border-[#D1E7D3]">
                    <h3 className="text-2xl font-bold text-[#14532D] mb-3">{item.title}</h3>
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base mb-6">{item.description}</p>

                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      {(item.highlights || []).map((hl: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#D1E7D3]">
                          <CheckCircle className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{hl}</span>
                        </div>
                      ))}
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {item.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Distinctiveness illustration"
                            className="w-full h-48 sm:h-56 object-cover rounded-2xl border border-[#D1E7D3] shadow-sm"
                          />
                        ))}
                      </div>
                    )}

                    <a
                      href={item.documentUrl || "#"}
                      download
                      onClick={() => handleDownload("institutionalDistinctiveness", item.id, item.documentUrl)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Distinctiveness Dossier
                    </a>
                  </div>
                </div>
              ))}
            </Section>


            {/* ── 15. CURRICULUM FEEDBACK SECTION ── */}
            <Section id="feedback" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="360° Stakeholder Evaluation"
                title="Curriculum Feedback & Action Taken"
                subtitle="Structured feedback collected annually from students, faculty, alumni, and recruiting employers."
              />

              <div className="flex flex-wrap gap-2 border-b border-[#D1E7D3] pb-3 mb-6">
                {curriculumFeedback.map((fb: any) => (
                  <button
                    key={fb.type}
                    onClick={() => setFeedbackTab(fb.type)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                      feedbackTab === fb.type
                        ? "bg-[#1B5E20] text-white shadow-sm"
                        : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                    )}
                  >
                    {fb.type} Feedback
                  </button>
                ))}
              </div>

              {curriculumFeedback
                .filter((fb: any) => fb.type === feedbackTab)
                .map((fb: any) => (
                  <div key={fb.type} className="p-6 rounded-2xl bg-[#F5FBF6] border border-[#D1E7D3] space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-[#14532D]">{fb.title}</h4>
                        <p className="text-sm text-slate-600 mt-1 max-w-2xl">{fb.description}</p>
                      </div>

                      <div className="flex gap-4">
                        <div className="px-4 py-3 rounded-2xl bg-white border border-[#D1E7D3] text-center">
                          <div className="text-xs text-gray-500 font-medium">Satisfaction</div>
                          <div className="text-xl font-black text-[#1B5E20]">{fb.satisfactionScore}</div>
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-white border border-[#D1E7D3] text-center">
                          <div className="text-xs text-gray-500 font-medium">Responses</div>
                          <div className="text-xl font-black text-[#14532D]">{(fb.responseCount || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3 border-t border-[#D1E7D3]">
                      <button
                        onClick={() => setModalItem({ title: `Feedback Report (${fb.type.toUpperCase()}) - ${fb.year}`, url: fb.reportUrl, type: "Feedback" })}
                        className="px-4 py-2 rounded-xl border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9] transition-colors"
                      >
                        Preview Feedback Analysis
                      </button>
                      <a
                        href={fb.reportUrl || "#"}
                        download
                        className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Analysis Report
                      </a>
                      <a
                        href={fb.atrUrl || "#"}
                        download
                        className="px-4 py-2 rounded-xl bg-[#388E3C] text-white text-xs font-bold hover:bg-[#2E7D32] inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Action Taken Report (ATR)
                      </a>
                    </div>
                  </div>
                ))}
            </Section>


            {/* ── 16. ACADEMIC AUDIT SECTION ── */}
            <Section id="audit" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Peer Review & Verification"
                title="Academic & Administrative Audits"
                subtitle="Internal and external peer reviews of academic standards, pedagogy, and research compliance."
              />

              <div className="space-y-4">
                {academicAudits.map((audit: any) => (
                  <div
                    key={audit.id}
                    className="p-5 rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E20] text-white text-xs font-bold">
                          Year {audit.year}
                        </span>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                          audit.auditorType === "external" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        )}>
                          {audit.auditorType} Audit
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {audit.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#14532D]">{audit.auditType}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">{audit.findings}</p>
                    </div>

                    <div className="shrink-0 flex gap-2">
                      <button
                        onClick={() => setModalItem({ title: `${audit.auditType} - ${audit.year}`, url: audit.fileUrl, type: "Audit" })}
                        className="px-3 py-1.5 rounded-lg border border-[#1B5E20] text-[#1B5E20] text-xs font-bold hover:bg-[#E8F5E9]"
                      >
                        Preview
                      </button>
                      <a
                        href={audit.fileUrl || "#"}
                        download
                        onClick={() => handleDownload("academicAudits", audit.id, audit.fileUrl)}
                        className="px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 17. MONTHLY REPORTS SECTION ── */}
            <Section id="monthly" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Timeline Monitoring"
                title="Monthly Activity Reports"
                subtitle="Comprehensive month-by-month documentation of university activities, webinars, research outputs, and cell meetings."
              />

              <div className="space-y-4">
                {monthlyReports.map((yr: any) => {
                  const isExpanded = expandedYear === yr.year;
                  return (
                    <div key={yr.year} className="rounded-2xl border border-[#D1E7D3] overflow-hidden bg-white">
                      <button
                        onClick={() => setExpandedYear(isExpanded ? null : yr.year)}
                        className="w-full flex items-center justify-between p-5 bg-[#E8F5E9] hover:bg-[#D1E7D3] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-[#1B5E20]" />
                          <h4 className="text-lg font-bold text-[#14532D]">Academic Year {yr.year} Reports</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E20] text-white text-xs font-semibold">
                            {yr.months?.length || 0} Months Documented
                          </span>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-[#1B5E20] transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
                      </button>

                      {isExpanded && (
                        <div className="p-6 bg-[#F5FBF6] divide-y divide-[#D1E7D3]">
                          {(yr.months || []).map((month: any) => (
                            <div key={month.monthIndex} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#1B5E20] font-bold text-xs flex items-center justify-center border border-[#D1E7D3]">
                                  {month.monthIndex}
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{month.month} {yr.year}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {(month.files || []).map((file: any, fIdx: number) => (
                                  <a
                                    key={fIdx}
                                    href={file.fileUrl || "#"}
                                    download
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D1E7D3] text-[#1B5E20] text-xs font-semibold hover:bg-[#E8F5E9] transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    {file.label || "Report PDF"}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>


            {/* ── 18. NOTICES & CIRCULARS SECTION ── */}
            <Section id="notices" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Official Orders"
                title="Notices & Circulars"
                subtitle="Official notification orders, guidelines, and quality compliance directives released by IQAC."
              />

              <div className="space-y-3.5">
                {notices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#D1E7D3] bg-[#F5FBF6] hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full mt-2 shrink-0",
                        notice.urgency === "high" ? "bg-red-500 ring-4 ring-red-100" : "bg-amber-500 ring-4 ring-amber-100"
                      )} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[11px] font-bold uppercase">
                            {notice.category}
                          </span>
                          <span className="text-xs text-gray-500">{notice.date}</span>
                          <span className="text-xs text-gray-400 font-mono">[{notice.referenceNo}]</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#14532D] leading-snug">{notice.title}</h4>
                      </div>
                    </div>

                    <div className="shrink-0 pl-6 sm:pl-0">
                      <a
                        href={notice.fileUrl || "#"}
                        download
                        onClick={() => handleDownload("notices", notice.id, notice.fileUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#388E3C] transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Order
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 19. GALLERY SECTION ── */}
            <Section id="gallery" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <SectionHeader
                  badge="Events & Milestones"
                  title="IQAC Gallery"
                  subtitle="Photographic chronicle of accreditation visits, academic conclaves, workshops, and quality audits."
                />

                <div className="flex flex-wrap gap-1.5">
                  {["all", "visit", "seminar", "audit", "workshop"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGalleryCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                        galleryCategory === cat
                          ? "bg-[#1B5E20] text-white"
                          : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredGallery.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setGalleryItem(item)}
                    className="group rounded-2xl overflow-hidden border border-[#D1E7D3] bg-[#F5FBF6] hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#1B5E20]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.date}
                      </div>
                      <h4 className="font-bold text-sm text-[#14532D] leading-snug line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>


            {/* ── 20. DOWNLOAD CENTER SECTION ── */}
            <Section id="downloads" className="bg-white rounded-3xl border border-[#D1E7D3] shadow-sm">
              <SectionHeader
                badge="Central Repository"
                title="IQAC Download Center"
                subtitle="Unified search & download portal for all verified accreditation files, dossiers, criteria metrics, and reports."
              />

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 mb-4">
                {[
                  { id: "all", label: "All Documents" },
                  { id: "aqar", label: "AQAR" },
                  { id: "ssr", label: "SSR" },
                  { id: "iiqa", label: "IIQA" },
                  { id: "nirf", label: "NIRF" },
                  { id: "meeting-minutes", label: "Meeting Minutes" },
                  { id: "atr-reports", label: "ATR Reports" },
                  { id: "academic-audit", label: "Academic Audit" },
                  { id: "monthly-reports", label: "Monthly Reports" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDownloadTab(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      activeDownloadTab === tab.id
                        ? "bg-[#1B5E20] text-white shadow-sm"
                        : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#D1E7D3]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={downloadSearch}
                  onChange={(e) => setDownloadSearch(e.target.value)}
                  placeholder="Instant document search..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#D1E7D3] bg-[#F5FBF6] focus:outline-none focus:border-[#1B5E20]"
                />
              </div>

              {/* Documents List */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {filteredDownloads.slice(0, 16).map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-4 rounded-2xl bg-[#F5FBF6] border border-[#D1E7D3] hover:bg-white hover:border-[#388E3C] hover:shadow-md transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-bold uppercase mb-1">
                        {doc.category} {doc.year ? `· ${doc.year}` : ""}
                      </span>
                      <h5 className="font-bold text-slate-800 text-sm leading-snug truncate">{doc.title}</h5>
                      <span className="text-[11px] text-gray-400">{doc.size || "PDF"}</span>
                    </div>

                    <a
                      href={doc.url || "#"}
                      download
                      className="shrink-0 w-9 h-9 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center hover:bg-[#388E3C] transition-colors shadow-sm"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              {filteredDownloads.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No documents found matching your filter or query.
                </div>
              )}
            </Section>


            {/* ── 21. FOOTER CONTACT SECTION ── */}
            <section className="rounded-3xl bg-gradient-to-br from-[#1B5E20] via-[#246B2A] to-[#0E3511] text-white p-8 lg:p-10 shadow-xl border border-[#14532D]">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-emerald-200">
                    IQAC Secretariat Contact
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif">Connect with IQAC Leadership</h3>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xl">
                    For accreditation documentation queries, AQAR queries, institutional partnerships, or stakeholder feedback inquiries, please contact the IQAC Coordinator office.
                  </p>

                  <div className="space-y-2.5 pt-2 text-sm text-white/90">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="font-semibold">{contact.coordinatorName || "Dr. Meera Krishnamurthy"} (Coordinator)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                      <a href={`mailto:${contact.coordinatorEmail || "iqac@bac.edu"}`} className="hover:underline">
                        {contact.coordinatorEmail || "iqac@bac.edu"}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{contact.coordinatorPhone || "+91 80 4967 0200"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                      <span>{contact.officeAddress || "IQAC Office, Administrative Block, 2nd Floor, BAC Global University, Bangalore"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{contact.officeHours || "Monday to Friday: 9:00 AM - 5:00 PM"}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20">
                  <h4 className="font-bold text-base mb-3 font-serif text-[#C8E6C9]">Quick Access Links</h4>
                  <ul className="space-y-2 text-xs text-white/80">
                    <li>
                      <button onClick={() => scrollTo("aqar")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        NAAC AQAR Submissions
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo("ssr")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        Self Study Reports (SSR Cycle 3 & 4)
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo("nirf")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        NIRF National Rankings Dossier
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo("minutes")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        Quarterly Meeting Minutes & Action Taken
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo("feedback")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        Curriculum Stakeholder Feedback
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo("downloads")} className="hover:text-white flex items-center gap-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                        Central Download Archive
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* PDF / Document Modal */}
      {modalItem && (
        <DocumentModal item={modalItem} onClose={() => setModalItem(null)} />
      )}

      {/* Gallery Lightbox Modal */}
      {galleryItem && (
        <GalleryModal item={galleryItem} onClose={() => setGalleryItem(null)} />
      )}

    </div>
  );
}
