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
  Sparkles,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "./nav-context";
import { Logo, PremiumButton, staggerContainer, staggerItem } from "./primitives";

// ── Dropdown Item Interface ───────────────────────────────────────────────────
interface SubmenuCard {
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  action: () => void;
}

interface NavItemConfig {
  label: string;
  id: string;
  action?: () => void;
  // Introduction panel properties for Mega Dropdown
  panelTitle?: string;
  panelBadge?: string;
  panelDescription?: string;
  panelLearnMore?: {
    label: string;
    action: () => void;
  };
  children?: SubmenuCard[];
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
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  const navContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection for navbar elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll when mobile navigation drawer is active
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

  // Click outside listener to close active mega dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
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
        setActiveMegaMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Graceful hover enter/leave handling with debounce
  const handleNavMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveMegaMenu(label);
  };

  const handleNavMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  // ── Navigation Configuration (Preserving All 12 Routes & Submenu Cards) ─────
  const navItems: NavItemConfig[] = [
    {
      label: "Home",
      id: "home",
      action: goHome,
    },
    {
      label: "About Us",
      id: "about",
      panelBadge: "Institutional Heritage",
      panelTitle: "About Bishop Ambrose College",
      panelDescription:
        "Founded in 1994 by the Diocese of Coimbatore, committed to academic excellence, value-based education, and transformative leadership.",
      panelLearnMore: {
        label: "Discover Our 30-Year Heritage",
        action: () => goAbout("overview"),
      },
      children: [
        { label: "History of BAC", description: "Diocesan establishment and 30-year legacy", icon: BookOpen, action: () => goAbout("history") },
        { label: "Secretary's Message", description: "Institutional vision from Rev. Fr. Secretary", icon: MessageSquare, action: () => goAbout("secretary") },
        { label: "Principal's Message", description: "Academic stewardship & student mentorship", icon: GraduationCap, action: () => goAbout("principal") },
        { label: "Governance", description: "Apex statutory councils and governing body", icon: Shield, action: () => goAbout("governance") },
        { label: "Organogram", description: "Administrative chart and institutional hierarchy", icon: GitBranch, action: () => goAbout("organogram") },
        { label: "Strategic Plan", description: "Long-term institutional development roadmap", icon: Target, action: () => goAbout("strategic") },
        { label: "Code of Conduct", description: "Ethical values, integrity & campus rules", icon: FileCheck, action: () => goAbout("conduct") },
        { label: "Annual Reports", description: "Year-wise certified institutional audits", icon: BarChart2, action: () => goAbout("annual-report") },
      ],
    },
    {
      label: "Academic",
      id: "academic",
      panelBadge: "Autonomous · CBCS System",
      panelTitle: "Academic Excellence & Programmes",
      panelDescription:
        "Comprehensive career-focused undergraduate and postgraduate programmes under Choice Based Credit System, affiliated with Bharathiar University.",
      panelLearnMore: {
        label: "Explore All Programmes",
        action: () => goAcademic("courses"),
      },
      children: [
        { label: "Courses Offered", description: "All undergraduate & postgraduate programmes", icon: BookOpen, action: () => goAcademic("courses") },
        { label: "Academic Departments", description: "Specialized centres of disciplinary excellence", icon: Building2, action: () => goAcademic("departments") },
        { label: "Autonomous Status", description: "Conferred autonomous system & CBCS regulations", icon: Shield, badge: "UGC", action: () => goAutonomous() },
        { label: "Examination Cell", description: "CIA schedules, evaluations & CoE results", icon: FileCheck, badge: "COE", action: () => goExamination() },
        { label: "Curriculum Dev. Cell", description: "Industry-aligned syllabus & Board of Studies", icon: FileText, action: () => goAcademic("curriculum") },
        { label: "Programme Outcomes", description: "Core PO1–PO8 graduate attributes & competencies", icon: Target, action: () => goAcademic("outcomes") },
        { label: "ICT Facilities", description: "Advanced computing labs & smart classrooms", icon: Monitor, action: () => goAcademic("ict") },
        { label: "Academic Calendar", description: "Annual instructional days, events & schedules", icon: Calendar, action: () => goAcademic("calendar") },
      ],
    },
    {
      label: "Student Activities",
      id: "student-activities",
      panelBadge: "Campus Life & Thriving",
      panelTitle: "Student Activities & Co-Curriculars",
      panelDescription:
        "Fostering holistic growth through elected student governance, performing fine arts, athletic championships, and community outreach.",
      panelLearnMore: {
        label: "View All Student Clubs",
        action: () => goStudentActivities("council"),
      },
      children: [
        { label: "Student Council", description: "Elected student leadership & representation", icon: Users, action: () => goStudentActivities("council") },
        { label: "Fine Arts & Culture", description: "Annual fest, dance, music & theatre society", icon: Palette, action: () => goStudentActivities("fine-arts") },
        { label: "Sports & Athletics", description: "Inter-collegiate tournaments & championships", icon: Trophy, action: () => goStudentActivities("sports") },
        { label: "Department Associations", description: "Disciplinary symposiums & student workshops", icon: Building2, action: () => goStudentActivities("associations") },
        { label: "Extension Activities", description: "NSS, NCC & community outreach initiatives", icon: Heart, action: () => goStudentActivities("extension") },
        { label: "Placements & Training", description: "Corporate recruitment bootcamps & campus drives", icon: Briefcase, action: goPlacements },
      ],
    },
    {
      label: "Admission",
      id: "admissions",
      panelBadge: "Admissions 2026–27",
      panelTitle: "Join Bishop Ambrose College",
      panelDescription:
        "Begin your academic journey in our lush green campus. Merit scholarships, transparent fee structures, and dedicated career guidance available.",
      panelLearnMore: {
        label: "Apply Online for 2026–27",
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
      label: "IQAC",
      id: "iqac",
      panelBadge: "Quality Assurance & Standards",
      panelTitle: "Internal Quality Assurance Cell",
      panelDescription:
        "Catalyzing continuous quality enhancement, academic benchmarks, stakeholder feedback, and NAAC/NIRF accreditation compliance.",
      panelLearnMore: {
        label: "Explore IQAC Initiatives",
        action: () => goIqac("about"),
      },
      children: [
        { label: "About IQAC Cell", description: "Internal Quality Assurance Cell stewardship", icon: Shield, action: () => goIqac("about") },
        { label: "IQAC Members", description: "Composition of the IQAC steering committee", icon: Users, action: () => goIqac("members") },
        { label: "NIRF Rankings", description: "National Institutional Ranking Framework data", icon: Award, badge: "NIRF", action: goNirf },
        { label: "AQAR Reports", description: "Annual Quality Assurance Reports", icon: FileText, action: () => goIqac("aqar") },
        { label: "Quality Initiatives", description: "Continuous academic & pedagogical improvements", icon: Lightbulb, action: () => goIqac("initiatives") },
        { label: "Institutional Best Practices", description: "Excellence in ethics, ecology & student support", icon: Star, action: () => goIqac("best-practices") },
        { label: "Self Study Report (SSR)", description: "Certified NAAC accreditation documents", icon: BookOpen, action: () => goIqac("ssr") },
      ],
    },
    {
      label: "Examination",
      id: "examination",
      panelBadge: "Evaluation & Assessment",
      panelTitle: "Office of the Controller of Examinations",
      panelDescription:
        "Ensuring integrity, confidentiality, and transparency in continuous internal assessments, semester end examinations, and evaluation.",
      panelLearnMore: {
        label: "View Examination Guidelines",
        action: () => goExamination(),
      },
      children: [
        { label: "Examination Schedule", description: "Semester examination dates, timetable & circulars", icon: Calendar, action: () => goExamination("schedule") },
        { label: "CIA Assessments", description: "Continuous Internal Assessment regulations & marks", icon: FileCheck, action: () => goExamination("cia") },
        { label: "Autonomous Framework", description: "CBCS credit distribution and passing minimums", icon: Shield, action: () => goAutonomous() },
        { label: "Results & Verification", description: "Publication of semester results & transcript issue", icon: Award, action: () => goExamination("results") },
        { label: "Revaluation Procedures", description: "Guidelines for answer script revaluation & scrutiny", icon: FileText, action: () => goExamination("revaluation") },
      ],
    },
    {
      label: "Autonomous",
      id: "autonomous",
      panelBadge: "Academic Autonomy",
      panelTitle: "UGC Conferred Autonomous Status",
      panelDescription:
        "Conferred autonomous status by the UGC and Bharathiar University, empowering syllabus innovation, modern pedagogy, and CBCS flexibility.",
      panelLearnMore: {
        label: "About Autonomous Status",
        action: () => goAutonomous(),
      },
      children: [
        { label: "Autonomous Regulations", description: "CBCS credit system, grading and curriculum rules", icon: Shield, action: () => goAutonomous("regulations") },
        { label: "Board of Studies", description: "Departmental academic boards for syllabus revision", icon: Building2, action: () => goAutonomous("bos") },
        { label: "Academic Council", description: "Apex academic regulatory body of the college", icon: Users, action: () => goAutonomous("council") },
        { label: "Governing Body", description: "Institutional stewardship and strategic policies", icon: GitBranch, action: () => goAutonomous("governing") },
      ],
    },
    {
      label: "Library",
      id: "library",
      panelBadge: "Learning Commons",
      panelTitle: "Central Library & Digital Hub",
      panelDescription:
        "State-of-the-art knowledge hub housing 10,000+ e-books, subscriptions to INFLIBNET N-LIST & DELNET, peer-reviewed journals, and digital terminals.",
      panelLearnMore: {
        label: "Visit Central Library",
        action: () => goLibrary(),
      },
      children: [
        { label: "Central Library", description: "Collection of print volumes, references & journals", icon: Library, action: () => goLibrary() },
        { label: "E-Resources & INFLIBNET", description: "Access to N-LIST, DELNET & e-theses portals", icon: Monitor, action: () => goLibrary("digital") },
        { label: "Campus Facilities", description: "Sports grounds, laboratories & seminar halls", icon: Building2, action: goFacilities },
        { label: "Photo & Video Gallery", description: "Visual memories of campus life and events", icon: Palette, action: goGallery },
      ],
    },
    {
      label: "NIRF",
      id: "nirf",
      action: goNirf,
    },
    {
      label: "BAC Alumni",
      id: "alumni",
      panelBadge: "Global Alumni Network",
      panelTitle: "BAC Alumni Association",
      panelDescription:
        "A worldwide community of over 10,000+ graduates leading across diverse corporate, public, academic, and entrepreneurial sectors.",
      panelLearnMore: {
        label: "Join Alumni Network",
        action: () => goAlumni("registration"),
      },
      children: [
        { label: "Alumni Events", description: "Reunions, guest lectures & annual homecoming", icon: Calendar, action: () => goAlumni("events") },
        { label: "Alumni Registration", description: "Register as an active BAC graduate", icon: UserCheck, action: () => goAlumni("registration") },
        { label: "Alumni Association", description: "Chapter leadership & scholarship mentorship", icon: Heart, action: () => goAlumni("association") },
      ],
    },
    {
      label: "Contact Us",
      id: "contact",
      action: goContact,
    },
  ];

  const isCurrentActive = (item: NavItemConfig) => {
    const t = view.type;
    if (item.id === "home") return t === "home";
    if (item.id === "about") return t === "about";
    if (item.id === "academic") return t === "academic" || t === "department";
    if (item.id === "student-activities") return t === "student-activities" || t === "placements";
    if (item.id === "admissions") return t === "admissions";
    if (item.id === "iqac") return t === "iqac";
    if (item.id === "examination") return t === "examination";
    if (item.id === "autonomous") return t === "autonomous";
    if (item.id === "library") return t === "library" || t === "facilities" || t === "gallery";
    if (item.id === "nirf") return t === "nirf";
    if (item.id === "alumni") return t === "alumni";
    if (item.id === "contact") return t === "contact";
    return false;
  };

  const activeSectionData = navItems.find((item) => item.label === activeMegaMenu && item.children);

  return (
    <div id="site-header-container" ref={navContainerRef} className="w-full relative z-50">
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

        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 xl:px-6 2xl:px-10">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-200",
              scrolled ? "h-14 lg:h-16" : "h-16 lg:h-18"
            )}
          >
            {/* College Logo with Distinct Spacing from Navigation */}
            <div className="flex items-center shrink-0 mr-4 lg:mr-6 xl:mr-8 2xl:mr-10">
              <Logo variant="dark" onClick={goHome} />
            </div>

            {/* Desktop Navigation Links (All 12 Items Retained & Single-Line at xl:) */}
            <nav
              role="navigation"
              aria-label="Main Navigation"
              className="hidden xl:flex items-center gap-0.5 2xl:gap-1 shrink min-w-0"
              onMouseLeave={handleNavMouseLeave}
            >
              {navItems.map((item) => {
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isActive = isCurrentActive(item);
                const isOpen = activeMegaMenu === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasChildren && handleNavMouseEnter(item.label)}
                  >
                    <button
                      type="button"
                      aria-haspopup={hasChildren ? "true" : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                      onClick={() => {
                        if (hasChildren) {
                          setActiveMegaMenu(isOpen ? null : item.label);
                        } else if (item.action) {
                          item.action();
                          setActiveMegaMenu(null);
                        }
                      }}
                      className={cn(
                        "relative px-2 py-1.5 2xl:px-2.5 2xl:py-2 text-[12.5px] 2xl:text-[13.5px] font-semibold transition-all rounded-lg whitespace-nowrap shrink-0 flex items-center gap-0.5 2xl:gap-1 cursor-pointer select-none",
                        isActive
                          ? "text-[#14532D] font-bold bg-[#14532D]/8"
                          : "text-[#26352B] hover:text-[#14532D] hover:bg-[#14532D]/5",
                        isOpen && "text-[#14532D] bg-[#14532D]/6"
                      )}
                    >
                      <span>{item.label}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 opacity-70 ml-0.5",
                            isOpen && "rotate-180 text-[#14532D]"
                          )}
                        />
                      )}

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#14532D] rounded-full z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Right Action Icons & Primary Apply Now CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto xl:ml-0">
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

        {/* ── 3. Premium Mega Dropdown Overlay (Recreating Design Reference) ─── */}
        <AnimatePresence>
          {activeSectionData && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onMouseEnter={() => handleNavMouseEnter(activeSectionData.label)}
              onMouseLeave={handleNavMouseLeave}
              className="absolute left-0 right-0 top-full z-50 pointer-events-auto"
            >
              <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-2 pb-6">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-[#E2E8F0] overflow-hidden grid grid-cols-12">
                  {/* Left Section – Dark-to-Medium Green Introduction Panel */}
                  <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#0B2916] via-[#14532D] to-[#166534] p-7 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 blob bg-white/5 pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 blob bg-gold/10 pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                      {/* Small Category Label / Badge */}
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 text-gold-light border border-white/15">
                        <Sparkles className="w-3 h-3 text-gold" />
                        {activeSectionData.panelBadge || "Bishop Ambrose College"}
                      </span>

                      {/* Section Title */}
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight">
                        {activeSectionData.panelTitle || activeSectionData.label}
                      </h3>

                      {/* Short Description */}
                      <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                        {activeSectionData.panelDescription}
                      </p>
                    </div>

                    {/* Learn More link when an existing destination is available */}
                    {activeSectionData.panelLearnMore && (
                      <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
                        <button
                          onClick={() => {
                            activeSectionData.panelLearnMore?.action();
                            setActiveMegaMenu(null);
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-gold-light hover:text-white transition-colors group/lm cursor-pointer"
                        >
                          <span>{activeSectionData.panelLearnMore.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/lm:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Section – Submenu 3-Column Grid */}
                  <div className="col-span-12 lg:col-span-8 p-6 sm:p-8 bg-[#FBFDFB]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {activeSectionData.children?.map((child, idx) => {
                        const Icon = child.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              child.action();
                              setActiveMegaMenu(null);
                            }}
                            className="group/card text-left p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#14532D]/40 hover:shadow-md hover:bg-emerald-50/40 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
                          >
                            <div>
                              {/* Small Green Icon inside light green container + Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532D] group-hover/card:bg-[#14532D] group-hover/card:text-white flex items-center justify-center transition-colors">
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                {child.badge && (
                                  <span className="text-[10px] font-bold text-[#14532D] bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </div>

                              {/* Clearly visible Submenu Title */}
                              <h4 className="font-semibold text-xs sm:text-sm text-navy group-hover/card:text-[#14532D] transition-colors leading-snug mb-1">
                                {child.label}
                              </h4>

                              {/* Short Description beneath title */}
                              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                                {child.description}
                              </p>
                            </div>

                            {/* Right-Arrow Indicator */}
                            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-end">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover/card:text-[#14532D] transition-colors">
                                <ArrowRight className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* ── 4. Responsive Mobile Navigation Drawer (< xl) ────────────────── */}
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
                  {navItems.map((item) => {
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isExpanded = expandedMobileItem === item.label;
                    const isActive = isCurrentActive(item);

                    return (
                      <motion.div
                        variants={staggerItem}
                        key={item.label}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              setExpandedMobileItem(isExpanded ? null : item.label);
                            } else {
                              setMobileOpen(false);
                              if (item.action) item.action();
                            }
                          }}
                          className="w-full flex items-center justify-between py-3 px-2 font-semibold text-navy text-sm sm:text-base min-h-[44px] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className={isActive ? "text-[#14532D] font-bold" : ""}>
                            {item.label}
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
                              {item.children?.map((child, idx) => {
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
