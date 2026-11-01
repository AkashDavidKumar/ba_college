"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Target, Eye, Heart, Compass, ArrowRight, Quote } from "lucide-react";
import { aboutStats, aboutHighlights, aboutAwards } from "@/lib/university-data";
import { SectionHeading, GlassCard, AnimatedCounter, Reveal, DepartmentIcon, PremiumButton } from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { useSiteData } from "@/lib/site-context";

const coreValues = [
  { title: "Academic Integrity", description: "Rigor, honesty, and intellectual courage in everything we do.", icon: "Compass" },
  { title: "Inclusive Excellence", description: "Diverse perspectives drive better research and richer learning.", icon: "Heart" },
  { title: "Global Citizenship", description: "Educating leaders who serve their communities and the world.", icon: "Compass" },
  { title: "Innovation for Impact", description: "Translating discovery into solutions that uplift society.", icon: "Target" },
];

export function About() {
  const shouldReduceMotion = useReducedMotion();
  const { goAdmissions } = useNav();
  const { data } = useSiteData();

  const aboutPage = data?.aboutPage || {
    hero: {
      enabled: true,
      badgeText: "ABOUT BAC",
      heading: "A globally connected university shaping tomorrow's leaders",
      description: "Founded in 1984, BAC Global University blends the rigor of a research institution with the warmth of a close-knit campus community — preparing 20,000+ students to lead with excellence, empathy, and impact."
    },
    legacy: {
      enabled: true,
      accentLabel: "OUR STORY & FOUNDATION",
      heading: "A Legacy of Innovation and Excellence",
      paragraphs: [
        "What began as a small engineering college in 1984 has grown into one of Asia's most respected research universities. BAC was founded on a simple conviction: that an education rooted in critical inquiry, hands-on research, and global exposure could transform not just individual lives but entire communities. Four decades later, that conviction has produced 85,000+ alumni across 80 countries, three campuses, and a research portfolio that ranks among the world's best.",
        "Today, BAC is recognised by QS, THE, and the world's leading accreditation bodies. We are a member of the Association of Pacific Rim Universities, and our partnerships span Stanford, MIT, Oxford, Cambridge, NUS, and ETH Zurich — giving every BAC student the opportunity to learn from and contribute to the global academic community.",
        "Through state-of-the-art research facilities, world-class faculty, and industry-connected programs, BAC empowers students to solve real-world problems and shape the future with intellectual curiosity and ethical leadership."
      ],
      image: {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        altText: "BAC University Knowledge City Campus",
        caption: "200 acres of learning & discovery",
        badge: "Knowledge City Campus"
      }
    },
    additionalSections: []
  };

  const hero = aboutPage.hero || {
    enabled: true,
    badgeText: "ABOUT BAC",
    heading: "A globally connected university shaping tomorrow's leaders",
    description: "Founded in 1984, BAC Global University blends the rigor of a research institution with the warmth of a close-knit campus community — preparing 20,000+ students to lead with excellence, empathy, and impact."
  };

  const legacy = aboutPage.legacy || {
    enabled: true,
    accentLabel: "OUR STORY & FOUNDATION",
    heading: "A Legacy of Innovation and Excellence",
    paragraphs: [],
    image: {
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      altText: "BAC University Knowledge City Campus",
      caption: "200 acres of learning & discovery",
      badge: "Knowledge City Campus"
    }
  };

  if (!hero.enabled && !legacy.enabled) {
    return null;
  }

  // Format title with gold gradient highlight
  const rawHeading = hero.heading || "A globally connected university shaping tomorrow's leaders";
  const renderTitle = () => {
    if (rawHeading.includes("tomorrow's leaders")) {
      const parts = rawHeading.split("tomorrow's leaders");
      return (
        <>
          {parts[0]}
          <span className="text-gold-gradient">tomorrow&apos;s leaders</span>
          {parts[1]}
        </>
      );
    }
    if (rawHeading.includes("leaders")) {
      const parts = rawHeading.split("leaders");
      return (
        <>
          {parts[0]}
          <span className="text-gold-gradient">leaders</span>
          {parts[1]}
        </>
      );
    }
    return rawHeading;
  };

  return (
    <section id="about" className="relative py-12 sm:py-20 lg:py-28 bg-mesh overflow-hidden">
      <div className="absolute top-20 -right-32 w-80 h-80 blob bg-gold/15" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        {hero.enabled && (
          <SectionHeading
            eyebrow={hero.badgeText || "About BAC"}
            title={renderTitle()}
            description={hero.description}
          />
        )}

        <div className="grid lg:grid-cols-2 gap-12 mt-16 items-start">
          {/* Left: story + vision + mission */}
          <div className="space-y-8">
            {/* Legacy Story Card */}
            {legacy.enabled && (
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white/95 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-6 sm:p-7 shadow-sm"
              >
                <div className="divider-gold mb-4" />
                {legacy.accentLabel && (
                  <div className="text-xs uppercase font-bold tracking-wider text-[#166534] mb-1.5">
                    {legacy.accentLabel}
                  </div>
                )}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] mb-3">
                  {legacy.heading}
                </h3>
                <div className="space-y-4">
                  {legacy.paragraphs && legacy.paragraphs.length > 0 ? (
                    legacy.paragraphs.map((para, i) => (
                      <p key={i} className="text-[#374151] leading-relaxed font-normal text-base">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-[#374151] leading-relaxed font-normal text-base">
                      BAC was founded on a simple conviction: that an education rooted in critical inquiry, hands-on research, and global exposure could transform not just individual lives but entire communities.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Dynamic Additional Sections (e.g. Principal's Message, Vision & Mission, etc.) */}
            {aboutPage.additionalSections &&
              aboutPage.additionalSections.filter((s) => s.enabled).map((sec, idx) => (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.1, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-l-4 border-l-[#14532D] border border-emerald-200/70 shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {sec.image && (
                      <img
                        src={sec.image}
                        alt={sec.author || sec.title}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400/50 shrink-0"
                      />
                    )}
                    <div>
                      {sec.subtitle && (
                        <div className="text-xs uppercase font-bold tracking-wider text-[#166534] mb-1">
                          {sec.subtitle}
                        </div>
                      )}
                      <h4 className="font-serif text-base font-bold text-[#14532D] mb-2">
                        {sec.title}
                      </h4>
                      <blockquote className="text-sm font-serif italic text-[#1F2937] mb-2 leading-relaxed">
                        &ldquo;{sec.content}&rdquo;
                      </blockquote>
                      {sec.author && (
                        <div className="text-xs font-bold text-[#14532D]">{sec.author}</div>
                      )}
                      {sec.role && (
                        <div className="text-[11px] text-[#374151] font-medium">{sec.role}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

            {/* Static Vision & Mission (shown if not replaced by custom sections) */}
            {(!aboutPage.additionalSections || aboutPage.additionalSections.length === 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="group rounded-2xl p-5 bg-white/95 backdrop-blur-md border border-emerald-200/70 hover:border-[#166534] hover:shadow-md transition-all duration-300 shadow-xs cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-[#14532D] group-hover:text-white text-[#14532D] flex items-center justify-center mb-3 transition-colors font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#14532D] mb-2 transition-colors">College Vision</h4>
                  <p className="text-sm text-[#374151] leading-relaxed transition-colors font-normal">
                    To be a globally recognized educational benchmark for research excellence, student growth, and societal impact.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="group rounded-2xl p-5 bg-white/95 backdrop-blur-md border border-emerald-200/70 hover:border-[#166534] hover:shadow-md transition-all duration-300 shadow-xs cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-[#14532D] group-hover:text-white text-[#14532D] flex items-center justify-center mb-3 transition-colors font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#14532D] mb-2 transition-colors">College Mission</h4>
                  <p className="text-sm text-[#374151] leading-relaxed transition-colors font-normal">
                    To deliver transformative education, advance interdisciplinary research, and nurture ethical leaders prepared for future challenges.
                  </p>
                </motion.div>
              </div>
            )}

            {/* Core values cards with staggered entrance */}
            <div>
              <h4 className="font-serif text-lg font-bold text-[#14532D] mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#166534]" />
                Core Values
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {coreValues.map((v, idx) => (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.08, ease: "easeOut" }}
                    whileHover={{ y: shouldReduceMotion ? 0 : -3, transition: { duration: 0.25, ease: "easeOut" } }}
                    className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/95 border border-emerald-200/70 hover:border-[#166534] transition-all duration-300 shadow-xs cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-[#14532D] group-hover:text-white text-[#14532D] flex items-center justify-center shrink-0 transition-colors font-bold">
                      <DepartmentIcon name={v.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1F2937] transition-colors">{v.title}</div>
                      <div className="text-xs text-[#374151] transition-colors font-normal">{v.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: image + awards + stats */}
          <div className="space-y-6 lg:sticky lg:top-28">
            {/* Campus Image with subtle zoom-in on hover and accessible card overlay */}
            {legacy.image?.url && (
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="group relative rounded-2xl overflow-hidden shadow-premium aspect-[4/3] bg-slate-900 border border-emerald-200/60"
              >
                <img
                  src={legacy.image.url}
                  alt={legacy.image.altText || "BAC University campus"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 card-dark-overlay p-3.5 sm:p-4 rounded-xl border border-white/20 text-white shadow-lg">
                  {legacy.image.badge && (
                    <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
                      {legacy.image.badge}
                    </div>
                  )}
                  {legacy.image.caption && (
                    <div className="font-serif text-base sm:text-lg font-bold text-white text-shadow-on-dark">
                      {legacy.image.caption}
                    </div>
                  )}
                </div>
                {/* Floating quote */}
                <div className="absolute top-3 right-3 sm:-top-3 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </motion.div>
            )}

            {/* Stats Cards - sequential entrance */}
            <div className="grid grid-cols-2 gap-3">
              {aboutStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 + idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: "easeOut" } }}
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/70 p-5 text-center shadow-xs hover:shadow-md transition-shadow">
                    <div className="font-serif text-2xl sm:text-3xl font-bold text-[#166534] mb-1 tracking-tight">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-[#1F2937] font-bold">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Awards Card */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-emerald-200/70 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-lg font-bold text-[#14532D]">Awards & Accreditations</h4>
                <span className="text-xs text-[#374151] font-bold">2024-25</span>
              </div>
              <div className="space-y-2.5">
                {aboutAwards.map((award) => (
                  <div key={award.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center text-[#166534] shrink-0 font-bold">
                      <DepartmentIcon name={award.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#1F2937] truncate">{award.name}</div>
                      <div className="text-xs text-[#374151] font-medium">{award.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Highlight cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {aboutHighlights.map((h, idx) => (
            <Reveal key={h.title} delay={idx * 0.08}>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-emerald-200/70 h-full group shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center mb-4 transition-colors font-bold">
                  <DepartmentIcon name={h.icon} className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#14532D] mb-2">{h.title}</h4>
                <p className="text-sm text-[#374151] leading-relaxed font-normal">{h.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mt-12 text-center">
            <PremiumButton variant="navy" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />} className="bg-[#14532D] text-white font-bold">
              Discover the BAC Advantage
            </PremiumButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
