"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";

const STATUTORY_BODIES = [
  {
    id: "governing-body",
    title: "Governing Body",
    icon: ShieldCheck,
    desc: "The apex body responsible for policy formulation, institutional planning, approval of academic decisions, budget sanctions, and overall governance of the college.",
    members: [
      { name: "Most Rev. Dr. L. Thomas Aquinas", role: "President / Bishop of Coimbatore", affiliation: "Diocese of Coimbatore" },
      { name: "Rev. Fr. Secretary", role: "Secretary & Correspondent", affiliation: "Bishop Ambrose College" },
      { name: "Dr. A. Peter Raj", role: "Principal & Member Secretary", affiliation: "Bishop Ambrose College" },
      { name: "Prof. University Nominee", role: "UGC / University Nominee", affiliation: "Bharathiar University" },
      { name: "Dr. State Govt Nominee", role: "State Government Nominee", affiliation: "Dept. of Higher Education, TN" },
      { name: "Senior Faculty Members (2)", role: "Teacher Representatives", affiliation: "Bishop Ambrose College" },
    ],
  },
  {
    id: "academic-council",
    title: "Academic Council",
    icon: GraduationCap,
    desc: "Vested with the responsibility of approving all academic regulations, course curricula, syllabi updates, instructional schemes, and examination evaluation standards.",
    members: [
      { name: "Dr. A. Peter Raj", role: "Chairman / Principal", affiliation: "Bishop Ambrose College" },
      { name: "All Heads of Departments", role: "Members", affiliation: "Bishop Ambrose College" },
      { name: "Four External Experts", role: "Industry & Academic Experts", affiliation: "Industry / Academia" },
      { name: "Three BU Nominees", role: "University Nominees", affiliation: "Bharathiar University" },
      { name: "Member Secretary", role: "Senior Faculty Member", affiliation: "Bishop Ambrose College" },
    ],
  },
  {
    id: "board-of-studies",
    title: "Board of Studies (BOS)",
    icon: BookOpen,
    desc: "Constituted for each academic department to prescribe syllabi, reference books, pedagogical methods, project assignments, and question paper patterns.",
    members: [
      { name: "Head of the Department", role: "Chairman BOS", affiliation: "Concerned Department" },
      { name: "All Department Faculty", role: "Members", affiliation: "Bishop Ambrose College" },
      { name: "Two Subject Experts", role: "External Academic Experts", affiliation: "Other Autonomous Colleges / Univ" },
      { name: "One University Nominee", role: "University Representative", affiliation: "Bharathiar University" },
      { name: "One Industry Expert", role: "Corporate / Industry Mentor", affiliation: "Industry" },
      { name: "One Meritorious Alumnus", role: "Alumni Representative", affiliation: "BAC Alumni" },
    ],
  },
  {
    id: "finance-committee",
    title: "Finance Committee",
    icon: Scale,
    desc: "Advises the Governing Body on financial matters, annual budget allocations, autonomy grant utilization, fee structure reviews, and audit statements.",
    members: [
      { name: "Dr. A. Peter Raj", role: "Chairman / Principal", affiliation: "Bishop Ambrose College" },
      { name: "Finance Officer / Bursar", role: "Member", affiliation: "Bishop Ambrose College" },
      { name: "University Nominee (Finance)", role: "BU Representative", affiliation: "Bharathiar University" },
      { name: "Senior Faculty Member", role: "Member", affiliation: "Bishop Ambrose College" },
    ],
  },
];

const AUTONOMY_BENEFITS = [
  {
    title: "Industry-Centric Curriculum",
    desc: "Curricula are updated regularly in consultation with industry leaders to integrate modern technologies like AI, Data Science, Fintech, and Digital Media.",
    icon: Sparkles,
  },
  {
    title: "Choice-Based Credit System (CBCS)",
    desc: "Students can choose open electives, value-added skill courses, and multidisciplinary subjects tailored to their personal career trajectories.",
    icon: Layers,
  },
  {
    title: "Continuous Internal Assessment (CIA)",
    desc: "Holistic evaluation system incorporating quizzes, seminars, model building, case studies, and mini-projects alongside semester exams.",
    icon: FileCheck,
  },
  {
    title: "Timely Results & Transcripts",
    desc: "Dedicated in-house Controller of Examinations (COE) ensures on-schedule examination conduct, swift paper evaluations, and prompt marksheet issuance.",
    icon: Award,
  },
];

const DOWNLOADABLE_REGULATIONS = [
  { title: "Autonomous Academic Regulations (CBCS 2024-25)", size: "2.8 MB", date: "June 2024", tag: "Regulations" },
  { title: "Continuous Internal Assessment (CIA) Guidelines", size: "1.4 MB", date: "August 2024", tag: "Policy" },
  { title: "Curriculum Structure & Credit Distribution Matrix", size: "1.9 MB", date: "May 2024", tag: "Academic" },
  { title: "Code of Ethics for Autonomous Evaluation & Examination", size: "980 KB", date: "July 2024", tag: "COE" },
  { title: "UGC Autonomy Conferment & Extension Orders", size: "3.2 MB", date: "Notification", tag: "Statutory" },
];

export function AutonomousPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedBody, setSelectedBody] = useState(STATUTORY_BODIES[0].id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-navy-dark text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark/90 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-light">Autonomous</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" /> UGC Autonomous Institution
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Autonomous Status & Governance
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Bishop Ambrose College functions with Autonomous status conferred by the University Grants Commission (UGC) and Bharathiar University, empowering academic excellence, contemporary syllabus design, and progressive pedagogy.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm mb-10">
          {[
            { id: "overview", label: "Autonomy Overview", icon: Award },
            { id: "statutory", label: "Statutory Bodies", icon: Users },
            { id: "cbcs", label: "CBCS System & Pedagogy", icon: Layers },
            { id: "regulations", label: "Regulations & Downloads", icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-navy text-white shadow-md"
                    : "text-slate-600 hover:text-navy hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-gold" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            <Reveal>
              <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4 text-slate-600 leading-relaxed">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-gold/15 text-navy font-bold">
                        <Award className="w-6 h-6 text-gold-dark" />
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-navy">
                        Freedom to Excel & Innovate
                      </h2>
                    </div>
                    <p>
                      The conferment of <strong>Autonomous Status</strong> marks a historic milestone in Bishop Ambrose College's journey toward global benchmarks. Autonomy grants our faculty and academic leadership the freedom to continually revitalize syllabus content, conduct advanced research-oriented assessments, and collaborate with leading industries for student internships and capstone projects.
                    </p>
                    <p>
                      While degrees continue to be awarded by <strong>Bharathiar University</strong>, Bishop Ambrose College designs its own curriculum, sets continuous internal evaluation standards, conducts autonomous semester examinations, and issues certified mark statements.
                    </p>
                  </div>

                  <div className="w-full lg:w-80 bg-gradient-to-br from-navy to-navy-dark text-white rounded-2xl p-6 space-y-4 shrink-0 shadow-lg">
                    <h3 className="font-serif font-bold text-lg text-gold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-gold" /> Key Highlights
                    </h3>
                    <ul className="space-y-3 text-xs text-white/80">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>Conferred by UGC & Bharathiar University</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>Outcome-Based Education (OBE) Model</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>Industry-Integrated Skill Certifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>Digitally Automated COE Examination Cell</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Autonomy Benefits Grid */}
            <div>
              <h3 className="text-xl font-serif font-bold text-navy mb-6">
                Direct Benefits of Autonomy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AUTONOMY_BENEFITS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={idx} delay={idx * 0.08}>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold/40 transition-all h-full flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                            <Icon className="w-6 h-6 text-gold-dark" />
                          </div>
                          <h4 className="font-bold text-base text-navy">{item.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Statutory Bodies */}
        {activeTab === "statutory" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar list */}
            <div className="lg:col-span-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
                Governing Authorities
              </h3>
              {STATUTORY_BODIES.map((body) => {
                const Icon = body.icon;
                const isSelected = selectedBody === body.id;
                return (
                  <button
                    key={body.id}
                    onClick={() => setSelectedBody(body.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left font-semibold text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "bg-navy text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-gold" : "text-navy"}`} />
                    <span className="flex-1">{body.title}</span>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-gold" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

            {/* Body Details */}
            <div className="lg:col-span-8">
              {STATUTORY_BODIES.filter((b) => b.id === selectedBody).map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="p-2 rounded-xl bg-navy text-gold">
                        <b.icon className="w-5 h-5" />
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-navy">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{b.desc}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-navy uppercase tracking-wider mb-4">
                      Composition & Members
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                      {b.members.map((m, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                          <div>
                            <p className="font-semibold text-navy text-sm">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.affiliation}</p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-navy/5 text-navy font-semibold text-xs rounded-full sm:self-center">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: CBCS System */}
        {activeTab === "cbcs" && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-2xl font-serif font-bold text-navy">
                Choice Based Credit System (CBCS) & OBE
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Under autonomous status, BAC adopts the UGC-recommended <strong>Choice Based Credit System (CBCS)</strong> combined with an <strong>Outcome-Based Education (OBE)</strong> framework. This structure provides academic flexibility to tailor coursework around individual aptitude and aspirations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-gold-dark uppercase tracking-wide">Category 1</span>
                  <h4 className="font-bold text-navy text-base">Core & Discipline Specific</h4>
                  <p className="text-xs text-slate-600">Fundamental theory and laboratory courses mandatory for achieving core domain mastery.</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-gold-dark uppercase tracking-wide">Category 2</span>
                  <h4 className="font-bold text-navy text-base">Electives & Open Courses</h4>
                  <p className="text-xs text-slate-600">Interdisciplinary electives offered across departments to foster broader intellectual exposure.</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-gold-dark uppercase tracking-wide">Category 3</span>
                  <h4 className="font-bold text-navy text-base">Skill & Ability Enhancement</h4>
                  <p className="text-xs text-slate-600">Value added courses, communicative English, ethical reasoning, computer proficiency & internships.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Regulations & Downloads */}
        {activeTab === "regulations" && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-serif font-bold text-navy">
                Autonomous Handbooks & Official Regulations
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official documents, examination guidelines, and syllabus handbooks for download.
              </p>
            </div>

            <div className="space-y-3">
              {DOWNLOADABLE_REGULATIONS.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-gold/30 hover:bg-slate-50/50 transition-all gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                      <FileText className="w-5 h-5 text-gold-dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-navy">{doc.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Badge variant="navy">{doc.tag}</Badge>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Updated: {doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-dark transition-colors cursor-pointer self-stretch sm:self-auto justify-center">
                    <Download className="w-3.5 h-3.5 text-gold" /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
