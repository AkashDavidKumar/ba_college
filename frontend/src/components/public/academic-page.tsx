"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Building2,
  Monitor,
  Target,
  Calendar,
  FileText,
  ChevronRight,
  Users,
  Clock,
  Award,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Laptop,
  Wifi,
  Library,
  Video,
  Compass,
  ShieldCheck,
  Layers,
  Download,
  Code2,
  TrendingUp,
  Dna,
  Calculator,
  Search,
  ExternalLink,
  MapPin,
  Check,
  Lightbulb,
  Globe2,
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
  { id: "courses", label: "Courses Offered", icon: BookOpen },
  { id: "departments", label: "Academic Departments", icon: Building2 },
  { id: "curriculum", label: "Curriculum Dev. Cell", icon: FileText },
  { id: "outcomes", label: "Programme Outcomes", icon: Target },
  { id: "ict", label: "ICT Facilities", icon: Monitor },
  { id: "calendar", label: "Academic Calendar", icon: Calendar },
];

// ── Academic Statistics Helper Component ─────────────────────────────────────
function AcademicStat({
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
        <div className="text-2xl sm:text-3xl font-bold text-navy tracking-tight font-serif">
          {typeof value === "number" ? (
            <>
              <AnimatedCounter value={value} />
              {suffix}
            </>
          ) : (
            `${value}${suffix}`
          )}
        </div>
        <div className="text-xs text-navy/60 font-medium uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Course Data ─────────────────────────────────────────────────────────────
interface Program {
  name: string;
  duration: string;
  type: string;
  seats: number;
  eligibility: string;
  description?: string;
}

interface CourseCategory {
  dept: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  description: string;
  programs: Program[];
}

const BAC_COURSES: CourseCategory[] = [
  {
    dept: "Computer Science & IT",
    slug: "computer-science",
    icon: Code2,
    color: "bg-blue-50/70 text-blue-900 border-blue-100",
    iconBg: "bg-blue-100/80 text-blue-800",
    description: "Industry-aligned curricula in computing, software architecture, full-stack development, and data systems.",
    programs: [
      {
        name: "B.Sc. Computer Science",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 with Mathematics or Computer Science",
        description: "Core algorithms, database systems, object-oriented programming, and cloud computing foundations.",
      },
      {
        name: "BCA (Bachelor of Computer Applications)",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 with Mathematics as a subject",
        description: "Application development, web technologies, software engineering, and UI/UX engineering principles.",
      },
      {
        name: "B.Sc. Information Technology",
        duration: "3 Years",
        type: "UG",
        seats: 40,
        eligibility: "10+2 with Mathematics or Computer Science",
        description: "Network architecture, cyber fundamentals, enterprise systems administration, and mobile computing.",
      },
    ],
  },
  {
    dept: "Commerce & Finance",
    slug: "commerce",
    icon: TrendingUp,
    color: "bg-emerald-50/70 text-emerald-900 border-emerald-100",
    iconBg: "bg-emerald-100/80 text-emerald-800",
    description: "Specialized commerce streams integrating international accounting, taxation frameworks, corporate governance, and fintech.",
    programs: [
      {
        name: "B.Com (General)",
        duration: "3 Years",
        type: "UG",
        seats: 120,
        eligibility: "10+2 (Any stream with Commerce / Accountancy / Business)",
        description: "Financial accounting, mercantile law, auditing standards, banking practices, and investment management.",
      },
      {
        name: "B.Com (Computer Applications)",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 (Commerce or Science stream)",
        description: "Accounting information systems, ERP software, e-commerce platforms, and computerized data analysis.",
      },
      {
        name: "B.Com (Professional Accounting)",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 (Commerce stream recommended)",
        description: "Integrated syllabus aligned with CA, CMA, and CS foundation and intermediate examinations.",
      },
      {
        name: "B.Com (Corporate Secretaryship)",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 (Any recognized stream)",
        description: "Company law, corporate secretarial practice, compliance management, and business communication.",
      },
      {
        name: "B.Com (CSCA)",
        duration: "3 Years",
        type: "UG",
        seats: 40,
        eligibility: "10+2 (Any stream with Mathematics or Commerce)",
        description: "Dual specialization bridging corporate governance, company administration, and computer applications.",
      },
    ],
  },
  {
    dept: "Management Studies",
    slug: "management",
    icon: Building2,
    color: "bg-violet-50/70 text-violet-900 border-violet-100",
    iconBg: "bg-violet-100/80 text-violet-800",
    description: "Developing strategic leaders, marketing visionaries, and organizational managers with case-study pedagogies.",
    programs: [
      {
        name: "BBA (Bachelor of Business Administration)",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 (Any recognized stream)",
        description: "Organizational behavior, marketing management, human resource strategy, and financial analytics.",
      },
      {
        name: "BBA (Computer Applications)",
        duration: "3 Years",
        type: "UG",
        seats: 40,
        eligibility: "10+2 (Any stream)",
        description: "Business analytics, digital marketing channels, ERP management, and computerized business modeling.",
      },
    ],
  },
  {
    dept: "Science & Life Sciences",
    slug: "science",
    icon: Dna,
    color: "bg-amber-50/70 text-amber-900 border-amber-100",
    iconBg: "bg-amber-100/80 text-amber-800",
    description: "Inquiry-based laboratory learning in mathematical sciences, genetics, microbiology, and bio-industrial applications.",
    programs: [
      {
        name: "B.Sc. Mathematics",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 with Mathematics",
        description: "Abstract algebra, real and complex analysis, differential equations, numerical methods, and statistics.",
      },
      {
        name: "B.Sc. Biotechnology",
        duration: "3 Years",
        type: "UG",
        seats: 40,
        eligibility: "10+2 with Biology and Chemistry",
        description: "Molecular biology, genetic engineering, plant tissue culture, immunology, and bioprocess technology.",
      },
    ],
  },
  {
    dept: "Arts & Humanities",
    slug: "arts",
    icon: BookOpen,
    color: "bg-rose-50/70 text-rose-900 border-rose-100",
    iconBg: "bg-rose-100/80 text-rose-800",
    description: "Fostering creative critical thinking, literary analysis, linguistics, and cross-cultural communication excellence.",
    programs: [
      {
        name: "B.A. English Literature",
        duration: "3 Years",
        type: "UG",
        seats: 60,
        eligibility: "10+2 (Any stream with English proficiency)",
        description: "British and world literatures, literary theory, American literature, phonetics, and professional writing.",
      },
    ],
  },
];

// ── Academic Departments Data ───────────────────────────────────────────────
const DEPARTMENTS_DATA = [
  {
    name: "Computer Science & Engineering",
    slug: "computer-science",
    hod: "Dr. A. Jeyaraj",
    faculty: 12,
    students: 350,
    programs: 3,
    icon: Code2,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=75",
    desc: "Innovative learning in cutting-edge computing, AI foundations, cloud infrastructure, and full-stack software development with dedicated research labs.",
  },
  {
    name: "Commerce & Management",
    slug: "commerce",
    hod: "Dr. S. Arulraj",
    faculty: 15,
    students: 480,
    programs: 5,
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=75",
    desc: "Build expertise in corporate accounting, fintech, taxation, and financial management with industry-recognized certifications and internship pipelines.",
  },
  {
    name: "Biotechnology & Life Sciences",
    slug: "biotechnology",
    hod: "Dr. L. Kavitha",
    faculty: 7,
    students: 80,
    programs: 1,
    icon: Dna,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=75",
    desc: "Explore the frontiers of molecular genetics, microbiological assays, plant cell culture, and industrial bio-manufacturing in modern laboratories.",
  },
  {
    name: "Management Studies (BBA)",
    slug: "management",
    hod: "Dr. M. Priya",
    faculty: 8,
    students: 180,
    programs: 2,
    icon: Building2,
    image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=75",
    desc: "Developing tomorrow's business leaders and entrepreneurs through experiential management labs, enterprise case studies, and corporate internships.",
  },
  {
    name: "Mathematics",
    slug: "mathematics",
    hod: "Dr. R. Sundar",
    faculty: 6,
    students: 120,
    programs: 1,
    icon: Calculator,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=75",
    desc: "Rigorous curriculum with profound emphasis on abstract algebra, computational modeling, differential equations, and data science analytics.",
  },
  {
    name: "English & Comparative Literature",
    slug: "english",
    hod: "Dr. P. Malar",
    faculty: 5,
    students: 120,
    programs: 1,
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=75",
    desc: "Fostering literary appreciation, critical analysis, creative expression, and world-class English language communication competence.",
  },
];

// ── Academic Calendar Schedule ──────────────────────────────────────────────
const CALENDAR_EVENTS = [
  {
    month: "June",
    semester: "Odd Semester",
    events: [
      "College Reopens for Academic Year 2024–25",
      "Orientation & Induction Programme for I Year UG Scholars",
      "Bridge Courses in English, Mathematics & Computer Basics",
      "Scholarship Verification & Government Portal Enrollment",
    ],
  },
  {
    month: "July",
    semester: "Odd Semester",
    events: [
      "Commencement of Continuous Internal Assessment – I (CIA-1)",
      "Student Council Elections & Department Association Inaugurations",
      "Sports Selection Trials & Athletic Team Formation",
      "Mandatory Anti-Ragging Awareness & Sensitization Workshops",
    ],
  },
  {
    month: "August",
    semester: "Odd Semester",
    events: [
      "Independence Day Celebrations & NCC Ceremonial Parade",
      "Department National Seminars & Inter-Collegiate Symposiums",
      "First Parent-Teacher Consultative Meetings",
      "NSS Clean Campus & Community Tree Plantation Drive",
    ],
  },
  {
    month: "September",
    semester: "Odd Semester",
    events: [
      "Continuous Internal Assessment – II (CIA-2)",
      "Inter-Collegiate Cultural Festival & Fine Arts Prelims",
      "NSS Special Rural Outreach Residential Camp Registration",
      "On-Campus Pre-Placement Training Bootcamps for Final Years",
    ],
  },
  {
    month: "October",
    semester: "Odd Semester",
    events: [
      "Model Examinations for Odd Semester Theory & Practicals",
      "Bharathiar University Practical Examinations Commence",
      "Annual Alumni Homecoming & Networking Forum",
      "Industrial Visits for Science & Commerce Final Year Batches",
    ],
  },
  {
    month: "November",
    semester: "Even Semester",
    events: [
      "Bharathiar University Odd Semester Theory Examinations",
      "Commencement of Even Semester Classes",
      "Corporate Placement Drives – Phase 1 (IT & Consulting)",
      "National Education Day Seminars & Book Fair Exhibition",
    ],
  },
  {
    month: "December",
    semester: "Even Semester",
    events: [
      "Annual College Sports Meet & Athletic Championship",
      "Christmas Carol Fest & Joy of Giving Charity Outreach",
      "Continuous Internal Assessment – I for Even Semester (CIA-1)",
      "Winter Recess & Study Tour for Final Year Students",
    ],
  },
  {
    month: "January",
    semester: "Even Semester",
    events: [
      "College Reopens after Winter Recess",
      "National Youth Day & Pongal Harvest Cultural Celebrations",
      "Republic Day Celebrations & NCC Guard of Honour",
      "Corporate Placement Drives – Phase 2 (Banking, Core & Retail)",
    ],
  },
  {
    month: "February",
    semester: "Even Semester",
    events: [
      "Continuous Internal Assessment – II (CIA-2)",
      "International / National Multi-Disciplinary Conference",
      "Department Annual Day Exhibitions & Science Project Expo",
      "Second Parent-Teacher Consultative Review Meetings",
    ],
  },
  {
    month: "March",
    semester: "Even Semester",
    events: [
      "Even Semester Model Examinations & Practical Assessments",
      "College Annual Day Celebrations & Academic Merit Honors",
      "Graduation Day & Farewell Assembly for Final Year Batches",
      "Bharathiar University Even Semester Practicals Begin",
    ],
  },
  {
    month: "April",
    semester: "Even Semester",
    events: [
      "Bharathiar University Even Semester Theory Examinations",
      "Faculty Development Programmes (FDP) & Research Colloquiums",
      "Annual Institutional Quality Audit by IQAC",
      "Summer Vacation Commences for Students",
    ],
  },
  {
    month: "May",
    semester: "Summer Term",
    events: [
      "Admission Counselling & Application Verification for 2025–26",
      "Annual Board of Studies & Curriculum Revision Meetings",
      "Campus Infrastructure Upgrades & Laboratory Maintenance",
      "Publication of Bharathiar University Semester Results",
    ],
  },
];

// ── Curriculum Development Cell Details ──────────────────────────────────────
const CDC_FEATURES = [
  {
    title: "Triennial Syllabi Overhauls",
    desc: "Rigorous 3-year systematic curriculum review integrating the latest industry advancements, technological disruptions, and UGC/TANSCHE mandates.",
    icon: Clock,
  },
  {
    title: "Statutory Board of Studies",
    desc: "Autonomous curriculum panels featuring university representatives, corporate sector leads, alumni innovators, and senior faculty specialists.",
    icon: Users,
  },
  {
    title: "Skill Enhancement Courses (SEC)",
    desc: "Mandatory value-added modular courses in Artificial Intelligence, Python for Analytics, Tally Prime, Digital Marketing, and Communicative English.",
    icon: Award,
  },
  {
    title: "Mandatory Summer Internships",
    desc: "Compulsory 4- to 6-week corporate internships and field research projects fostering direct workplace immersion prior to graduation.",
    icon: Building2,
  },
  {
    title: "Credit-Bearing MOOC Integration",
    desc: "Formal credit transfer pathways for certified courses completed through Swayam, NPTEL, Coursera, and edX digital learning ecosystems.",
    icon: Laptop,
  },
  {
    title: "Outcome-Based Education (OBE)",
    desc: "Granular Bloom's Taxonomy mapping connecting each course module to measurable Course Outcomes (COs) and Programme Specific Outcomes (PSOs).",
    icon: Target,
  },
];

// ── Programme Outcomes (PO1 – PO8) ──────────────────────────────────────────
const PROGRAMME_OUTCOMES = [
  {
    code: "PO1",
    title: "Critical Thinking & Complex Problem Solving",
    desc: "Develop capacity to systematically evaluate qualitative and quantitative data, formulate evidence-based deductions, and devise innovative multi-disciplinary solutions to real-world challenges.",
    icon: Lightbulb,
  },
  {
    code: "PO2",
    title: "Communication & Language Proficiency",
    desc: "Demonstrate articulate, persuasive, and culturally sensitive verbal, written, digital, and interpersonal communication across academic, corporate, and social environments.",
    icon: MessageSquareIcon,
  },
  {
    code: "PO3",
    title: "Digital, Computational & Information Literacy",
    desc: "Effectively utilize modern digital tools, software packages, databases, and emerging artificial intelligence platforms with high standards of data security and ethics.",
    icon: Laptop,
  },
  {
    code: "PO4",
    title: "Moral Ethos, Social Justice & Integrity",
    desc: "Embody Gospel-inspired Christian principles of compassion, civic responsibility, environmental sustainability, ethical leadership, and dedicated service to marginalized communities.",
    icon: ShieldCheck,
  },
  {
    code: "PO5",
    title: "Collaborative Leadership & Cross-Functional Teamwork",
    desc: "Exhibit leadership agility, collaborative consensus-building, and conflict resolution capabilities while functioning productively in diverse, multi-disciplinary workforces.",
    icon: Users,
  },
  {
    code: "PO6",
    title: "Scientific Research & Inquiry-Driven Learning",
    desc: "Apply foundational research methodologies, hypothesis testing, empirical literature reviews, and rigorous scientific reasoning to address regional and global dilemmas.",
    icon: Search,
  },
  {
    code: "PO7",
    title: "Lifelong Learning & Professional Adaptability",
    desc: "Cultivate intellectual curiosity and autonomous learning agility to thrive amidst evolving technologies, changing economic landscapes, and dynamic industry environments.",
    icon: Compass,
  },
  {
    code: "PO8",
    title: "Career Readiness & Entrepreneurial Mindset",
    desc: "Demonstrate strong industry competence, corporate professionalism, project execution capability, and an innovative entrepreneurial spirit that creates societal value.",
    icon: Award,
  },
];

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ── ICT Facilities Data ─────────────────────────────────────────────────────
const ICT_FACILITIES = [
  {
    name: "Advanced Computer Laboratories",
    count: "6 Dedicated Labs",
    spec: "250+ Intel Core i7 / 16GB RAM Workstations",
    desc: "High-speed networked computing laboratories equipped with licensed compilers, MATLAB, Python environments, database engines, and Gigabit LAN connectivity.",
    icon: Monitor,
    highlights: ["Dual 1 Gbps redundant leased lines", "UPS power backup for 100% uptime", "Specialized AI & Data Science lab"],
  },
  {
    name: "Smart Audio-Visual Classrooms",
    count: "12 Interactive Rooms",
    spec: "4K Interactive Digital Displays & Audio",
    desc: "Multimedia-enabled lecture halls featuring interactive touch panels, ultra-short throw projectors, document cameras, and synchronized acoustic systems.",
    icon: Laptop,
    highlights: ["Live hybrid lecture streaming setup", "Cloud lecture capture and archival", "Wireless screen casting for faculty"],
  },
  {
    name: "Campus-Wide Gigabit Wi-Fi",
    count: "100% Coverage",
    spec: "Enterprise Mesh Access Points",
    desc: "Ubiquitous wireless infrastructure providing high-throughput, secure, firewall-protected internet access across all academic blocks, library, and common spaces.",
    icon: Wifi,
    highlights: ["802.11ax Wi-Fi 6 standard", "Role-based authenticated user access", "24/7 network security monitoring"],
  },
  {
    name: "Digital Library & E-Resource Hub",
    count: "10,000+ E-Books",
    spec: "Access to INFLIBNET N-LIST & DELNET",
    desc: "Air-conditioned digital resource centre featuring 30 dedicated desktop stations with full-text access to peer-reviewed e-journals, research repositories, and e-theses.",
    icon: Library,
    highlights: ["INFLIBNET N-LIST & DELNET subscriptions", "OPAC computerized book search", "Remote institutional repository access"],
  },
  {
    name: "Interactive Language Laboratory",
    count: "40 Master Consoles",
    spec: "Sanako Speech & Phonetics Software",
    desc: "Specialized multimedia laboratory focused on phonetics, accent neutralization, TOEFL/IELTS preparation, and interactive communicative English mastering.",
    icon: Video,
    highlights: ["Individual headsets with noise cancellation", "Real-time speech analysis & recording", "Interactive pronunciation drills"],
  },
  {
    name: "Executive Video Conferencing Suites",
    count: "2 Telepresence Suites",
    spec: "Polycom 4K Video Arrays & PTZ Cameras",
    desc: "State-of-the-art telepresence boardrooms dedicated to international webinars, collaborative inter-collegiate symposia, and live corporate placement interviews.",
    icon: Globe2,
    highlights: ["Multi-party conferencing support", "Integrated acoustic ceiling microphones", "Direct YouTube/Webcast streaming bridge"],
  },
];

// ── Main Academic Page Component ────────────────────────────────────────────
export function AcademicPage({ section }: { section?: string }) {
  const { goHome, goAdmissions, goDepartment } = useNav();
  const [activeSection, setActiveSection] = useState(() => section || "courses");
  const [selectedStream, setSelectedStream] = useState("All");

  useEffect(() => {
    if (section && navSections.some((s) => s.id === section)) {
      setActiveSection(section);
    }
  }, [section]);

  const handleTabChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      const navEl = document.getElementById("academic-tab-nav");
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

  const activeNav = navSections.find((n) => n.id === activeSection) ?? navSections[0];

  const streamFilters = [
    "All",
    "Computer Science & IT",
    "Commerce & Finance",
    "Management Studies",
    "Science & Life Sciences",
    "Arts & Humanities",
  ];

  const filteredCourses =
    selectedStream === "All"
      ? BAC_COURSES
      : BAC_COURSES.filter((c) => c.dept === selectedStream);

  return (
    <div className="bg-background min-h-screen">
      {/* ── Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 flex-wrap">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-white/40" />
          <span>Academic</span>
          <ChevronRight className="w-3 h-3 text-white/40" />
          <span className="text-gold-light font-medium">{activeNav.label}</span>
        </div>
      </div>

      {/* ── Hero Section (8:4 Split Grid Matching Department Page) ───── */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=75"
            alt="Bishop Ambrose College Academic Campus"
            className="w-full h-full object-cover opacity-85"
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
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-[#14532D]/20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-navy text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Autonomous · CBCS System · Bharathiar Univ Affiliated
                </div>
                <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-5">
                  Academic Excellence & Programmes
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                  Empowering ambitious scholars with industry-aligned curricula, Outcome-Based Education (OBE),
                  world-class computing facilities, and values rooted in holistic intellectual discovery.
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
                    onClick={() => handleTabChange("courses")}
                    icon={<BookOpen className="w-4 h-4" />}
                  >
                    Explore Programmes
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10"
                    icon={<Calendar className="w-4 h-4" />}
                    onClick={() => handleTabChange("calendar")}
                  >
                    Academic Calendar
                  </PremiumButton>
                </div>
              </motion.div>
            </div>

            {/* Right 4 Columns - 2x2 Quick Stats */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <AcademicStat
                  icon={<BookOpen className="w-4 h-4" />}
                  value={12}
                  suffix="+"
                  label="Programmes Offered"
                />
                <AcademicStat
                  icon={<Users className="w-4 h-4" />}
                  value={60}
                  suffix="+"
                  label="Faculty Mentors"
                />
                <AcademicStat
                  icon={<GraduationCap className="w-4 h-4" />}
                  value={1200}
                  suffix="+"
                  label="Active Students"
                />
                <AcademicStat
                  icon={<CheckCircle className="w-4 h-4" />}
                  value="100%"
                  label="Outcome-Based (OBE)"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Tab Navigation Bar ─────────────────────────────────── */}
      <div
        id="academic-tab-nav"
        className="sticky top-16 lg:top-20 z-30 glass-strong border-y border-navy/8 shadow-premium"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav
            role="tablist"
            aria-label="Academic section navigation"
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium py-2.5"
          >
            {navSections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  id={`tab-${s.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${s.id}`}
                  onClick={() => handleTabChange(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-[#14532D] text-white shadow-md shadow-[#14532D]/20 scale-102"
                      : "text-navy hover:bg-navy/8 hover:text-[#14532D]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Tabbed Content Area ──────────────────────────────────── */}
      <main className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <AnimatePresence mode="wait">
          {/* TAB 1: COURSES OFFERED */}
          {activeSection === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-navy/10">
                <SectionHeading
                  eyebrow="Degrees & Specializations"
                  title="Undergraduate & Postgraduate Programmes"
                  description="Explore career-oriented programmes under the Choice Based Credit System (CBCS), affiliated with Bharathiar University."
                />
                <div className="shrink-0">
                  <PremiumButton
                    variant="gold"
                    size="md"
                    onClick={goAdmissions}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Admissions 2024–25
                  </PremiumButton>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {streamFilters.map((stream) => (
                  <button
                    key={stream}
                    onClick={() => setSelectedStream(stream)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap",
                      selectedStream === stream
                        ? "bg-[#14532D] text-white shadow-sm shadow-[#14532D]/20"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-[#14532D]/40 hover:text-[#14532D]"
                    )}
                  >
                    {stream}
                  </button>
                ))}
              </div>

              {/* Stream Cards */}
              <div className="space-y-8">
                {filteredCourses.map((category, idx) => {
                  const Icon = category.icon;
                  return (
                    <Reveal key={category.dept} delay={idx * 0.05}>
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Stream Banner */}
                        <div className={cn("px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b", category.color)}>
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", category.iconBg)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-lg sm:text-xl text-navy">
                                Department of {category.dept}
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{category.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => goDepartment(category.slug)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14532D] hover:underline self-start sm:self-auto shrink-0"
                          >
                            <span>Department Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Programme List */}
                        <div className="divide-y divide-slate-100">
                          {category.programs.map((prog, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                              <div className="space-y-1.5 max-w-2xl">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#14532D]/10 text-[#14532D]">
                                    {prog.type}
                                  </span>
                                  <h4 className="font-serif font-bold text-base sm:text-lg text-navy">
                                    {prog.name}
                                  </h4>
                                </div>
                                {prog.description && (
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {prog.description}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                                  <span className="font-semibold text-slate-700">Eligibility:</span>
                                  <span>{prog.eligibility}</span>
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-gold-dark" />
                                  <span>{prog.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-lg">
                                  <Users className="w-3.5 h-3.5 text-gold-dark" />
                                  <span>{prog.seats} Seats</span>
                                </div>
                                <PremiumButton
                                  variant="primary"
                                  size="sm"
                                  onClick={goAdmissions}
                                  className="text-xs"
                                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                                >
                                  Apply Now
                                </PremiumButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACADEMIC DEPARTMENTS */}
          {activeSection === "departments" && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <SectionHeading
                eyebrow="Centres of Excellence"
                title="Our Academic Departments"
                description="Explore a wide range of career-defining programmes across diverse disciplines, designed to shape your future."
              />

              {/* 3-Column Card Grid Matching the Design Reference */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {DEPARTMENTS_DATA.map((dept, i) => {
                  const Icon = dept.icon;
                  return (
                    <Reveal key={dept.name} delay={i * 0.05}>
                      <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                        {/* 16:9 Image Container with Floating Department Icon */}
                        <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
                          <img
                            src={dept.image}
                            alt={dept.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Floating Circular Icon Badge */}
                          <div className="absolute bottom-3 left-4 w-11 h-11 rounded-xl bg-[#14532D] text-white flex items-center justify-center shadow-lg border-2 border-white">
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Top Badge */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-navy shadow-sm">
                            {dept.programs} {dept.programs === 1 ? "Program" : "Programs"}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="font-serif font-bold text-lg sm:text-xl text-navy group-hover:text-[#14532D] transition-colors mb-2 leading-snug">
                              {dept.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                              {dept.desc}
                            </p>
                          </div>

                          <div>
                            {/* Department Metrics Bar */}
                            <div className="flex items-center justify-between text-xs text-slate-500 py-3 border-t border-slate-100 mb-4">
                              <span className="flex items-center gap-1 font-medium">
                                <Users className="w-3.5 h-3.5 text-[#14532D]" />
                                {dept.faculty} Faculty
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <GraduationCap className="w-3.5 h-3.5 text-[#14532D]" />
                                {dept.students} Students
                              </span>
                              <span className="text-slate-400 font-medium">
                                HOD: {dept.hod}
                              </span>
                            </div>

                            {/* Explore Department Button */}
                            <button
                              onClick={() => goDepartment(dept.slug)}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-[#14532D] text-navy hover:text-white rounded-xl text-xs font-bold transition-all duration-200 group/btn border border-slate-200 hover:border-[#14532D]"
                            >
                              <span>Explore Department</span>
                              <div className="w-6 h-6 rounded-full bg-white text-navy group-hover/btn:bg-white/20 group-hover/btn:text-white flex items-center justify-center transition-colors">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* Bottom Feature Strip (Matching Reference Image) */}
              <div className="mt-12 bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy font-serif">Quality Education</div>
                      <div className="text-xs text-slate-500">Learn with Excellence</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy font-serif">Expert Faculty</div>
                      <div className="text-xs text-slate-500">Learn from the Best</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy font-serif">Holistic Growth</div>
                      <div className="text-xs text-slate-500">Grow Beyond Academics</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy font-serif">Bright Future</div>
                      <div className="text-xs text-slate-500">Achieve Your Goals</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CURRICULUM DEVELOPMENT CELL */}
          {activeSection === "curriculum" && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <SectionHeading
                eyebrow="Curricular Innovation"
                title="Curriculum Development Cell (CDC)"
                description="Continuously reviewing, designing, and upgrading academic curricula in accordance with UGC mandates, industry benchmarks, and Bharathiar University regulations."
              />

              {/* Overview Box */}
              <GlassCard className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="font-serif font-bold text-2xl text-navy">
                      Academic Rigor Meets Contemporary Industry Relevance
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      The Curriculum Development Cell at Bishop Ambrose College functions as the primary catalyst
                      for academic transformation. By combining feedback from corporate partners, academic peers, alumni
                      practitioners, and active students, the CDC guarantees that every degree programme nurtures
                      critical thinking, analytical depth, ethical conviction, and occupational readiness.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      {[
                        "Continuous Outcome-Based Education (OBE) mapping",
                        "Interdisciplinary electives across all streams",
                        "Mandatory value-added modular certifications",
                        "National Education Policy (NEP) aligned framework",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-[#14532D] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-emerald-50/80 rounded-2xl p-6 border border-emerald-100 space-y-3">
                    <h4 className="font-serif font-bold text-base text-navy">CDC Highlights</h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between py-1 border-b border-emerald-200/60">
                        <span className="font-medium">Revision Cycle</span>
                        <span className="font-bold text-[#14532D]">Every 3 Years</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-200/60">
                        <span className="font-medium">Statutory Approvals</span>
                        <span className="font-bold text-[#14532D]">Board of Studies</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-200/60">
                        <span className="font-medium">Industry Experts</span>
                        <span className="font-bold text-[#14532D]">2+ Per Department</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Credit System</span>
                        <span className="font-bold text-[#14532D]">CBCS Framework</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* 6 Core Pillars Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CDC_FEATURES.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <Reveal key={feat.title} delay={i * 0.05}>
                      <GlassCard className="p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center mb-4">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-serif font-bold text-base sm:text-lg text-navy mb-2">
                            {feat.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {feat.desc}
                          </p>
                        </div>
                      </GlassCard>
                    </Reveal>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PROGRAMME OUTCOMES */}
          {activeSection === "outcomes" && (
            <motion.div
              key="outcomes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <SectionHeading
                eyebrow="Graduate Attributes"
                title="Programme Outcomes (PO1 – PO8)"
                description="The institutional core competencies, cognitive skills, and ethical foundations attained by every graduating scholar at Bishop Ambrose College."
              />

              <div className="grid md:grid-cols-2 gap-6">
                {PROGRAMME_OUTCOMES.map((po, i) => {
                  const Icon = po.icon;
                  return (
                    <Reveal key={po.code} delay={i * 0.05}>
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 h-full">
                        <div className="w-12 h-12 rounded-xl bg-[#14532D] text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                          <span className="text-xs font-black tracking-wide">{po.code}</span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gold-dark shrink-0" />
                            <h4 className="font-serif font-bold text-base sm:text-lg text-navy">
                              {po.title}
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {po.desc}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* Assessment Card */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-lg text-navy">Outcome Attainment & Assessment</h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                      Each course assesses outcome attainment via continuous direct assessments (internal tests, quizzes, assignments) and indirect student exit surveys to ensure 100% compliance.
                    </p>
                  </div>
                  <PremiumButton
                    variant="primary"
                    size="md"
                    onClick={goAdmissions}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Admissions Desk
                  </PremiumButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ICT FACILITIES */}
          {activeSection === "ict" && (
            <motion.div
              key="ict"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <SectionHeading
                eyebrow="Digital Learning Ecosystem"
                title="ICT & Technological Infrastructure"
                description="State-of-the-art computational laboratories, high-speed campus fiber connectivity, and smart pedagogical classrooms supporting modern pedagogy."
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ICT_FACILITIES.map((facility, i) => {
                  const Icon = facility.icon;
                  return (
                    <Reveal key={facility.name} delay={i * 0.05}>
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-[#14532D]/10 text-[#14532D] flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold/15 text-gold-dark">
                              {facility.count}
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-lg text-navy mb-1">
                            {facility.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#14532D] mb-3">
                            {facility.spec}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                            {facility.desc}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-1.5">
                          {facility.highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-600">
                              <Check className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 6: ACADEMIC CALENDAR */}
          {activeSection === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-navy/10">
                <SectionHeading
                  eyebrow="Schedule 2024–2025"
                  title="Annual Academic Calendar"
                  description="A structured 12-month schedule of instructional periods, CIA evaluations, university examinations, cultural celebrations, and institutional milestones."
                />
                <div className="shrink-0 flex items-center gap-3">
                  <a
                    href="#"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#14532D] text-white hover:bg-[#0f3d21] transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Calendar (PDF)</span>
                  </a>
                </div>
              </div>

              {/* 12 Months Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CALENDAR_EVENTS.map((month, i) => (
                  <Reveal key={month.month} delay={i * 0.04}>
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                      {/* Month Header */}
                      <div className="bg-navy px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-gold-light" />
                          <span className="text-white font-bold text-sm tracking-wide font-serif">
                            {month.month}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                          {month.semester}
                        </span>
                      </div>

                      {/* Events List */}
                      <ul className="p-5 space-y-3 flex-1 flex flex-col justify-start">
                        {month.events.map((ev, eIdx) => (
                          <li key={eIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-dark mt-1.5 shrink-0" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Next-Steps Exploration Strip ─────────────────────── */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-navy/10">
          <div className="bg-gradient-to-r from-navy via-navy-dark to-[#14532D] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 blob bg-gold/10 pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gold-light uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Begin Your Journey at Bishop Ambrose
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl leading-tight">
                Ready to Discover Your Academic Potential?
              </h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Admissions are open for Undergraduate and Postgraduate programmes for the upcoming academic year.
                Reach out to our admissions counsellors or visit our lush green campus today.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <PremiumButton
                  variant="gold"
                  size="lg"
                  onClick={goAdmissions}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply Online Now
                </PremiumButton>
                <PremiumButton
                  variant="outline-light"
                  size="lg"
                  onClick={() => handleTabChange("departments")}
                  icon={<Building2 className="w-4 h-4" />}
                >
                  Explore Departments
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
