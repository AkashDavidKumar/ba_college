"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, FileText, Lightbulb, Award, Star, BookOpen, ChevronRight, Download, CheckCircle, ExternalLink } from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { Reveal } from "@/components/site/primitives";

const IQAC_NAV = [
  { id: "about",          label: "About IQAC",           icon: Shield },
  { id: "members",        label: "IQAC Members",          icon: Users },
  { id: "aqar",           label: "AQAR Report",           icon: FileText },
  { id: "initiatives",    label: "Quality Initiatives",   icon: Lightbulb },
  { id: "best-practices", label: "Best Practices",        icon: Star },
  { id: "ssr",            label: "Self Study Report",     icon: BookOpen },
];

const IQAC_MEMBERS = [
  { name: "Dr. P. Samuel Manoharan", role: "Chairperson (Principal)",         category: "Management" },
  { name: "Rev. Fr. A. Susai Raj",   role: "Management Representative",       category: "Management" },
  { name: "Dr. A. Jeyaraj",          role: "IQAC Coordinator",                category: "Faculty" },
  { name: "Dr. S. Arulraj",          role: "Member (Dean – Commerce)",         category: "Faculty" },
  { name: "Dr. M. Priya",            role: "Member (Dean – Management)",       category: "Faculty" },
  { name: "Dr. R. Sundar",           role: "Member (HOD – Mathematics)",       category: "Faculty" },
  { name: "Dr. L. Kavitha",          role: "Member (HOD – Biotechnology)",     category: "Faculty" },
  { name: "Dr. P. Malar",            role: "Member (HOD – English)",           category: "Faculty" },
  { name: "Mr. K. Vijay",            role: "Administrative Officer",           category: "Administrative" },
  { name: "Ms. G. Anitha",           role: "Student Representative",           category: "Student" },
  { name: "Dr. T. Prasad (Alumni)",  role: "Alumni Representative",            category: "Alumni" },
  { name: "Mr. R. Krishnan",         role: "Industry Expert (IT Sector)",      category: "Industry" },
  { name: "Mr. S. Murugan",          role: "Industry Expert (MSME)",           category: "Industry" },
  { name: "Dr. J. Mercy",            role: "External Expert (Nearby College)", category: "External" },
];

const AQAR_REPORTS = [
  { year: "2023-24", status: "Submitted", grade: "A" },
  { year: "2022-23", status: "Submitted", grade: "A" },
  { year: "2021-22", status: "Submitted", grade: "B+" },
  { year: "2020-21", status: "Submitted", grade: "B+" },
  { year: "2019-20", status: "Submitted", grade: "B" },
];

const QUALITY_INITIATIVES = [
  { title: "Outcome-Based Education (OBE)", desc: "All programmes are mapped to Programme Outcomes (POs), Course Outcomes (COs), and Programme Specific Outcomes (PSOs), ensuring measurable learning goals." },
  { title: "Academic Audit",               desc: "Bi-annual internal academic audit of all departments to review curriculum delivery, faculty performance, and student achievement levels." },
  { title: "Student Feedback System",      desc: "Online feedback collected from students on faculty teaching, curriculum relevance, and infrastructure — used for continuous improvement." },
  { title: "Faculty Development",          desc: "Regular FDPs, workshops, and orientation programmes to enhance teaching competence, research output, and industry awareness." },
  { title: "Green Campus Initiatives",     desc: "Solar panels, waste management, paper reduction drives, and digital administrative processes for an eco-friendly campus." },
  { title: "E-Learning Integration",       desc: "Integration of NPTEL, SWAYAM, and other MOOC platforms into the curriculum for value-added learning opportunities." },
];

const BEST_PRACTICES = [
  {
    title: "Early Career Mentorship Programme",
    desc: "Every student is assigned a faculty mentor who provides academic guidance, career counselling, and personal support throughout the three-year programme.",
    outcomes: ["95% student retention rate", "Significant reduction in examination failures", "Improved student well-being and campus engagement"],
  },
  {
    title: "Industry-Ready Skill Development Programme",
    desc: "A structured skill development initiative in the final year equipping students with soft skills, technical aptitude, and interview readiness before campus placements.",
    outcomes: ["85%+ placement rate for participants", "Industry certifications obtained by 200+ students", "Partnerships with 50+ recruiters for campus drives"],
  },
];

export function IqacPublicPage({ section }: { section?: string }) {
  const { goIqac, goNirf } = useNav();
  const [active, setActive] = useState(section ?? "about");

  const activeItem = IQAC_NAV.find(n => n.id === active) ?? IQAC_NAV[0];

  const renderContent = () => {
    switch (active) {
      case "about":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-navy mb-4">Internal Quality Assurance Cell (IQAC)</h3>
              <div className="space-y-4 text-slate-600">
                <p>The Internal Quality Assurance Cell (IQAC) was established at Bishop Ambrose College in compliance with the guidelines of the National Assessment and Accreditation Council (NAAC). The IQAC serves as the nodal agency for quality initiatives and continuously strives to build a quality culture within the institution.</p>
                <p>The IQAC channels the efforts and measures of the institution towards academic excellence and ensures that quality enhancement becomes a continuous process. It functions as the backbone of institutional quality management, ensuring timely, efficient, and progressive performance of academic, administrative, and financial activities.</p>
                <p>The cell prepares the Annual Quality Assurance Report (AQAR), facilitates peer team visits, and monitors implementation of recommendations from NAAC and other bodies.</p>
              </div>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                {[
                  { label: "Established", value: "2005" },
                  { label: "NAAC Cycles", value: "3 Completed" },
                  { label: "Current Grade", value: "Under Process" },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-navy">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy-dark text-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold mb-3 text-lg">Vision of IQAC</h4>
              <p className="text-white/80 text-sm mb-4">To develop a quality-conscious academic community committed to continuous improvement in teaching-learning processes, research, extension, and institutional governance.</p>
              <h4 className="font-bold mb-3 text-lg">Mission of IQAC</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                {["Ensure quality benchmarks in all institutional activities","Facilitate the creation of a learner-centric environment","Institutionalize best practices for continuous improvement","Prepare AQAR and submit to NAAC annually","Build a quality culture across all departments and committees"].map((m, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-gold-light shrink-0 mt-0.5" />{m}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "members":
        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-navy px-6 py-4"><h3 className="text-white font-bold">IQAC Committee Members 2024-25</h3></div>
            <div className="divide-y divide-slate-50">
              {IQAC_MEMBERS.map((m, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gold-light text-navy-dark font-semibold">{m.category}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        );
      case "aqar":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
              <p className="text-slate-600">The Annual Quality Assurance Report (AQAR) is submitted to NAAC by the IQAC of Bishop Ambrose College annually, documenting all quality initiatives, academic achievements, and institutional progress.</p>
            </div>
            {AQAR_REPORTS.map((r, i) => (
              <Reveal key={r.year} delay={i * 0.06}>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">PDF</span>
                    </div>
                    <div>
                      <p className="font-bold text-navy">AQAR {r.year}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">Status: {r.status}</span>
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded-full">Grade {r.grade}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        );
      case "initiatives":
        return (
          <div className="grid md:grid-cols-2 gap-5">
            {QUALITY_INITIATIVES.map((qi, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center mb-4">
                    <Lightbulb className="w-5 h-5 text-gold-dark" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">{qi.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{qi.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        );
      case "best-practices":
        return (
          <div className="space-y-6">
            {BEST_PRACTICES.map((bp, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy">{bp.title}</h3>
                    <span className="text-xs text-slate-500">Best Practice #{i + 1}</span>
                  </div>
                </div>
                <p className="text-slate-600 mb-5">{bp.desc}</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-navy mb-3">Measurable Outcomes:</p>
                  <ul className="space-y-2">
                    {bp.outcomes.map((o, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />{o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case "ssr":
        return (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-4">Self Study Report (SSR)</h3>
            <p className="text-slate-600 mb-6">The Self Study Report (SSR) is a comprehensive document prepared by Bishop Ambrose College for NAAC accreditation. It covers all aspects of institutional functioning across seven criteria defined by NAAC.</p>
            <div className="space-y-3 mb-6">
              {["Criterion I – Curricular Aspects","Criterion II – Teaching-Learning and Evaluation","Criterion III – Research, Innovations and Extension","Criterion IV – Infrastructure and Learning Resources","Criterion V – Student Support and Progression","Criterion VI – Governance, Leadership and Management","Criterion VII – Institutional Values and Best Practices"].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <span className="text-sm font-medium text-slate-700">{c}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark transition-colors">
              <Download className="w-4 h-4" /> Download SSR (PDF)
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-gold-light">IQAC</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">IQAC</h1>
          <p className="text-white/70">Internal Quality Assurance Cell — ensuring quality, continuous improvement and institutional excellence.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-navy-dark px-5 py-4"><h3 className="text-white font-bold text-sm">IQAC</h3></div>
              <nav className="divide-y divide-slate-50">
                {IQAC_NAV.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => { setActive(item.id); goIqac(item.id); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left ${active === item.id ? "bg-gold-light text-navy font-semibold border-l-4 border-gold-dark" : "text-slate-600 hover:text-navy hover:bg-slate-50"}`}>
                      <Icon className="w-4 h-4 shrink-0" />{item.label}
                    </button>
                  );
                })}
                <button onClick={goNirf}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors text-left">
                  <Award className="w-4 h-4 shrink-0" />NIRF
                </button>
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
