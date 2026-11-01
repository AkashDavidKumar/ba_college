"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  Headphones,
  Mail,
  Phone,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";

const STATS = [
  { label: "Overall Placement Record", value: "85%+", highlight: "Consistent Year-on-Year" },
  { label: "Partner Recruiters", value: "65+", highlight: "Top MNCs & Tech Firms" },
  { label: "Highest Package Offered", value: "₹ 6.5 LPA", highlight: "Product & Analytics" },
  { label: "Average Package", value: "₹ 3.2 LPA", highlight: "Entry-Level Trainee" },
];

const RECRUITERS = [
  { name: "Tata Consultancy Services (TCS)", category: "IT & Consulting", role: "Software Engineer / System Associate" },
  { name: "Infosys", category: "IT Services", role: "Operation Executive / Specialist Programmer" },
  { name: "Wipro", category: "IT & Cloud", role: "Project Engineer / Scholar Trainee (WILP)" },
  { name: "Cognizant (CTS)", category: "IT Services", role: "Programmer Trainee / GenC" },
  { name: "Zoho Corporation", category: "Product / SaaS", role: "Software Developer / Technical Support" },
  { name: "Sutherland Global Services", category: "BPO / Consulting", role: "Associate – Customer & Technical Support" },
  { name: "HCL Technologies", category: "IT & Infrastructure", role: "Graduate Engineer Trainee" },
  { name: "ICICI Bank & Prudential", category: "Banking & Finance", role: "Relationship Officer / Senior Officer" },
  { name: "Axis Bank", category: "Banking & Finance", role: "Assistant Manager – Sales & Operations" },
  { name: "Accenture", category: "Consulting", role: "Associate System Engineer" },
  { name: "Capgemini", category: "IT Services", role: "Software Analyst" },
  { name: "Amazon India", category: "E-Commerce", role: "Operations Specialist / Customer Support" },
];

const TRAINING_MODULES = [
  {
    semester: "Semester I & II",
    title: "Foundation & Communicative English",
    desc: "Public speaking, business communication, email etiquette, and interactive grammar enhancement.",
  },
  {
    semester: "Semester III & IV",
    title: "Aptitude & Quantitative Problem Solving",
    desc: "Numerical reasoning, logical deduction, data interpretation, verbal ability, and speed mathematics.",
  },
  {
    semester: "Semester V",
    title: "Technical Coding & Domain Mastery",
    desc: "Hands-on data structures, SQL queries, full-stack frameworks, financial modeling, and mock aptitude tests.",
  },
  {
    semester: "Semester VI",
    title: "Corporate Readiness & Mock Interviews",
    desc: "One-on-one HR interviews with alumni directors, group discussion simulations, and live placement drives.",
  },
];

const PLACED_STORIES = [
  {
    name: "Kavitha Rajan",
    dept: "B.Sc Computer Science (2025)",
    company: "TCS Digital",
    package: "₹ 5.2 LPA",
    quote: "The rigorous coding bootcamp and mock interviews arranged by BAC Placement Cell gave me the confidence to crack the TCS Digital interview.",
  },
  {
    name: "Antony Naveen",
    dept: "B.Com Professional Accounting (2025)",
    company: "ICICI Bank",
    package: "₹ 4.2 LPA",
    quote: "Bishop Ambrose College shaped my financial analysis skills and groomed my professional demeanor for corporate banking roles.",
  },
  {
    name: "Sneha Varadarajan",
    dept: "BCA (2025)",
    company: "Zoho Corporation",
    package: "₹ 5.8 LPA",
    quote: "The faculty guidance on fullstack web development and problem-solving helped me secure a dream developer role at Zoho.",
  },
];

export function PlacementsPage() {
  const [recruiterTab, setRecruiterTab] = useState<string>("All");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="relative bg-navy-dark text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark/90 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-light">Career & Placement Cell</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Briefcase className="w-3.5 h-3.5" /> Empowering Careers
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Training & Placement Cell
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Bridging academia and corporate excellence. Equipping Bishop Ambrose College students with industry-relevant technical competencies, ethical leadership, and premium campus career offers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-12">
        {/* Placement Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2 text-center h-full flex flex-col justify-center">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-navy">
                  {s.value}
                </span>
                <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                <span className="text-[11px] text-gold-dark font-medium">{s.highlight}</span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Training Methodology */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-serif font-bold text-navy">
              Four-Stage Campus Career Readiness Model
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Structured progressive training integrated across all three years of undergraduate education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRAINING_MODULES.map((mod, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <Badge variant="navy">{mod.semester}</Badge>
                  <h4 className="font-bold text-sm text-navy">{mod.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Recruiters Showcase */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-navy">Our Prominent Recruiters</h3>
              <p className="text-xs text-slate-500 mt-1">
                Top national and multinational corporations recruiting from BAC campus.
              </p>
            </div>
            <Badge variant="gold">65+ Campus Partners</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RECRUITERS.map((r, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-gold/40 hover:bg-white transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-navy">{r.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy/5 text-navy font-semibold">
                    {r.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-gold-dark shrink-0" /> {r.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Placement Success Stories */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-serif font-bold text-navy">Placement Success Stories</h3>
            <p className="text-xs text-slate-500">
              Hear directly from our recently placed students across leading enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLACED_STORIES.map((story, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-navy">{story.name}</h4>
                        <p className="text-xs text-slate-500">{story.dept}</p>
                      </div>
                      <Badge variant="gold">{story.package}</Badge>
                    </div>
                    <div className="text-xs font-semibold text-gold-dark">
                      Placed at: {story.company}
                    </div>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      "{story.quote}"
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Recruiter Invitation Desk */}
        <div className="bg-gradient-to-r from-navy via-navy to-navy-dark text-white rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-gold">Invite BAC Placement Cell</h3>
            <p className="text-xs text-white/80 max-w-xl leading-relaxed">
              Are you a corporate recruiter looking to hire dynamic, industry-trained talent from Bishop Ambrose College? Download our placement brochure or connect with our Placement Officer.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:placement@bishopambrosecollege.edu.in"
              className="px-6 py-3 bg-gold text-navy font-bold rounded-xl text-xs hover:bg-gold-light transition-colors shadow-md flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Email Placement Desk
            </a>
            <a
              href="tel:04222310658"
              className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-gold" /> 0422-2310658
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
