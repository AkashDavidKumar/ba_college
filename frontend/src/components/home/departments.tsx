"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react";
import { departments as defaultDepts } from "@/lib/university-data";
import { SectionHeading, DepartmentIcon, PremiumButton, Reveal, staggerContainer, staggerItem } from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { cn } from "@/lib/utils";
import { useSiteData } from "@/lib/site-context";

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  navy: { bg: "bg-navy/8", text: "text-navy", border: "group-hover:border-navy/40", gradient: "from-navy to-navy-light" },
  gold: { bg: "bg-gold/12", text: "text-gold-dark", border: "group-hover:border-gold/40", gradient: "from-gold-dark to-gold" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "group-hover:border-emerald-300", gradient: "from-emerald-600 to-teal-700" },
  crimson: { bg: "bg-rose-100", text: "text-rose-700", border: "group-hover:border-rose-300", gradient: "from-rose-600 to-rose-800" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "group-hover:border-violet-300", gradient: "from-violet-600 to-violet-800" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "group-hover:border-amber-300", gradient: "from-amber-500 to-amber-700" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "group-hover:border-teal-300", gradient: "from-teal-600 to-cyan-700" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", border: "group-hover:border-rose-300", gradient: "from-rose-500 to-pink-600" },
};

export function Departments() {
  const shouldReduceMotion = useReducedMotion();
  const { goDepartment } = useNav();
  const { data } = useSiteData();
  const deptList = data?.departments || defaultDepts;


  return (
    <section id="departments" className="relative py-12 sm:py-20 lg:py-28 bg-cream overflow-hidden">
      <div className="absolute top-40 -left-32 w-80 h-80 blob bg-navy/8" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          eyebrow="Academic Departments"
          title={
            <>
              Eight schools. <span className="text-gold-gradient">Two hundred programs.</span> One mission.
            </>
          }
          description="Explore our world-class departments, each blending rigorous academics with industry-aligned capstones, global exchange, and an in-residence venture studio for student founders."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-14">
          {deptList.map((dept, idx) => {
            const colors = colorMap[dept.color] || colorMap.navy;
            return (
              <motion.div
                key={dept.slug}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
                className="group relative rounded-2xl overflow-hidden bg-white border border-border hover:border-gold-dark hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => goDepartment(dept.slug)}
              >
                {/* Cover */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={dept.coverImage}
                    alt={dept.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-navy text-[10px] font-semibold uppercase tracking-wider text-white">
                    {dept.category}
                  </div>

                  {/* Department icon */}
                  <div className={cn("absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-premium border border-navy/8")}>
                    <div className={cn("w-full h-full rounded-xl flex items-center justify-center", colors.bg)}>
                      <DepartmentIcon name={dept.icon} className={cn("w-6 h-6", colors.text)} />
                    </div>
                  </div>

                  {/* Program count chip */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-[#14532D] border border-emerald-200/90 text-[11px] font-bold shadow-sm">
                    {dept.programsCount} Programs
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 pt-7 flex-1 flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-[#14532D] mb-1 leading-tight">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-[#374151] leading-relaxed mb-4 line-clamp-3">
                    {dept.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-navy/8">
                    <Stat label="Faculty" value={`${dept.facultyCount}`} icon={<Users className="w-3 h-3 text-[#166534]" />} />
                    <Stat label="Students" value={`${(dept.studentCount / 1000).toFixed(1)}K`} icon={<GraduationCap className="w-3 h-3 text-[#166534]" />} />
                    <Stat label="Placed" value={`${dept.placementRate}%`} icon={<TrendingUp className="w-3 h-3 text-[#166534]" />} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => goDepartment(dept.slug)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14532D] text-white text-xs font-semibold hover:bg-navy-dark transition-colors shadow-sm"
                    >
                      Explore
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => goDepartment(dept.slug, "programs")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#14532D]/30 text-[#14532D] text-xs font-semibold hover:bg-[#14532D] hover:text-white transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      Programs
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : deptList.length * 0.08, ease: "easeOut" }}
            whileHover={{ y: shouldReduceMotion ? 0 : -5, transition: { duration: 0.25, ease: "easeOut" } }}
          >
            <div className="rounded-2xl bg-navy-gradient text-white p-6 h-full flex flex-col justify-between min-h-[300px] relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold-light mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Find Your Program</h3>
                <p className="text-sm text-white/90 leading-relaxed mb-4">
                  Not sure where to start? Use our program finder to discover the right fit for your interests, eligibility, and career goals.
                </p>
              </div>
              <PremiumButton variant="gold" size="sm" className="relative" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Browse All Programs
              </PremiumButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-[#166534] font-bold text-sm mb-0.5">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-[#1F2937] font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}
