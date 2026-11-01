"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Phone,
  Mail,
  Globe2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Headphones,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { departments } from "@/lib/university-data";
import { useNav } from "./nav-context";
import { Logo, PremiumButton, DepartmentIcon, staggerContainer, staggerItem } from "./primitives";

type NavItem = {
  label: string;
  type?: string;
  action?: () => void;
  children?: { label: string; description: string; icon: string; slug?: string; action: () => void }[];
};

export function Header() {
  const { goHome, goDepartment, goEvents, goAdmissions, goAbout, goAcademic,
    goStudentActivities, goIqac, goExamination, goAutonomous, goLibrary,
    goNirf, goAlumni, goContact, goFacilities, goGallery, goPlacements, goNews, view } = useNav();
  const goErp = goAdmissions;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  // Close drawers and modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
        setMegaOpen(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollToSection = (id: string) => {
    setMegaOpen(null);
    setMobileOpen(false);
    setSearchOpen(false);
    if (view.type !== "home") {
      goHome();
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Home", action: goHome },
    {
      label: "About Us",
      type: "about",
      children: [
        { label: "History of BAC",    description: "Establishment and heritage since 1994",      icon: "BookOpen",   action: () => goAbout("history") },
        { label: "Secretary's Message",description: "Message from the college Secretary",          icon: "MessageSquare",action: () => goAbout("secretary") },
        { label: "Principal's Message",description: "Vision from the Principal",                   icon: "GraduationCap",action: () => goAbout("principal") },
        { label: "Governance",         description: "Administrative governance structure",          icon: "Shield",     action: () => goAbout("governance") },
        { label: "Organogram",         description: "Organizational chart and hierarchy",           icon: "GitBranch",  action: () => goAbout("organogram") },
        { label: "Strategic Plan",     description: "Institutional development roadmap",            icon: "Target",     action: () => goAbout("strategic") },
        { label: "Code of Conduct",    description: "Rules, values and expected conduct",           icon: "FileCheck",  action: () => goAbout("conduct") },
        { label: "Annual Report",      description: "Year-wise institutional annual report",         icon: "BarChart2",  action: () => goAbout("annual-report") },
      ],
    },
    {
      label: "Academic",
      type: "academic",
      children: [
        { label: "Courses Offered",         description: "All undergraduate programmes at BAC",      icon: "BookOpen",   action: () => goAcademic("courses") },
        { label: "Departments",             description: "Our academic departments",                  icon: "Building2",  action: () => goAcademic("departments") },
        { label: "Curriculum Dev. Cell",    description: "Curriculum design and development",         icon: "FileText",   action: () => goAcademic("curriculum") },
        { label: "Programme Outcomes",      description: "Learning outcomes across programmes",        icon: "Target",     action: () => goAcademic("outcomes") },
        { label: "ICT Facilities",          description: "Digital infrastructure and smart labs",      icon: "Monitor",    action: () => goAcademic("ict") },
        { label: "Academic Calendar",       description: "Dates, events and schedules",               icon: "Calendar",   action: () => goAcademic("calendar") },
      ],
    },
    {
      label: "Student Activities",
      type: "student-activities",
      children: [
        { label: "Student Council",    description: "Elected student leadership body",              icon: "Users",      action: () => goStudentActivities("council") },
        { label: "Fine Arts",          description: "Cultural and performing arts activities",       icon: "Palette",    action: () => goStudentActivities("fine-arts") },
        { label: "Sports",             description: "Athletics, tournaments and achievements",        icon: "Trophy",     action: () => goStudentActivities("sports") },
        { label: "Associations",       description: "Student associations by department",             icon: "Users",      action: () => goStudentActivities("associations") },
        { label: "Extension Activities",description: "Community outreach and NSS",                  icon: "Heart",      action: () => goStudentActivities("extension") },
        { label: "Placement",          description: "Campus placements and career support",          icon: "Briefcase",  action: goPlacements },
      ],
    },
    {
      label: "Admission",
      type: "admissions",
      children: [
        { label: "Admission Policy",   description: "Eligibility and admission procedure",          icon: "FileText",   action: goAdmissions },
        { label: "BAC Prospectus",     description: "Download our college prospectus",              icon: "Download",   action: goAdmissions },
        { label: "Fees Structure",     description: "Programme-wise fee details",                   icon: "CreditCard", action: goAdmissions },
        { label: "Application Form",   description: "Apply online for 2026-27 admissions",         icon: "ClipboardList",action: goAdmissions },
        { label: "Scholarships",       description: "Government and institutional scholarships",    icon: "Award",      action: goAdmissions },
      ],
    },
    {
      label: "IQAC",
      type: "iqac",
      children: [
        { label: "About IQAC",              description: "Internal Quality Assurance Cell",          icon: "Shield",    action: () => goIqac("about") },
        { label: "IQAC Members",            description: "IQAC committee members list",              icon: "Users",     action: () => goIqac("members") },
        { label: "AQAR Report",             description: "Annual Quality Assurance Reports",         icon: "FileText",  action: () => goIqac("aqar") },
        { label: "Quality Initiatives",     description: "Initiatives to improve quality",           icon: "Lightbulb", action: () => goIqac("initiatives") },
        { label: "NIRF",                    description: "National Institutional Ranking Framework", icon: "Award",     action: goNirf },
        { label: "Best Practices",          description: "Institutional best practices",             icon: "Star",      action: () => goIqac("best-practices") },
        { label: "SSR",                     description: "Self Study Report",                       icon: "BookOpen",  action: () => goIqac("ssr") },
      ],
    },
    { label: "Examination", action: goExamination },
    { label: "Autonomous",  action: () => goAutonomous() },
    { label: "Library",     action: () => goLibrary() },
    { label: "NIRF",        action: goNirf },
    {
      label: "BAC Alumni",
      type: "alumni",
      children: [
        { label: "Alumni Events",        description: "Events for and by alumni",                   icon: "Calendar",   action: () => goAlumni("events") },
        { label: "Alumni Registration",  description: "Register as a BAC alumni",                  icon: "UserCheck",  action: () => goAlumni("registration") },
        { label: "BAC Alumni Association",description: "Alumni association and chapter",            icon: "Heart",      action: () => goAlumni("association") },
      ],
    },
    { label: "Contact Us", action: goContact },
  ];

  const isActive = (item: NavItem) => {
    const t = view.type;
    if (item.label === "Home")              return t === "home";
    if (item.label === "About Us")          return t === "about";
    if (item.label === "Academic")          return t === "academic" || t === "department";
    if (item.label === "Student Activities")return t === "student-activities";
    if (item.label === "Admission")         return t === "admissions";
    if (item.label === "IQAC")              return t === "iqac";
    if (item.label === "Examination")       return t === "examination";
    if (item.label === "Autonomous")        return t === "autonomous";
    if (item.label === "Library")           return t === "library";
    if (item.label === "NIRF")              return t === "nirf";
    if (item.label === "BAC Alumni")        return t === "alumni";
    if (item.label === "Contact Us")        return t === "contact";
    return false;
  };

  return (
    <>
      {/* Top utility bar */}
      <div className="hidden lg:block bg-navy-dark text-white/90 text-xs py-2 border-b border-white/10">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Headphones className="w-3.5 h-3.5 text-gold" />
              Admission Helpline: <a href="tel:04222316731" className="hover:text-gold transition-colors font-semibold">0422-2316731</a>
            </span>
            <span className="text-white/30">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold" />
              Contact: <a href="tel:04222310655" className="hover:text-gold transition-colors">0422-2310655</a>
            </span>
            <span className="text-white/30">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold" />
              <a href="mailto:bishopambrosecollege1@gmail.com" className="hover:text-gold transition-colors">bishopambrosecollege1@gmail.com</a>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={goErp} className="inline-flex items-center gap-1.5 text-gold hover:text-white transition-colors font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-gold" />
              Student Portal Link
            </button>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-gold transition-colors" title="Facebook" aria-label="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
              <a href="#" className="hover:text-gold transition-colors" title="Twitter" aria-label="Twitter"><Twitter className="w-3.5 h-3.5" /></a>
              <a href="#" className="hover:text-gold transition-colors" title="Instagram" aria-label="Instagram"><Instagram className="w-3.5 h-3.5" /></a>
              <a href="#" className="hover:text-gold transition-colors" title="LinkedIn" aria-label="LinkedIn"><Linkedin className="w-3.5 h-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled ? "glass-strong shadow-premium" : "bg-transparent"
        )}
        onMouseLeave={() => {
          setMegaOpen(null);
          setHoveredItem(null);
        }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gold-dark z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />
        <div className="container mx-auto px-4 sm:px-6">
          <div className={cn(
            "flex items-center justify-between transition-all duration-300",
            scrolled ? "h-16" : "h-16 lg:h-22"
          )}>
            <Logo variant="dark" onClick={goHome} />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "relative px-4 py-2.5 text-sm font-semibold transition-colors rounded-full",
                    isActive(item)
                      ? "text-gold-dark"
                      : "text-navy hover:text-gold-dark",
                    megaOpen === item.label && "text-gold-dark"
                  )}
                  onMouseEnter={() => {
                    setMegaOpen(item.label);
                    setHoveredItem(item.label);
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(false);
                    if (item.children) {
                      setMegaOpen(megaOpen === item.label ? null : item.label);
                    } else if (item.action) {
                      item.action();
                      setMegaOpen(null);
                    }
                  }}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {item.label}
                    {item.children && (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </span>
                  
                  {hoveredItem === item.label && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-navy/5 z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  {isActive(item) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-gold-dark rounded-full z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
                className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-navy hover:bg-navy/5 transition-colors cursor-pointer"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <button
                aria-label="Admin Portal"
                onClick={() => window.open("/admin", "_blank")}
                className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-navy hover:bg-navy/5 transition-colors cursor-pointer"
                title="Admin Portal"
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-navy" />
              </button>
              <div className="hidden sm:block">
                <PremiumButton variant="gold" size="md" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />}>
                  Apply Now
                </PremiumButton>
              </div>
              <button
                aria-label="Menu"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-navy hover:bg-navy/5 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full hidden lg:block"
            >
              <div className="container mx-auto px-6 pb-6">
                <div className="glass-strong rounded-2xl shadow-premium overflow-hidden">
                  <div className="grid grid-cols-12 gap-0">
                    {/* Side panel */}
                    <div className="col-span-3 bg-navy-gradient text-white p-6">
                      <div className="text-xs uppercase tracking-widest text-gold mb-2 font-semibold">
                        BAC
                      </div>
                      <h3 className="font-serif text-2xl font-bold mb-3 leading-tight">
                        {megaOpen}
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed">
                        Explore {megaOpen?.toLowerCase()} across Bishop Ambrose College.
                      </p>
                    </div>
                    {/* Items grid */}
                    <div className="col-span-9 p-6 grid grid-cols-3 gap-3">
                      {navItems
                        .find((i) => i.label === megaOpen)
                        ?.children?.slice(0, 9)
                        .map((child, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              child.action();
                              setMegaOpen(null);
                            }}
                            className="group text-left p-4 rounded-xl border border-navy/8 hover:border-gold/40 hover:bg-gold/5 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-navy/8 flex items-center justify-center text-navy group-hover:bg-gold group-hover:text-navy transition-colors shrink-0">
                                <DepartmentIcon name={child.icon} className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-navy mb-1 leading-tight">
                                  {child.label}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {child.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-navy/8 overflow-hidden"
            >
              <div className="container mx-auto px-6 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search programs, departments, faculty, events..."
                    className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-navy/10 focus:border-gold focus:outline-none text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[88%] max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-navy/8">
                <Logo variant="dark" onClick={() => { setMobileOpen(false); goHome(); }} />
                <button
                  aria-label="Close"
                  onClick={() => setMobileOpen(false)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-navy hover:bg-navy/5 cursor-pointer"
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
                  className="flex flex-col gap-0.5"
                >
                  {navItems.map((item) => {
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isExpanded = expandedMobileItem === item.label;

                    return (
                      <motion.div
                        variants={staggerItem}
                        key={item.label}
                        className="border-b border-navy/5 last:border-0"
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
                          className="w-full flex items-center justify-between py-3 px-2 font-semibold text-navy text-base min-h-[44px] hover:bg-navy/5 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className={isActive(item) ? "text-gold-dark font-bold" : ""}>
                            {item.label}
                          </span>
                          {hasChildren && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                isExpanded && "rotate-180 text-navy"
                              )}
                            />
                          )}
                        </button>

                        {/* Interactive Accordion for Child Items */}
                        <AnimatePresence>
                          {hasChildren && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pb-2 pl-3 flex flex-col gap-1"
                            >
                              {item.children?.map((child, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setMobileOpen(false);
                                    child.action();
                                  }}
                                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-navy hover:bg-navy/5 text-left min-h-[44px] cursor-pointer"
                                >
                                  <DepartmentIcon name={child.icon} className="w-4 h-4 mt-0.5 text-gold-dark shrink-0" />
                                  <span className="min-w-0">
                                    <span className="block text-navy font-medium leading-tight">{child.label}</span>
                                    <span className="text-xs text-slate-500 line-clamp-1">{child.description}</span>
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 sm:p-5 border-t border-navy/8 space-y-3 bg-slate-50/50">
                <PremiumButton
                  variant="gold"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileOpen(false);
                    goAdmissions();
                  }}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply Now
                </PremiumButton>

                <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <a
                    href="tel:04222316731"
                    className="inline-flex items-center gap-1 hover:text-gold-dark font-medium py-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5 text-gold-dark" /> 0422-2316731
                  </a>
                  <span className="text-slate-300">|</span>
                  <a
                    href="mailto:bishopambrosecollege1@gmail.com"
                    className="inline-flex items-center gap-1 hover:text-gold-dark font-medium py-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold-dark" /> Email
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
