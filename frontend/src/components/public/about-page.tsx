"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen, Users, Shield, GitBranch, Target, FileCheck, BarChart2,
  MessageSquare, ChevronRight, Download, Award, Clock, Calendar,
  CheckCircle, Quote, Building2,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { SectionHeading, Reveal } from "@/components/site/primitives";

// ─── Page Banner ─────────────────────────────────────────────────────────────

function PageBanner({
  title, subtitle, section,
}: { title: string; subtitle?: string; section?: string }) {
  return (
    <div className="relative bg-navy-dark text-white py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy/80" />
      <div className="relative container mx-auto px-6">
        <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span>About Us</span>
          {section && <><ChevronRight className="w-3 h-3" /><span className="text-gold-light">{section}</span></>}
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 text-white">{title}</h1>
        {subtitle && <p className="text-white/70 text-base md:text-lg max-w-2xl">{subtitle}</p>}
        <div className="mt-6 flex items-center gap-3 text-xs text-white/50">
          <div className="w-8 h-0.5 bg-gold-dark" />
          <span>Bishop Ambrose College · Autonomous · Affiliated to Bharathiar University</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ABOUT_SECTIONS = {
  history: {
    title: "History of BAC",
    icon: BookOpen,
    content: [
      "Bishop Ambrose College was established in 1994 by the Diocese of Coimbatore, under the inspiring leadership of the late Bishop Rt. Rev. Gnanapragasam. The college was founded with a firm commitment to providing quality higher education with a strong moral and ethical foundation, guided by the motto: Truth · Growth · Knowledge · Excellence.",
      "From its humble beginnings with a handful of programmes and students, the college has grown into a full-fledged autonomous institution offering over 12 undergraduate programmes across Science, Commerce, and Arts disciplines. Affiliated to Bharathiar University, Coimbatore, the college received recognition under Section 2(f) and 12(B) of the UGC Act.",
      "The grant of Autonomous status marked a significant milestone in the college's journey, enabling it to design its own curriculum, conduct examinations, and maintain academic standards that are responsive to the needs of students and the demands of the industry.",
      "Today, Bishop Ambrose College stands as a reputed institution in Tamil Nadu, known for its academic rigour, vibrant student activities, outstanding placements, and deep commitment to holistic education.",
    ],
    timeline: [
      { year: "1994", event: "Bishop Ambrose College established by the Diocese of Coimbatore" },
      { year: "1998", event: "Recognized under Section 2(f) and 12(B) of the UGC Act" },
      { year: "2005", event: "Received Autonomous status from Bharathiar University" },
      { year: "2010", event: "NAAC Accreditation — First Cycle" },
      { year: "2016", event: "NAAC Re-accreditation — Second Cycle with 'B+' Grade" },
      { year: "2022", event: "Launch of new programmes and modern digital infrastructure" },
      { year: "2024", event: "NAAC Third Cycle accreditation — enhanced grade" },
    ],
  },
  secretary: {
    title: "Secretary's Message",
    icon: MessageSquare,
    person: {
      name: "Rev. Fr. A. Susai Raj",
      role: "Secretary, Bishop Ambrose College",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      message: [
        "It is with great joy and pride that I welcome you to Bishop Ambrose College — an institution that has been steadfastly committed to the holistic development of students for over three decades.",
        "Founded on the principles of truth, justice, and compassion, our college continues to uphold the vision of our founder, the late Bishop Rt. Rev. Gnanapragasam. We believe that education is not merely the transfer of knowledge, but the transformation of the whole person.",
        "At Bishop Ambrose College, we nurture academic excellence, ethical values, and social responsibility. Our dedicated faculty, modern infrastructure, and vibrant campus life create an environment where students discover their potential and prepare themselves for meaningful contributions to society.",
        "I invite you to be part of this great institution and to take full advantage of the opportunities it offers. Together, we shall continue to build a brighter future for our students and for Tamil Nadu.",
      ],
    },
  },
  principal: {
    title: "Principal's Message",
    icon: Shield,
    person: {
      name: "Dr. P. Samuel Manoharan",
      role: "Principal, Bishop Ambrose College",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      message: [
        "Welcome to Bishop Ambrose College — a place where dreams take shape, values are formed, and futures are built.",
        "At BAC, we are deeply committed to academic excellence, character formation, and the overall development of our students. Our curriculum is designed to be industry-relevant while remaining rooted in the timeless values of integrity, service, and compassion.",
        "Our faculty are not just teachers — they are mentors, guides, and role models who invest in the success of every student. Through our well-equipped laboratories, digital library, and active student associations, we provide an environment that challenges students to think critically, act ethically, and lead confidently.",
        "As an autonomous institution affiliated to Bharathiar University, we have the privilege of designing programmes that are contemporary, comprehensive, and responsive to emerging trends. I encourage every student to make the most of this opportunity.",
        "I look forward to welcoming you to our vibrant campus community and to partnering with you on your journey of growth and discovery.",
      ],
    },
  },
  governance: {
    title: "Governance",
    icon: Shield,
    committees: [
      { name: "Governing Body",        members: 15, head: "Rev. Fr. Secretary",         desc: "Apex body for strategic governance and institutional direction" },
      { name: "Academic Council",       members: 21, head: "Principal",                  desc: "Academic policy, curriculum oversight, and examination governance" },
      { name: "Finance Committee",      members: 7,  head: "Treasurer",                  desc: "Financial planning, budget approval, and audit oversight" },
      { name: "Internal Complaints Committee", members: 9, head: "Senior Faculty Member", desc: "Prevention and redressal of sexual harassment complaints" },
      { name: "Anti-Ragging Committee",members: 12, head: "Principal",                   desc: "Zero-tolerance policy enforcement and student safety" },
      { name: "IQAC",                  members: 17, head: "IQAC Coordinator",            desc: "Internal quality assurance, academic audits, and NAAC preparation" },
      { name: "Placement Committee",   members: 8,  head: "Placement Officer",           desc: "Industry linkage, campus recruitment, and career guidance" },
      { name: "Library Committee",     members: 6,  head: "Librarian",                   desc: "Library development, resource procurement, and digital initiatives" },
    ],
  },
  organogram: {
    title: "Organogram",
    icon: GitBranch,
    levels: [
      { level: "Diocese of Coimbatore", roles: ["Bishop / Chancellor"] },
      { level: "College Management",    roles: ["Secretary / Manager", "Treasurer"] },
      { level: "Administration",        roles: ["Principal", "Vice-Principal"] },
      { level: "Academic Deans",        roles: ["Dean – Science", "Dean – Commerce", "Dean – Arts"] },
      { level: "Departments (HODs)",    roles: ["Computer Science", "Commerce", "BCA", "English", "Maths", "Biotechnology", "BBA", "B.Com (PA)", "B.Com (CS)", "Visual Communication"] },
      { level: "Support",              roles: ["Administrative Officer", "Librarian", "Controller of Examinations", "Placement Officer", "Student Counsellor", "Sports Director"] },
    ],
  },
  strategic: {
    title: "Strategic Plan 2024–2029",
    icon: Target,
    pillars: [
      { icon: Award,     title: "Academic Excellence",     desc: "Enhance curriculum quality, introduce skill-based courses, strengthen research culture and faculty development programmes." },
      { icon: Users,     title: "Student Development",     desc: "Holistic growth through sports, fine arts, clubs, NSS, NCC, and robust placement and career guidance services." },
      { icon: Building2, title: "Infrastructure Growth",   desc: "Expand digital infrastructure, laboratory upgrades, smart classrooms, and green campus initiatives." },
      { icon: CheckCircle,title: "Quality Assurance",     desc: "Sustain and improve NAAC accreditation status, implement IQAC quality benchmarks, and continuous assessment reforms." },
      { icon: BookOpen,  title: "Research & Innovation",   desc: "Promote faculty research, student projects, publication culture, and industry-academia collaboration." },
      { icon: Shield,    title: "Ethical Governance",      desc: "Transparent, accountable, and value-driven institutional management aligned with regulatory norms." },
    ],
  },
  conduct: {
    title: "Code of Conduct",
    icon: FileCheck,
    sections: [
      {
        title: "Students",
        rules: [
          "Maintain 75% attendance in all courses to appear for examinations.",
          "Dress modestly and in accordance with the college dress code.",
          "Treat all fellow students, faculty, and staff with respect and dignity.",
          "Zero tolerance for ragging, bullying, and any form of harassment.",
          "Mobile phones must be switched off within academic premises.",
          "Obtain prior permission for participation in external events and activities.",
          "Use library, laboratory, and college property responsibly.",
          "Respect the cultural, religious, and linguistic diversity of the community.",
        ],
      },
      {
        title: "Faculty & Staff",
        rules: [
          "Conduct classes punctually and maintain academic integrity.",
          "Provide mentorship and guidance to students under their care.",
          "Submit academic records, reports, and evaluations on time.",
          "Maintain professional conduct in all interactions with students and colleagues.",
          "Participate actively in college committees and institutional development activities.",
          "Engage in continuous professional development and research.",
          "Maintain confidentiality of student records and institutional information.",
        ],
      },
    ],
  },
  "annual-report": {
    title: "Annual Reports",
    icon: BarChart2,
    reports: [
      { year: "2023-24", size: "4.2 MB", pages: 68 },
      { year: "2022-23", size: "3.8 MB", pages: 62 },
      { year: "2021-22", size: "3.5 MB", pages: 58 },
      { year: "2020-21", size: "3.1 MB", pages: 52 },
      { year: "2019-20", size: "2.9 MB", pages: 48 },
      { year: "2018-19", size: "2.6 MB", pages: 45 },
    ],
  },
};

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function HistoryContent() {
  const data = ABOUT_SECTIONS.history;
  return (
    <div className="max-w-5xl mx-auto">
      <div className="prose prose-lg max-w-none mb-12">
        {data.content.map((p, i) => (
          <p key={i} className="text-slate-700 leading-relaxed mb-4">{p}</p>
        ))}
      </div>
      <div>
        <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold-dark" /> Milestones Timeline
        </h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gold/40" />
          <div className="space-y-6">
            {data.timeline.map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="flex gap-6 items-start">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center shadow-md z-10 relative">
                      <span className="text-xs font-bold text-gold-light text-center leading-tight">{t.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-slate-700 font-medium">{t.event}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonMessageContent({ section }: { section: "secretary" | "principal" }) {
  const data = ABOUT_SECTIONS[section];
  const person = (data as any).person;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-navy-dark text-white p-8 md:p-10">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img src={person.image} alt={person.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-gold/30 shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{person.name}</h2>
              <p className="text-gold-light text-sm font-medium">{person.role}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gold-dark" />
                <span className="text-white/60 text-xs">Bishop Ambrose College, Coimbatore</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 w-10 h-10 text-gold/20" />
            <div className="space-y-4 pl-4">
              {person.message.map((p: string, i: number) => (
                <p key={i} className="text-slate-700 leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GovernanceContent() {
  const data = ABOUT_SECTIONS.governance;
  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-slate-600 mb-8 text-lg">
        Bishop Ambrose College operates through a transparent and well-structured governance framework, ensuring academic excellence, student welfare, and institutional accountability.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {data.committees.map((c, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-navy text-base">{c.name}</h3>
                <span className="text-xs bg-gold-light text-navy-dark font-semibold px-2 py-0.5 rounded-full">{c.members} Members</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{c.desc}</p>
              <p className="text-xs text-gold-dark font-semibold">Chair: {c.head}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function OrganogramContent() {
  const data = ABOUT_SECTIONS.organogram;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {data.levels.map((level, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-48 bg-navy-dark text-white rounded-xl p-3 text-center text-sm font-semibold shrink-0">
                {level.level}
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {level.roles.map((role, j) => (
                  <span key={j} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium shadow-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            {i < data.levels.length - 1 && (
              <div className="flex justify-center">
                <div className="w-0.5 h-4 bg-slate-300" />
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function StrategicContent() {
  const data = ABOUT_SECTIONS.strategic;
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-navy-dark text-white rounded-2xl p-8 mb-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Strategic Plan 2024–2029</h2>
        <p className="text-white/70">A five-year roadmap for academic excellence, institutional growth, and student success at Bishop Ambrose College.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-bold text-navy mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function ConductContent() {
  const data = ABOUT_SECTIONS.conduct;
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {data.sections.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-navy px-6 py-4">
            <h3 className="text-white font-bold text-lg">Code of Conduct — {s.title}</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {s.rules.map((rule, j) => (
              <li key={j} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <CheckCircle className="w-4 h-4 text-gold-dark mt-0.5 shrink-0" />
                <span className="text-slate-700 text-sm">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AnnualReportContent() {
  const data = ABOUT_SECTIONS["annual-report"];
  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-slate-600 mb-8">Download Bishop Ambrose College Annual Reports. These reports provide a comprehensive overview of academic, financial, and institutional activities for each academic year.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {data.reports.map((r, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">PDF</span>
                  </div>
                  <span className="font-bold text-navy">Annual Report {r.year}</span>
                </div>
                <p className="text-xs text-slate-500">{r.pages} pages · {r.size}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const ABOUT_NAV = [
  { id: "history",       label: "History of BAC",      icon: BookOpen },
  { id: "secretary",     label: "Secretary's Message",  icon: MessageSquare },
  { id: "principal",     label: "Principal's Message",  icon: Shield },
  { id: "governance",    label: "Governance",           icon: Shield },
  { id: "organogram",    label: "Organogram",           icon: GitBranch },
  { id: "strategic",     label: "Strategic Plan",       icon: Target },
  { id: "conduct",       label: "Code of Conduct",      icon: FileCheck },
  { id: "annual-report", label: "Annual Report",        icon: BarChart2 },
];

// ─── Main export ──────────────────────────────────────────────────────────────

export function AboutPage({ section }: { section?: string }) {
  const { goAbout } = useNav();
  const [activeSection, setActiveSection] = useState(section ?? "history");

  useEffect(() => { if (section) setActiveSection(section); }, [section]);

  const active = ABOUT_NAV.find(n => n.id === activeSection) ?? ABOUT_NAV[0];

  const renderContent = () => {
    switch (activeSection) {
      case "history":       return <HistoryContent />;
      case "secretary":     return <PersonMessageContent section="secretary" />;
      case "principal":     return <PersonMessageContent section="principal" />;
      case "governance":    return <GovernanceContent />;
      case "organogram":    return <OrganogramContent />;
      case "strategic":     return <StrategicContent />;
      case "conduct":       return <ConductContent />;
      case "annual-report": return <AnnualReportContent />;
      default:              return <HistoryContent />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageBanner
        title="About Bishop Ambrose College"
        subtitle="Established in 1994 · Autonomous · Affiliated to Bharathiar University · Co-Education"
        section={active.label}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-navy-dark px-5 py-4">
                <h3 className="text-white font-bold text-sm">About Us</h3>
              </div>
              <nav className="divide-y divide-slate-50">
                {ABOUT_NAV.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveSection(item.id); goAbout(item.id); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left ${activeSection === item.id ? "bg-gold-light text-navy font-semibold border-l-4 border-gold-dark" : "text-slate-600 hover:text-navy hover:bg-slate-50"}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-10 mb-6">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center shrink-0">
                      {(() => { const Icon = active.icon; return <Icon className="w-5 h-5 text-gold-dark" />; })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-navy">{active.label}</h2>
                      <p className="text-xs text-slate-500">Bishop Ambrose College, Coimbatore</p>
                    </div>
                  </div>
                  {renderContent()}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
