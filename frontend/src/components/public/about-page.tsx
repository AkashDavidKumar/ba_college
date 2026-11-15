"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Users,
  Shield,
  GitBranch,
  Target,
  FileCheck,
  BarChart2,
  MessageSquare,
  ChevronRight,
  Download,
  Award,
  Calendar,
  CheckCircle,
  Building2,
  Eye,
  ShieldCheck,
  Clock,
  Sparkles,
  Quote,
  Compass,
  FileText,
  MapPin,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import {
  SectionHeading,
  GlassCard,
  AnimatedCounter,
  Reveal,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { cn } from "@/lib/utils";

// ── Navigation Tabs Configuration ───────────────────────────────────────────
const navSections = [
  { id: "overview", label: "Overview & Vision", icon: Eye },
  { id: "history", label: "History of BAC", icon: BookOpen },
  { id: "secretary", label: "Secretary's Message", icon: MessageSquare },
  { id: "principal", label: "Principal's Message", icon: GraduationCap },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "organogram", label: "Organogram", icon: GitBranch },
  { id: "strategic", label: "Strategic Plan", icon: Target },
  { id: "conduct", label: "Code of Conduct", icon: FileCheck },
  { id: "annual-report", label: "Annual Reports", icon: BarChart2 },
];

// ── Static Institutional Content ────────────────────────────────────────────
const TIMELINE = [
  { year: "1994", event: "Bishop Ambrose College established by the Diocese of Coimbatore under the patronage of Rt. Rev. Bishop Ambrose." },
  { year: "1998", event: "Formally recognized under Section 2(f) and 12(B) of the University Grants Commission (UGC) Act." },
  { year: "2005", event: "Conferred Autonomous status, enabling tailored curriculum innovation and industry-responsive academic design." },
  { year: "2010", event: "Successfully accredited by NAAC in the First Cycle with high commendations for moral ethos." },
  { year: "2016", event: "Re-accredited by NAAC in the Second Cycle with prestigious 'B+' grade recognition." },
  { year: "2022", event: "Commissioned modern digital learning infrastructure, advanced smart lecture halls, and expanded research facilities." },
  { year: "2024", event: "NAAC Third Cycle Accreditation achieved with upgraded marks across curriculum and placement quality." },
];

const COMMITTEES = [
  { name: "Governing Body", members: 15, head: "Rev. Fr. Secretary", desc: "Apex statutory body responsible for strategic direction, policy approval, and institutional stewardship." },
  { name: "Academic Council", members: 21, head: "Principal", desc: "Highest academic authority regulating curriculum design, syllabi revisions, and examination standards." },
  { name: "Finance Committee", members: 7, head: "Treasurer", desc: "Oversees budgetary allocations, financial transparency, development funds, and independent audits." },
  { name: "Internal Complaints Committee", members: 9, head: "Senior Faculty", desc: "Promotes an inclusive, respectful campus climate with zero tolerance for discrimination or harassment." },
  { name: "Anti-Ragging Committee", members: 12, head: "Principal", desc: "Enforces strict UGC anti-ragging mandates ensuring student safety, dignity, and immediate redressal." },
  { name: "IQAC", members: 17, head: "IQAC Coordinator", desc: "Internal Quality Assurance Cell driving continuous benchmark enhancements and NAAC compliance." },
  { name: "Placement & Training Committee", members: 8, head: "Placement Officer", desc: "Bridges corporate recruiters, facilitates skill bootcamps, and coordinates campus placement drives." },
  { name: "Library Committee", members: 6, head: "Librarian", desc: "Guides collection development, subscriptions to e-journals (N-LIST/DELNET), and digital repository upgrades." },
];

const ORGANOGRAM_LEVELS = [
  { level: "Diocese of Coimbatore", roles: ["Bishop / Chancellor", "Diocesan Education Board"] },
  { level: "College Management", roles: ["Secretary / Correspondent", "Treasurer"] },
  { level: "Administration", roles: ["Principal", "Vice-Principal", "Controller of Examinations"] },
  { level: "Academic Deans", roles: ["Dean — Science & Technology", "Dean — Commerce & Management", "Dean — Humanities & Arts"] },
  { level: "Department Heads (HODs)", roles: ["Computer Science", "Commerce", "Biotechnology", "Psychology", "Mathematics", "English", "Management Studies", "Visual Communication"] },
  { level: "Support & Student Services", roles: ["Administrative Officer", "Chief Librarian", "Placement Director", "Physical Director", "IQAC Coordinator", "Student Welfare Counsellor"] },
];

const STRATEGIC_PILLARS = [
  { icon: Award, title: "Academic Excellence", desc: "Continuous curriculum innovation, modern outcome-based education (OBE), and multidisciplinary skill certifications aligned with NEP." },
  { icon: Users, title: "Student-Centric Thriving", desc: "Holistic student development through active clubs, cultural forums, sports championships, and comprehensive career mentoring." },
  { icon: Building2, title: "Infrastructure & Digitalization", desc: "Equipping state-of-the-art laboratory commons, smart classrooms, gigabit campus connectivity, and green energy installations." },
  { icon: CheckCircle, title: "Quality Benchmarking", desc: "Institutionalizing continuous IQAC quality audits, maintaining top-tier NAAC ratings, and transparent academic audits." },
  { icon: BookOpen, title: "Research & Industry Linkage", desc: "Incentivizing faculty research publications, student innovation hackathons, and corporate MoUs with leading enterprises." },
  { icon: ShieldCheck, title: "Value-Based Governance", desc: "Ethical, participatory management rooted in service, social justice, integrity, and community outreach programs." },
];

const ANNUAL_REPORTS = [
  { year: "2023–2024", size: "4.2 MB", pages: 68, date: "July 2024" },
  { year: "2022–2023", size: "3.8 MB", pages: 62, date: "July 2023" },
  { year: "2021–2022", size: "3.5 MB", pages: 58, date: "June 2022" },
  { year: "2020–2021", size: "3.1 MB", pages: 52, date: "July 2021" },
  { year: "2019–2020", size: "2.9 MB", pages: 48, date: "August 2020" },
  { year: "2018–2019", size: "2.6 MB", pages: 45, date: "July 2019" },
];

// ── Reusable Stat Card (Matching Department Page DeptStat Style) ────────────
function AboutStat({
  icon,
  value,
  suffix = "",
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  suffix?: string;
  label: string;
}) {
  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold-dark mb-3">
        {icon}
      </div>
      <div>
        <div className="font-serif text-2xl sm:text-3xl font-bold text-navy flex items-baseline">
          {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
          {suffix && <span className="text-gold-dark ml-0.5">{suffix}</span>}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>
    </GlassCard>
  );
}

// ── Main About Page Component ───────────────────────────────────────────────
export function AboutPage({ section }: { section?: string }) {
  const { goHome, goAdmissions, goDepartment, goContact } = useNav();
  const [activeSection, setActiveSection] = useState(() => section || "overview");

  useEffect(() => {
    if (section && navSections.some((s) => s.id === section)) {
      setActiveSection(section);
    }
  }, [section]);

  const handleTabChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      const navEl = document.getElementById("about-tab-nav");
      if (navEl) {
        const rect = navEl.getBoundingClientRect();
        if (rect.top < 0) {
          window.scrollTo({
            top: window.scrollY + rect.top - 80,
            behavior: "smooth",
          });
        }
      }
    }
  };

  const currentNav = navSections.find((s) => s.id === activeSection) || navSections[0];

  return (
    <div className="bg-background min-h-screen">
      {/* ── 1. Top Breadcrumb Bar ───────────────────────────────────────── */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span>About Us</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">{currentNav.label}</span>
        </div>
      </div>

      {/* ── 2. Hero Section (Matching Department Page Hero Layout) ──────── */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=80"
            alt="Bishop Ambrose College Campus"
            className="w-full h-full object-cover opacity-80"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 47, 32, 0.60) 0%, rgba(0, 47, 32, 0.40) 50%, rgba(0, 47, 32, 0.75) 100%)",
            }}
          />
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 blob bg-gold/10 pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-violet-500/10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            {/* Left Column (8 cols): Title & Description */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-navy text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-light" />
                  Autonomous · NAAC Accredited · Est. 1994
                </div>
                <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-5">
                  About Bishop Ambrose College
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                  Empowering generations through academic excellence, ethical character, and devoted service since 1994. Affiliated to Bharathiar University, Coimbatore, with Autonomous distinction.
                </p>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton
                    variant="gold"
                    size="lg"
                    onClick={goAdmissions}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Apply for Admissions
                  </PremiumButton>
                  <PremiumButton
                    variant="outline-light"
                    size="lg"
                    onClick={() => handleTabChange("history")}
                    icon={<BookOpen className="w-4 h-4" />}
                  >
                    Our 30-Year Heritage
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10"
                    icon={<Compass className="w-4 h-4" />}
                    onClick={() => handleTabChange("strategic")}
                  >
                    Strategic Vision
                  </PremiumButton>
                </div>
              </motion.div>
            </div>

            {/* Right Column (4 cols): 2x2 Quick Stats Grid */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <AboutStat icon={<Calendar className="w-4 h-4" />} value={30} suffix="+" label="Years of Legacy" />
                <AboutStat icon={<BookOpen className="w-4 h-4" />} value={12} suffix="+" label="UG & PG Programmes" />
                <AboutStat icon={<Users className="w-4 h-4" />} value={2500} suffix="+" label="Active Students" />
                <AboutStat icon={<Award className="w-4 h-4" />} value="A++" label="NAAC Distinctions" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Sticky Navigation Tabs (Matching Department Page Sticky Bar) ─ */}
      <div
        id="about-tab-nav"
        className="sticky top-16 lg:top-20 z-30 glass-strong border-y border-navy/8 shadow-premium"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav
            role="tablist"
            aria-label="About navigation"
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium py-2.5"
          >
            {navSections.map((s) => {
              const isActive = activeSection === s.id;
              const IconComp = s.icon;
              return (
                <button
                  key={s.id}
                  id={`tab-${s.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${s.id}`}
                  onClick={() => handleTabChange(s.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-[#14532D] text-white shadow-md shadow-[#14532D]/20 scale-102"
                      : "text-navy hover:bg-navy/8 hover:text-[#14532D]"
                  )}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── 4. Main Tabbed Content Sections ─────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* ──────── SECTION 1: OVERVIEW & VISION ──────────────────────── */}
            {activeSection === "overview" && (
              <section id="panel-overview" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Institutional Ethos"
                  title={<>Empowering Minds, <span className="text-gold-gradient">Building Futures</span></>}
                  description="Bishop Ambrose College is a renowned autonomous co-educational institution situated in the serene educational hub of Coimbatore, committed to holistic formation."
                  align="left"
                />

                {/* 3 Pillars: Vision, Mission, Values */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Reveal delay={0.05}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold-dark">
                            <Eye className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Our Vision</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          To be a premier institution of higher learning that provides transformative education rooted in academic rigor, ethical conscience, and social compassion, empowering students to lead meaningful lives.
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-gold-dark">
                        <Sparkles className="w-3.5 h-3.5" />
                        Guiding Light Since 1994
                      </div>
                    </GlassCard>
                  </Reveal>

                  <Reveal delay={0.12}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-navy/8 flex items-center justify-center text-navy">
                            <Target className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Our Mission</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          To impart quality, holistic education through relevant curricula, contemporary pedagogical methodologies, moral character building, and community engagement that transforms young individuals into responsible global citizens.
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-navy">
                        <CheckCircle className="w-3.5 h-3.5 text-gold-dark" />
                        Holistic Personal Growth
                      </div>
                    </GlassCard>
                  </Reveal>

                  <Reveal delay={0.18}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#14532D]">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Core Values</h3>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
                            <strong className="text-navy">Trust:</strong> Integrity and mutual faith
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
                            <strong className="text-navy">Growth:</strong> Lifelong holistic learning
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
                            <strong className="text-navy">Knowledge:</strong> Academic and practical inquiry
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
                            <strong className="text-navy">Excellence:</strong> Distinction in all endeavours
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-[#14532D]">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Diocesan Heritage
                      </div>
                    </GlassCard>
                  </Reveal>
                </div>

                {/* Campus Image & Narrative Split */}
                <div className="grid lg:grid-cols-12 gap-8 items-center pt-4">
                  <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-premium border border-navy/8">
                    <img
                      src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
                      alt="Bishop Ambrose College Campus"
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-xs uppercase tracking-widest text-gold-light font-bold mb-1">
                        Coimbatore Campus
                      </div>
                      <h4 className="font-serif text-xl font-bold">
                        A peaceful academic sanctuary dedicated to learning
                      </h4>
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy leading-tight">
                      Rooted in Heritage, Driven by Innovation
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Founded under the visionary stewardship of the Catholic Diocese of Coimbatore, Bishop Ambrose College continues to be an intellectual beacon for students across Tamil Nadu and neighbouring states.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our autonomous status enables us to maintain an agile, industry-aligned syllabus while nurturing traditional values of discipline, social empathy, and community responsibility. Over 95% of our graduating cohorts secure employment or pursue postgraduate admissions in reputed national and global universities.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <PremiumButton
                        variant="gold"
                        size="md"
                        onClick={() => handleTabChange("history")}
                        icon={<ChevronRight className="w-4 h-4" />}
                      >
                        Read Full History
                      </PremiumButton>
                      <PremiumButton
                        variant="ghost"
                        size="md"
                        onClick={goContact}
                        icon={<MapPin className="w-4 h-4" />}
                      >
                        Campus Location
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 2: HISTORY OF BAC ─────────────────────────── */}
            {activeSection === "history" && (
              <section id="panel-history" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Our Heritage"
                  title={<>Three Decades of <span className="text-gold-gradient">Academic Excellence</span></>}
                  description="Trace the journey of Bishop Ambrose College from its founding by the Catholic Diocese of Coimbatore to becoming an autonomous educational powerhouse."
                  align="left"
                />

                <div className="grid lg:grid-cols-12 gap-10">
                  {/* Left Column: Narrative History */}
                  <div className="lg:col-span-7 space-y-5">
                    <GlassCard className="p-6 sm:p-8 space-y-4">
                      <h3 className="font-serif text-2xl font-bold text-navy">
                        Founding Vision & The Early Years
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Bishop Ambrose College was established in 1994 by the Diocese of Coimbatore, under the inspiring leadership of the late Bishop Rt. Rev. Gnanapragasam. The college was founded with a firm commitment to providing quality higher education with a strong moral and ethical foundation, guided by the institutional motto: <strong className="text-navy">Trust · Growth · Knowledge · Excellence</strong>.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        From its humble beginnings with a handful of programmes and passionate scholars, the college has grown into a full-fledged autonomous institution offering undergraduate and postgraduate programmes across Science, Commerce, and Arts disciplines, recognized under Section 2(f) and 12(B) of the UGC Act.
                      </p>
                    </GlassCard>

                    <GlassCard className="p-6 sm:p-8 space-y-4">
                      <h3 className="font-serif text-2xl font-bold text-navy">
                        Autonomy & Academic Freedom
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The conferment of Autonomous status marked a transformative turning point in the college’s historical trajectory. Autonomy empowered our Academic Council and Boards of Studies to regularly refresh curricula, incorporate emerging technologies, introduce continuous assessment models, and organize specialized internship credits.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Today, Bishop Ambrose College stands as one of the most respected Christian minority institutions in South India, celebrated for its faculty scholarship, competitive sports championships, student welfare support, and remarkable graduate placement record.
                      </p>
                    </GlassCard>
                  </div>

                  {/* Right Column: Chronological Milestones Timeline */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl bg-white border border-navy/8 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-navy/8">
                        <Clock className="w-4 h-4 text-gold-dark" />
                        <h4 className="font-serif text-lg font-bold text-navy">Milestones Timeline</h4>
                      </div>

                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy/15">
                        {TIMELINE.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white bg-gold-dark shadow-sm group-hover:scale-125 transition-transform" />
                            <div className="text-xs font-bold text-gold-dark uppercase tracking-wider mb-0.5">
                              {item.year}
                            </div>
                            <p className="text-sm text-slate-700 leading-snug font-medium">
                              {item.event}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 3: SECRETARY'S MESSAGE ────────────────────── */}
            {activeSection === "secretary" && (
              <section id="panel-secretary" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Institutional Leadership"
                  title={<>Secretary’s <span className="text-gold-gradient">Message</span></>}
                  description="Guiding words on purpose, compassion, and academic commitment from the management of Bishop Ambrose College."
                  align="left"
                />

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Portrait Card */}
                  <div className="lg:col-span-4">
                    <div className="rounded-2xl overflow-hidden bg-white border border-navy/8 shadow-premium sticky top-36">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
                          alt="Rev. Fr. A. Susai Raj"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h4 className="font-serif text-xl font-bold">Rev. Fr. A. Susai Raj</h4>
                          <p className="text-xs text-gold-light font-semibold uppercase tracking-wider">
                            Secretary & Correspondent
                          </p>
                        </div>
                      </div>
                      <div className="p-5 space-y-2 text-xs text-muted-foreground">
                        <div><strong className="text-navy">Office:</strong> Office of the Secretary</div>
                        <div><strong className="text-navy">Affiliation:</strong> Diocese of Coimbatore</div>
                        <div><strong className="text-navy">Tenure:</strong> Serving BAC with distinction</div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="lg:col-span-8">
                    <GlassCard className="p-6 sm:p-10 space-y-5 relative overflow-hidden">
                      <Quote className="absolute right-6 top-6 w-20 h-20 text-gold-dark/10 pointer-events-none" />

                      <div className="border-l-4 border-gold-dark pl-4 italic text-navy font-serif text-lg leading-relaxed">
                        “Education is not merely the transfer of knowledge, but the holistic transformation of the human person in intellect, heart, and spirit.”
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        It is with great joy and pride that I welcome you to Bishop Ambrose College — an institution that has been steadfastly committed to the holistic development of students for over three decades.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Founded on the eternal principles of truth, justice, and compassion, our college continues to uphold the sacred vision of our founder, the late Bishop Rt. Rev. Gnanapragasam. We believe that learning must awaken moral responsibility and foster deep social sensitivity in every student who walks our corridors.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        At Bishop Ambrose College, we nurture academic excellence, ethical values, and social empathy. Our dedicated faculty mentors, modern laboratory infrastructure, and vibrant student community create an enabling ecosystem where students discover their God-given potential and prepare themselves for meaningful contributions to society.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        I invite you to be an integral part of this great institution and to take full advantage of the opportunities it offers. Together, we shall continue to build a brighter, more compassionate future for our nation.
                      </p>

                      <div className="pt-4 border-t border-navy/8 flex items-center justify-between">
                        <div>
                          <div className="font-serif font-bold text-navy text-base">Rev. Fr. A. Susai Raj</div>
                          <div className="text-xs text-muted-foreground">Secretary, Bishop Ambrose College</div>
                        </div>
                        <div className="text-xs font-semibold text-gold-dark">
                          Diocese of Coimbatore
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 4: PRINCIPAL'S MESSAGE ────────────────────── */}
            {activeSection === "principal" && (
              <section id="panel-principal" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Academic Leadership"
                  title={<>Principal’s <span className="text-gold-gradient">Address</span></>}
                  description="A message on intellectual curiosity, integrity, and future-readiness from the academic head of BAC."
                  align="left"
                />

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Portrait Card */}
                  <div className="lg:col-span-4">
                    <div className="rounded-2xl overflow-hidden bg-white border border-navy/8 shadow-premium sticky top-36">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80"
                          alt="Dr. P. Samuel Manoharan"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h4 className="font-serif text-xl font-bold">Dr. P. Samuel Manoharan</h4>
                          <p className="text-xs text-gold-light font-semibold uppercase tracking-wider">
                            Principal & Academic Head
                          </p>
                        </div>
                      </div>
                      <div className="p-5 space-y-2 text-xs text-muted-foreground">
                        <div><strong className="text-navy">Qualification:</strong> M.Sc., M.Phil., Ph.D.</div>
                        <div><strong className="text-navy">Specialization:</strong> Higher Education Leadership</div>
                        <div><strong className="text-navy">Council:</strong> Chairman, Academic Council</div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="lg:col-span-8">
                    <GlassCard className="p-6 sm:p-10 space-y-5 relative overflow-hidden">
                      <Quote className="absolute right-6 top-6 w-20 h-20 text-gold-dark/10 pointer-events-none" />

                      <div className="border-l-4 border-gold-dark pl-4 italic text-navy font-serif text-lg leading-relaxed">
                        “Welcome to Bishop Ambrose College — a sanctuary where aspirations take shape, ethical character is forged, and lasting futures are built.”
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        At BAC, we are deeply committed to academic excellence, character formation, and the multi-dimensional development of our scholars. Our contemporary autonomous curriculum is designed to be industry-relevant and research-oriented while remaining rooted in the timeless virtues of integrity, service, and intellectual courage.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Our faculty are not merely instructors — they are passionate mentors, research advisors, and role models who invest wholeheartedly in the personal success of every student. Through our well-equipped science and computing laboratories, automated digital library, and vibrant student societies, we cultivate critical thinkers and empathetic leaders.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        As an autonomous institution affiliated to Bharathiar University, we have the unique advantage of introducing pioneering courses in emerging technologies, data analytics, entrepreneurship, and foreign languages.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        I invite every prospective student to embark upon this inspiring voyage of discovery with us. Here you will find mentors who believe in you, peers who inspire you, and opportunities that will empower you to shine on the world stage.
                      </p>

                      <div className="pt-4 border-t border-navy/8 flex items-center justify-between">
                        <div>
                          <div className="font-serif font-bold text-navy text-base">Dr. P. Samuel Manoharan</div>
                          <div className="text-xs text-muted-foreground">Principal, Bishop Ambrose College</div>
                        </div>
                        <div className="text-xs font-semibold text-gold-dark">
                          Coimbatore, India
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 5: GOVERNANCE ─────────────────────────────── */}
            {activeSection === "governance" && (
              <section id="panel-governance" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Statutory Committees"
                  title={<>Institutional <span className="text-gold-gradient">Governance</span></>}
                  description="Structured administrative bodies upholding the highest benchmarks of transparency, student safety, and academic integrity."
                  align="left"
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {COMMITTEES.map((com, idx) => (
                    <Reveal key={com.name} delay={idx * 0.05}>
                      <GlassCard className="p-5 h-full flex flex-col justify-between hover:border-gold-dark/40 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="w-8 h-8 rounded-lg bg-navy/8 text-navy flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark font-bold uppercase">
                              {com.members} Members
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-navy mb-1 leading-snug">
                            {com.name}
                          </h4>
                          <div className="text-xs font-semibold text-gold-dark mb-2">
                            Chair: {com.head}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {com.desc}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-navy/8 flex items-center gap-1.5 text-[11px] font-semibold text-[#14532D]">
                          <Shield className="w-3.5 h-3.5" />
                          Statutory Committee
                        </div>
                      </GlassCard>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 6: ORGANOGRAM ─────────────────────────────── */}
            {activeSection === "organogram" && (
              <section id="panel-organogram" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Administrative Structure"
                  title={<>Institutional <span className="text-gold-gradient">Organogram</span></>}
                  description="The participatory governance and leadership hierarchy guiding Bishop Ambrose College."
                  align="left"
                />

                <div className="max-w-4xl mx-auto space-y-4">
                  {ORGANOGRAM_LEVELS.map((tier, idx) => (
                    <Reveal key={tier.level} delay={idx * 0.08}>
                      <div className="rounded-2xl bg-white border border-navy/8 p-5 shadow-xs hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-navy/8">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="font-serif text-lg font-bold text-navy">{tier.level}</h4>
                          </div>
                          <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
                            Administrative Tier
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tier.roles.map((r) => (
                            <span
                              key={r}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-semibold"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 7: STRATEGIC PLAN ─────────────────────────── */}
            {activeSection === "strategic" && (
              <section id="panel-strategic" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Vision 2024–2029"
                  title={<>Strategic Plan: <span className="text-gold-gradient">Six Pillars</span></>}
                  description="A forward-looking institutional roadmap steering Bishop Ambrose College toward national eminence, research vigor, and inclusive excellence."
                  align="left"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {STRATEGIC_PILLARS.map((p, idx) => {
                    const IconComp = p.icon;
                    return (
                      <Reveal key={p.title} delay={idx * 0.06}>
                        <GlassCard className="p-6 h-full flex flex-col justify-between hover:border-gold-dark/40 transition-colors">
                          <div>
                            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center mb-4">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <h4 className="font-serif text-xl font-bold text-navy mb-2 leading-snug">
                              {p.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {p.desc}
                            </p>
                          </div>
                          <div className="mt-5 pt-3 border-t border-navy/8 flex items-center justify-between text-xs font-semibold text-gold-dark">
                            <span>Strategic Goal</span>
                            <span>2024–2029</span>
                          </div>
                        </GlassCard>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ──────── SECTION 8: CODE OF CONDUCT ────────────────────────── */}
            {activeSection === "conduct" && (
              <section id="panel-conduct" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Standards & Ethics"
                  title={<>Institutional <span className="text-gold-gradient">Code of Conduct</span></>}
                  description="Essential ethical norms, discipline protocols, and mutual expectations upholding a respectful campus atmosphere."
                  align="left"
                />

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Student Code */}
                  <GlassCard className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-navy/8">
                      <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl font-bold text-navy">Code of Conduct for Students</h4>
                        <p className="text-xs text-muted-foreground">Discipline, attendance, and campus decorum</p>
                      </div>
                    </div>

                    <ul className="space-y-3 text-sm text-slate-700">
                      {[
                        "Maintain a minimum of 75% attendance in all courses to be eligible for end-semester examinations.",
                        "Dress modestly and in accordance with the official college dress code at all times.",
                        "Treat all fellow scholars, faculty, and administrative staff with dignity and courtesy.",
                        "Strict zero-tolerance policy against ragging, harassment, or verbal abuse in any form.",
                        "Mobile phones must be powered off or placed in silent mode inside lecture halls and labs.",
                        "Obtain official prior written permission from HODs before participating in external events.",
                        "Use the central library, digital commons, and sports equipment with care and stewardship.",
                        "Actively uphold the moral values, peace, and cultural harmony of the campus community.",
                      ].map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  {/* Faculty & Staff Code */}
                  <GlassCard className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-navy/8">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl font-bold text-navy">Code of Conduct for Faculty & Staff</h4>
                        <p className="text-xs text-muted-foreground">Professional integrity and pedagogical ethics</p>
                      </div>
                    </div>

                    <ul className="space-y-3 text-sm text-slate-700">
                      {[
                        "Conduct lectures, tutorials, and practical laboratory sessions punctually and diligently.",
                        "Serve as inspiring mentors and academic advisors to students under their pastoral care.",
                        "Submit continuous assessment marks, attendance registers, and academic reports punctually.",
                        "Maintain the highest standards of professional ethics, impartiality, and mutual respect.",
                        "Participate actively in college committees, statutory councils, and institutional tasks.",
                        "Engage in continuous professional enhancement, research publications, and FDPs.",
                        "Uphold the absolute confidentiality of examination papers and institutional records.",
                        "Support the college management in fulfilling the founding vision and mission of BAC.",
                      ].map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              </section>
            )}

            {/* ──────── SECTION 9: ANNUAL REPORTS ─────────────────────────── */}
            {activeSection === "annual-report" && (
              <section id="panel-annual-report" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Institutional Transparency"
                  title={<>Annual <span className="text-gold-gradient">Reports</span></>}
                  description="Year-wise documented accounts of academic outcomes, faculty achievements, admissions, placements, and financial audits."
                  align="left"
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ANNUAL_REPORTS.map((rep) => (
                    <GlassCard key={rep.year} className="p-5 flex flex-col justify-between hover:border-gold-dark/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-navy/8 text-navy font-bold uppercase">
                            PDF Format
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-navy mb-1">
                          Annual Report {rep.year}
                        </h4>
                        <div className="text-xs text-muted-foreground mb-3">
                          Published: {rep.date} · {rep.pages} Pages
                        </div>
                      </div>

                      <div className="pt-4 border-t border-navy/8 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">{rep.size}</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading Annual Report ${rep.year}...`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-dark text-white text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 5. Bottom Cross-Sell / Exploration Strip (Like Department Page) ─ */}
      <section className="py-16 lg:py-20 bg-cream border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Explore BAC"
            title={<>Discover More at <span className="text-gold-gradient">Bishop Ambrose College</span></>}
            description="Explore our academic programmes, student activities, and admissions pathways."
          />
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button
              onClick={() => goDepartment("computer-science")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-navy/10 bg-white hover:border-gold/40 hover:bg-gold/5 transition-colors text-sm font-semibold text-navy shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-gold-dark" />
              Academic Departments
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goAdmissions}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-navy/10 bg-white hover:border-gold/40 hover:bg-gold/5 transition-colors text-sm font-semibold text-navy shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-gold-dark" />
              Admissions 2026
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goContact}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-navy/10 bg-white hover:border-gold/40 hover:bg-gold/5 transition-colors text-sm font-semibold text-navy shadow-xs"
            >
              <MapPin className="w-4 h-4 text-gold-dark" />
              Contact & Campus Visit
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
