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
      badgeText: "ABOUT BISHOP AMBROSE COLLEGE",
      heading: "Rooted in Faith, Growing in Excellence",
      description: "Founded in 1994 by the Catholic Diocese of Coimbatore, Bishop Ambrose College has spent over three decades delivering transformative, values-based education to empower future generations."
    },
    legacy: {
      enabled: true,
      accentLabel: "OUR HERITAGE & DIOCESAN FOUNDATION",
      heading: "Three Decades of Ethical Leadership and Learning",
      paragraphs: [
        "Established in 1994 under the visionary leadership of the Catholic Diocese of Coimbatore, Bishop Ambrose College was founded on a steadfast commitment: that higher education grounded in moral values, intellectual inquiry, and inclusive accessibility can transform lives and elevate communities.",
        "Over thirty years of dedicated service, the college has evolved into a premier autonomous institution affiliated with Bharathiar University. Today, our campus nurtures thousands of young men and women across cutting-edge programs in Computer Science, Commerce, Management, Life Sciences, and the Humanities.",
        "With state-of-the-art laboratories, a vibrant sports infrastructure, active NSS/NCC units, and a dedicated career guidance cell, Bishop Ambrose College provides students with the competencies and ethical compass required to thrive in a rapidly changing world."
      ],
      image: {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        altText: "Bishop Ambrose College Campus",
        caption: "A vibrant learning community rooted in values",
        badge: "Bishop Ambrose Campus"
      }
    },
    additionalSections: []
  };

  const hero = aboutPage.hero || {
    enabled: true,
    badgeText: "ABOUT BISHOP AMBROSE COLLEGE",
    heading: "Rooted in Faith, Growing in Excellence",
    description: "Founded in 1994 by the Catholic Diocese of Coimbatore, Bishop Ambrose College has spent over three decades delivering transformative, values-based education to empower future generations."
  };

  const legacy = aboutPage.legacy || {
    enabled: true,
    accentLabel: "OUR HERITAGE & DIOCESAN FOUNDATION",
    heading: "Three Decades of Ethical Leadership and Learning",
    paragraphs: [],
    image: {
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      altText: "Bishop Ambrose College Campus",
      caption: "A vibrant learning community rooted in values",
      badge: "Bishop Ambrose Campus"
    }
  };

  if (!hero.enabled && !legacy.enabled) {
    return null;
  }

  // Format title with clean highlight
  const rawHeading = hero.heading || "Rooted in Faith, Growing in Excellence";
  const renderTitle = () => {
    if (rawHeading.includes("Excellence")) {
      const parts = rawHeading.split("Excellence");
      return (
        <>
          {parts[0]}
          <span className="text-[#2E7D32]">Excellence</span>
          {parts[1]}
        </>
      );
    }
    return rawHeading;
  };

  return (
    <section id="about" className="relative py-14 sm:py-20 lg:py-24 bg-[#F5F7F1] border-b border-[#E2E8F0]/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {hero.enabled && (
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8E6C9] bg-white text-[#14532D] text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-[#2E7D32]" />
                {hero.badgeText || "About Bishop Ambrose College"}
              </span>
              <h2 className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
                {renderTitle()}
              </h2>
              <p className="text-[#374151] text-base sm:text-lg leading-relaxed">
                {hero.description}
              </p>
            </div>
          </Reveal>
        )}

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Heritage story + Vision & Mission + Values (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Heritage Narrative Block */}
            {legacy.enabled && (
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm"
              >
                {legacy.accentLabel && (
                  <div className="text-xs uppercase font-bold tracking-wider text-[#166534] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#166534]" />
                    {legacy.accentLabel}
                  </div>
                )}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] mb-4 leading-snug">
                  {legacy.heading}
                </h3>
                <div className="space-y-4 text-[#374151] leading-relaxed text-sm sm:text-base font-normal">
                  {legacy.paragraphs && legacy.paragraphs.length > 0 ? (
                    legacy.paragraphs.map((para, i) => (
                      <p key={i}>
                        {para}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>
                        Established in 1994 by the Catholic Diocese of Coimbatore, Bishop Ambrose College was founded on a simple conviction: that higher education grounded in moral values, intellectual rigor, and inclusive access can transform individual lives and uplift whole communities.
                      </p>
                      <p>
                        Over three decades, the college has earned autonomous distinction under Bharathiar University, fostering generations of ethical professionals, civil servants, entrepreneurs, and scholars who serve society with character.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Vision & Mission: Clean Vertical Green Accent Blocks (No generic boxy cards) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-white rounded-2xl p-5 border border-[#E2E8F0] border-l-4 border-l-[#14532D] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F7F1] text-[#14532D] flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#14532D]">College Vision</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                  To be an acclaimed center of higher education radiating academic rigor, Christian humanist values, moral integrity, and social transformation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-2xl p-5 border border-[#E2E8F0] border-l-4 border-l-[#2E7D32] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F7F1] text-[#2E7D32] flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#14532D]">College Mission</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                  To provide quality, affordable, and holistic education empowering youth with critical thinking, ethical leadership, and market-ready competencies.
                </p>
              </motion.div>
            </div>

            {/* Core Values Strip */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs">
              <h4 className="font-serif text-sm font-bold text-[#14532D] mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#2E7D32]" />
                Institutional Core Values
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {coreValues.map((v) => (
                  <div key={v.title} className="p-2.5 rounded-xl bg-[#FAFBF9] border border-gray-100">
                    <div className="text-xs font-bold text-[#26352B] mb-0.5">{v.title}</div>
                    <div className="text-[11px] text-[#68766B] leading-tight">{v.description}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: High-Res Campus Image + Verified Heritage Badge + Accreditations (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Campus Photography with Heritage Overlay */}
            {legacy.image?.url && (
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative rounded-3xl overflow-hidden shadow-md aspect-[4/3] bg-slate-900 border border-[#E2E8F0]"
              >
                <img
                  src={legacy.image.url}
                  alt={legacy.image.altText || "Bishop Ambrose College Campus"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Floating Heritage Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#14532D] shadow-sm">
                    Est. 1994 · Autonomous · NAAC Accredited
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <div className="text-xs uppercase tracking-widest text-[#A3C95A] font-bold mb-1">
                    Bishop Ambrose College Campus
                  </div>
                  <div className="font-serif text-base sm:text-lg font-bold text-white text-shadow-on-dark">
                    A peaceful, values-centered academic sanctuary in Coimbatore
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-3">
              {aboutStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-2xs"
                >
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] mb-0.5 tracking-tight">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-[#26352B] font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Accreditations Strip */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-sm font-bold text-[#14532D]">Institutional Accreditations</h4>
                <span className="text-[11px] font-bold text-[#2E7D32] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                  Recognized
                </span>
              </div>
              <div className="space-y-2 text-xs text-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                  <span>Affiliated with <strong>Bharathiar University</strong>, Coimbatore</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                  <span>Conferred <strong>Autonomous Status</strong> by UGC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                  <span>Accredited by <strong>NAAC</strong> with high institutional merit</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-2">
              <button
                onClick={goAdmissions}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Discover the BAC Advantage &amp; Admissions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
