"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  TrendingUp,
  Briefcase,
  Users,
  Music,
  HeartHandshake,
  Home,
  Lightbulb,
  Trophy,
  Building2,
  Monitor,
  Cpu,
  BookOpen,
  Bus,
  Utensils,
  Wifi,
  CheckCircle2,
  GraduationCap,
  Award,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import {
  researchAreas,
  researchStats,
  placementStats,
  recruiters,
  studentLife,
  whyChooseStats,
} from "@/lib/university-data";
import {
  SectionHeading,
  GlassCard,
  AnimatedCounter,
  Reveal,
  DepartmentIcon,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { useSiteData } from "@/lib/site-context";

/* ============== Research & Innovation ============== */
export function ResearchInnovation() {
  const { goDepartment } = useNav();
  return (
    <section id="research" className="relative py-12 sm:py-20 lg:py-28 bg-cream border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          eyebrow="Research & Innovation"
          title={
            <>
              Discovery that <span className="text-gold-gradient">moves the world forward</span>
            </>
          }
          description="From foundational AI to translational biotech, BAC researchers publish in the world's most respected venues and translate discovery into products, policy, and pedagogy."
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-14 mb-16">
          {researchStats.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 0.08}>
              <div className="bg-white/95 backdrop-blur-md border border-emerald-200/70 rounded-2xl p-6 text-center shadow-xs hover:shadow-md transition-shadow">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#166534] mb-1.5 tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[#1F2937] text-sm font-bold">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Areas */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {researchAreas.map((area) => (
            <motion.div
              key={area.name}
              variants={staggerItem}
              className="group rounded-2xl p-6 bg-white border border-emerald-200/70 hover:border-[#166534] hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer"
              onClick={() => goDepartment("computer-science")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-[#14532D] group-hover:text-white text-[#14532D] flex items-center justify-center transition-colors shrink-0 font-bold">
                  <DepartmentIcon name={area.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#14532D] mb-1.5 transition-colors">{area.name}</h4>
                  <p className="text-sm text-[#374151] leading-relaxed transition-colors font-normal">{area.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Reveal>
          <div className="mt-12 text-center">
            <PremiumButton variant="navy" size="lg" icon={<ArrowRight className="w-4 h-4" />} onClick={() => goDepartment("computer-science", "research")} className="bg-[#14532D] text-white font-bold">
              Explore Research Centers
            </PremiumButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============== Placements ============== */
export function Placements() {
  const { goPlacements, goAdmissions } = useNav();
  const shouldReduceMotion = useReducedMotion();

  const careerPillars = [
    {
      title: "Technical & Coding Bootcamps",
      description: "Hands-on data structures, full-stack web, cloud, and AI development tracks aligned with tech industry standards.",
      icon: Cpu,
    },
    {
      title: "Aptitude & Analytical Mastery",
      description: "Rigorous quantitative, logical reasoning, and verbal aptitude training from first semester to final placement drives.",
      icon: TrendingUp,
    },
    {
      title: "Mock HR & Technical Panels",
      description: "Simulated interview environments conducted by visiting industry managers and distinguished college alumni.",
      icon: Users,
    },
    {
      title: "Paid Industry Internships",
      description: "Pre-placement internship opportunities leading to fast-track career conversions with leading multinational firms.",
      icon: Briefcase,
    },
  ];

  return (
    <section id="placements" className="relative py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8E6C9] bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-[#2E7D32]" />
              Career Placements & Corporate Success
            </span>
            <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
              Where Ambition Meets Corporate Opportunity
            </h2>
            <p className="text-[#374151] text-base sm:text-lg leading-relaxed">
              With a consistent 95% placement record and 300+ recruiting partners, our dedicated Career Guidance Cell nurtures students for industry leadership.
            </p>
          </div>
        </Reveal>

        {/* ── 1. Elegant Horizontal Placement Stats Strip ── */}
        <Reveal delay={0.1}>
          <div className="bg-[#FAFBF9] rounded-3xl border border-[#E2E8F0] shadow-xs mb-14 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200/70">
              {placementStats.map((stat) => (
                <div key={stat.label} className="p-6 sm:p-8 flex flex-col items-center text-center">
                  <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14532D] tracking-tight mb-1.5">
                    {stat.prefix && <span className="text-2xl sm:text-3xl text-[#2E7D32] mr-0.5">{stat.prefix}</span>}
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix && <span>{stat.suffix}</span>}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#26352B] tracking-wide mb-1">
                    {stat.label}
                  </div>
                  <span className="text-[11px] text-[#68766B] font-medium">
                    {stat.label.includes("Rate") ? "Verified institutional average" : stat.label.includes("Highest") ? "International top offer" : stat.label.includes("Average") ? "Campus-wide median CTC" : "Conversion from internships"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── 2. Editorial 2-Column Spread: Career Studio + Recruiter Portfolio ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-14">
          
          {/* Left Column: 4 Career Development Pillars (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">Career Studio Pillars</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] mb-4">
                Structured Training for Modern Industry Careers
              </h3>
              <p className="text-[#374151] text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Our Training and Placement Cell operates year-round, equipping students with rigorous technical acumen, soft-skills finesse, and continuous placement preparation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {careerPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : idx * 0.08, ease: "easeOut" }}
                    className="p-5 rounded-2xl bg-[#FAFBF9] border border-[#E2E8F0] hover:border-[#14532D]/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-center text-[#14532D] mb-3 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-serif font-bold text-[#14532D] text-sm mb-1.5">{pillar.title}</h4>
                    <p className="text-xs text-[#374151] leading-relaxed font-normal">{pillar.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Verified Corporate Recruiters (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAFBF9] rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#14532D]">Premier Recruiter Network</h4>
                  <p className="text-xs text-[#68766B]">Multinational & top regional employers</p>
                </div>
                <span className="text-xs font-bold text-[#14532D] bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                  300+ Recruiters
                </span>
              </div>

              {/* Recruiter Logos Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {recruiters.slice(0, 12).map((recruiter) => (
                  <div
                    key={recruiter}
                    className="h-14 rounded-xl border border-gray-200/80 bg-white flex items-center justify-center text-center px-2 hover:border-[#14532D] hover:shadow-xs transition-all group"
                  >
                    <span className="font-serif font-bold text-[#26352B] text-xs group-hover:text-[#14532D] transition-colors">
                      {recruiter}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#374151] font-medium text-center sm:text-left">
                +280 more corporate & IT partners
              </span>
              <button
                onClick={goPlacements}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto justify-center"
              >
                View Placement Report
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ── 3. Marquee of Recruiters ── */}
        <Reveal>
          <div className="overflow-hidden">
            <div className="text-center mb-4">
              <p className="text-xs uppercase tracking-widest text-[#26352B] font-bold">
                Trusted by Leading Global Enterprises
              </p>
            </div>
            <div className="relative overflow-hidden mask-gradient">
              <div className="flex gap-3.5 animate-marquee whitespace-nowrap py-1">
                {[...recruiters, ...recruiters].map((recruiter, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 px-5 py-2 rounded-full border border-gray-200 bg-white font-serif font-bold text-[#14532D] text-xs shadow-2xs"
                  >
                    {recruiter}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

/* ============== Student Life ============== */
export function StudentLife() {
  const { goEvents } = useNav();
  return (
    <section id="student-life" className="relative py-14 sm:py-20 lg:py-24 bg-[#F5F7F1] border-y border-[#E2E8F0]/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8E6C9] bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              Campus Experience & Student Life
            </span>
            <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
              More Than an Education. A Thriving Community.
            </h2>
            <p className="text-[#374151] text-base sm:text-lg leading-relaxed">
              Active student clubs, championship sports teams, cultural galas, and social service initiatives that make life at Bishop Ambrose unforgettable.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Big image card with Accessible Semi-Transparent Dark Card Overlay */}
          <Reveal>
            <div className="lg:col-span-1 relative rounded-3xl overflow-hidden shadow-md h-80 lg:h-full min-h-[340px] group bg-slate-900 border border-[#E2E8F0]">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80"
                alt="Student campus life"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <div className="text-xs uppercase tracking-widest text-[#A3C95A] font-bold mb-1.5">
                  The Ambrose Experience
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 leading-tight text-white text-shadow-on-dark">
                  Friendships &amp; Values That Endure
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                  From inter-collegiate fests to social outreach in Coimbatore rural communities, every semester provides enriching leadership opportunities.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Grid of features */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {studentLife.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.05}>
                <div className="group rounded-2xl p-6 bg-white border border-[#E2E8F0] hover:border-[#14532D]/40 hover:shadow-md transition-all duration-300 shadow-xs h-full cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F7F1] border border-[#C8E6C9] text-[#14532D] flex items-center justify-center transition-colors shrink-0 font-bold group-hover:bg-[#14532D] group-hover:text-white">
                      <DepartmentIcon name={item.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14532D] mb-1.5 transition-colors">{item.title}</h4>
                      <p className="text-xs text-[#374151] leading-relaxed transition-colors font-normal">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-12 text-center">
            <button
              onClick={goEvents}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Campus Events &amp; Activities
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============== Testimonials / Success Stories ============== */
const testimonials = [
  {
    name: "Arjun Mehta",
    title: "Lead Software Architect, Global Tech",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    quote:
      "Bishop Ambrose College provided the perfect balance of technical rigor, ethical foundation, and career opportunities. The guidance of the faculty shaped my trajectory in enterprise computing.",
    year: "Class of 2019",
  },
  {
    name: "Sara Williams",
    title: "Senior Research Associate, Life Sciences",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    quote:
      "The hands-on lab access and dedicated mentorship from professors at BAC gave me the edge during university campus interviews and postgraduate entrance examinations.",
    year: "Class of 2020",
  },
  {
    name: "Maya Singh",
    title: "Assistant Vice President, Banking & Finance",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    quote:
      "The analytical discipline and communication skills developed through departmental associations at BAC built the foundation for my international corporate banking career.",
    year: "Class of 2018",
  },
];

export function SuccessStories() {
  return (
    <section className="relative py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8E6C9] bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[#2E7D32]" />
              Alumni Voices &amp; Success
            </span>
            <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
              Graduates Shaping the Future
            </h2>
            <p className="text-[#374151] text-base sm:text-lg leading-relaxed">
              From corporate executives to researchers and community leaders, our alumni carry forward the Bishop Ambrose spirit of excellence.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 0.1}>
              <div className="bg-[#FAFBF9] rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 h-full flex flex-col group shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#2E7D32] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.075 9.38c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.953z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#26352B] font-serif text-base leading-relaxed mb-6 flex-1 italic font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/80">
                  <img
                    src={t.image}
                    alt={t.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                    }}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2E7D32]/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-[#14532D] text-sm truncate">{t.name}</div>
                    <div className="text-xs text-[#374151] font-medium line-clamp-1">{t.title}</div>
                    <div className="text-[11px] text-[#2E7D32] font-bold uppercase tracking-wider mt-0.5">
                      {t.year}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Homepage Final CTA ============== */
export function HomeCta() {
  const { goAdmissions } = useNav();
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#14532D] via-[#0E3E21] to-[#082815] text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#A3C95A] text-xs font-bold uppercase tracking-widest mb-6 border border-white/15">
              <GraduationCap className="w-3.5 h-3.5" />
              Admissions Open 2026–27
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6 text-white text-shadow-on-dark">
              Your Journey of Excellence Begins at <span className="text-[#A3C95A]">Bishop Ambrose</span>
            </h2>
            <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
              Take the first step toward high-impact undergraduate and postgraduate programs. Join a prestigious institution where academic rigor meets values, ethics, and community leadership.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              <button
                onClick={goAdmissions}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-[#14532D] text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Apply for Admission 2026
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={goAdmissions}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white hover:bg-white/10 text-sm font-bold transition-all duration-200 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                Download College Prospectus
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============== Why Choose Us Statistics (Academic Excellence) ============== */
export function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const statsConfig = data?.statistics;

  // If explicitly disabled in admin, hide the section
  if (statsConfig && statsConfig.sectionEnabled === false) {
    return null;
  }

  const eyebrow = statsConfig?.badgeText || "Academic Excellence & Distinction";
  const heading = statsConfig?.heading || "Building Academic Excellence & Enduring Trust";
  const description = statsConfig?.description ?? "Empowering students through rigorous diocesan heritage, distinguished faculty mentorship, modern labs, and verified career success.";

  // Use dynamic stats if available, sorted by order and filtered by visible
  const statsList = (statsConfig?.statistics && statsConfig.statistics.length > 0)
    ? [...statsConfig.statistics]
        .filter((s) => s.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : whyChooseStats.map((s, idx) => ({
        id: `default-${idx}`,
        value: s.value,
        label: s.label,
        prefix: "",
        suffix: s.suffix || "",
        order: idx + 1,
        visible: true,
      }));

  return (
    <section className="relative py-14 sm:py-20 lg:py-24 bg-[#F5F7F1] border-b border-[#E2E8F0]/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Editorial Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8E6C9] bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              {eyebrow}
            </span>
            <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
              {heading.includes("Academic Excellence") ? (
                <>
                  {heading.split("Academic Excellence")[0]}
                  <span className="text-[#2E7D32]">Academic Excellence</span>
                  {heading.split("Academic Excellence")[1]}
                </>
              ) : (
                heading
              )}
            </h2>
            <p className="text-[#374151] text-base sm:text-lg leading-relaxed">
              {description}
            </p>
          </div>
        </Reveal>

        {/* Continuous Editorial Metric Strip with Thin Subtle Dividers */}
        <Reveal delay={0.1}>
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {statsList.map((stat, idx) => (
                <div
                  key={stat.id || stat.label}
                  className="p-6 sm:p-8 flex flex-col items-center text-center group hover:bg-[#F9FAF8] transition-colors"
                >
                  <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#14532D] tracking-tight mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.prefix && <span className="mr-0.5 text-3xl sm:text-4xl text-[#2E7D32]">{stat.prefix}</span>}
                    <AnimatedCounter value={Number(stat.value) || 0} suffix={stat.suffix || ""} />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#26352B] tracking-wide mb-1">
                    {stat.label}
                  </div>
                  <span className="text-[11px] text-[#68766B] font-medium leading-snug">
                    {stat.label.includes("Excellence") || stat.label.includes("Years")
                      ? "Educational legacy since 1994"
                      : stat.label.includes("Students")
                      ? "Enrolled & active alumni network"
                      : stat.label.includes("Faculty")
                      ? "Dedicated research mentors"
                      : stat.label.includes("Placement")
                      ? "Verified career success rate"
                      : "Peer-reviewed academic contributions"}
                  </span>
                </div>
              ))}
            </div>

            {/* Narrative Context Footer Bar */}
            <div className="bg-[#FAFBF9] px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 text-xs text-[#26352B]">
                <GraduationCap className="w-4 h-4 text-[#14532D] shrink-0" />
                <span className="font-medium">
                  Affiliated with Bharathiar University · Approved by UGC · Managed by the Catholic Diocese of Coimbatore
                </span>
              </div>
              <div className="text-xs font-bold text-[#14532D] shrink-0">
                Autonomous Status · NAAC Accredited
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

/* ============== Campus Facilities ============== */
const featuredFacilities = [
  {
    title: "Digital Library & Research Learning",
    subtitle: "Knowledge Gateway",
    description:
      "An expansive academic resource hub housing over 25,000 physical volumes, 24/7 digital subscriptions to international journals (INFLIBNET N-LIST, DELNET, IEEE), individual research carrels, and collaborative study pods.",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    features: [
      "25,000+ Print & E-Volumes",
      "Automated RFID Cataloging",
      "INFLIBNET & DELNET Access",
      "Air-Conditioned Study Pods",
    ],
    icon: BookOpen,
  },
  {
    title: "High-Performance Computing & AI Infrastructure",
    subtitle: "Innovation Infrastructure",
    description:
      "State-of-the-art computer science and engineering laboratories equipped with 350+ workstation clusters, dedicated GPU compute accelerators for artificial intelligence and machine learning, and enterprise software suites.",
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    features: [
      "350+ Intel i7 Workstations",
      "GPU Compute Accelerators",
      "Gigabit LAN Network",
      "Linux & Windows Dual Boot",
    ],
    icon: Cpu,
  },
];

const supportingFacilities = [
  {
    title: "Smart Classrooms",
    category: "Academic",
    description:
      "Spacious, ergonomically designed lecture halls equipped with interactive smartboards, high-definition audio-visual projection, and hybrid lecture capture systems.",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    highlight: "45+ Digitally Enabled Halls",
    icon: Monitor,
  },
  {
    title: "Sports & Athletics Arena",
    category: "Sports & Fitness",
    description:
      "Expansive sports pavilion featuring standard football grounds, cricket pitches, floodlit volleyball courts, indoor badminton arena, and a modern fitness gym.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    highlight: "Multi-Sport Pavilion & Gym",
    icon: Trophy,
  },
  {
    title: "College Transportation Fleet",
    category: "Campus Services",
    description:
      "Comprehensive fleet of institutional buses connecting the campus to all major Coimbatore arterial hubs, Tirupur, and Pollachi with real-time GPS tracking.",
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    highlight: "15+ Arterial Routes · GPS Tracking",
    icon: Bus,
  },
  {
    title: "Hygienic Dining & Cafeteria",
    category: "Student Life",
    description:
      "Spacious dining commons offering hygienic, balanced South and North Indian meals, healthy refreshments, and purified RO drinking water under strict FSSAI standards.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    highlight: "300+ Seating · FSSAI Certified",
    icon: Utensils,
  },
  {
    title: "High-Speed Campus Wi-Fi & Network",
    category: "Connectivity",
    description:
      "High-speed dedicated leased-line network backbone with seamless wireless coverage spanning across academic blocks, departments, laboratories, and student open greens.",
    image:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    highlight: "Dedicated Leased-Line Coverage",
    icon: Wifi,
  },
  {
    title: "Auditoriums & Seminar Halls",
    category: "Events & Culture",
    description:
      "Acoustically engineered air-conditioned main auditorium with 1,200+ seating capacity and multimedia seminar halls for university symposiums and conferences.",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    highlight: "1,200+ Seating Capacity",
    icon: Building2,
  },
];

export function CampusFacilities() {
  const shouldReduceMotion = useReducedMotion();
  const { goFacilities } = useNav();

  return (
    <section id="facilities" className="relative py-16 sm:py-20 lg:py-28 bg-[#F4FAF4] border-t border-[#E2E8F0]/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2E7D32]/25 bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              Campus Infrastructure & Spaces
            </span>
            <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
              World-Class Learning Environments
            </h2>
            <p className="text-[#475569] text-base sm:text-lg leading-relaxed font-normal">
              Designed to support comprehensive academic discovery, holistic personal growth, ethical leadership, and student well-being.
            </p>
          </div>
        </Reveal>

        {/* ── PART A: Featured Campus Facilities (Two Large Prominent Hubs) ── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 mb-14 sm:mb-16">
          {featuredFacilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <motion.div
                key={fac.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: shouldReduceMotion ? 0 : idx * 0.12,
                  ease: "easeOut",
                }}
                onClick={goFacilities}
                className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 hover:border-[#14532D]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Visual Image Area (55–60% space) */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent pointer-events-none" />

                  {/* Category Label */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#14532D] uppercase tracking-wider shadow-2xs">
                      <Icon className="w-3.5 h-3.5 text-[#2E7D32]" />
                      {fac.subtitle}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#14532D] group-hover:text-[#2E7D32] transition-colors leading-snug mb-3">
                      {fac.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed mb-6 font-normal">
                      {fac.description}
                    </p>
                  </div>

                  <div>
                    {/* Feature Checklist Pills */}
                    <div className="grid grid-cols-2 gap-2.5 py-4 border-t border-slate-100">
                      {fac.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-2 text-xs text-[#1e293b] font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Explore Link */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Explore Facility &amp; Specifications
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D] group-hover:text-[#2E7D32] transition-colors">
                        <span>Explore More</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── PART B: Other Campus Facilities (Sub-heading & Six Compact Cards) ── */}
        <div className="mb-8 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32]">
              Campus Resources
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#14532D] mt-1">
              More Campus Facilities
            </h3>
          </div>
          <button
            onClick={goFacilities}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D] hover:text-[#2E7D32] transition-colors self-start sm:self-auto group cursor-pointer"
          >
            <span>View All Facilities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Six Compact Cards Grid (3-Column Desktop, 2-Column Tablet, 1-Column Mobile) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {supportingFacilities.map((fac, idx) => {
            return (
              <motion.div
                key={fac.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : idx * 0.07,
                  ease: "easeOut",
                }}
                onClick={goFacilities}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-200/90 hover:border-[#14532D]/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
              >
                {/* Landscape Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#14532D] uppercase tracking-wider shadow-2xs">
                      {fac.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#14532D] group-hover:text-[#2E7D32] transition-colors leading-snug mb-2">
                      {fac.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal mb-4">
                      {fac.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 truncate mr-2">
                      {fac.highlight}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#14532D] group-hover:text-[#2E7D32] transition-colors shrink-0">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Comprehensive Facilities Action Bar */}
        <div className="mt-14 text-center">
          <PremiumButton
            variant="gold"
            size="lg"
            onClick={goFacilities}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Complete Campus Facilities Dossier
          </PremiumButton>
        </div>

      </div>
    </section>
  );
}
