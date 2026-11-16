"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Palette,
  Trophy,
  Heart,
  Briefcase,
  ChevronRight,
  Star,
  Calendar,
  Award,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Quote,
  Compass,
  CheckCircle,
  GraduationCap,
  Building2,
  Music,
  HeartHandshake,
  Eye,
  Target,
  Clock,
  MapPin,
  ExternalLink,
  Code,
  Dna,
  BarChart3,
  Flame,
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
import { ClubsDirectorySection } from "@/components/public/clubs-directory-section";

// ── Tab Navigation Configuration ───────────────────────────────────────────
const SA_NAV = [
  { id: "council",      label: "Student Council",         icon: Users },
  { id: "clubs",        label: "Clubs & Committees",      icon: Award },
  { id: "fine-arts",    label: "Fine Arts & Culture",     icon: Palette },
  { id: "sports",       label: "Sports & Athletics",      icon: Trophy },
  { id: "associations", label: "Academic Associations",   icon: BookOpen },
  { id: "extension",    label: "Extension & Outreach",    icon: Heart },
  { id: "placement",    label: "Placements & Careers",    icon: Briefcase },
];

// ── Student Council Data ───────────────────────────────────────────────────
const COUNCIL_OFFICERS = [
  {
    role: "President",
    name: "Mr. J. Solomon",
    dept: "B.Com III Year",
    bio: "Chief student coordinator leading the executive council and representing student welfare in college administrative council meetings.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Vice President",
    name: "Ms. P. Preethi",
    dept: "BCA III Year",
    bio: "Oversees inter-departmental co-curricular councils and heads the student academic feedback committee.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Secretary",
    name: "Mr. R. Daniel",
    dept: "BBA III Year",
    bio: "Manages council minutes, administrative correspondence, event permissions, and annual reporting.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Joint Secretary",
    name: "Ms. A. Selvi",
    dept: "B.Sc CS III Year",
    bio: "Coordinates council digital communications, campus public relations, and technical event infrastructure.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Cultural Secretary",
    name: "Ms. M. Kavitha",
    dept: "B.A. English III Year",
    bio: "Chief convener for Kaleidoscope annual cultural fest, fine arts exhibitions, and inter-collegiate competitions.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Sports Secretary",
    name: "Mr. T. Raj",
    dept: "B.Com CA III Year",
    bio: "Captain of college athletics and liaison for inter-university tournaments, sports pavilion maintenance, and annual sports day.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "NSS Representative",
    name: "Ms. S. Dharani",
    dept: "B.Sc Biotechnology III Year",
    bio: "Leads community outreach, blood donation drives, Swachh Bharat campaigns, and rural village adoption initiatives.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    role: "Arts Club Head",
    name: "Mr. P. Clement",
    dept: "B.Sc Mathematics III Year",
    bio: "Coordinates dramatic society, visual arts galleries, music choir, and stage performances across the academic year.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
  },
];

// ── Department Academic Associations ───────────────────────────────────────
const ASSOCIATIONS = [
  {
    name: "Computer Science Association",
    dept: "CS",
    members: 180,
    events: 12,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    desc: "Tech talks, hackathons, coding competitions, AI workshops, and annual IT symposiums connecting students to software leaders.",
    flagship: "TechSprint National Symposium",
  },
  {
    name: "Commerce Association",
    dept: "Commerce",
    members: 220,
    events: 10,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    desc: "Inter-collegiate business fests, CA/CMA interaction sessions, stock trading simulations, and entrepreneurial workshops.",
    flagship: "ComFest Business Conclave",
  },
  {
    name: "BBA Students Association",
    dept: "BBA",
    members: 120,
    events: 8,
    image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80",
    desc: "Management case-study games, brand marketing challenges, leadership bootcamps, and executive guest lectures.",
    flagship: "Management Vista Summit",
  },
  {
    name: "Science Students Forum",
    dept: "Science",
    members: 90,
    events: 7,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    desc: "Scientific research exhibitions, lab demonstrations, life-science quiz leagues, and regional environmental symposia.",
    flagship: "BioGenesis Science Expo",
  },
  {
    name: "English Literary Association",
    dept: "English",
    members: 85,
    events: 9,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    desc: "Parliamentary debates, Shakespearean stage productions, creative writing slams, poetry circles, and elocution contests.",
    flagship: "Pegasus Literary Gala",
  },
  {
    name: "NSS & Social Action Unit",
    dept: "College-wide",
    members: 200,
    events: 15,
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
    desc: "Community service camps, free health clinics, blood donation camps, reforestation drives, and village adoption programmes.",
    flagship: "Gramodaya Village Camp",
  },
];

// ── Sports & Athletics Disciplines ─────────────────────────────────────────
const SPORTS_DATA = [
  {
    sport: "Cricket",
    level: "University Level",
    achievement: "Inter-University Quarter-Finals 2024",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    details: "Full turf cricket pitch with professional practice nets, year-round coaching, and district league participation.",
  },
  {
    sport: "Football",
    level: "District Champions",
    achievement: "District Championship Winners 2023",
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=800&q=80",
    details: "FIFA-standard natural turf football pitch hosting inter-collegiate invitation cups and Bharathiar University zone tournaments.",
  },
  {
    sport: "Basketball",
    level: "University Level",
    achievement: "Inter-College Tournament Runner-up 2024",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    details: "Floodlit outdoor basketball court with electronic scoring boards and specialized conditioning clinics.",
  },
  {
    sport: "Kabaddi",
    level: "State Level",
    achievement: "State-Level Championship Participants 2024",
    image: "https://images.unsplash.com/photo-1519767770432-8c0b08c5f6f1?auto=format&fit=crop&w=800&q=80",
    details: "Standardized clay and mat kabaddi arenas producing recognized players for Tamil Nadu state youth contingents.",
  },
  {
    sport: "Volleyball",
    level: "University Level",
    achievement: "Inter-College Tournament Semi-Finals 2024",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
    details: "Outdoor standard court with dedicated physical trainers, regular practice matches, and annual trophy meets.",
  },
  {
    sport: "Athletics & Track",
    level: "State Level",
    achievement: "Multiple Gold & Silver Medals at District & State Meets",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    details: "400m running track with jumping pits, shot-put rings, javelin sectors, and specialized sprint conditioning.",
  },
];

// ── Fine Arts Categories ───────────────────────────────────────────────────
const FINE_ARTS = [
  {
    category: "Classical & Vocal Music",
    icon: "🎵",
    subtitle: "Harmony & Melodic Tradition",
    description: "Fostering vocal excellence through Carnatic traditions, choral harmonies, and instrumental recitals.",
    events: ["Carnatic Vocal Competitions", "Classical Instrumental Performances", "College Choir Competitions", "Devotional Recitals"],
  },
  {
    category: "Classical & Folk Dance",
    icon: "💃",
    subtitle: "Rhythm & Cultural Storytelling",
    description: "Showcasing classical Bharatanatyam, regional Tamil folk traditions (Karakattam, Oyilattam), and creative choreography.",
    events: ["Bharatanatyam Solo & Group", "Traditional Folk Dance Competitions", "Contemporary Dance Battles", "Festive Celebrations"],
  },
  {
    category: "Drama & Street Theatre",
    icon: "🎭",
    subtitle: "Expression & Social Awareness",
    description: "Harnessing the power of live performance for social critique, historical drama, and competitive stage theater.",
    events: ["Social Impact Street Plays", "One-Act English & Tamil Dramas", "Mime Art Competitions", "Scriptwriting Workshops"],
  },
  {
    category: "Visual & Creative Arts",
    icon: "🎨",
    subtitle: "Aesthetics & Visual Mediums",
    description: "Developing visual expression across watercolor painting, charcoal sketching, traditional Rangoli, and creative photography.",
    events: ["Canvas Painting & Sketching", "Traditional Rangoli Contests", "Collage Making & Poster Design", "Campus Photo Exhibitions"],
  },
  {
    category: "Literary & Oratory Arts",
    icon: "✍️",
    subtitle: "Debate & Written Excellence",
    description: "Nurturing eloquence, critical arguments, and creative writing in both Tamil and English through competitive forums.",
    events: ["Tamil Kavithai Poetry Slams", "English Creative Writing", "Youth Parliament Debates", "Elocution Competitions"],
  },
  {
    category: "Annual Cultural Fest",
    icon: "🌟",
    subtitle: "Kaleidoscope — The Flagship Gala",
    description: "The premier inter-collegiate cultural fest bringing together over 2,000 delegates from 40+ colleges across South India.",
    events: ["Inter-Collegiate Cultural Trophy", "Department Annual Talent Days", "Battle of the Bands", "Freshers Talent Showcase"],
  },
];

// ── Extension & Community Outreach Wings ───────────────────────────────────
const EXTENSION_WINGS = [
  {
    title: "National Service Scheme (NSS)",
    badge: "2 Government Sanctioned Units",
    lead: "200+ Active Student Volunteers",
    desc: "Bishop Ambrose College maintains two vibrant NSS units under Bharathiar University. Volunteers undertake community service, blood donation camps, afforestation, rural health education, disaster assistance, and structured village development.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    activities: [
      "Annual 7-Day Rural Special Camping Programme",
      "Voluntary Blood Donation Camps with District Blood Bank",
      "Swachh Bharat Cleanliness & Plastic-Free Drives",
      "Public Health, Dengue & COVID Awareness Rallies",
      "Free Eye & Medical Checkup Camps in Rural Clusters",
      "Tree Plantation & Rainwater Harvesting Initiatives",
    ],
  },
  {
    title: "National Cadet Corps (NCC)",
    badge: "Army Wing Affiliation",
    lead: "Discipline, Leadership & Patriotic Service",
    desc: "NCC cadets at BAC participate in drill, adventure expeditions, weapon handling, national integration camps, and disaster relief drills. Cadets regularly appear for B and C certificate examinations, qualifying for defense and civil services.",
    image: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80",
    activities: [
      "Ceremonial Republic Day & Independence Day Parades",
      "Combined Annual Training Camps (CATC)",
      "High-Altitude Trekking & Mountain Survival Camps",
      "National Integration Camps (NIC) Across India",
      "Institutional Defense Training & Firing Practice",
      "B and C Certificate Comprehensive Examination Training",
    ],
  },
  {
    title: "Community Outreach & Youth Red Cross (YRC)",
    badge: "Social Justice & Care",
    lead: "Humanitarian Service in Coimbatore Neighbourhoods",
    desc: "Under the diocesan ethos of servant leadership, students regularly support orphanages, senior citizen homes, rural primary schools, and marginalized communities, addressing real-world needs and fostering deep civic responsibility.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    activities: [
      "Digital Literacy Training for Rural School Students",
      "Distribution of Educational Kits to Underprivileged Children",
      "Visits & Care Packages for Elder Care Homes",
      "Women Empowerment & Livelihood Skill Workshops",
      "Road Safety Awareness & Traffic Volunteerism",
      "Environmental Conservation & Waste Segregation Campaigns",
    ],
  },
];

// ── Reusable Stat Card (Matching About Us Page DeptStat Style) ──────────────
function ActivityStat({
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

// ── Main Student Activities Page Component ──────────────────────────────────
export function StudentActivitiesPage({ section }: { section?: string }) {
  const { goHome, goStudentActivities, goPlacements, goAdmissions, goContact } = useNav();
  const [active, setActive] = useState(() => section ?? "council");

  useEffect(() => {
    if (section && SA_NAV.some((s) => s.id === section)) {
      setActive(section);
    }
  }, [section]);

  const handleTabChange = (sectionId: string) => {
    setActive(sectionId);
    goStudentActivities(sectionId);
    if (typeof window !== "undefined") {
      const navEl = document.getElementById("activities-tab-nav");
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

  const currentNav = SA_NAV.find((n) => n.id === active) || SA_NAV[0];

  return (
    <div className="bg-background min-h-screen">
      
      {/* ── 1. Top Breadcrumb Bar ───────────────────────────────────────── */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span>Student Life</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">{currentNav.label}</span>
        </div>
      </div>

      {/* ── 2. Hero Section (Matching About Us Page Hero Layout) ────────── */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2000&q=80"
            alt="Bishop Ambrose College Student Activities"
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
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-emerald-500/10 pointer-events-none" />

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
                  <Sparkles className="w-3.5 h-3.5 text-gold-light" />
                  STUDENT LIFE &amp; CAMPUS EXPERIENCE
                </div>
                <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-5">
                  Student Activities &amp; Leadership
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                  Nurturing leadership, artistic expression, championship sportsmanship, and social responsibility through vibrant student governance, dynamic clubs, and extension outreach at Bishop Ambrose College.
                </p>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton
                    variant="gold"
                    size="lg"
                    onClick={() => handleTabChange("council")}
                    icon={<Users className="w-4 h-4" />}
                  >
                    Student Council
                  </PremiumButton>
                  <PremiumButton
                    variant="outline-light"
                    size="lg"
                    onClick={() => handleTabChange("clubs")}
                    icon={<Award className="w-4 h-4" />}
                  >
                    Clubs &amp; Committees
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10"
                    icon={<Trophy className="w-4 h-4" />}
                    onClick={() => handleTabChange("sports")}
                  >
                    Sports &amp; Athletics
                  </PremiumButton>
                </div>
              </motion.div>
            </div>

            {/* Right Column (4 cols): 2x2 Quick Stats Grid (Matching About Us Page DeptStat Style) */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <ActivityStat icon={<Users className="w-4 h-4" />} value={150} suffix="+" label="Council Leaders" />
                <ActivityStat icon={<Award className="w-4 h-4" />} value={20} suffix="+" label="Active Student Clubs" />
                <ActivityStat icon={<Trophy className="w-4 h-4" />} value={32} suffix="+" label="Championships Won" />
                <ActivityStat icon={<Heart className="w-4 h-4" />} value={100} suffix="%" label="Community Reach" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Sticky Navigation Tabs (Matching About Us Page Sticky Bar) ─ */}
      <div
        id="activities-tab-nav"
        className="sticky top-16 lg:top-20 z-30 glass-strong border-y border-navy/8 shadow-premium"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav
            role="tablist"
            aria-label="Student activities navigation"
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium py-2.5"
          >
            {SA_NAV.map((s) => {
              const isActive = active === s.id;
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

      {/* ── 4. Main Content Area ────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            
            {/* ──────── SECTION 1: STUDENT COUNCIL ────────────────────────── */}
            {active === "council" && (
              <section id="panel-council" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Student Leadership & Governance"
                  title={<>Democratic Voice, <span className="text-[#2E7D32]">Stewardship & Service</span></>}
                  description="The Student Council serves as the democratic bridge between the student body and college management, championing student welfare, organizing flagship cultural fests, and upholding campus traditions."
                  align="left"
                />

                {/* Narrative Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <GlassCard className="p-6 sm:p-8 space-y-4">
                      <h3 className="font-serif text-2xl font-bold text-navy">
                        A Tradition of Student-Led Responsibility
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The Student Council at Bishop Ambrose College is an elected representative body representing all academic departments across undergraduate and postgraduate programmes. Established to empower student voices, the Council promotes an inclusive campus climate where every student can flourish academically, socially, and culturally.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Working in close collaboration with the Principal, Vice-Principal, and Faculty Advisors, council officers coordinate major campus celebrations, lead inter-collegiate delegation teams, facilitate student welfare suggestions, and conduct regular student forums.
                      </p>
                    </GlassCard>

                    {/* Key Council Mandates */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#14532D] flex items-center justify-center font-bold mb-2.5">
                          <Target className="w-4 h-4" />
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#14532D] mb-1">Democratic Representation</h4>
                        <p className="text-xs text-[#374151] leading-relaxed">Facilitates transparent communication between students and college administrative bodies.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#14532D] flex items-center justify-center font-bold mb-2.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#14532D] mb-1">Event Leadership</h4>
                        <p className="text-xs text-[#374151] leading-relaxed">Orchestrates annual cultural festivals, fresher welcoming, sports days, and farewell ceremonies.</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo & Quote Card */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-premium border border-navy/8 bg-slate-900 group">
                      <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                        alt="Student Council Leaders"
                        className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                      <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                        <div className="text-xs uppercase tracking-widest text-[#A3C95A] font-bold mb-1">
                          Student Council 2024–2025
                        </div>
                        <blockquote className="font-serif text-sm sm:text-base italic leading-snug">
                          &ldquo;Leadership is not about privilege, but about selfless service, empathy, and empowering fellow students to excel.&rdquo;
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8 Council Office Bearers Grid */}
                <div className="pt-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-navy">Executive Cabinet 2024–2025</h3>
                      <p className="text-xs text-muted-foreground">Elected student office bearers guiding college activities</p>
                    </div>
                    <span className="text-xs font-bold text-[#14532D] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0]">
                      8 Office Bearers
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COUNCIL_OFFICERS.map((officer) => (
                      <motion.div
                        key={officer.role}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-md hover:border-[#14532D]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-[#C8E6C9] shrink-0">
                              <img
                                src={officer.avatar}
                                alt={officer.name}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif font-bold text-sm text-navy truncate">{officer.name}</h4>
                              <span className="inline-block text-[11px] font-bold text-[#14532D] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                                {officer.role}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[#2E7D32] font-semibold mb-2">{officer.dept}</p>
                          <p className="text-xs text-[#68766B] leading-relaxed line-clamp-3 mb-3">
                            {officer.bio}
                          </p>
                        </div>
                        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Tenure: 2024–25</span>
                          <span className="font-bold text-[#14532D]">Active Cabinet</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </section>
            )}

            {/* ──────── SECTION 2: CLUBS & COMMITTEES ──────────────────────── */}
            {active === "clubs" && (
              <section id="panel-clubs" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Co-Curricular Exploration"
                  title={<>Vibrant Student Clubs &amp; <span className="text-[#2E7D32]">Special Interest Forums</span></>}
                  description="With more than 20 active clubs spanning robotics, literature, performing arts, entrepreneurship, and social action, BAC provides every student a launchpad for passion and leadership."
                  align="left"
                />

                {/* Club Benefits Banner */}
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-bold mb-3">
                      <Award className="w-4 h-4" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-navy mb-1">Faculty Mentorship</h4>
                    <p className="text-xs text-[#374151] leading-relaxed">Each club is guided by senior professors ensuring structured calendars and quality outcomes.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center font-bold mb-3">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-navy mb-1">Project Showcases</h4>
                    <p className="text-xs text-[#374151] leading-relaxed">Regular intra-collegiate exhibitions, hackathons, and cultural evenings to exhibit talents.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-navy mb-1">Skill Certification</h4>
                    <p className="text-xs text-[#374151] leading-relaxed">Active participation earns validated co-curricular credits contributing to student portfolios.</p>
                  </div>
                </div>

                {/* Embedded Interactive Clubs Directory with Search, Categories, and Registration */}
                <div className="pt-4">
                  <ClubsDirectorySection />
                </div>
              </section>
            )}

            {/* ──────── SECTION 3: FINE ARTS & CULTURE ────────────────────── */}
            {active === "fine-arts" && (
              <section id="panel-fine-arts" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Cultural Arts & Creative Expression"
                  title={<>Celebrating Heritage, Harmony &amp; <span className="text-[#2E7D32]">Artistic Talent</span></>}
                  description="The Fine Arts Association nurtures creative potential through intra-mural cultural competitions, national talent fests, music recitals, theatre workshops, and fine art exhibitions."
                  align="left"
                />

                {/* Flagship Event Banner: Kaleidoscope */}
                <div className="rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="grid lg:grid-cols-12 items-center">
                    <div className="lg:col-span-6 p-6 sm:p-10 space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Flagship Cultural Extravaganza
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl font-bold text-navy leading-tight">
                        Kaleidoscope Cultural Festival
                      </h3>
                      <p className="text-sm text-[#374151] leading-relaxed">
                        &lsquo;Kaleidoscope&rsquo; is Bishop Ambrose College&apos;s celebrated annual inter-collegiate mega fest. Attracting thousands of student artists from across Tamil Nadu, the two-day carnival hosts over 25 competitive events in music, dance, theatre, literature, and visual arts.
                      </p>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-[#FAFBF9] border border-gray-100 text-center">
                          <div className="font-serif text-2xl font-bold text-[#14532D]">40+</div>
                          <div className="text-[11px] text-[#68766B] font-medium">Colleges</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAFBF9] border border-gray-100 text-center">
                          <div className="font-serif text-2xl font-bold text-[#14532D]">2,000+</div>
                          <div className="text-[11px] text-[#68766B] font-medium">Delegates</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAFBF9] border border-gray-100 text-center">
                          <div className="font-serif text-2xl font-bold text-[#14532D]">25+</div>
                          <div className="text-[11px] text-[#68766B] font-medium">Stage Events</div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6 relative h-72 sm:h-96 overflow-hidden bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
                        alt="Kaleidoscope Cultural Fest"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
                          Auditorium &amp; Open Air Stage
                        </div>
                        <div className="font-serif text-lg font-bold text-shadow-on-dark">
                          Two days of exhilarating music, drama, and youth camaraderie
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6 Fine Arts Disciplines */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy mb-6">Fine Arts Wings &amp; Competitions</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FINE_ARTS.map((f) => (
                      <GlassCard key={f.category} className="p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-100">{f.icon}</span>
                            <div>
                              <h4 className="font-serif font-bold text-lg text-navy leading-tight">{f.category}</h4>
                              <p className="text-xs text-[#2E7D32] font-semibold">{f.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            {f.description}
                          </p>
                          <div className="space-y-1.5 pt-2 border-t border-navy/8">
                            {f.events.map((e, j) => (
                              <div key={j} className="flex items-start gap-2 text-xs text-slate-700">
                                <Star className="w-3.5 h-3.5 text-gold-dark shrink-0 mt-0.5" />
                                <span>{e}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-navy/8 flex items-center justify-between text-[11px] text-[#14532D] font-bold">
                          <span>Annual Forum</span>
                          <span className="flex items-center gap-1">Auditions Open <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>

              </section>
            )}

            {/* ──────── SECTION 4: SPORTS & ATHLETICS ─────────────────────── */}
            {active === "sports" && (
              <section id="panel-sports" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Athletic Distinction & Physical Fitness"
                  title={<>Championship Spirit, Discipline &amp; <span className="text-[#2E7D32]">Sportsmanship</span></>}
                  description="The Department of Physical Education promotes physical fitness, competitive sporting excellence, and mental discipline through world-class campus facilities and seasoned coaching."
                  align="left"
                />

                {/* Sports Facilities Overview */}
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy leading-tight">
                      State-of-the-Art Sports Pavilion &amp; Grounds
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      At Bishop Ambrose College, sports are an integral pillar of character building. Our multi-acre athletic complex includes standard football grounds, a full cricket pitch, synthetic basketball courts, volleyball courts, kabaddi courts, and an indoor table tennis and fitness gymnasium.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BAC athletes regularly represent Bharathiar University in South Zone and All-India Inter-University tournaments, bringing home laurels in track and field, football, cricket, and kabaddi.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                        <div className="font-serif text-2xl font-bold text-[#14532D]">32+</div>
                        <div className="text-xs text-[#26352B] font-semibold">Trophies &amp; Medals</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                        <div className="font-serif text-2xl font-bold text-[#14532D]">6+</div>
                        <div className="text-xs text-[#26352B] font-semibold">Inter-Varsity Teams</div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-premium border border-navy/8 bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80"
                      alt="Athletics Track at BAC"
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="text-xs uppercase tracking-widest text-[#A3C95A] font-bold mb-1">
                        Campus Sports Pavilion
                      </div>
                      <h4 className="font-serif text-xl font-bold text-shadow-on-dark">
                        Cultivating Champions, Instilling Integrity
                      </h4>
                    </div>
                  </div>
                </div>

                {/* 6 Sports Disciplines Grid */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy mb-6">Competitive Sports Disciplines</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SPORTS_DATA.map((s) => (
                      <motion.div
                        key={s.sport}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="group bg-white rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xs hover:shadow-lg transition-all flex flex-col"
                      >
                        <div className="relative h-48 overflow-hidden bg-slate-900">
                          <img
                            src={s.image}
                            alt={s.sport}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute top-3.5 left-3.5">
                            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#14532D] shadow-xs">
                              {s.level}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <h4 className="font-serif text-xl font-bold text-shadow-on-dark">{s.sport}</h4>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-xs font-bold text-[#14532D]">
                              <Award className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                              <span>{s.achievement}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {s.details}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Bharathiar Zone Meets</span>
                            <span className="font-bold text-[#2E7D32]">Daily Practice</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </section>
            )}

            {/* ──────── SECTION 5: ACADEMIC ASSOCIATIONS ───────────────────── */}
            {active === "associations" && (
              <section id="panel-associations" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Departmental Forums & Academic Symposia"
                  title={<>Bridging Theory, Industry &amp; <span className="text-[#2E7D32]">Collaborative Research</span></>}
                  description="Every academic department operates a dynamic student association that organizes national symposiums, hackathons, CA seminars, research colloquiums, and industry field trips."
                  align="left"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ASSOCIATIONS.map((assoc) => (
                    <motion.div
                      key={assoc.name}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xs hover:shadow-lg transition-all flex flex-col"
                    >
                      <div className="relative h-44 overflow-hidden bg-slate-900">
                        <img
                          src={assoc.image}
                          alt={assoc.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-3.5 left-3.5">
                          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#14532D]">
                            Dept of {assoc.dept}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h4 className="font-serif text-lg font-bold text-shadow-on-dark">{assoc.name}</h4>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0] mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
                            {assoc.flagship}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            {assoc.desc}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                          <span>{assoc.members} Active Members</span>
                          <span className="text-[#14532D] font-bold">{assoc.events} Events / Year</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 6: EXTENSION ACTIVITIES & OUTREACH ─────────── */}
            {active === "extension" && (
              <section id="panel-extension" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Service to Society & Civic Responsibility"
                  title={<>Rooted in Faith, <span className="text-[#2E7D32]">Reaching Out to Communities</span></>}
                  description="True to our diocesan heritage, extension activities encourage students to apply knowledge, empathy, and active service to address pressing community challenges across Coimbatore."
                  align="left"
                />

                <div className="space-y-10">
                  {EXTENSION_WINGS.map((wing, idx) => (
                    <div
                      key={wing.title}
                      className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="grid lg:grid-cols-12 items-center">
                        <div className={cn("p-6 sm:p-10 space-y-4", idx % 2 === 0 ? "lg:col-span-7" : "lg:col-span-7 lg:order-2")}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0] text-xs font-bold uppercase tracking-wider">
                              {wing.badge}
                            </span>
                            <span className="text-xs text-gold-dark font-bold">
                              {wing.lead}
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                            {wing.title}
                          </h3>
                          <p className="text-sm text-[#374151] leading-relaxed">
                            {wing.desc}
                          </p>
                          
                          <div className="pt-2">
                            <h4 className="text-xs uppercase font-bold tracking-wider text-[#14532D] mb-3">
                              Key Community Activities &amp; Initiatives:
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {wing.activities.map((act, j) => (
                                <div key={j} className="flex items-start gap-2 text-xs text-slate-700">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className={cn("relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden bg-slate-900", idx % 2 === 0 ? "lg:col-span-5" : "lg:col-span-5 lg:order-1")}>
                          <img
                            src={wing.image}
                            alt={wing.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80";
                            }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
                              Bishop Ambrose Extension
                            </div>
                            <div className="font-serif text-base font-bold">
                              Serving with Compassion &amp; Humility
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 7: PLACEMENTS & CAREERS ────────────────────── */}
            {active === "placement" && (
              <section id="panel-placement" role="tabpanel" className="space-y-10">
                <SectionHeading
                  eyebrow="Career Launchpad & Corporate Pathways"
                  title={<>Connecting Student Talent with <span className="text-[#2E7D32]">Global Opportunities</span></>}
                  description="The Career Guidance and Placement Cell prepares students from day one through continuous soft-skills training, technical assessments, internship facilitation, and corporate recruitment drives."
                  align="left"
                />

                {/* Placement Stats Ribbon */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-4 text-center">
                      <div className="font-serif text-4xl sm:text-5xl font-bold text-[#14532D] mb-1">95%</div>
                      <div className="text-xs font-bold text-[#26352B]">Verified Placement Rate</div>
                      <span className="text-[11px] text-[#68766B]">Campus-wide average</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="font-serif text-4xl sm:text-5xl font-bold text-[#14532D] mb-1">₹64 LPA</div>
                      <div className="text-xs font-bold text-[#26352B]">Highest International Offer</div>
                      <span className="text-[11px] text-[#68766B]">Global technology roles</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="font-serif text-4xl sm:text-5xl font-bold text-[#14532D] mb-1">₹12 LPA</div>
                      <div className="text-xs font-bold text-[#26352B]">Average Package</div>
                      <span className="text-[11px] text-[#68766B]">Competitive compensation</span>
                    </div>
                    <div className="p-4 text-center">
                      <div className="font-serif text-4xl sm:text-5xl font-bold text-[#14532D] mb-1">300+</div>
                      <div className="text-xs font-bold text-[#26352B]">Recruiting Partners</div>
                      <span className="text-[11px] text-[#68766B]">MNCs &amp; Fortune 500s</span>
                    </div>
                  </div>
                </div>

                {/* Career Studio Features & Direct CTA */}
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="font-serif text-2xl font-bold text-navy">
                      Structured Pre-Placement Grooming from Day One
                    </h3>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      Our Placement Cell bridges the gap between academic learning and industry expectations. Through mandatory aptitude bootcamps, resume-building clinics, mock HR interviews, and coding hackathons, students develop the practical competencies demanded by modern employers.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#26352B]">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>Corporate Internship Stipends</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#26352B]">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>Alumni Mentorship Network</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#26352B]">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>Technical Coding Assessments</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#26352B]">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>On-Campus Day-One Recruitment</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-[#FAFBF9] rounded-3xl border border-[#E2E8F0] p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#C8E6C9] flex items-center justify-center text-[#14532D] mx-auto shadow-2xs">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-navy">Explore Full Placement Portal</h4>
                      <p className="text-xs text-[#68766B] mt-1">
                        Detailed recruiter list, placement reports, and student success stories.
                      </p>
                    </div>
                    <button
                      onClick={goPlacements}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    >
                      View Placement Reports &amp; Recruiters
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
