"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Award,
  Users,
  FileText,
  Lightbulb,
  Star,
  BookOpen,
  ChevronRight,
  Download,
  CheckCircle,
  ExternalLink,
  Target,
  Sparkles,
  Eye,
  Calendar,
  Building2,
  FileCheck,
  BarChart2,
  BarChart3,
  Search,
  X,
  Clock,
  ArrowRight,
  Filter,
  Check,
  TrendingUp,
  ClipboardList,
  Microscope,
  FileDown,
  GraduationCap,
  Globe,
  Quote,
  Compass,
  Layers,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import {
  SectionHeading,
  GlassCard,
  AnimatedCounter,
  Reveal,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { cn } from "@/lib/utils";

// ── Navigation Tabs Configuration (Matching About Us Page Layout) ─────────────
export const IQAC_NAV_SECTIONS = [
  { id: "overview",     label: "Overview & Vision",             icon: Eye },
  { id: "members",      label: "IQAC Committee",                icon: Users },
  { id: "initiatives",  label: "Quality Initiatives & Practices",icon: Lightbulb },
  { id: "aqar",         label: "AQAR Reports",                  icon: FileText },
  { id: "ssr",          label: "NAAC Accreditation & SSR",      icon: BookOpen },
  { id: "nirf",         label: "NIRF Rankings",                 icon: Award },
  { id: "governance",   label: "Meeting Minutes & Audits",      icon: ClipboardList },
  { id: "downloads",    label: "Document Center",               icon: FileDown },
];

// Helper to normalize any incoming section parameter (from URL or nav-context)
function resolveSectionId(raw?: string): string {
  if (!raw) return "overview";
  const s = raw.toLowerCase().trim();
  if (s === "about" || s === "overview" || s === "intro") return "overview";
  if (s === "members" || s === "committee" || s === "composition") return "members";
  if (s === "initiatives" || s === "quality-initiatives" || s === "best-practices" || s === "practices") return "initiatives";
  if (s === "aqar" || s === "aqar-reports") return "aqar";
  if (s === "ssr" || s === "naac" || s === "accreditation" || s === "iiqa") return "ssr";
  if (s === "nirf" || s === "rankings" || s === "ranking") return "nirf";
  if (s === "governance" || s === "minutes" || s === "atr" || s === "audit" || s === "audits") return "governance";
  if (s === "downloads" || s === "documents" || s === "reports") return "downloads";
  return "overview";
}

// ── Institutional Static Data ─────────────────────────────────────────────────
export const IQAC_COMMITTEE = [
  {
    name: "Dr. P. Samuel Manoharan",
    role: "Chairperson (Principal)",
    designation: "Principal & Head of Institution",
    category: "Management",
    department: "Executive Council",
    email: "principal@bac.edu.in",
  },
  {
    name: "Rev. Fr. A. Susai Raj",
    role: "Management Representative",
    designation: "Secretary & Correspondent",
    category: "Management",
    department: "Diocese of Coimbatore",
    email: "secretary@bac.edu.in",
  },
  {
    name: "Dr. A. Jeyaraj",
    role: "IQAC Coordinator",
    designation: "Associate Professor, Department of Commerce",
    category: "Faculty & Deans",
    department: "Commerce",
    email: "iqac@bac.edu.in",
  },
  {
    name: "Dr. V. Anitha",
    role: "IQAC Director / Co-Coordinator",
    designation: "Associate Professor, Computer Science",
    category: "Faculty & Deans",
    department: "Computer Science",
    email: "anitha.cs@bac.edu.in",
  },
  {
    name: "Dr. S. Arulraj",
    role: "Senior Administrative Dean",
    designation: "Dean – School of Commerce & Management",
    category: "Faculty & Deans",
    department: "Commerce",
    email: "dean.commerce@bac.edu.in",
  },
  {
    name: "Dr. M. Priya",
    role: "Academic Dean",
    designation: "Dean – School of Management Studies",
    category: "Faculty & Deans",
    department: "Management",
    email: "dean.management@bac.edu.in",
  },
  {
    name: "Dr. R. Sundar",
    role: "Senior Faculty Member",
    designation: "Associate Professor & HOD, Mathematics",
    category: "Faculty & Deans",
    department: "Mathematics",
    email: "hod.maths@bac.edu.in",
  },
  {
    name: "Dr. L. Kavitha",
    role: "Senior Faculty Member",
    designation: "Associate Professor & HOD, Biotechnology",
    category: "Faculty & Deans",
    department: "Biotechnology",
    email: "hod.biotech@bac.edu.in",
  },
  {
    name: "Dr. P. Malar",
    role: "Senior Faculty Member",
    designation: "Associate Professor & HOD, English",
    category: "Faculty & Deans",
    department: "English",
    email: "hod.english@bac.edu.in",
  },
  {
    name: "Mr. K. Vijay",
    role: "Administrative Officer",
    designation: "Office Superintendent & Records Officer",
    category: "Administration",
    department: "Central Administration",
    email: "admin@bac.edu.in",
  },
  {
    name: "Mrs. S. Renuka",
    role: "Finance & Accounts Representative",
    designation: "Accounts Superintendent",
    category: "Administration",
    department: "Accounts & Bursar Office",
    email: "accounts@bac.edu.in",
  },
  {
    name: "Mr. R. Krishnan",
    role: "Industry Expert",
    designation: "Vice President – Engineering, TCS Technologies",
    category: "Industry & External",
    department: "Information Technology",
    email: "external.krishnan@bac.edu.in",
  },
  {
    name: "Mr. S. Murugan",
    role: "Industry Expert",
    designation: "Managing Director, Coimbatore MSME Consortium",
    category: "Industry & External",
    department: "MSME / Industrial Manufacturing",
    email: "external.murugan@bac.edu.in",
  },
  {
    name: "Mr. A. John",
    role: "Corporate Linkage Advisor",
    designation: "Chief Technology Officer, TechCorp India",
    category: "Industry & External",
    department: "Software & Systems",
    email: "external.john@bac.edu.in",
  },
  {
    name: "Dr. J. Mercy",
    role: "External Academic Expert",
    designation: "Former Principal & NAAC Peer Assessor",
    category: "Industry & External",
    department: "Higher Education Quality",
    email: "mercy.eval@bac.edu.in",
  },
  {
    name: "Dr. R. Xavier",
    role: "Affiliating University Nominee",
    designation: "Professor, Bharathiar University, Coimbatore",
    category: "Industry & External",
    department: "University Academic Council",
    email: "xavier.bu@bac.edu.in",
  },
  {
    name: "Dr. T. Prasad",
    role: "Alumni Representative",
    designation: "Senior Lead Data Scientist (Batch of 2008)",
    category: "Alumni & Students",
    department: "BAC Alumni Association",
    email: "alumni.prasad@bac.edu.in",
  },
  {
    name: "Ms. G. Anitha",
    role: "Student Council Representative",
    designation: "Final Year B.Sc Computer Science / Student Secretary",
    category: "Alumni & Students",
    department: "Student Affairs",
    email: "student.rep@bac.edu.in",
  },
];

export const AQAR_REPORTS_DATA = [
  {
    year: "2023–2024",
    status: "Submitted & Approved",
    naacGrade: "A",
    submissionDate: "20 November 2024",
    fileSize: "4.2 MB",
    downloadUrl: "/downloads/aqar-2023-24.pdf",
    highlights: [
      "Successful completion and documentation of NAAC Third Cycle quality parameters",
      "Inauguration of modern computing clusters and high-performance data analytics lab",
      "Five new institutional MoUs executed with leading regional and IT enterprises",
      "Over 88% overall campus placement rate achieved across arts and science streams",
    ],
  },
  {
    year: "2022–2023",
    status: "Submitted & Approved",
    naacGrade: "A",
    submissionDate: "15 October 2023",
    fileSize: "3.8 MB",
    downloadUrl: "/downloads/aqar-2022-23.pdf",
    highlights: [
      "NBA-aligned outcome based education (OBE) curriculum roll-out for undergraduate departments",
      "Hosted 2nd International Multi-Disciplinary Conference with 120+ published papers",
      "Three distinguished faculty research honours awarded by state educational bodies",
      "Implementation of 50 kW rooftop green solar energy generation across science block",
    ],
  },
  {
    year: "2021–2022",
    status: "Submitted & Approved",
    naacGrade: "B+",
    submissionDate: "01 November 2022",
    fileSize: "3.5 MB",
    downloadUrl: "/downloads/aqar-2021-22.pdf",
    highlights: [
      "Comprehensive post-pandemic academic acceleration and digital campus enhancement plan",
      "Enterprise LMS integration and institutional digital repository roll-out",
      "Alignment with National Education Policy (NEP 2020) multidisciplinary credit structure",
      "Formal community outreach expansion covering 14 adopted villages under NSS/YRC",
    ],
  },
  {
    year: "2020–2021",
    status: "Submitted & Approved",
    naacGrade: "B+",
    submissionDate: "30 October 2021",
    fileSize: "3.1 MB",
    downloadUrl: "/downloads/aqar-2020-21.pdf",
    highlights: [
      "Zero academic disruption during pandemic through institutional cloud LMS deployment",
      "Comprehensive digital library expansion granting remote access to N-LIST and DELNET journals",
      "Dedicated mental health, student counselling and peer-mentoring safety protocols",
      "Conducted 45 state-level webinars and digital faculty development workshops",
    ],
  },
  {
    year: "2019–2020",
    status: "Submitted & Approved",
    naacGrade: "B",
    submissionDate: "18 September 2020",
    fileSize: "2.9 MB",
    downloadUrl: "/downloads/aqar-2019-20.pdf",
    highlights: [
      "Initiated smart classroom digitization across arts, commerce, and science wings",
      "State-level youth sports tournament silver medals won in volleyball and athletics",
      "Annual institutional green audit and energy conservation benchmarks formalized",
      "Curriculum syllabus restructuring with mandatory industry internship credits",
    ],
  },
];

export const NAAC_SSR_CYCLES = [
  {
    cycle: "3rd Cycle Accreditation",
    year: "2023–2024",
    grade: "B+",
    cgpa: "2.71",
    status: "Accredited",
    period: "2023 to 2028",
    downloadUrl: "/downloads/ssr-3rd-cycle-2023.pdf",
    fileSize: "12.5 MB",
    summary: "Comprehensive assessment evaluating 7 NAAC criteria under revised accreditation framework, noting substantial advancement in ICT integration and placement performance.",
  },
  {
    cycle: "2nd Cycle Accreditation",
    year: "2016–2017",
    grade: "B",
    cgpa: "2.52",
    status: "Accredited",
    period: "2016 to 2021",
    downloadUrl: "/downloads/ssr-2nd-cycle-2017.pdf",
    fileSize: "9.8 MB",
    summary: "Re-accreditation highlighting strong moral foundation, ethical community outreach, and systematic autonomous examination governance.",
  },
  {
    cycle: "1st Cycle Accreditation",
    year: "2010–2011",
    grade: "B",
    cgpa: "2.40",
    status: "Accredited",
    period: "2011 to 2016",
    downloadUrl: "/downloads/ssr-1st-cycle-2011.pdf",
    fileSize: "7.2 MB",
    summary: "Initial institutional accreditation establishing quality parameters, formalizing IQAC structure, and creating standardized departmental documentation.",
  },
];

export const NAAC_SEVEN_CRITERIA = [
  {
    criterion: "Criterion I",
    title: "Curricular Aspects",
    weightage: "100 Marks",
    desc: "Curriculum design and development, academic flexibility, curriculum enrichment, and structured stakeholder feedback mechanisms.",
  },
  {
    criterion: "Criterion II",
    title: "Teaching-Learning and Evaluation",
    weightage: "350 Marks",
    desc: "Student enrollment profile, catering to student diversity, teaching-learning process, teacher profile, and continuous evaluation reforms.",
  },
  {
    criterion: "Criterion III",
    title: "Research, Innovations and Extension",
    weightage: "110 Marks",
    desc: "Resource mobilization for research, innovation ecosystem, research publications and awards, extension activities, and institutional collaborations.",
  },
  {
    criterion: "Criterion IV",
    title: "Infrastructure and Learning Resources",
    weightage: "100 Marks",
    desc: "Physical facilities, library as a learning resource, IT infrastructure, and institutional maintenance of campus facilities.",
  },
  {
    criterion: "Criterion V",
    title: "Student Support and Progression",
    weightage: "140 Marks",
    desc: "Student support scholarships, capability enhancement, student progression to higher education and employment, and alumni engagement.",
  },
  {
    criterion: "Criterion VI",
    title: "Governance, Leadership and Management",
    weightage: "100 Marks",
    desc: "Institutional vision and leadership, strategy development and deployment, faculty empowerment strategies, and internal financial audits.",
  },
  {
    criterion: "Criterion VII",
    title: "Institutional Values and Best Practices",
    weightage: "100 Marks",
    desc: "Institutional values and social responsibilities, best practices, and institutional distinctiveness reflecting community impact.",
  },
];

export const NIRF_PARTICIPATION_DATA = [
  {
    year: "NIRF 2024",
    category: "College Category",
    status: "Data Submitted",
    dcsReport: "DCS-College-2024.pdf",
    fileSize: "1.8 MB",
    downloadUrl: "/downloads/nirf-dcs-2024.pdf",
    highlights: "Full institutional data uploaded covering faculty demographics, academic expenditures, sponsored research, and 2023 graduating placements.",
  },
  {
    year: "NIRF 2023",
    category: "College Category",
    status: "Data Submitted",
    dcsReport: "DCS-College-2023.pdf",
    fileSize: "1.6 MB",
    downloadUrl: "/downloads/nirf-dcs-2023.pdf",
    highlights: "Documented student diversity, regional intake distribution, and audited financial capital and operational expenditure statements.",
  },
  {
    year: "NIRF 2022",
    category: "College Category",
    status: "Participated",
    dcsReport: "DCS-College-2022.pdf",
    fileSize: "1.4 MB",
    downloadUrl: "/downloads/nirf-dcs-2022.pdf",
    highlights: "Baseline submission documenting faculty-student ratios, higher education progression statistics, and undergraduate placement tracking.",
  },
];

export const NIRF_CORE_PARAMETERS = [
  {
    id: "TLR",
    name: "Teaching, Learning & Resources (TLR)",
    weight: "30%",
    metric: "30 / 100",
    desc: "Assesses student strength including doctoral students, faculty-student ratio emphasizing permanent faculty, faculty qualifications and experience, and financial resources utilization.",
    components: ["Student Strength (SS)", "Faculty-Student Ratio (FSR)", "Combined Metric for Faculty Quality (FQE)", "Financial Resources & Utilization (FRU)"],
  },
  {
    id: "RP",
    name: "Research and Professional Practice (RP)",
    weight: "30%",
    metric: "30 / 100",
    desc: "Evaluates quality and quantity of peer-reviewed publications (Scopus, Web of Science), citation impact, intellectual property (patents granted/published), and sponsored research footprint.",
    components: ["Combined Metric for Publications (PU)", "Combined Metric for Citations (CI)", "Intellectual Property Rights (IPR)", "Sponsored Research Projects (FPSR)"],
  },
  {
    id: "GO",
    name: "Graduation Outcomes (GO)",
    weight: "20%",
    metric: "20 / 100",
    desc: "Focuses on the core academic output: student graduation rate in minimum stipulated time, campus placement rates, median salary of graduates, and progression to top higher-learning institutions.",
    components: ["Metric for University Examinations (GUE)", "Metric for Graduating Students Placement (GPH)", "Median Salary of Placed Graduates (MS)"],
  },
  {
    id: "OI",
    name: "Outreach and Inclusivity (OI)",
    weight: "10%",
    metric: "10 / 100",
    desc: "Measures regional diversity (inter-state & international students), percentage of female students and faculty, facilities for physically challenged students, and economically disadvantaged student support.",
    components: ["Percentage of Students from Other States (RD)", "Percentage of Women Students & Faculty (WD)", "Economically and Socially Challenged Students (ESCS)", "Facilities for Divyangjan (PCS)"],
  },
  {
    id: "PR",
    name: "Peer Perception (PR)",
    weight: "10%",
    metric: "10 / 100",
    desc: "Captures institutional reputation through systematic survey feedback from academic peers across India, corporate employers, and prominent educational stakeholders.",
    components: ["Academic Peer Perception Survey", "Corporate Employer & Recruiter Evaluation", "Public Academic Standing"],
  },
];

export const QUALITY_INITIATIVES_LIST = [
  {
    title: "Outcome-Based Education (OBE) Framework",
    category: "Academic Architecture",
    desc: "All undergraduate and postgraduate programmes are mapped to rigorous Programme Outcomes (POs), Course Outcomes (COs), and Programme Specific Outcomes (PSOs) with quantifiable direct and indirect attainment benchmarks.",
    impact: "100% courses mapped with transparent bloom's taxonomy rubrics",
  },
  {
    title: "Academic & Administrative Audit (AAA)",
    category: "Institutional Governance",
    desc: "Bi-annual comprehensive internal reviews combined with periodic external peer evaluations by senior professors from Bharathiar University to verify curriculum delivery, question paper standards, and laboratory readiness.",
    impact: "Systematic auditing of 12 academic departments and 6 support cells",
  },
  {
    title: "Digital Feedback & Student Satisfaction Survey",
    category: "Stakeholder Analytics",
    desc: "Automated, anonymous multi-stakeholder feedback collected from students, faculty, alumni, and recruiters covering teacher competence, curriculum relevance, campus infrastructure, and placement services.",
    impact: "Annual SSS score of 78.4% with structured action taken reports",
  },
  {
    title: "Faculty Continuous Professional Development (FDP)",
    category: "Faculty Empowerment",
    desc: "Institutional funding, duty leave, and incentive policies encouraging faculty to participate in national/international workshops, SWAYAM-NPTEL certifications, and peer-reviewed research publications.",
    impact: "Average of 18 FDP days per department completed annually",
  },
  {
    title: "Green Ambrose & Sustainable Campus Drive",
    category: "Environmental Stewardship",
    desc: "Rooftop solar panel installation, campus-wide rainwater harvesting, biological compost conversion, energy-efficient LED retrofits, and a strict single-use plastic ban across all facilities.",
    impact: "Recognized as Green Campus compliant with formal annual audits",
  },
  {
    title: "E-Learning & MOOC Curriculum Integration",
    category: "Digital Pedagogy",
    desc: "Direct integration of UGC SWAYAM, NPTEL, and Coursera value-added certificate programmes into autonomous elective slots, enabling students to gain cutting-edge interdisciplinary skills.",
    impact: "Over 450+ students earned national MOOC certifications in 2023–24",
  },
  {
    title: "Industry Linkages & Corporate MoUs",
    category: "Industry Partnerships",
    desc: "Active academic partnerships and MoUs with Tata Consultancy Services (TCS), Infosys, Wipro, and regional MSME associations providing experiential guest lectures, hackathons, and internship avenues.",
    impact: "15 active corporate MoUs powering guaranteed internship pipelines",
  },
  {
    title: "Research & Innovation Incubation Cell",
    category: "Scholarly Research",
    desc: "Dedicated institutional seed funding, ethical clearance guidelines, and mentorship to encourage student-faculty collaborative research projects, patent filings, and conference presentations.",
    impact: "65+ research papers published in Scopus and UGC-CARE listed journals",
  },
];

export const BEST_PRACTICES_LIST = [
  {
    title: "Early Career Mentorship & Holistic Guidance Programme",
    practiceNo: 1,
    tag: "Student Centricity",
    desc: "Every student upon admission is assigned a dedicated faculty mentor who provides one-on-one academic counseling, psychological encouragement, study-path monitoring, and career guidance across their entire degree journey.",
    outcomes: [
      "95% sustained student retention rate and zero dropout in tracked cohorts",
      "Noticeable reduction in semester exam backlogs through timely remedial sessions",
      "Immediate detection and resolution of student emotional or academic distress",
      "Stronger bond between parents, students, and faculty via periodic reviews",
    ],
  },
  {
    title: "Industry-Ready Skill Development & Placement Accelerator",
    practiceNo: 2,
    tag: "Career Empowerment",
    desc: "A structured, 60-hour pre-placement training curriculum integrated into the pre-final and final semesters, covering quantitative aptitude, logical reasoning, verbal communication, mock interviews, and specialized software certifications.",
    outcomes: [
      "85%+ consistent campus placement record across eligible graduating students",
      "200+ industry-recognized certifications secured by students annually",
      "Onboarding of 50+ premier corporate recruiters for annual campus drives",
      "Significant boost in median salary offers and multi-offer selections",
    ],
  },
];

export const MEETING_MINUTES_DATA = [
  {
    meetingNo: "IQAC Meeting 2024–Q3",
    date: "14 September 2024",
    academicYear: "2024–2025",
    agenda: "Review of NAAC 3rd cycle peer committee recommendations, initiation of revised AQAR 2023-24 documentation, and approval of new industry MoU proposals.",
    atrAction: "Established sub-committees for criterion-wise AQAR data consolidation; signed 2 new corporate agreements with regional manufacturing firms.",
    minutesUrl: "/downloads/iqac-minutes-2024-q3.pdf",
    atrUrl: "/downloads/iqac-atr-2024-q3.pdf",
  },
  {
    meetingNo: "IQAC Meeting 2024–Q1",
    date: "08 March 2024",
    academicYear: "2023–2024",
    agenda: "Evaluation of annual Student Satisfaction Survey (SSS) responses, departmental curriculum audit reports, and expansion of smart learning commons.",
    atrAction: "Conducted departmental debriefings on SSS feedback; sanctioned budgetary allocation for 6 additional interactive smart projection panels.",
    minutesUrl: "/downloads/iqac-minutes-2024-q1.pdf",
    atrUrl: "/downloads/iqac-atr-2024-q1.pdf",
  },
  {
    meetingNo: "IQAC Meeting 2023–Q4",
    date: "12 December 2023",
    academicYear: "2023–2024",
    agenda: "Preparation for external Academic and Administrative Audit (AAA) by Bharathiar University peer committee and review of semester examination pass percentages.",
    atrAction: "Formulated schedule for departmental mock audits; implemented mandatory remedial classes for slow learners in quantitative disciplines.",
    minutesUrl: "/downloads/iqac-minutes-2023-q4.pdf",
    atrUrl: "/downloads/iqac-atr-2023-q4.pdf",
  },
  {
    meetingNo: "IQAC Meeting 2023–Q2",
    date: "22 June 2023",
    academicYear: "2023–2024",
    agenda: "Annual academic plan formulation, approval of faculty development calendar, and review of autonomous curriculum restructuring for odd semester.",
    atrAction: "Notified academic calendar 2023–24; scheduled 4 multidisciplinary FDPs across science, humanities, and commerce departments.",
    minutesUrl: "/downloads/iqac-minutes-2023-q2.pdf",
    atrUrl: "/downloads/iqac-atr-2023-q2.pdf",
  },
];

export const MASTER_DOWNLOAD_DOCS = [
  { id: "aqar-23-24", title: "Annual Quality Assurance Report (AQAR) 2023–2024", category: "AQAR", year: "2023–2024", size: "4.2 MB", url: "/downloads/aqar-2023-24.pdf" },
  { id: "aqar-22-23", title: "Annual Quality Assurance Report (AQAR) 2022–2023", category: "AQAR", year: "2022–2023", size: "3.8 MB", url: "/downloads/aqar-2022-23.pdf" },
  { id: "aqar-21-22", title: "Annual Quality Assurance Report (AQAR) 2021–2022", category: "AQAR", year: "2021–2022", size: "3.5 MB", url: "/downloads/aqar-2021-22.pdf" },
  { id: "aqar-20-21", title: "Annual Quality Assurance Report (AQAR) 2020–2021", category: "AQAR", year: "2020–2021", size: "3.1 MB", url: "/downloads/aqar-2020-21.pdf" },
  { id: "ssr-c3", title: "NAAC Self Study Report (SSR) — 3rd Cycle (2023)", category: "NAAC SSR", year: "2023", size: "12.5 MB", url: "/downloads/ssr-3rd-cycle-2023.pdf" },
  { id: "ssr-c2", title: "NAAC Self Study Report (SSR) — 2nd Cycle (2017)", category: "NAAC SSR", year: "2017", size: "9.8 MB", url: "/downloads/ssr-2nd-cycle-2017.pdf" },
  { id: "naac-peer-23", title: "NAAC Peer Team Evaluation Report (3rd Cycle)", category: "NAAC SSR", year: "2023", size: "3.2 MB", url: "/downloads/naac-peer-report-2023.pdf" },
  { id: "nirf-dcs-24", title: "NIRF 2024 Data Capturing System (DCS) Full Report", category: "NIRF", year: "2024", size: "1.8 MB", url: "/downloads/nirf-dcs-2024.pdf" },
  { id: "nirf-dcs-23", title: "NIRF 2023 Data Capturing System (DCS) Full Report", category: "NIRF", year: "2023", size: "1.6 MB", url: "/downloads/nirf-dcs-2023.pdf" },
  { id: "nirf-dcs-22", title: "NIRF 2022 Data Capturing System (DCS) Full Report", category: "NIRF", year: "2022", size: "1.4 MB", url: "/downloads/nirf-dcs-2022.pdf" },
  { id: "min-2024-q3", title: "Minutes of IQAC Statutory Meeting & ATR (Sep 2024)", category: "Minutes & ATR", year: "2024", size: "1.2 MB", url: "/downloads/iqac-minutes-2024-q3.pdf" },
  { id: "min-2024-q1", title: "Minutes of IQAC Statutory Meeting & ATR (Mar 2024)", category: "Minutes & ATR", year: "2024", size: "1.1 MB", url: "/downloads/iqac-minutes-2024-q1.pdf" },
  { id: "aaa-audit-24", title: "Academic & Administrative Audit (AAA) External Report 2024", category: "Audits", year: "2024", size: "2.4 MB", url: "/downloads/aaa-audit-2024.pdf" },
  { id: "sss-survey-24", title: "Student Satisfaction Survey (SSS) Comprehensive Analysis 2024", category: "Audits", year: "2024", size: "1.7 MB", url: "/downloads/sss-report-2024.pdf" },
  { id: "ugc-autonomy", title: "UGC Order of Extension of Autonomous Status", category: "Statutory", year: "2022", size: "1.9 MB", url: "/downloads/ugc-autonomy-order.pdf" },
  { id: "acad-calendar", title: "Institutional Academic Calendar & Quality Roadmap 2024–25", category: "Statutory", year: "2024", size: "1.1 MB", url: "/downloads/academic-calendar-2024.pdf" },
];

// ── Reusable Stat Card (Matching About Us Page DeptStat Style) ────────────────
function IqacStat({
  icon,
  value,
  suffix = "",
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  suffix?: string;
  label: string;
}) {
  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold-dark mb-3">
        {icon}
      </div>
      <div>
        <div className="font-serif text-2xl sm:text-3xl font-bold text-navy flex items-baseline">
          {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
          {suffix && <span className="text-gold-dark ml-0.5">{suffix}</span>}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>
    </GlassCard>
  );
}

// ── Document Modal Component ──────────────────────────────────────────────────
function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: { title: string; category: string; year?: string; size?: string; url: string };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-navy-dark text-white border-b border-navy/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gold-light" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light">
                {doc.category} · Verified Institutional Record
              </span>
              <h3 className="font-serif font-bold text-base truncate">{doc.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 flex-1 overflow-y-auto bg-slate-50 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-xs">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h4 className="font-serif font-bold text-navy text-xl mb-2 max-w-lg">{doc.title}</h4>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-navy/5 text-navy font-semibold">
              Category: {doc.category}
            </span>
            {doc.year && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gold/15 text-gold-dark font-semibold">
                Academic Year: {doc.year}
              </span>
            )}
            {doc.size && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                File Size: {doc.size}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
            Official institutional quality assurance document authenticated by the IQAC Directorate, Bishop Ambrose College. Preserved under statutory records for NAAC, NIRF, and Bharathiar University inspections.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={doc.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy hover:bg-navy-dark text-white font-semibold text-xs shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Download Document (PDF)
            </a>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all"
            >
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main IQAC & NIRF Page Component ───────────────────────────────────────────
export function IqacPublicPage({
  section,
  initialSection,
}: {
  section?: string;
  initialSection?: string;
}) {
  const { goHome, goNirf, goAdmissions, goContact } = useNav();

  // Active section state
  const [activeSection, setActiveSection] = useState(() =>
    resolveSectionId(section || initialSection || "overview")
  );

  // Sync if section prop changes externally (e.g. user clicks dropdown item)
  useEffect(() => {
    if (section) {
      setActiveSection(resolveSectionId(section));
    }
  }, [section]);

  // Tab change handler with smooth auto-scroll to the sticky bar
  const handleTabChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      const navEl = document.getElementById("iqac-tab-nav");
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

  const currentNav =
    IQAC_NAV_SECTIONS.find((s) => s.id === activeSection) || IQAC_NAV_SECTIONS[0];

  // Committee Member Category Filter
  const [memberCategory, setMemberCategory] = useState<string>("All");
  const filteredMembers = useMemo(() => {
    if (memberCategory === "All") return IQAC_COMMITTEE;
    return IQAC_COMMITTEE.filter((m) => m.category === memberCategory);
  }, [memberCategory]);

  // Document Center Filter & Search
  const [docCategory, setDocCategory] = useState<string>("All");
  const [docSearch, setDocSearch] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    category: string;
    year?: string;
    size?: string;
    url: string;
  } | null>(null);

  const filteredDocs = useMemo(() => {
    return MASTER_DOWNLOAD_DOCS.filter((d) => {
      const matchesCat = docCategory === "All" || d.category === docCategory;
      const matchesSearch =
        !docSearch.trim() ||
        d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
        d.category.toLowerCase().includes(docSearch.toLowerCase()) ||
        (d.year && d.year.includes(docSearch));
      return matchesCat && matchesSearch;
    });
  }, [docCategory, docSearch]);

  return (
    <div className="bg-background min-h-screen">
      {/* ── 1. Top Breadcrumb Bar (Matching About Us Page) ──────────────── */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span>Quality & Accreditation</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">{currentNav.label}</span>
        </div>
      </div>

      {/* ── 2. Hero Section (Matching About Us Page Hero Layout) ────────── */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80"
            alt="Bishop Ambrose College Quality Assurance & Institutional Rankings"
            className="w-full h-full object-cover opacity-80"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 47, 32, 0.65) 0%, rgba(0, 47, 32, 0.45) 50%, rgba(0, 47, 32, 0.80) 100%)",
            }}
          />
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 blob bg-gold/10 pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-emerald-500/10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            {/* Left Column (8 cols): Title & Description */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-navy text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-light" />
                  QUALITY ASSURANCE & INSTITUTIONAL RANKINGS
                </div>
                <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-5">
                  Internal Quality Assurance Cell (IQAC) & NIRF
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                  Driving continuous educational enhancement, transparent academic governance, and transformative student outcomes at Bishop Ambrose College. Serving as the statutory nodal body for NAAC accreditation, NIRF participation, and institutional benchmark compliance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton
                    variant="gold"
                    size="lg"
                    onClick={() => handleTabChange("nirf")}
                    icon={<Award className="w-4 h-4" />}
                  >
                    NIRF Rankings & Reports
                  </PremiumButton>
                  <PremiumButton
                    variant="outline-light"
                    size="lg"
                    onClick={() => handleTabChange("aqar")}
                    icon={<FileText className="w-4 h-4" />}
                  >
                    Annual Quality Reports (AQAR)
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10"
                    icon={<FileDown className="w-4 h-4" />}
                    onClick={() => handleTabChange("downloads")}
                  >
                    Document Archive
                  </PremiumButton>
                </div>
              </motion.div>
            </div>

            {/* Right Column (4 cols): 2x2 Quick Stats Grid (Matching About Us) */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <IqacStat
                  icon={<Award className="w-4 h-4" />}
                  value="B+"
                  suffix=" (2.71)"
                  label="NAAC 3rd Cycle Grade"
                />
                <IqacStat
                  icon={<Calendar className="w-4 h-4" />}
                  value={2005}
                  label="IQAC Established"
                />
                <IqacStat
                  icon={<ShieldCheck className="w-4 h-4" />}
                  value={100}
                  suffix="%"
                  label="NAAC AQAR Compliance"
                />
                <IqacStat
                  icon={<BarChart3 className="w-4 h-4" />}
                  value="Active"
                  label="NIRF College Participant"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Sticky Navigation Tabs (Matching About Us Page Sticky Bar) ── */}
      <div
        id="iqac-tab-nav"
        className="sticky top-16 lg:top-20 z-30 glass-strong border-y border-navy/8 shadow-premium"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav
            role="tablist"
            aria-label="IQAC and NIRF navigation"
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium py-2.5"
          >
            {IQAC_NAV_SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              const IconComp = s.icon;
              return (
                <button
                  key={s.id}
                  id={`tab-${s.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${s.id}`}
                  onClick={() => handleTabChange(s.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-[#14532D] text-white shadow-md shadow-[#14532D]/20 scale-102"
                      : "text-navy hover:bg-navy/8 hover:text-[#14532D]"
                  )}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── 4. Main Tabbed Content Sections ───────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* ──────── SECTION 1: OVERVIEW & VISION ──────────────────────── */}
            {activeSection === "overview" && (
              <section id="panel-overview" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Quality Assurance & Institutional Ethos"
                  title={
                    <>
                      Stewardship of Academic <span className="text-gold-gradient">Excellence</span>
                    </>
                  }
                  description="The Internal Quality Assurance Cell (IQAC) at Bishop Ambrose College functions as the apex catalyst for continuous improvement across pedagogy, research, and institutional integrity."
                  align="left"
                />

                {/* 3 Pillars: Vision, Mission, Mandate */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Reveal delay={0.05}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold-dark">
                            <Eye className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Vision of IQAC</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          To develop a quality-conscious, value-driven academic community committed to continuous innovation in teaching-learning methodologies, scholarly inquiry, community extension, and transparent institutional governance.
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-gold-dark">
                        <Sparkles className="w-3.5 h-3.5" />
                        NAAC-Aligned Continuous Quality
                      </div>
                    </GlassCard>
                  </Reveal>

                  <Reveal delay={0.12}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-navy/8 flex items-center justify-center text-navy">
                            <Target className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Mission of IQAC</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          To establish benchmark standards for academic and administrative operations, foster a learner-centric environment, institutionalize best practices, ensure timely AQAR reporting, and promote participatory quality culture across all departments.
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-navy">
                        <CheckCircle className="w-3.5 h-3.5" />
                        5 Core Action Objectives
                      </div>
                    </GlassCard>
                  </Reveal>

                  <Reveal delay={0.18}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-navy">Statutory Role</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Constituted as per National Assessment and Accreditation Council (NAAC) guidelines, IQAC serves as the nodal agency for coordinating quality-related activities, disseminating educational information, and spearheading NIRF data audits.
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-navy/8 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <Building2 className="w-3.5 h-3.5" />
                        Established in 2005
                      </div>
                    </GlassCard>
                  </Reveal>
                </div>

                {/* Editorial Split Section: About IQAC & Statutory Functions */}
                <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs">
                  <div className="lg:col-span-6 space-y-4 text-slate-700 leading-relaxed text-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                      <Layers className="w-3.5 h-3.5" />
                      About The Quality Cell
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                      Building a Culture of Measurable Academic Accountability
                    </h3>
                    <p>
                      The Internal Quality Assurance Cell (IQAC) was formally established at Bishop Ambrose College in compliance with the quality mandate of the National Assessment and Accreditation Council (NAAC). Over two decades, the Cell has evolved from an administrative reporting conduit into an active engine of pedagogical innovation and institutional strategy.
                    </p>
                    <p>
                      The IQAC channels institutional measures towards academic excellence, ensuring that quality enhancement is an ingrained daily discipline rather than an intermittent audit event. It supervises the Annual Quality Assurance Report (AQAR), monitors peer team visit compliance, and liaises directly with Bharathiar University and statutory regulatory bodies.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-navy bg-slate-50 px-3.5 py-2 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        NAAC 3rd Cycle Accredited
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-navy bg-slate-50 px-3.5 py-2 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Autonomous Status Active
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-navy bg-slate-50 px-3.5 py-2 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        NIRF College Category
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80">
                    <h4 className="font-serif font-bold text-navy text-lg mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-gold-dark" />
                      Core Functions & Statutory Responsibilities
                    </h4>
                    <div className="space-y-3.5">
                      {[
                        "Development and application of quality benchmarks across teaching, evaluation, and research.",
                        "Facilitating the creation of a learner-centric environment conducive to quality education and faculty development.",
                        "Systematic arrangement for collection and analysis of stakeholder feedback from students, parents, and employers.",
                        "Organization of inter and intra institutional workshops, seminars, and quality circles.",
                        "Documentation of all institutional programmes leading to quality improvement.",
                        "Preparation and timely submission of the Annual Quality Assurance Report (AQAR) to NAAC.",
                      ].map((fn, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span>{fn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 2: IQAC COMMITTEE MEMBERS ─────────────────── */}
            {activeSection === "members" && (
              <section id="panel-members" role="tabpanel" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <SectionHeading
                    eyebrow="Statutory Composition"
                    title={
                      <>
                        IQAC Committee <span className="text-gold-gradient">2024–2025</span>
                      </>
                    }
                    description="Composed in strict adherence to NAAC guidelines with representation from management, distinguished senior faculty, administration, local industry, alumni, and student council."
                    align="left"
                  />

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl self-start">
                    {["All", "Management", "Faculty & Deans", "Administration", "Industry & External", "Alumni & Students"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMemberCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                          memberCategory === cat
                            ? "bg-[#14532D] text-white shadow-xs"
                            : "text-slate-600 hover:text-navy hover:bg-slate-100"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Executive Directorate Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-navy-dark to-[#002f20] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-gold-light/20 text-gold-light text-xs font-bold uppercase tracking-wider border border-gold-light/30">
                        Chairperson
                      </span>
                      <span className="text-xs text-white/70">Executive Authority</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-1">
                      Dr. P. Samuel Manoharan
                    </h3>
                    <p className="text-gold-light text-xs font-semibold mb-4">
                      Principal & Head of Institution
                    </p>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6">
                      Provides strategic leadership to the Internal Quality Assurance Cell, presiding over all statutory review sessions, NAAC compliance, and institutional vision alignment.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/70 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gold-light" /> principal@bac.edu.in
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold-light" /> Principal&apos;s Secretariat
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                          Coordinator
                        </span>
                        <span className="text-xs text-slate-500">Directorate Head</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-navy mb-1">
                        Dr. A. Jeyaraj
                      </h3>
                      <p className="text-emerald-700 text-xs font-semibold mb-4">
                        Associate Professor & IQAC Coordinator
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                        Coordinates day-to-day operations of the Cell, spearheading AQAR data synthesis, academic audit schedules, OBE attainment analytics, and NIRF dossier compilation.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-700" /> iqac@bac.edu.in
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" /> IQAC Central Directorate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Committee Directory Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((m, idx) => (
                    <Reveal key={idx} delay={idx * 0.03}>
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {m.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {m.department}
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-navy/8 text-navy flex items-center justify-center shrink-0 font-bold text-sm">
                              {m.name.charAt(0) === "D" ? "Dr" : m.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-navy text-sm leading-snug">{m.name}</h4>
                              <p className="text-xs font-medium text-emerald-800 mt-0.5">{m.role}</p>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.designation}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate">{m.email}</span>
                          <span className="text-emerald-700 font-semibold shrink-0">Member</span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 3: QUALITY INITIATIVES & PRACTICES ───────── */}
            {activeSection === "initiatives" && (
              <section id="panel-initiatives" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Continuous Enhancement"
                  title={
                    <>
                      Institutional Quality <span className="text-gold-gradient">Initiatives</span>
                    </>
                  }
                  description="Structured interventions spanning outcome-based curricula, faculty professional development, environmental sustainability, and holistic student mentoring."
                  align="left"
                />

                {/* 8 Initiatives Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {QUALITY_INITIATIVES_LIST.map((qi, i) => (
                    <Reveal key={i} delay={i * 0.04}>
                      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {qi.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active Benchmark
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg sm:text-xl text-navy mb-2.5">
                            {qi.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                            {qi.desc}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50/70 p-3 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>Measurable Output:</strong> {qi.impact}</span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {/* Institutional Best Practices (Full Editorial Layout) */}
                <div className="pt-6 space-y-6">
                  <div className="border-b border-navy/10 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                      NAAC Criterion VII · Best Practices
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy mt-1">
                      Institutionalized Flagship Practices
                    </h3>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {BEST_PRACTICES_LIST.map((bp, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-3xl border border-slate-100 p-7 shadow-xs flex flex-col justify-between space-y-6"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
                              Practice #{bp.practiceNo}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{bp.tag}</span>
                          </div>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-navy mb-3">
                            {bp.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {bp.desc}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                            Verified Measurable Outcomes
                          </p>
                          <ul className="space-y-2">
                            {bp.outcomes.map((o, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 4: AQAR REPORTS ───────────────────────────── */}
            {activeSection === "aqar" && (
              <section id="panel-aqar" role="tabpanel" className="space-y-8">
                <SectionHeading
                  eyebrow="Annual NAAC Compliance"
                  title={
                    <>
                      Annual Quality Assurance <span className="text-gold-gradient">Reports</span>
                    </>
                  }
                  description="The Annual Quality Assurance Report (AQAR) is prepared and submitted annually to the National Assessment and Accreditation Council (NAAC), documenting institutional growth, academic milestones, and quality benchmarks."
                  align="left"
                />

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold-dark shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-navy mb-1">
                        Statutory Submission Record
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Under NAAC governance mandates, Bishop Ambrose College submits comprehensive Annual Quality Assurance Reports. Each dossier encapsulates institutional milestones, outcome-based attainment measures, financial resources allocation, and community engagement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* AQAR List Cards */}
                <div className="space-y-4">
                  {AQAR_REPORTS_DATA.map((r, idx) => (
                    <Reveal key={r.year} delay={idx * 0.05}>
                      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex flex-col items-center justify-center shrink-0 border border-rose-100">
                              <span className="text-[10px] font-black uppercase">PDF</span>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-serif text-xl font-bold text-navy">
                                  AQAR Dossier — {r.year}
                                </h4>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                                  Grade {r.naacGrade}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Submitted on: <strong className="text-slate-700">{r.submissionDate}</strong> · Status: <span className="text-emerald-700 font-semibold">{r.status}</span> · File Size: {r.fileSize}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button
                              onClick={() =>
                                setPreviewDoc({
                                  title: `AQAR Dossier — ${r.year}`,
                                  category: "AQAR",
                                  year: r.year,
                                  size: r.fileSize,
                                  url: r.downloadUrl,
                                })
                              }
                              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors cursor-pointer"
                            >
                              Quick Preview
                            </button>
                            <a
                              href={r.downloadUrl}
                              download
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-navy hover:bg-navy-dark text-white rounded-xl shadow-xs transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        </div>

                        {/* Highlights Accordion/Grid */}
                        <div className="pt-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Key Institutional Highlights Documented
                          </p>
                          <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                            {r.highlights.map((h, j) => (
                              <div key={j} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {/* ──────── SECTION 5: NAAC ACCREDITATION & SSR ─────────────────── */}
            {activeSection === "ssr" && (
              <section id="panel-ssr" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="NAAC Peer Recognition"
                  title={
                    <>
                      Accreditation Cycles & <span className="text-gold-gradient">Self Study Reports</span>
                    </>
                  }
                  description="Bishop Ambrose College has completed three consecutive cycles of NAAC assessment, reflecting continuous advancement in academic infrastructure and research quality."
                  align="left"
                />

                {/* 3 Accreditation Cycles Progression Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {NAAC_SSR_CYCLES.map((c, idx) => (
                    <Reveal key={c.cycle} delay={idx * 0.06}>
                      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {c.status}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{c.year}</span>
                          </div>
                          <h3 className="font-serif font-bold text-xl text-navy mb-2">
                            {c.cycle}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-serif text-3xl font-extrabold text-navy">
                              Grade {c.grade}
                            </span>
                            {c.cgpa && (
                              <span className="text-xs font-semibold text-gold-dark bg-gold/15 px-2 py-0.5 rounded-md">
                                CGPA: {c.cgpa}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-4 font-medium">
                            Validity Period: {c.period}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed mb-6">
                            {c.summary}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() =>
                              setPreviewDoc({
                                title: `NAAC SSR Dossier — ${c.cycle}`,
                                category: "NAAC SSR",
                                year: c.year,
                                size: c.fileSize,
                                url: c.downloadUrl,
                              })
                            }
                            className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-center cursor-pointer"
                          >
                            Preview
                          </button>
                          <a
                            href={c.downloadUrl}
                            download
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-navy hover:bg-navy-dark text-white rounded-xl shadow-xs transition-colors text-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {/* 7 NAAC Assessment Criteria Breakdown */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                      Accreditation Architecture
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy mt-1">
                      Seven Assessment Criteria Defined by NAAC
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                      The institutional Self Study Report (SSR) rigorously documents academic delivery, physical infrastructure, governance transparency, and student progression across the seven core criteria established by NAAC.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NAAC_SEVEN_CRITERIA.map((crit, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                              {crit.criterion}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {crit.weightage}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-navy text-base mb-1.5">
                            {crit.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{crit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Official SSR dossiers are accessible in the college repository and NAAC portal.
                    </p>
                    <a
                      href="/downloads/ssr-3rd-cycle-2023.pdf"
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-dark text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      Download Complete 3rd Cycle SSR Dossier (PDF)
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 6: NIRF SECTION (VISUALLY DISTINCT) ───────── */}
            {activeSection === "nirf" && (
              <section id="panel-nirf" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="National Institutional Ranking Framework"
                  title={
                    <>
                      NIRF Participation & <span className="text-gold-gradient">Data Disclosures</span>
                    </>
                  }
                  description="Bishop Ambrose College actively participates in the National Institutional Ranking Framework (NIRF) under the Ministry of Education, Government of India, affirming our commitment to academic transparency."
                  align="left"
                />

                {/* About NIRF Distinctive Editorial Block */}
                <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs">
                  <div className="lg:col-span-7 space-y-4 text-slate-700 leading-relaxed text-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider mb-2">
                      <Award className="w-3.5 h-3.5" />
                      Ministry of Education (MoE), Government of India
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                      National Institutional Ranking Framework (NIRF)
                    </h3>
                    <p>
                      The National Institutional Ranking Framework (NIRF) was approved and launched by the Ministry of Education (formerly MHRD), Government of India, to establish objective parameters for ranking higher education institutions across the country.
                    </p>
                    <p>
                      Bishop Ambrose College consistently submits institutional data for the <strong>&ldquo;College&rdquo; Category</strong>. Our participation reflects strict accountability, verified faculty-student ratios, transparent financial audits, and validated placement statistics.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="https://www.nirfindia.org"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy hover:bg-navy-dark text-white text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit Official NIRF Portal (nirfindia.org)
                      </a>
                      <a
                        href="/downloads/nirf-dcs-2024.pdf"
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-navy/30 text-navy hover:bg-navy/5 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download 2024 Data Sheet (PDF)
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-gradient-to-br from-navy-dark to-[#002f20] text-white rounded-2xl p-6 sm:p-8 space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light">
                      Institution Code & Category
                    </span>
                    <h4 className="font-serif text-xl font-bold text-white">
                      Bishop Ambrose College (BAC)
                    </h4>
                    <div className="space-y-2 text-xs text-white/80 pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <strong className="text-white">College</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Affiliation:</span>
                        <strong className="text-white">Bharathiar University</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <strong className="text-white">Coimbatore, Tamil Nadu</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Participation Years:</span>
                        <strong className="text-gold-light">2022, 2023, 2024</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Status:</span>
                        <strong className="text-emerald-300">Verified by Core Committee</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NIRF Submission Dossiers List */}
                <div className="space-y-4">
                  <div className="border-b border-navy/10 pb-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy">
                      Submitted NIRF Data Capturing System (DCS) Reports
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {NIRF_PARTICIPATION_DATA.map((d, i) => (
                      <Reveal key={d.year} delay={i * 0.05}>
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                                {d.status}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{d.category}</span>
                            </div>
                            <h4 className="font-serif font-bold text-xl text-navy mb-2">
                              {d.year}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">
                              {d.highlights}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Report: {d.dcsReport}</span>
                              <span>{d.fileSize}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setPreviewDoc({
                                    title: `${d.year} — NIRF College Data Sheet`,
                                    category: "NIRF",
                                    year: d.year,
                                    size: d.fileSize,
                                    url: d.downloadUrl,
                                  })
                                }
                                className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-center cursor-pointer"
                              >
                                Preview
                              </button>
                              <a
                                href={d.downloadUrl}
                                download
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-navy hover:bg-navy-dark text-white rounded-xl shadow-xs transition-colors text-center"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                {/* 5 NIRF Parameters Breakdown */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                      Ranking Methodology
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy mt-1">
                      Core NIRF Ranking Parameters & Weightages
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                      NIRF assesses higher education institutions across five key parameters with designated percentage weightages, drawing upon data verified by institutional statutory officers.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {NIRF_CORE_PARAMETERS.map((p, idx) => (
                      <div
                        key={p.id}
                        className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-xs font-bold text-navy bg-navy/10 px-2 py-0.5 rounded-md">
                              {p.id}
                            </span>
                            <span className="text-xs font-bold text-gold-dark bg-gold/15 px-2.5 py-0.5 rounded-full">
                              Weightage: {p.weight}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-navy text-base mb-2">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">{p.desc}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-200/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Key Evaluation Metrics
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.components.map((c, j) => (
                              <span
                                key={j}
                                className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 7: MEETING MINUTES & AUDITS ───────────────── */}
            {activeSection === "governance" && (
              <section id="panel-governance" role="tabpanel" className="space-y-12">
                <SectionHeading
                  eyebrow="Academic Audits & Compliance"
                  title={
                    <>
                      Meeting Minutes & <span className="text-gold-gradient">Audit Dossiers</span>
                    </>
                  }
                  description="Quarterly statutory minutes, verified Action Taken Reports (ATR), Academic and Administrative Audits (AAA), and annual Student Satisfaction Survey analytics."
                  align="left"
                />

                {/* Meeting Minutes & ATR Table/Cards */}
                <div className="space-y-4">
                  <div className="border-b border-navy/10 pb-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy">
                      Quarterly IQAC Statutory Minutes & Action Taken Reports (ATR)
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {MEETING_MINUTES_DATA.map((m, i) => (
                      <Reveal key={m.meetingNo} delay={i * 0.05}>
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                {m.academicYear}
                              </span>
                              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {m.date}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-xl text-navy mb-3">
                              {m.meetingNo}
                            </h4>
                            <div className="space-y-3 text-xs leading-relaxed">
                              <div className="bg-slate-50 p-3 rounded-xl">
                                <p className="font-bold text-navy mb-1 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-gold-dark" />
                                  Agenda & Deliberations:
                                </p>
                                <p className="text-slate-600">{m.agenda}</p>
                              </div>
                              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                                <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                  Action Taken Report (ATR):
                                </p>
                                <p className="text-emerald-900/90">{m.atrAction}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex gap-2">
                            <a
                              href={m.minutesUrl}
                              download
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Minutes (PDF)
                            </a>
                            <a
                              href={m.atrUrl}
                              download
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-navy hover:bg-navy-dark text-white rounded-xl shadow-xs transition-colors text-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              ATR (PDF)
                            </a>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                {/* Academic & Administrative Audit (AAA) and SSS Block */}
                <div className="grid lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                      Peer Review Mechanism
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-navy">
                      Academic & Administrative Audit (AAA)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Bi-annual audits evaluate curriculum transaction, lab safety, question paper standards, and faculty publication records. Audits are executed in two tiers: Internal Departmental Verification followed by External Peer Review by senior university academicians.
                    </p>
                    <div className="space-y-2 pt-2">
                      {[
                        "Continuous Outcome-Based Education (OBE) course outcome attainment verification.",
                        "Laboratory equipment log books, calibration certificates, and stock register verification.",
                        "Analysis of slow and advanced learners identification rubrics and remedial outcomes.",
                        "Departmental research proposal submissions and intellectual property evaluation.",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">
                        Student Satisfaction Survey (SSS) 2023–24
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Overall Score: 78.4%
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Aggregated anonymous feedback gathered from over 1,200 enrolled undergraduate and postgraduate scholars across six quality criteria.
                    </p>

                    <div className="space-y-3 pt-2">
                      {[
                        { label: "Teaching-Learning Quality & Pedagogy", score: 82 },
                        { label: "Placement, Internships & Career Mentoring", score: 85 },
                        { label: "Extracurricular, Sports & Cultural Vibrancy", score: 79 },
                        { label: "Physical Infrastructure, Labs & Smart Rooms", score: 76 },
                        { label: "Library, Digital Journals & E-Resources", score: 74 },
                        { label: "Hostel, Campus Safety & Student Welfare", score: 71 },
                      ].map((metric, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{metric.label}</span>
                            <span className="text-navy">{metric.score}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#14532D] to-emerald-500 rounded-full"
                              style={{ width: `${metric.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ──────── SECTION 8: DOCUMENT CENTER ────────────────────────── */}
            {activeSection === "downloads" && (
              <section id="panel-downloads" role="tabpanel" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <SectionHeading
                    eyebrow="Public Institutional Archive"
                    title={
                      <>
                        IQAC & NIRF <span className="text-gold-gradient">Document Center</span>
                      </>
                    }
                    description="Official public repository containing authenticated PDF documents, accreditation certificates, AQAR dossiers, and NIRF Data Capturing System submissions."
                    align="left"
                  />

                  {/* Search Bar */}
                  <div className="relative min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search dossiers, reports, years..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#14532D] font-medium"
                    />
                    {docSearch && (
                      <button
                        onClick={() => setDocSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl self-start">
                  {["All", "AQAR", "NAAC SSR", "NIRF", "Minutes & ATR", "Audits", "Statutory"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setDocCategory(cat)}
                      className={cn(
                        "px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                        docCategory === cat
                          ? "bg-[#14532D] text-white shadow-xs"
                          : "text-slate-600 hover:text-navy hover:bg-slate-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Filtered Documents Table/List */}
                {filteredDocs.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No Documents Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No documents match your filter &ldquo;{docCategory}&rdquo; or query &ldquo;{docSearch}&rdquo;. Try clearing filters.
                    </p>
                    <button
                      onClick={() => {
                        setDocCategory("All");
                        setDocSearch("");
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredDocs.map((doc, idx) => (
                      <Reveal key={doc.id} delay={idx * 0.03}>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex flex-col items-center justify-center shrink-0 border border-rose-100">
                              <span className="text-[9px] font-black uppercase">PDF</span>
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {doc.category}
                                </span>
                                {doc.year && (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {doc.year}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-navy text-sm leading-snug line-clamp-2">
                                {doc.title}
                              </h4>
                              {doc.size && (
                                <p className="text-[11px] text-slate-400 mt-1">Size: {doc.size}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="flex-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-center cursor-pointer"
                            >
                              Preview
                            </button>
                            <a
                              href={doc.url}
                              download
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold bg-navy hover:bg-navy-dark text-white rounded-xl shadow-xs transition-colors text-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 5. Bottom Accreditation & Institutional Contact Banner ───────── */}
      <section className="bg-slate-900 text-white py-14 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
                Statutory Quality Directorate
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Bishop Ambrose College Quality Assurance & Compliance
              </h3>
              <p className="text-white/75 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Autonomous Institution Affiliated to Bharathiar University · Approved by UGC under Section 2(f) & 12(B) · Re-accredited by NAAC with &ldquo;B+&rdquo; Grade · Participating Institution in NIRF College Category.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-white/80">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gold-light" />
                  <span>iqac@bac.edu.in</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gold-light" />
                  <span>College Campus, College Road, Sungam, Coimbatore – 641045</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <PremiumButton
                variant="gold"
                size="md"
                onClick={() => handleTabChange("nirf")}
                icon={<Award className="w-4 h-4" />}
              >
                Explore NIRF Disclosures
              </PremiumButton>
              <PremiumButton
                variant="outline-light"
                size="md"
                onClick={goContact}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Contact IQAC Directorate
              </PremiumButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Document Preview Modal ─────────────────────────────────────── */}
      {previewDoc && (
        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}
