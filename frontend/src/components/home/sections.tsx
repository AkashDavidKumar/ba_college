"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical, TrendingUp, Briefcase, Users, Music, HeartHandshake, Home, Lightbulb, Trophy, Building2, Monitor, Cpu, BookOpen, Bus, Utensils, Wifi, LucideIcon } from "lucide-react";
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
  const { goAdmissions } = useNav();
  return (
    <section id="placements" className="relative py-12 sm:py-20 lg:py-28 bg-background overflow-hidden">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-64 blob bg-gold/10" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          eyebrow="Placements & Career Success"
          title={
            <>
              Where BAC graduates <span className="text-gold-gradient">land</span>
            </>
          }
          description="A dedicated career studio, 1,200+ recruiters, and a 95% placement rate. Our graduates join the world's most respected companies — and start the next generation of category-defining startups."
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-14">
          {/* Stats dashboard */}
          <Reveal>
            <div className="space-y-4">
              {placementStats.map((stat) => (
                <div key={stat.label} className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/70 p-6 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#1F2937] font-bold mb-1">
                      {stat.label}
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#166534] tracking-tight">
                      {stat.prefix}
                      <AnimatedCounter value={stat.value} />
                      {stat.suffix}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#166534]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Highlight */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-navy-gradient text-white p-8 h-full flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                  <Trophy className="w-3 h-3" />
                  Top Recruiters
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-white text-shadow-on-dark">
                  1,200+ recruiters from 30+ countries
                </h3>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  From global technology majors to investment banks, consulting firms, and research labs — BAC graduates are recruited by the world&apos;s most respected organisations.
                </p>
              </div>
              <PremiumButton variant="gold" size="md" className="relative bg-white text-[#14532D] hover:bg-white/95 font-bold" icon={<ArrowRight className="w-4 h-4" />} onClick={goAdmissions}>
                View Placement Report
              </PremiumButton>
            </div>
          </Reveal>

          {/* Industry partners */}
          <Reveal delay={0.2}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/70 p-6 h-full shadow-xs">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-[#166534]" />
                <h3 className="font-serif text-lg font-bold text-[#14532D]">Industry Partners</h3>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5 sm:gap-3">
                {recruiters.slice(0, 12).map((recruiter) => (
                  <div
                    key={recruiter}
                    className="aspect-square rounded-xl border border-emerald-100 bg-white flex items-center justify-center text-center p-2 hover:border-[#166534]/50 hover:bg-emerald-50/50 transition-colors group shadow-2xs"
                  >
                    <span className="font-serif font-bold text-[#14532D] text-[11px] xs:text-xs sm:text-sm group-hover:text-[#166534] transition-colors">
                      {recruiter}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-[#374151] font-medium">
                +{recruiters.length - 12} more global recruiters
              </div>
            </div>
          </Reveal>
        </div>

        {/* Marquee of recruiters */}
        <Reveal>
          <div className="mt-12 overflow-hidden">
            <div className="text-center mb-4">
              <p className="text-xs uppercase tracking-widest text-[#1F2937] font-bold">
                A few of the companies that hire BAC graduates
              </p>
            </div>
            <div className="relative overflow-hidden mask-gradient">
              <div className="flex gap-4 animate-marquee whitespace-nowrap">
                {[...recruiters, ...recruiters].map((recruiter, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 px-6 py-3 rounded-full border border-emerald-200/80 bg-white font-serif font-bold text-[#14532D] text-sm shadow-xs"
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
    <section id="student-life" className="relative py-12 sm:py-20 lg:py-28 bg-cream overflow-hidden">
      <div className="absolute top-32 right-0 w-96 h-96 blob bg-gold/15" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          eyebrow="Student Life"
          title={
            <>
              More than a campus. <span className="text-gold-gradient">A community.</span>
            </>
          }
          description="150+ student clubs, 32 sports teams, year-round cultural festivals, a 24/7 makerspace, and wellness support that puts student thriving at the centre of everything we do."
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-14">
          {/* Big image card with Accessible Semi-Transparent Dark Card Overlay */}
          <Reveal>
            <div className="lg:col-span-1 relative rounded-2xl overflow-hidden shadow-premium h-80 lg:h-full min-h-[320px] group">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80"
                alt="Student campus life"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 card-dark-overlay p-4 sm:p-5 rounded-xl border border-white/20 text-white shadow-xl">
                <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
                  The BAC Experience
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 leading-tight text-white text-shadow-on-dark">
                  Friendships and ideas that last a lifetime
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                  From hackathons to film festivals, every week at BAC brings a new opportunity to learn, lead, and belong.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Grid of features */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {studentLife.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.05}>
                <div className="group rounded-2xl p-6 bg-white border border-emerald-200/70 hover:border-[#14532D] hover:shadow-md transition-all duration-300 shadow-xs h-full cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center transition-colors shrink-0 font-bold">
                      <DepartmentIcon name={item.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#14532D] mb-1 transition-colors">{item.title}</h4>
                      <p className="text-sm text-[#374151] leading-relaxed transition-colors font-normal">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-12 text-center">
            <PremiumButton variant="navy" size="lg" icon={<ArrowRight className="w-4 h-4" />} onClick={goEvents} className="bg-[#14532D] text-white font-bold">
              Explore Campus Events
            </PremiumButton>
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
    title: "Staff Software Engineer, Google",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    quote:
      "BAC gave me the rigor of a top research lab and the pragmatism of a Silicon Valley startup. I shipped my first production system as a sophomore.",
    year: "Class of 2019",
  },
  {
    name: "Sara Williams",
    title: "Research Scientist, Anthropic",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    quote:
      "The faculty mentorship and access to compute resources at BAC rival what I have seen at Stanford and CMU. The network effect is real.",
    year: "Class of 2020",
  },
  {
    name: "Maya Singh",
    title: "VP, Investment Banking, Goldman Sachs",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    quote:
      "The case-method rigor and global network at BAC accelerated my career by at least five years. I still lean on my BAC cohort every single day.",
    year: "Class of 2017",
  },
];

export function SuccessStories() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Student Success Stories"
          title={
            <>
              BAC graduates <span className="text-gold-gradient">shape the future</span>
            </>
          }
          description="From Silicon Valley engineers to Wall Street leaders and venture-backed founders — BAC alumni are building the next generation of impactful organisations."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 sm:mt-14">
          {testimonials.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 0.1}>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/70 p-6 sm:p-7 h-full flex flex-col group shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-emerald-600 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.075 9.38c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.953z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#1F2937] font-serif text-base leading-relaxed mb-6 flex-1 italic font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-emerald-100">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-400/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-[#14532D] text-sm truncate">{t.name}</div>
                    <div className="text-xs text-[#374151] font-medium line-clamp-1">{t.title}</div>
                    <div className="text-[11px] text-[#166534] font-bold uppercase tracking-wider mt-0.5">
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
    <section className="relative py-14 sm:py-20 lg:py-28 bg-navy-gradient text-white overflow-hidden">
      <div className="absolute inset-0 pattern-grid opacity-15 mix-blend-overlay" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 blob bg-gold/30" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
              <FlaskConical className="w-3.5 h-3.5" />
              Admissions Open 2026
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.12] mb-6 text-white text-shadow-on-dark">
              Your future starts at <span className="text-emerald-300">BAC</span>
            </h2>
            <p className="text-white/95 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto font-normal text-shadow-subtle">
              Join 20,000+ students from 80 countries who chose BAC to launch their careers,
              their startups, and their research journeys. Applications for the 2026 intake are now open.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              <PremiumButton variant="gold" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />} className="bg-white text-[#14532D] hover:bg-white/95 font-bold">
                Apply Now
              </PremiumButton>
              <PremiumButton
                variant="outline-light"
                size="lg"
                onClick={goAdmissions}
                icon={<Briefcase className="w-4 h-4" />}
                className="border-white/40 text-white hover:bg-white/15 font-bold"
              >
                Download Brochure
              </PremiumButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============== Why Choose Us Statistics ============== */
export function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const statsConfig = data?.statistics;

  // If explicitly disabled in admin, hide the section
  if (statsConfig && statsConfig.sectionEnabled === false) {
    return null;
  }

  const eyebrow = statsConfig?.badgeText || "Why Choose Our College";
  const heading = statsConfig?.heading || "Building Academic Excellence & Global Trust";
  const description = statsConfig?.description ?? "Empowering thousands of students through world-class faculty, cutting-edge facilities, and exceptional career outcomes.";

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

  const count = statsList.length;
  const gridColsClass =
    count === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : count === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
      : count === 3
      ? "grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto"
      : count === 4
      ? "grid-cols-2 md:grid-cols-4"
      : count === 5
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-cream border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow={eyebrow}
          title={
            heading.includes("Academic Excellence") ? (
              <>
                {heading.split("Academic Excellence")[0]}
                <span className="text-gold-gradient">Academic Excellence</span>
                {heading.split("Academic Excellence")[1]}
              </>
            ) : (
              heading
            )
          }
          description={description}
        />
        <div className={`grid ${gridColsClass} gap-4 mt-12`}>
          {statsList.map((stat, idx) => (
            <motion.div
              key={stat.id || stat.label}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.09, ease: "easeOut" }}
              whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 text-center border border-emerald-200/70 hover:border-[#166534] hover:shadow-xl transition-all cursor-default group shadow-sm"
            >
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[#166534] mb-1.5 transition-colors tracking-tight text-shadow-subtle">
                {stat.prefix && <span className="mr-0.5">{stat.prefix}</span>}
                <AnimatedCounter value={Number(stat.value) || 0} suffix={stat.suffix || ""} />
              </div>
              <div className="text-[#1F2937] text-xs sm:text-sm font-bold tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Campus Facilities ============== */
const campusFacilities = [
  {
    title: "Smart Classrooms",
    description: "Equipped with interactive smartboards, high-speed audio-visual systems, and hybrid lecture capture.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    icon: Monitor,
  },
  {
    title: "Computer Labs",
    description: "High-performance computing clusters with latest GPUs, workstation labs, and AI development servers.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    icon: Cpu,
  },
  {
    title: "Digital Library",
    description: "Over 500,000 physical volumes, 24/7 digital journal access, private study pods, and research archives.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    icon: BookOpen,
  },
  {
    title: "Sports Facilities",
    description: "Olympic-size swimming pool, indoor sports complex, football stadium, tennis courts, and fitness centers.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    icon: Trophy,
  },
  {
    title: "Transportation",
    description: "Comprehensive fleet of AC buses connecting the campus to all major city hubs with real-time GPS tracking.",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
    icon: Bus,
  },
  {
    title: "Cafeteria & Dining",
    description: "Multi-cuisine food courts offering hygienic, nutritious, and diverse meals with strict quality standards.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    icon: Utensils,
  },
  {
    title: "Wi-Fi Campus",
    description: "10 Gbps high-speed Wi-Fi network spanning across academic blocks, hostels, and outdoor lawns.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
    icon: Wifi,
  },
  {
    title: "Seminar Halls",
    description: "Acoustically designed auditoriums and seminar halls with 1,500+ seating capacity for international conferences.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    icon: Building2,
  },
];

export function CampusFacilities() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section id="facilities" className="relative py-12 sm:py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="World-Class Infrastructure"
          title={
            <>
              Campus <span className="text-gold-gradient">Facilities</span>
            </>
          }
          description="Designed to support comprehensive student development, cutting-edge learning, research, and recreation."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {campusFacilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <motion.div
                key={fac.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
                className="group rounded-2xl overflow-hidden bg-white border border-emerald-200/70 hover:border-[#166534] hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer shadow-xs"
              >
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  
                  {/* Floating Icon with micro-scale entrance */}
                  <motion.div
                    initial={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : (idx * 0.08) + 0.25, ease: "easeOut" }}
                    className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-[#14532D] group-hover:bg-[#14532D] group-hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </div>
                <div className="p-5 flex-1 flex flex-col bg-white">
                  <h4 className="font-serif font-bold text-[#14532D] text-lg mb-2 group-hover:text-[#166534] transition-colors">{fac.title}</h4>
                  <p className="text-xs text-[#374151] leading-relaxed font-normal">{fac.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
