"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Download,
  Compass,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Users,
  GraduationCap,
  FlaskConical,
  TrendingUp,
  Award,
  Trophy,
  Rocket,
  Globe2,
  Building2,
  HeartHandshake,
  Eye,
  Target,
  ShieldCheck,
  Crown,
  Star,
  BadgeCheck,
  Calendar,
  MapPinned,
  Linkedin,
  Twitter,
} from "lucide-react";
import { departments as defaultDepts, specializations } from "@/lib/university-data";
import { useSiteData } from "@/lib/site-context";
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
import { cn } from "@/lib/utils";

const navSections = [
  { id: "overview", label: "Overview" },
  { id: "programs", label: "Programs" },
  { id: "faculty", label: "Faculty" },
  { id: "research", label: "Research" },
  { id: "labs", label: "Laboratories" },
  { id: "achievements", label: "Achievements" },
  { id: "placements", label: "Placements" },
  { id: "events", label: "Events" },
  { id: "alumni", label: "Alumni" },
  { id: "contact", label: "Contact" },
];

const achievementIconMap: Record<string, typeof Trophy> = {
  Trophy,
  Award,
  Rocket,
  Globe2,
  HeartHandshake,
};

export function DepartmentDetail({ slug, section }: { slug: string; section?: string }) {
  const { goHome, goAdmissions, goDepartment } = useNav();
  const { data } = useSiteData();
  const deptList = data?.departments || defaultDepts;
  const dept = deptList.find((d) => d.slug === slug) ?? deptList[0];
  const [activeSection, setActiveSection] = useState(() => section || "overview");

  useEffect(() => {
    if (section && navSections.some((s) => s.id === section)) {
      setActiveSection(section);
    }
  }, [section]);

  const handleTabChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      const navEl = document.getElementById("dept-tab-nav");
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

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span>Academic Departments</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">{dept.shortName}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-navy-gradient text-white">
        <div className="absolute inset-0">
          <img src={dept.coverImage} alt={dept.name} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/85 via-navy/70 to-navy-dark/85" />
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 blob bg-gold/20" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-violet-500/15" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-navy text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <DepartmentIcon name={dept.icon} className="w-3.5 h-3.5" />
                  {dept.category}
                </div>
                <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-5">
                  {dept.name}
                </h1>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                  {dept.longDescription}
                </p>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton variant="gold" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />}>
                    Apply Now
                  </PremiumButton>
                  <PremiumButton
                    variant="outline-light"
                    size="lg"
                    onClick={goAdmissions}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Brochure
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10"
                    icon={<Compass className="w-4 h-4" />}
                    onClick={() => handleTabChange("programs")}
                  >
                    Explore Programs
                  </PremiumButton>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <DeptStat icon={<Users className="w-4 h-4" />} value={dept.studentCount} label="Students" />
                <DeptStat icon={<GraduationCap className="w-4 h-4" />} value={dept.facultyCount} label="Faculty" />
                <DeptStat icon={<FlaskConical className="w-4 h-4" />} value={dept.researchLabs} label="Research Labs" />
                <DeptStat
                  icon={<TrendingUp className="w-4 h-4" />}
                  value={dept.placementRate}
                  suffix="%"
                  label="Placement"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Department Navigation */}
      <div id="dept-tab-nav" className="sticky top-16 lg:top-20 z-30 glass-strong border-y border-navy/8 shadow-premium">
        <div className="container mx-auto px-4 sm:px-6">
          <nav role="tablist" aria-label="Department navigation" className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium py-2.5">
            {navSections.map((s) => {
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
                    "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-[#14532D] text-white shadow-md shadow-[#14532D]/20 scale-102"
                      : "text-navy hover:bg-navy/8 hover:text-[#14532D]"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sections */}
      <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Overview */}
            {activeSection === "overview" && (
              <section id="overview" role="tabpanel" aria-labelledby="tab-overview" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Department Overview"
            title={<>About the <span className="text-gold-gradient">Department</span></>}
            description={dept.longDescription}
            align="left"
          />

          <div className="grid lg:grid-cols-3 gap-6 mt-10">
            {/* Vision / Mission */}
            <Reveal>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center text-gold-dark">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy">Vision</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{dept.vision}</p>
              </GlassCard>
            </Reveal>
            <Reveal delay={0.08}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-navy/8 flex items-center justify-center text-navy">
                    <Target className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy">Mission</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{dept.mission}</p>
              </GlassCard>
            </Reveal>
            <Reveal delay={0.16}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy">Accreditation</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Accredited by leading global bodies including NBA Tier-1, ABET Substantial Equivalence, and UGC recognition.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["NBA Tier-1", "ABET", "UGC", "AICTE"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-navy/8 text-navy text-[10px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          </div>

          {/* Highlight cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {dept.highlights.map((h, idx) => (
              <Reveal key={h.title} delay={idx * 0.06}>
                <GlassCard className="p-5 h-full group">
                  <div className="w-10 h-10 rounded-lg bg-navy/8 group-hover:bg-gold group-hover:text-navy text-navy flex items-center justify-center mb-3 transition-colors">
                    <DepartmentIcon name={h.icon} className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-navy mb-1.5">{h.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Programs */}
      {activeSection === "programs" && (
        <section id="programs" role="tabpanel" aria-labelledby="tab-programs" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Programs Offered"
            title={<>Find the <span className="text-gold-gradient">right program</span> for you</>}
            description="From undergraduate foundations to doctoral research, our programs blend academic rigor with industry-aligned capstones and global exchange."
            align="left"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 gap-5 mt-10"
          >
            {dept.programs.map((program) => (
              <motion.div
                key={program.id}
                variants={staggerItem}
                className="group rounded-2xl overflow-hidden bg-white border border-navy/8 hover:border-gold/40 hover:shadow-premium transition-all duration-300 flex flex-col"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold-gradient text-navy text-[10px] font-bold uppercase">
                    {program.level}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif text-lg font-bold leading-tight">{program.name}</h4>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{program.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-medium">Duration</div>
                      <div className="text-navy font-semibold">{program.duration}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-medium">Eligibility</div>
                      <div className="text-navy font-semibold text-[11px] leading-snug">{program.eligibility}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-medium">Accreditation</div>
                      <div className="text-navy font-semibold text-[11px]">{program.accreditation}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-3 border-t border-navy/8">
                    <button className="flex-1 px-3 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-dark transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-2 rounded-lg border border-navy/15 text-navy text-xs font-semibold hover:bg-navy hover:text-white transition-colors">
                      Curriculum
                    </button>
                    <button
                      onClick={goAdmissions}
                      className="flex-1 px-3 py-2 rounded-lg bg-gold-gradient text-navy text-xs font-semibold hover:brightness-105 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Specializations */}
          <div className="mt-12">
            <h3 className="font-serif text-xl font-bold text-navy mb-5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-gold-dark" />
              Specializations & Tracks
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {specializations.map((spec) => (
                <GlassCard key={spec.department} className="p-5">
                  <h4 className="font-serif text-base font-bold text-navy mb-3">{spec.department}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.tracks.map((track) => (
                      <span
                        key={track}
                        className="px-2.5 py-1 rounded-full bg-navy/5 text-navy text-xs font-medium border border-navy/10"
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Faculty */}
      {activeSection === "faculty" && (
        <section id="faculty" role="tabpanel" aria-labelledby="tab-faculty" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Faculty"
            title={<>Learn from the <span className="text-gold-gradient">world&apos;s best</span></>}
            description="Our faculty hold doctorates from the world's leading universities — Stanford, MIT, Oxford, Cambridge, ETH Zurich, and CMU — and publish in the most selective academic venues."
            align="left"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10"
          >
            {dept.faculty.map((member) => (
              <motion.div
                key={member.id}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group rounded-2xl overflow-hidden bg-white border border-navy/8 hover:border-gold/40 hover:shadow-premium transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-transparent to-transparent" />
                  
                  {/* Social links overlay */}
                  <div className="absolute inset-0 bg-navy-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                    <motion.a
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-gold hover:text-navy text-white flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-gold hover:text-navy text-white flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 duration-200"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-gold hover:text-navy text-white flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 duration-300"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </motion.a>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold-gradient text-navy text-[10px] font-bold uppercase z-0">
                    {member.role}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white z-0">
                    <h4 className="font-serif text-base font-bold leading-tight mb-0.5">{member.name}</h4>
                    <p className="text-[11px] text-gold-light font-medium">{member.designation}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">{member.qualification}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {member.researchInterests.slice(0, 2).map((interest) => (
                      <span key={interest} className="px-1.5 py-0.5 rounded bg-navy/5 text-navy text-[10px] font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-navy/8 text-[11px]">
                    <span className="text-muted-foreground">{member.publications} publications</span>
                    <button className="text-navy font-semibold hover:text-gold-dark transition-colors">
                      View Profile →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Research */}
      {activeSection === "research" && (
        <section id="research" role="tabpanel" aria-labelledby="tab-research" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Research & Innovation"
            title={<>Research that <span className="text-gold-gradient">moves disciplines forward</span></>}
            description="Faculty and students collaborate on curiosity-driven and translational research published in the world's most selective venues."
            align="left"
          />

          <div className="grid lg:grid-cols-4 gap-4 mt-10 mb-10">
            {[
              { label: "Publications", value: dept.researchStats.publications, suffix: "+" },
              { label: "Patents", value: dept.researchStats.patents, suffix: "" },
              { label: "Active Projects", value: dept.researchStats.projects, suffix: "+" },
              { label: "Research Centers", value: dept.researchStats.centers, suffix: "" },
            ].map((s, idx) => (
              <Reveal key={s.label} delay={idx * 0.06}>
                <GlassCard className="p-5 text-center">
                  <div className="font-serif text-3xl font-bold text-navy mb-1">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-navy mb-4">Research Areas</h3>
            <div className="flex flex-wrap gap-2">
              {dept.researchAreas.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 rounded-full bg-navy/5 text-navy text-sm font-medium border border-navy/10 hover:bg-navy hover:text-white transition-colors cursor-default"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Laboratories */}
      {activeSection === "labs" && (
        <section id="labs" role="tabpanel" aria-labelledby="tab-labs" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Laboratories & Facilities"
            title={<>World-class <span className="text-gold-gradient">labs & infrastructure</span></>}
            description="Students work with industry-grade equipment and infrastructure that mirrors the labs at the world's leading research universities."
            align="left"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-5 mt-10"
          >
            {dept.labs.map((lab) => (
              <motion.div
                key={lab.name}
                variants={staggerItem}
                className="group rounded-2xl overflow-hidden bg-white border border-navy/8 hover:border-gold/40 hover:shadow-premium transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={lab.image}
                    alt={lab.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/20 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-navy text-white text-[10px] font-semibold">
                    Capacity: {lab.capacity}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif text-lg font-bold leading-tight">{lab.name}</h4>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{lab.description}</p>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                    Key Equipment
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.equipment.map((eq) => (
                      <span key={eq} className="px-2 py-0.5 rounded bg-navy/5 text-navy text-[10px] font-medium">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Achievements */}
      {activeSection === "achievements" && (
        <section id="achievements" role="tabpanel" aria-labelledby="tab-achievements" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Student Achievements"
            title={<>Our students <span className="text-gold-gradient">win globally</span></>}
            description="From hackathons to research publications, startup launches to international recognition — BAC students are shaping the future."
            align="left"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {dept.achievements.map((ach, idx) => {
              const Icon = achievementIconMap[ach.icon] ?? Trophy;
              return (
                <Reveal key={ach.title} delay={idx * 0.06}>
                  <GlassCard className="p-5 h-full group text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 group-hover:bg-gold group-hover:text-navy text-gold-dark flex items-center justify-center mb-3 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-sm font-bold text-navy mb-1.5 leading-tight">{ach.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ach.description}</p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Placements */}
      {activeSection === "placements" && (
        <section id="placements" role="tabpanel" aria-labelledby="tab-placements" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Placements"
            title={<>Career outcomes that <span className="text-gold-gradient">speak for themselves</span></>}
            description="Our graduates join the world's most respected companies — and launch category-defining startups."
            align="left"
          />

          <div className="grid lg:grid-cols-4 gap-4 mt-10 mb-8">
            {[
              { label: "Placement Rate", value: `${dept.placementRate}%` },
              { label: "Highest Package", value: "₹64 LPA" },
              { label: "Average Package", value: "₹12 LPA" },
              { label: "Internship Conversion", value: "78%" },
            ].map((s, idx) => (
              <Reveal key={s.label} delay={idx * 0.06}>
                <GlassCard className="p-6 text-center">
                  <div className="font-serif text-3xl font-bold text-navy mb-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          {/* Recruiters */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-gold-dark" />
              <h3 className="font-serif text-lg font-bold text-navy">Top Recruiters</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {["Google", "Microsoft", "Amazon", "IBM", "Infosys", "TCS", "Accenture", "Apple", "Meta", "Goldman Sachs", "McKinsey", "BCG"].map((r) => (
                <div
                  key={r}
                  className="aspect-video rounded-lg border border-navy/8 flex items-center justify-center p-2 hover:border-gold/40 hover:bg-gold/5 transition-colors"
                >
                  <span className="font-serif font-bold text-navy text-xs sm:text-sm">{r}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      {/* Events */}
      {activeSection === "events" && (
        <section id="events" role="tabpanel" aria-labelledby="tab-events" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Events & Activities"
            title={<>Flagship <span className="text-gold-gradient">department events</span></>}
            description="Hackathons, research symposia, guest lectures, and cultural festivals that bring the department alive."
            align="left"
          />

          <div className="grid lg:grid-cols-2 gap-5 mt-10">
            {dept.events.map((event, idx) => (
              <Reveal key={event.title} delay={idx * 0.08}>
                <GlassCard className="p-6 h-full group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/15 group-hover:bg-gold group-hover:text-navy text-gold-dark flex items-center justify-center shrink-0 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-base font-bold text-navy mb-1">{event.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gold-dark" />
                          {event.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold-dark" />
                          {event.venue}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          {/* Flagship event chips */}
          <div className="mt-8">
            <h4 className="font-serif text-sm font-bold text-navy mb-3">Annual Flagship Events</h4>
            <div className="flex flex-wrap gap-2">
              {dept.flagshipEvents.map((fe) => (
                <div
                  key={fe.name}
                  className="px-4 py-2 rounded-xl border border-navy/10 bg-white"
                >
                  <div className="font-serif text-sm font-bold text-navy">{fe.name}</div>
                  <div className="text-xs text-muted-foreground">{fe.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alumni */}
      {activeSection === "alumni" && (
        <section id="alumni" role="tabpanel" aria-labelledby="tab-alumni" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Alumni Voices"
            title={<>Where are they <span className="text-gold-gradient">now?</span></>}
            description="BAC alumni lead at the world's most respected companies — and stay connected to mentor the next generation."
            align="left"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {dept.alumni.map((alum, idx) => (
              <Reveal key={alum.name} delay={idx * 0.08}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={alum.image}
                      alt={alum.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/30"
                    />
                    <div>
                      <h4 className="font-serif text-base font-bold text-navy leading-tight">{alum.name}</h4>
                      <p className="text-xs text-muted-foreground">{alum.position}</p>
                      <p className="text-xs text-gold-dark font-semibold">{alum.company}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                    &ldquo;{alum.testimonial}&rdquo;
                  </p>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-4 pt-3 border-t border-navy/8">
                    Class of {alum.year}
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {activeSection === "contact" && (
        <section id="contact" role="tabpanel" aria-labelledby="tab-contact" className="scroll-mt-32">
          <SectionHeading
            eyebrow="Contact"
            title={<>Get in <span className="text-gold-gradient">touch</span></>}
            description="Have questions about programs, admissions, or research opportunities? We'd love to hear from you."
            align="left"
          />

          <div className="grid lg:grid-cols-3 gap-5 mt-10">
            <Reveal>
              <GlassCard className="p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-navy/8 text-navy flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-navy mb-1">Address</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{dept.contact.address}</p>
              </GlassCard>
            </Reveal>
            <Reveal delay={0.08}>
              <GlassCard className="p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-navy/8 text-navy flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-navy mb-1">Phone</h4>
                <a href={`tel:${dept.contact.phone}`} className="text-sm text-muted-foreground hover:text-gold-dark transition-colors">
                  {dept.contact.phone}
                </a>
              </GlassCard>
            </Reveal>
            <Reveal delay={0.16}>
              <GlassCard className="p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-navy/8 text-navy flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-navy mb-1">Email</h4>
                <a href={`mailto:${dept.contact.email}`} className="text-sm text-muted-foreground hover:text-gold-dark transition-colors">
                  {dept.contact.email}
                </a>
              </GlassCard>
            </Reveal>
          </div>

          {/* Quick form + map */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <GlassCard className="p-6">
              <h4 className="font-serif text-lg font-bold text-navy mb-4">Faculty Directory</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-premium pr-2">
                {dept.faculty.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy/3 transition-colors">
                    <img src={f.image} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-navy truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{f.designation}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark font-bold uppercase">
                      {f.role}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-0 overflow-hidden">
              <div className="relative h-72 lg:h-full min-h-[300px] bg-navy-gradient">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                  alt="Campus map"
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-navy/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                  <MapPinned className="w-10 h-10 text-gold-light mb-3" />
                  <h4 className="font-serif text-xl font-bold mb-2">BAC Global Campus</h4>
                  <p className="text-sm text-white/80 mb-4 max-w-xs">{dept.contact.address}</p>
                  <PremiumButton variant="gold" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open in Maps
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      )}
    </motion.div>
  </AnimatePresence>
</div>

      {/* Cross-sell to other departments */}
      <section className="py-16 lg:py-20 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Explore More"
            title={<>Other <span className="text-gold-gradient">departments</span></>}
            description="Discover the breadth of academic excellence at BAC."
          />
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {deptList
              .filter((d) => d.slug !== dept.slug)
              .map((d) => (
                <button
                  key={d.slug}
                  onClick={() => goDepartment(d.slug)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-navy/10 bg-white hover:border-gold/40 hover:bg-gold/5 transition-colors text-sm font-semibold text-navy"
                >
                  <DepartmentIcon name={d.icon} className="w-4 h-4 text-gold-dark" />
                  {d.shortName}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DeptStat({
  icon,
  value,
  suffix = "",
  label,
}: {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="glass-navy rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-gold-light mb-1">{icon}</div>
      <div className="font-serif text-2xl font-bold text-white">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-xs text-white/70">{label}</div>
    </div>
  );
}
