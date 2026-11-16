"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Headphones,
  UserCheck,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Building2,
  FileText,
  Target,
  Monitor,
  Calendar,
  Users,
  Palette,
  Trophy,
  Heart,
  Briefcase,
  Download,
  CreditCard,
  ClipboardList,
  Award,
  Shield,
  Lightbulb,
  Star,
  MessageSquare,
  GitBranch,
  FileCheck,
  BarChart2,
  Library,
  MapPin,
  Sparkles,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "./nav-context";
import { Logo, PremiumButton, staggerContainer, staggerItem } from "./primitives";

// ── Dropdown Item Interface ───────────────────────────────────────────────────
interface SubItem {
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  action: () => void;
}

interface NavSection {
  label: string;
  id: string;
  action?: () => void;
  align?: "left" | "right" | "center";
  width?: string;
  columns?: 1 | 2;
  highlight?: {
    badge?: string;
    title: string;
    description: string;
    ctaText: string;
    action: () => void;
  };
  children?: SubItem[];
}

export function Header() {
  const {
    goHome,
    goAdmissions,
    goAbout,
    goAcademic,
    goStudentActivities,
    goIqac,
    goExamination,
    goAutonomous,
    goLibrary,
    goNirf,
    goAlumni,
    goContact,
    goFacilities,
    goGallery,
    goPlacements,
    view,
  } = useNav();
  const goErp = goAdmissions;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection for navbar elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dynamically compute and expose real header height to CSS variable --header-height
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerContainer = document.getElementById("site-header-container");
      if (headerContainer) {
        const height = headerContainer.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Click outside listener to gracefully close active dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close drawers and modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hover handlers with debounce to prevent flicker
  const handleMouseEnter = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 140);
  };

  // ── Nav Sections Definition with Rich Grouping & Preserved Routes ───────────
  const navSections: NavSection[] = [
    {
      label: "Home",
      id: "home",
      action: goHome,
    },
    {
      label: "About Us",
      id: "about",
      align: "left",
      width: "w-[560px]",
      columns: 2,
      children: [
        { label: "History of BAC", description: "Diocesan establishment and 30-year legacy", icon: BookOpen, action: () => goAbout("history") },
        { label: "Secretary's Message", description: "Vision and guidance from the Secretary", icon: MessageSquare, action: () => goAbout("secretary") },
        { label: "Principal's Message", description: "Academic stewardship & student development", icon: GraduationCap, action: () => goAbout("principal") },
        { label: "Governance", description: "Apex statutory councils and leadership", icon: Shield, action: () => goAbout("governance") },
        { label: "Organogram", description: "Administrative chart and hierarchy", icon: GitBranch, action: () => goAbout("organogram") },
        { label: "Strategic Plan", description: "Institutional benchmarks & vision", icon: Target, action: () => goAbout("strategic") },
        { label: "Code of Conduct", description: "Ethical values, integrity & rules", icon: FileCheck, action: () => goAbout("conduct") },
        { label: "Annual Reports", description: "Year-wise certified institutional audits", icon: BarChart2, action: () => goAbout("annual-report") },
      ],
    },
    {
      label: "Academic",
      id: "academic",
      align: "left",
      width: "w-[620px]",
      columns: 2,
      children: [
        { label: "Courses Offered", description: "All undergraduate & postgraduate programmes", icon: BookOpen, action: () => goAcademic("courses") },
        { label: "Academic Departments", description: "Specialized centres of excellence", icon: Building2, action: () => goAcademic("departments") },
        { label: "Autonomous Status", description: "Conferred autonomous system & CBCS", icon: Shield, badge: "UGC", action: () => goAutonomous() },
        { label: "Examination Cell", description: "CIA schedules, evaluations & results", icon: FileCheck, badge: "COE", action: () => goExamination() },
        { label: "Curriculum Dev. Cell", description: "Outcome-based syllabus & Board of Studies", icon: FileText, action: () => goAcademic("curriculum") },
        { label: "Programme Outcomes", description: "Core PO1–PO8 graduate attributes", icon: Target, action: () => goAcademic("outcomes") },
        { label: "ICT Facilities", description: "Advanced computing labs & smart classrooms", icon: Monitor, action: () => goAcademic("ict") },
        { label: "Academic Calendar", description: "Annual instructional days & milestones", icon: Calendar, action: () => goAcademic("calendar") },
      ],
    },
    {
      label: "Admission",
      id: "admissions",
      align: "center",
      width: "w-[480px]",
      columns: 1,
      highlight: {
        badge: "Admissions 2026–27",
        title: "Enroll in Bishop Ambrose College",
        description: "Merit-based admissions open across Computer Science, Commerce, Management, Life Sciences and Arts.",
        ctaText: "Apply Online Now",
        action: goAdmissions,
      },
      children: [
        { label: "Admission Policy", description: "Eligibility criteria, guidelines & procedures", icon: FileText, action: goAdmissions },
        { label: "BAC Prospectus", description: "Download our official college prospectus", icon: Download, action: goAdmissions },
        { label: "Fees Structure", description: "Programme-wise fee schedule & payment modes", icon: CreditCard, action: goAdmissions },
        { label: "Application Form", description: "Apply online for 2026–27 academic year", icon: ClipboardList, action: goAdmissions },
        { label: "Scholarships", description: "Government aid, institutional merit awards", icon: Award, action: goAdmissions },
      ],
    },
    {
      label: "Student Activities",
      id: "student-activities",
      align: "center",
      width: "w-[540px]",
      columns: 2,
      children: [
        { label: "Student Council", description: "Elected student leadership & representation", icon: Users, action: () => goStudentActivities("council") },
        { label: "Fine Arts & Culture", description: "Annual fest, dance, music & theatre", icon: Palette, action: () => goStudentActivities("fine-arts") },
        { label: "Sports & Athletics", description: "Inter-collegiate tournaments & championships", icon: Trophy, action: () => goStudentActivities("sports") },
        { label: "Department Associations", description: "Co-curricular symposiums & guest lectures", icon: Building2, action: () => goStudentActivities("associations") },
        { label: "Extension Activities", description: "NSS, NCC & community outreach initiatives", icon: Heart, action: () => goStudentActivities("extension") },
        { label: "Placements & Careers", description: "Corporate recruitment bootcamps & drives", icon: Briefcase, action: goPlacements },
      ],
    },
    {
      label: "IQAC & NIRF",
      id: "iqac",
      align: "center",
      width: "w-[560px]",
      columns: 2,
      children: [
        { label: "About IQAC Cell", description: "Internal Quality Assurance Cell stewardship", icon: Shield, action: () => goIqac("about") },
        { label: "IQAC Members", description: "Composition of the IQAC committee", icon: Users, action: () => goIqac("members") },
        { label: "NIRF Rankings", description: "National Institutional Ranking Framework data", icon: Award, badge: "NIRF", action: goNirf },
        { label: "AQAR Reports", description: "Annual Quality Assurance Reports", icon: FileText, action: () => goIqac("aqar") },
        { label: "Quality Initiatives", description: "Continuous benchmark improvements", icon: Lightbulb, action: () => goIqac("initiatives") },
        { label: "Institutional Best Practices", description: "Excellence in ethics & student support", icon: Star, action: () => goIqac("best-practices") },
        { label: "Self Study Report (SSR)", description: "Certified NAAC accreditation documents", icon: BookOpen, action: () => goIqac("ssr") },
      ],
    },
    {
      label: "Campus & Library",
      id: "library",
      align: "right",
      width: "w-[440px]",
      columns: 1,
      children: [
        { label: "Central Library", description: "10,000+ e-books, INFLIBNET N-LIST & print journals", icon: Library, action: () => goLibrary() },
        { label: "Campus Facilities", description: "Sports pavilion, eco-grounds & cafeteria", icon: Building2, action: goFacilities },
        { label: "Campus Photo Gallery", description: "Life at Bishop Ambrose College in photos", icon: Palette, action: goGallery },
      ],
    },
    {
      label: "BAC Alumni",
      id: "alumni",
      align: "right",
      width: "w-[400px]",
      columns: 1,
      children: [
        { label: "Alumni Events", description: "Reunions, guest lectures & homecoming", icon: Calendar, action: () => goAlumni("events") },
        { label: "Alumni Registration", description: "Join our global graduate network", icon: UserCheck, action: () => goAlumni("registration") },
        { label: "Alumni Association", description: "Chapter leadership & mentorship programs", icon: Heart, action: () => goAlumni("association") },
      ],
    },
    {
      label: "Contact Us",
      id: "contact",
      action: goContact,
    },
  ];

  // Active item checking logic matching routes
  const isItemActive = (section: NavSection) => {
    const t = view.type;
    if (section.id === "home") return t === "home";
    if (section.id === "about") return t === "about";
    if (section.id === "academic") return t === "academic" || t === "department" || t === "autonomous" || t === "examination";
    if (section.id === "admissions") return t === "admissions";
    if (section.id === "student-activities") return t === "student-activities" || t === "placements";
    if (section.id === "iqac") return t === "iqac" || t === "nirf";
    if (section.id === "library") return t === "library" || t === "facilities" || t === "gallery";
    if (section.id === "alumni") return t === "alumni";
    if (section.id === "contact") return t === "contact";
    return false;
  };

  return (
    <div id="site-header-container" className="w-full relative z-50">
      {/* ── 1. Top Utility Contact Bar ──────────────────────────────────── */}
      <div
        id="top-utility-bar"
        className="hidden lg:block bg-navy-dark text-white/90 text-xs py-2 border-b border-white/10 select-none"
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 xl:px-8 2xl:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 xl:gap-5 whitespace-nowrap min-w-0">
            <span className="inline-flex items-center gap-1.5 font-medium shrink-0">
              <Headphones className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-white/80">Helpline:</span>{" "}
              <a href="tel:04222316731" className="hover:text-gold transition-colors font-semibold">
                0422-2316731
              </a>
            </span>
            <span className="text-white/20 hidden xl:inline">|</span>
            <span className="hidden xl:inline-flex items-center gap-1.5 shrink-0">
              <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-white/80">Office:</span>{" "}
              <a href="tel:04222310655" className="hover:text-gold transition-colors">
                0422-2310655
              </a>
            </span>
            <span className="text-white/20">|</span>
            <span className="inline-flex items-center gap-1.5 shrink-0">
              <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
              <a href="mailto:bishopambrosecollege1@gmail.com" className="hover:text-gold transition-colors">
                bishopambrosecollege1@gmail.com
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 xl:gap-5 whitespace-nowrap shrink-0">
            <button
              onClick={goErp}
              className="inline-flex items-center gap-1.5 text-gold hover:text-white transition-colors font-semibold cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>Student Portal</span>
            </button>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2.5">
              <a href="#" className="hover:text-gold transition-colors p-1" title="Facebook" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors p-1" title="Twitter" aria-label="Twitter">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors p-1" title="Instagram" aria-label="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors p-1" title="LinkedIn" aria-label="LinkedIn">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Sticky Navigation Header ─────────────────────────────── */}
      <header
        id="main-header"
        ref={navRef}
        className={cn(
          "sticky top-0 z-50 transition-all duration-200 bg-white border-b border-[#E2E8F0]",
          scrolled ? "shadow-md bg-white/98 backdrop-blur-md" : "shadow-xs"
        )}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gold-dark z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 xl:px-8 2xl:px-12">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-200",
              scrolled ? "h-14 lg:h-16" : "h-16 lg:h-18"
            )}
          >
            {/* College Logo with Distinct Spacing from Navigation */}
            <div className="flex items-center shrink-0 mr-6 lg:mr-8 xl:mr-10 2xl:mr-12">
              <Logo variant="dark" onClick={goHome} />
            </div>

            {/* Desktop Navigation Links (Single-Line, Logical, Cleanly Spaced) */}
            <nav
              role="navigation"
              aria-label="Main Navigation"
              className="hidden xl:flex items-center gap-1 xl:gap-1.5 2xl:gap-2.5 shrink min-w-0"
            >
              {navSections.map((section) => {
                const hasChildren = Boolean(section.children && section.children.length > 0);
                const isCurrentActive = isItemActive(section);
                const isCurrentOpen = activeDropdown === section.label;

                return (
                  <div
                    key={section.label}
                    className="relative"
                    onMouseEnter={() => hasChildren && handleMouseEnter(section.label)}
                    onMouseLeave={() => hasChildren && handleMouseLeave()}
                  >
                    <button
                      type="button"
                      aria-haspopup={hasChildren ? "true" : undefined}
                      aria-expanded={hasChildren ? isCurrentOpen : undefined}
                      onClick={() => {
                        if (hasChildren) {
                          setActiveDropdown(isCurrentOpen ? null : section.label);
                        } else if (section.action) {
                          section.action();
                          setActiveDropdown(null);
                        }
                      }}
                      className={cn(
                        "relative px-2.5 py-1.5 xl:px-3 xl:py-2 text-[13px] xl:text-[13.5px] 2xl:text-[14px] font-medium tracking-normal transition-all rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer select-none",
                        isCurrentActive
                          ? "text-[#14532D] font-bold bg-[#14532D]/8"
                          : "text-[#26352B] hover:text-[#14532D] hover:bg-[#14532D]/5",
                        isCurrentOpen && "text-[#14532D] bg-[#14532D]/6"
                      )}
                    >
                      <span>{section.label}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0",
                            isCurrentOpen && "rotate-180 text-[#14532D]"
                          )}
                        />
                      )}

                      {/* Active Indicator Bar */}
                      {isCurrentActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#14532D] rounded-full z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>

                    {/* Desktop Floating Dropdown Menu */}
                    <AnimatePresence>
                      {hasChildren && isCurrentOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className={cn(
                            "absolute top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-[#E2E8F0] overflow-hidden p-4",
                            section.width || "w-[500px]",
                            section.align === "left" && "left-0",
                            section.align === "center" && "left-1/2 -translate-x-1/2",
                            section.align === "right" && "right-0"
                          )}
                        >
                          {/* Optional Top Highlight Banner (e.g. for Admissions) */}
                          {section.highlight && (
                            <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50/50 border border-emerald-100 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                {section.highlight.badge && (
                                  <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                                    {section.highlight.badge}
                                  </span>
                                )}
                                <h4 className="font-serif font-bold text-xs text-navy mt-1">
                                  {section.highlight.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                                  {section.highlight.description}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  section.highlight?.action();
                                  setActiveDropdown(null);
                                }}
                                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#14532D] text-white text-xs font-semibold hover:bg-[#0f3d21] transition-colors cursor-pointer shadow-xs"
                              >
                                <span>{section.highlight.ctaText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Items Grid */}
                          <div
                            className={cn(
                              "grid gap-1.5",
                              section.columns === 2 ? "grid-cols-2" : "grid-cols-1"
                            )}
                          >
                            {section.children?.map((child, idx) => {
                              const Icon = child.icon;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    child.action();
                                    setActiveDropdown(null);
                                  }}
                                  className="group text-left p-2.5 rounded-xl hover:bg-emerald-50/70 hover:text-[#14532D] transition-all flex items-start gap-2.5 cursor-pointer"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#14532D] group-hover:text-white text-navy flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-navy group-hover:text-[#14532D] transition-colors leading-tight">
                                        {child.label}
                                      </span>
                                      {child.badge && (
                                        <span className="text-[9px] font-bold text-white bg-[#14532D] px-1.5 py-0.2 rounded-full">
                                          {child.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                                      {child.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right Action Icons & Primary Apply Now CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto xl:ml-6 2xl:ml-8">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-navy hover:bg-slate-100 transition-colors cursor-pointer"
                title="Search courses, departments, faculty"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                aria-label="Admin Portal"
                onClick={() => window.open("/admin", "_blank")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-navy hover:bg-slate-100 transition-colors cursor-pointer"
                title="Admin Portal"
              >
                <LayoutDashboard className="w-4 h-4 text-navy" />
              </button>

              <div className="hidden sm:block">
                <PremiumButton
                  variant="gold"
                  size="sm"
                  onClick={goAdmissions}
                  className="text-xs sm:text-sm font-bold px-4 py-2 whitespace-nowrap shadow-xs"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Apply Now
                </PremiumButton>
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-navy hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search Bar Dropdown ──────────────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#E2E8F0] overflow-hidden bg-white"
            >
              <div className="w-full max-w-[1920px] mx-auto px-6 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search programmes, departments, faculty, examinations, calendar..."
                    className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-slate-200 focus:border-[#14532D] focus:outline-none text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── 3. Responsive Mobile Navigation Drawer (< xl) ────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-50 xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[88%] max-w-sm sm:max-w-md bg-white z-50 xl:hidden flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
                <Logo variant="dark" onClick={() => { setMobileOpen(false); goHome(); }} />
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-navy hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-premium">
                <motion.nav
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-1"
                >
                  {navSections.map((section) => {
                    const hasChildren = Boolean(section.children && section.children.length > 0);
                    const isExpanded = expandedMobileItem === section.label;
                    const isCurrentActive = isItemActive(section);

                    return (
                      <motion.div
                        variants={staggerItem}
                        key={section.label}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              setExpandedMobileItem(isExpanded ? null : section.label);
                            } else {
                              setMobileOpen(false);
                              if (section.action) section.action();
                            }
                          }}
                          className="w-full flex items-center justify-between py-3 px-2 font-semibold text-navy text-sm sm:text-base min-h-[44px] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className={isCurrentActive ? "text-[#14532D] font-bold" : ""}>
                            {section.label}
                          </span>
                          {hasChildren && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                isExpanded && "rotate-180 text-[#14532D]"
                              )}
                            />
                          )}
                        </button>

                        {/* Interactive Accordion for Sub-items */}
                        <AnimatePresence>
                          {hasChildren && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pb-2 pl-2 flex flex-col gap-1"
                            >
                              {section.children?.map((child, idx) => {
                                const Icon = child.icon;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setMobileOpen(false);
                                      child.action();
                                    }}
                                    className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-600 hover:text-[#14532D] hover:bg-emerald-50/60 text-left min-h-[40px] cursor-pointer"
                                  >
                                    <Icon className="w-4 h-4 mt-0.5 text-[#14532D] shrink-0" />
                                    <span className="min-w-0">
                                      <span className="block text-navy font-medium leading-tight">
                                        {child.label}
                                      </span>
                                      <span className="text-[11px] text-slate-500 line-clamp-1">
                                        {child.description}
                                      </span>
                                    </span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3 bg-slate-50/60">
                <PremiumButton
                  variant="gold"
                  className="w-full justify-center shadow-xs"
                  onClick={() => {
                    setMobileOpen(false);
                    goAdmissions();
                  }}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply for Admissions
                </PremiumButton>

                <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <a
                    href="tel:04222316731"
                    className="inline-flex items-center gap-1 hover:text-[#14532D] font-medium py-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#14532D]" /> 0422-2316731
                  </a>
                  <span className="text-slate-300">|</span>
                  <a
                    href="mailto:bishopambrosecollege1@gmail.com"
                    className="inline-flex items-center gap-1 hover:text-[#14532D] font-medium py-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#14532D]" /> Email
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
