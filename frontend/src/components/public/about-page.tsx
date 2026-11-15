"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  BookOpen, Users, Shield, GitBranch, Target, FileCheck, BarChart2,
  MessageSquare, ChevronRight, Download, Award, Clock, Calendar,
  CheckCircle, Quote, Building2, ArrowRight,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  forest: "#01472e",
  sage: "#ccd5ae",
  olive: "#e9edc9",
  cream: "#fefae0",
  moss: "#a3b18a",
};

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── SVG Noise Overlay ────────────────────────────────────────────────────────
const NoiseOverlay = () => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9998,
      pointerEvents: "none",
      opacity: 0.04,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 100 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating organic image card ───────────────────────────────────────────────
function FloatCard({
  src, alt, style, speed = 0.05,
}: { src: string; alt: string; style?: React.CSSProperties; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        borderRadius: "3rem",
        overflow: "hidden",
        boxShadow: `0 25px 50px -12px rgba(1,71,46,0.25)`,
        animation: "floatCard 6s ease-in-out infinite",
        transform: `translateY(${scrollY * speed}px)`,
        ...style,
      }}
    >
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
      { name: "Governing Body",               members: 15, head: "Rev. Fr. Secretary",        desc: "Apex body for strategic governance and institutional direction" },
      { name: "Academic Council",             members: 21, head: "Principal",                 desc: "Academic policy, curriculum oversight, and examination governance" },
      { name: "Finance Committee",            members: 7,  head: "Treasurer",                 desc: "Financial planning, budget approval, and audit oversight" },
      { name: "Internal Complaints Committee",members: 9,  head: "Senior Faculty Member",     desc: "Prevention and redressal of sexual harassment complaints" },
      { name: "Anti-Ragging Committee",       members: 12, head: "Principal",                 desc: "Zero-tolerance policy enforcement and student safety" },
      { name: "IQAC",                         members: 17, head: "IQAC Coordinator",          desc: "Internal quality assurance, academic audits, and NAAC preparation" },
      { name: "Placement Committee",          members: 8,  head: "Placement Officer",         desc: "Industry linkage, campus recruitment, and career guidance" },
      { name: "Library Committee",            members: 6,  head: "Librarian",                 desc: "Library development, resource procurement, and digital initiatives" },
    ],
  },
  organogram: {
    title: "Organogram",
    icon: GitBranch,
    levels: [
      { level: "Diocese of Coimbatore", roles: ["Bishop / Chancellor"] },
      { level: "College Management",    roles: ["Secretary / Manager", "Treasurer"] },
      { level: "Administration",        roles: ["Principal", "Vice-Principal"] },
      { level: "Academic Deans",        roles: ["Dean — Science", "Dean — Commerce", "Dean — Arts"] },
      { level: "Departments (HODs)",    roles: ["Computer Science", "Commerce", "BCA", "English", "Maths", "Biotechnology", "BBA", "B.Com (PA)", "B.Com (CS)", "Visual Communication"] },
      { level: "Support",              roles: ["Administrative Officer", "Librarian", "Controller of Examinations", "Placement Officer", "Student Counsellor", "Sports Director"] },
    ],
  },
  strategic: {
    title: "Strategic Plan 2024–2029",
    icon: Target,
    pillars: [
      { icon: Award,      title: "Academic Excellence",   desc: "Enhance curriculum quality, introduce skill-based courses, strengthen research culture and faculty development programmes." },
      { icon: Users,      title: "Student Development",   desc: "Holistic growth through sports, fine arts, clubs, NSS, NCC, and robust placement and career guidance services." },
      { icon: Building2,  title: "Infrastructure Growth", desc: "Expand digital infrastructure, laboratory upgrades, smart classrooms, and green campus initiatives." },
      { icon: CheckCircle,title: "Quality Assurance",     desc: "Sustain and improve NAAC accreditation status, implement IQAC quality benchmarks, and continuous assessment reforms." },
      { icon: BookOpen,   title: "Research & Innovation", desc: "Promote faculty research, student projects, publication culture, and industry-academia collaboration." },
      { icon: Shield,     title: "Ethical Governance",    desc: "Transparent, accountable, and value-driven institutional management aligned with regulatory norms." },
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

// ─── Nav config ───────────────────────────────────────────────────────────────
const ABOUT_NAV = [
  { id: "history",      label: "History of BAC",       icon: BookOpen },
  { id: "secretary",    label: "Secretary's Message",   icon: MessageSquare },
  { id: "principal",    label: "Principal's Message",   icon: Shield },
  { id: "governance",   label: "Governance",            icon: Shield },
  { id: "organogram",   label: "Organogram",            icon: GitBranch },
  { id: "strategic",    label: "Strategic Plan",        icon: Target },
  { id: "conduct",      label: "Code of Conduct",       icon: FileCheck },
  { id: "annual-report",label: "Annual Report",         icon: BarChart2 },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HERO_LETTERS = "BISHOP AMBROSE COLLEGE".split("");

function AboutHero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        background: C.sage,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: "5rem",
      }}
    >
      {/* Background decorative layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "60%",
          height: "70%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.moss}55 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "-8%",
          width: "45%",
          height: "55%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.olive}88 0%, transparent 70%)`,
        }} />
      </div>

      {/* Floating organic images */}
      <FloatCard
        src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=70"
        alt="Campus building"
        speed={0.04}
        style={{ width: 220, height: 280, top: "12%", right: "8%", zIndex: 2 }}
      />
      <FloatCard
        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=320&q=70"
        alt="Graduation ceremony"
        speed={0.07}
        style={{ width: 170, height: 210, top: "22%", right: "30%", zIndex: 1, animationDelay: "2s" }}
      />
      <FloatCard
        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=70"
        alt="Students"
        speed={0.03}
        style={{ width: 150, height: 190, top: "55%", right: "5%", zIndex: 2, animationDelay: "1s" }}
      />

      {/* Giant display text */}
      <div style={{ position: "relative", zIndex: 3, padding: "0 4vw" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            lineHeight: 0.75,
            letterSpacing: "-0.05em",
            marginBottom: "4rem",
          }}
        >
          {"BISHOP AMBROSE COLLEGE".split(" ").map((word, wi) => (
            <span key={wi} style={{ display: "block", width: "100%", overflow: "hidden" }}>
              {word.split("").map((letter, li) => (
                <motion.span
                  key={li}
                  style={{
                    display: "inline-block",
                    fontFamily: "'Anton', 'Impact', sans-serif",
                    fontSize: "clamp(3rem, 15vw, 14rem)",
                    color: C.forest,
                    lineHeight: 0.85,
                  }}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    ease: EASE,
                    delay: (wi * 8 + li) * 0.04,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </div>

        {/* Bottom dual-column text */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "900px" }}>
          <Reveal delay={0.6}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.95rem",
              color: C.forest,
              lineHeight: 1.7,
              opacity: 0.85,
            }}>
              Empowering generations of students through excellence in education,
              character formation, and service since 1994. Affiliated to Bharathiar
              University · NAAC Accredited · Autonomous Institution.
            </p>
          </Reveal>
          <Reveal delay={0.75}>
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: C.forest,
                opacity: 0.6,
                marginBottom: "0.5rem",
              }}>
                LOCATION / ORIGIN
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: C.forest,
              }}>
                Coimbatore, Tamil Nadu
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.forest,
                opacity: 0.6,
                marginTop: "1rem",
              }}>
                Est. 1994 · Co-Education
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── History Content ──────────────────────────────────────────────────────────
function HistoryContent() {
  const data = ABOUT_SECTIONS.history;
  return (
    <div>
      <div style={{ marginBottom: "3rem" }}>
        {data.content.map((p, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.05rem",
              color: C.forest,
              lineHeight: 1.8,
              marginBottom: "1.5rem",
              opacity: 0.9,
            }}>
              {p}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <h3 style={{
          fontFamily: "'Anton', 'Impact', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: C.forest,
          letterSpacing: "-0.02em",
          marginBottom: "2rem",
        }}>
          MILESTONES
        </h3>
      </Reveal>

      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute",
          left: "2rem",
          top: 0,
          bottom: 0,
          width: "2px",
          background: `linear-gradient(to bottom, ${C.moss}, ${C.sage})`,
        }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {data.timeline.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                <div style={{
                  flexShrink: 0,
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "50%",
                  background: C.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: `0 4px 20px rgba(1,71,46,0.3)`,
                }}>
                  <span style={{
                    fontFamily: "'Anton', sans-serif",
                    fontSize: "0.6rem",
                    color: C.sage,
                    letterSpacing: "0.05em",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}>
                    {t.year}
                  </span>
                </div>
                <div style={{
                  flex: 1,
                  background: "white",
                  borderRadius: "1rem",
                  padding: "1rem 1.5rem",
                  boxShadow: `0 4px 20px rgba(1,71,46,0.08)`,
                  border: `1px solid ${C.sage}66`,
                }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    color: C.forest,
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}>
                    {t.event}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Person Message Content ───────────────────────────────────────────────────
function PersonMessageContent({ section }: { section: "secretary" | "principal" }) {
  const data = ABOUT_SECTIONS[section];
  const person = (data as any).person;
  return (
    <div>
      <Reveal>
        <div style={{
          borderRadius: "2.5rem",
          overflow: "hidden",
          boxShadow: `0 25px 60px rgba(1,71,46,0.15)`,
          border: `1px solid ${C.sage}`,
        }}>
          {/* Header */}
          <div style={{
            background: C.forest,
            padding: "2.5rem",
            display: "flex",
            gap: "2rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <img
              src={person.image}
              alt={person.name}
              style={{
                width: "7rem",
                height: "7rem",
                borderRadius: "1.5rem",
                objectFit: "cover",
                border: `3px solid ${C.sage}44`,
                flexShrink: 0,
              }}
            />
            <div>
              <h2 style={{
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                color: C.sage,
                letterSpacing: "-0.02em",
                marginBottom: "0.25rem",
              }}>
                {person.name}
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: C.moss,
              }}>
                {person.role}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                <div style={{ width: "2rem", height: "2px", background: C.moss }} />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  color: `${C.sage}88`,
                  letterSpacing: "0.1em",
                }}>
                  BISHOP AMBROSE COLLEGE, COIMBATORE
                </span>
              </div>
            </div>
          </div>

          {/* Message body */}
          <div style={{ background: C.cream, padding: "2.5rem" }}>
            <div style={{ position: "relative" }}>
              <svg
                viewBox="0 0 48 48"
                style={{ width: "3rem", height: "3rem", color: `${C.moss}55`, marginBottom: "1rem" }}
                fill="currentColor"
              >
                <path d="M12 32q-3.3 0-5.65-2.35T4 24q0-2.6.9-4.9T7.5 14.75l5.5-5.5L14.6 11.35l-4.1 4.1Q11 15.95 11 17.5t1 2.5H14q1.65 0 2.825 1.175T18 24v3q0 1.65-1.175 2.825T14 31.0Zm16 0q-3.3 0-5.65-2.35T20 24q0-2.6.9-4.9t2.6-4.35l5.5-5.5 1.6 1.65-4.1 4.1q-.5.55-.5 2.1t1 2.5h3.1q1.65 0 2.825 1.175T34 24v3q0 1.65-1.175 2.825T30 31.0Z"/>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {person.message.map((p: string, i: number) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      color: C.forest,
                      lineHeight: 1.8,
                      fontSize: "1rem",
                      opacity: 0.9,
                    }}>
                      {p}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ─── Governance Content ───────────────────────────────────────────────────────
function GovernanceContent() {
  const data = ABOUT_SECTIONS.governance;
  return (
    <div>
      <Reveal>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          color: C.forest,
          fontSize: "1.05rem",
          lineHeight: 1.7,
          marginBottom: "2.5rem",
          opacity: 0.85,
        }}>
          Bishop Ambrose College operates through a transparent and well-structured governance framework,
          ensuring academic excellence, student welfare, and institutional accountability.
        </p>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {data.committees.map((c, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <div style={{
              background: "white",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              border: `1px solid ${C.sage}66`,
              boxShadow: `0 4px 20px rgba(1,71,46,0.07)`,
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px rgba(1,71,46,0.18)`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px rgba(1,71,46,0.07)`;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  color: C.forest,
                  fontSize: "0.95rem",
                }}>
                  {c.name}
                </h3>
                <span style={{
                  background: C.sage,
                  color: C.forest,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.1em",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: "0.5rem",
                }}>
                  {c.members} members
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: `${C.forest}bb`, lineHeight: 1.6, marginBottom: "0.5rem" }}>
                {c.desc}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: C.moss, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Chair: {c.head}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── Organogram Content ───────────────────────────────────────────────────────
function OrganogramContent() {
  const data = ABOUT_SECTIONS.organogram;
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {data.levels.map((level, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{
                flexShrink: 0,
                minWidth: "12rem",
                background: C.forest,
                color: C.sage,
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                textAlign: "center",
              }}>
                {level.level}
              </div>
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {level.roles.map((role, j) => (
                  <span key={j} style={{
                    background: C.olive,
                    border: `1px solid ${C.sage}`,
                    borderRadius: "0.5rem",
                    padding: "0.4rem 0.75rem",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem",
                    color: C.forest,
                    fontWeight: 500,
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
            {i < data.levels.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                <div style={{ width: "2px", height: "1rem", background: C.moss }} />
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── Strategic Plan Content ───────────────────────────────────────────────────
function StrategicContent() {
  const data = ABOUT_SECTIONS.strategic;
  return (
    <div>
      <Reveal>
        <div style={{
          background: C.forest,
          borderRadius: "2.5rem",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Anton', 'Impact', sans-serif",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            color: C.sage,
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            STRATEGIC PLAN 2024–2029
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            color: `${C.sage}bb`,
            fontSize: "0.95rem",
            lineHeight: 1.7,
          }}>
            A five-year roadmap for academic excellence, institutional growth, and student success at Bishop Ambrose College.
          </p>
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {data.pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <div
                style={{
                  background: "white",
                  border: `1px solid ${C.sage}66`,
                  borderRadius: "1.5rem",
                  padding: "1.75rem",
                  boxShadow: `0 4px 20px rgba(1,71,46,0.07)`,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(1,71,46,0.2)`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px rgba(1,71,46,0.07)`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.875rem",
                  background: C.sage,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}>
                  <Icon style={{ width: "1.25rem", height: "1.25rem", color: C.forest }} />
                </div>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  color: C.forest,
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}>
                  {p.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  color: `${C.forest}99`,
                  lineHeight: 1.6,
                }}>
                  {p.desc}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

// ─── Code of Conduct ──────────────────────────────────────────────────────────
function ConductContent() {
  const data = ABOUT_SECTIONS.conduct;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {data.sections.map((s, i) => (
        <Reveal key={i} delay={i * 0.1}>
          <div style={{
            background: "white",
            borderRadius: "2rem",
            overflow: "hidden",
            border: `1px solid ${C.sage}66`,
            boxShadow: `0 4px 20px rgba(1,71,46,0.08)`,
          }}>
            <div style={{ background: C.forest, padding: "1.25rem 1.75rem" }}>
              <h3 style={{
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: "1.3rem",
                color: C.sage,
                letterSpacing: "0.05em",
              }}>
                CODE OF CONDUCT — {s.title.toUpperCase()}
              </h3>
            </div>
            <ul>
              {s.rules.map((rule, j) => (
                <li key={j} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.875rem 1.75rem",
                  borderBottom: j < s.rules.length - 1 ? `1px solid ${C.sage}44` : "none",
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: "1.25rem",
                    height: "1.25rem",
                    borderRadius: "50%",
                    background: C.sage,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "0.1rem",
                  }}>
                    <CheckCircle style={{ width: "0.75rem", height: "0.75rem", color: C.forest }} />
                  </div>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    color: C.forest,
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    opacity: 0.9,
                  }}>
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ─── Annual Reports ───────────────────────────────────────────────────────────
function AnnualReportContent() {
  const data = ABOUT_SECTIONS["annual-report"];
  return (
    <div>
      <Reveal>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          color: C.forest,
          opacity: 0.8,
          lineHeight: 1.7,
          marginBottom: "2rem",
          fontSize: "1rem",
        }}>
          Download Bishop Ambrose College Annual Reports. These reports provide a comprehensive overview of academic, financial, and institutional activities for each academic year.
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {data.reports.map((r, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "white",
                borderRadius: "1.25rem",
                padding: "1.25rem 1.75rem",
                border: `1px solid ${C.sage}66`,
                boxShadow: `0 2px 12px rgba(1,71,46,0.06)`,
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "0.875rem",
                  background: C.sage,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <BarChart2 style={{ width: "1.1rem", height: "1.1rem", color: C.forest }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Anton', 'Impact', sans-serif",
                    fontSize: "1.1rem",
                    color: C.forest,
                    letterSpacing: "0.02em",
                  }}>
                    Annual Report {r.year}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    color: `${C.forest}88`,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    {r.pages} pages · {r.size}
                  </div>
                </div>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: C.forest,
                  color: C.sage,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.8")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              >
                <Download style={{ width: "0.875rem", height: "0.875rem" }} />
                Download
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── Leadership / Cream section ───────────────────────────────────────────────
function LeadershipStrip() {
  return (
    <section style={{
      background: C.cream,
      borderRadius: "5rem 5rem 0 0",
      padding: "5rem 4vw",
      marginTop: "-2rem",
      position: "relative",
      zIndex: 2,
    }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: C.moss,
            background: `${C.sage}66`,
            padding: "0.4rem 1.2rem",
            borderRadius: "9999px",
            marginBottom: "1.5rem",
          }}>
            OUR LEADERSHIP
          </span>
          <h2 style={{
            fontFamily: "'Anton', 'Impact', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            color: C.forest,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
          }}>
            VOICES OF<br />WISDOM
          </h2>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        {(["secretary", "principal"] as const).map((key, i) => {
          const data = ABOUT_SECTIONS[key];
          const person = (data as any).person;
          return (
            <Reveal key={key} delay={i * 0.15}>
              <div style={{
                background: "white",
                borderRadius: "2.5rem",
                overflow: "hidden",
                boxShadow: `0 20px 60px rgba(1,71,46,0.12)`,
                border: `1px solid ${C.sage}66`,
              }}>
                <div style={{ background: C.forest, padding: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <img
                    src={person.image}
                    alt={person.name}
                    style={{ width: "4rem", height: "4rem", borderRadius: "1rem", objectFit: "cover", border: `2px solid ${C.sage}44`, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{
                      fontFamily: "'Anton', 'Impact', sans-serif",
                      fontSize: "1.1rem",
                      color: C.sage,
                      letterSpacing: "-0.01em",
                    }}>
                      {person.name}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: C.moss,
                      marginTop: "0.2rem",
                    }}>
                      {person.role}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1.75rem" }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    color: C.forest,
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                    opacity: 0.85,
                  }}>
                    {person.message[0]}
                  </p>
                  <div style={{ marginTop: "1.25rem" }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: C.moss,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}>
                      <div style={{ width: "1.5rem", height: "1px", background: C.moss }} />
                      Read full message
                      <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main About Page ──────────────────────────────────────────────────────────
export function AboutPage({ section }: { section?: string }) {
  const { goAbout } = useNav();
  const [activeSection, setActiveSection] = useState(section ?? "history");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div style={{ background: C.cream, minHeight: "100vh", overflowX: "hidden" }}>
      <NoiseOverlay />

      {/* ── Hero ── */}
      <AboutHero />

      {/* ── Leadership strip ── */}
      <LeadershipStrip />

      {/* ── Main content (olive bg, rounded top) ── */}
      <section style={{
        background: C.olive,
        borderRadius: "5rem 5rem 0 0",
        padding: "5rem 4vw 6rem",
        position: "relative",
        zIndex: 3,
      }}>
        {/* Section eyebrow */}
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2rem", marginBottom: "4rem", flexWrap: "wrap" }}>
            <h2 style={{
              fontFamily: "'Anton', 'Impact', sans-serif",
              fontSize: "clamp(2.5rem, 10vw, 7rem)",
              color: C.forest,
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              flex: "1 1 300px",
            }}>
              ABOUT US
            </h2>
            {/* Circular CTA */}
            <div style={{
              width: "7rem",
              height: "7rem",
              borderRadius: "50%",
              border: `2px solid ${C.forest}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = C.forest;
                (e.currentTarget as HTMLDivElement).style.color = C.sage;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
                (e.currentTarget as HTMLDivElement).style.color = C.forest;
              }}
            >
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textAlign: "center",
                color: "inherit",
                lineHeight: 1.4,
              }}>
                EXPLORE<br />MORE
              </span>
            </div>
          </div>
        </Reveal>

        {/* Content grid: sidebar + main */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Sidebar nav */}
          <aside style={{
            width: "240px",
            flexShrink: 0,
            position: "sticky",
            top: "5.5rem",
            background: "white",
            borderRadius: "2rem",
            overflow: "hidden",
            boxShadow: `0 8px 32px rgba(1,71,46,0.1)`,
            border: `1px solid ${C.sage}66`,
          }}>
            <div style={{ background: C.forest, padding: "1rem 1.25rem" }}>
              <span style={{
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: "0.9rem",
                color: C.sage,
                letterSpacing: "0.1em",
              }}>
                ABOUT US
              </span>
            </div>
            <nav>
              {ABOUT_NAV.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); goAbout(item.id); }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.875rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.82rem",
                      color: isActive ? C.forest : `${C.forest}88`,
                      background: isActive ? C.sage : "transparent",
                      borderLeft: isActive ? `4px solid ${C.forest}` : "4px solid transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Icon style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content panel */}
          <main style={{ flex: "1 1 300px", minWidth: 0 }}>
            {/* Section header */}
            <Reveal>
              <div style={{
                background: C.forest,
                borderRadius: "2rem 2rem 0 0",
                padding: "1.75rem 2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}>
                <div style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.75rem",
                  background: C.sage,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {(() => { const Icon = active.icon; return <Icon style={{ width: "1.1rem", height: "1.1rem", color: C.forest }} />; })()}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Anton', 'Impact', sans-serif",
                    fontSize: "clamp(1.1rem, 3vw, 1.75rem)",
                    color: C.sage,
                    letterSpacing: "-0.01em",
                  }}>
                    {active.label.toUpperCase()}
                  </h2>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.68rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: `${C.sage}88`,
                  }}>
                    BISHOP AMBROSE COLLEGE, COIMBATORE
                  </p>
                </div>
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  background: "white",
                  borderRadius: "0 0 2rem 2rem",
                  padding: "2.5rem",
                  boxShadow: `0 20px 60px rgba(1,71,46,0.1)`,
                  border: `1px solid ${C.sage}44`,
                  borderTop: "none",
                }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </section>

      {/* ── Footer strip ── */}
      <footer style={{
        background: C.forest,
        color: C.sage,
        padding: "5rem 4vw 3rem",
        position: "relative",
        zIndex: 4,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          maxWidth: "1200px",
          margin: "0 auto",
          flexWrap: "wrap",
        }}>
          {/* Newsletter left */}
          <Reveal>
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: C.moss,
                marginBottom: "1rem",
              }}>
                STAY CONNECTED
              </div>
              <h3 style={{
                fontFamily: "'Anton', 'Impact', sans-serif",
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                color: C.sage,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}>
                JOIN OUR<br />NEWSLETTER
              </h3>
              <div style={{ display: "flex", gap: "0", maxWidth: "400px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${C.sage}44`,
                    padding: "0.75rem 0",
                    fontFamily: "'Inter', sans-serif",
                    color: C.sage,
                    fontSize: "0.9rem",
                    outline: "none",
                    letterSpacing: "0.05em",
                  }}
                />
                <button style={{
                  background: C.sage,
                  color: C.forest,
                  border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  marginLeft: "1rem",
                }}>
                  Subscribe
                </button>
              </div>
            </div>
          </Reveal>

          {/* Links right */}
          <Reveal delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: C.moss,
                  marginBottom: "1rem",
                }}>
                  ABOUT BAC
                </div>
                {["History", "Secretary's Message", "Principal's Message", "Governance", "Organogram"].map(l => (
                  <div key={l} style={{ marginBottom: "0.6rem" }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: `${C.sage}88`,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => ((e.currentTarget as HTMLSpanElement).style.color = C.sage)}
                      onMouseLeave={e => ((e.currentTarget as HTMLSpanElement).style.color = `${C.sage}88`)}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: C.moss,
                  marginBottom: "1rem",
                }}>
                  QUICK LINKS
                </div>
                {["Academics", "Admissions", "NAAC", "IQAC", "Placements", "Student Life"].map(l => (
                  <div key={l} style={{ marginBottom: "0.6rem" }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: `${C.sage}88`,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => ((e.currentTarget as HTMLSpanElement).style.color = C.sage)}
                      onMouseLeave={e => ((e.currentTarget as HTMLSpanElement).style.color = `${C.sage}88`)}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: `1px solid ${C.sage}22`,
          marginTop: "3rem",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          maxWidth: "1200px",
          margin: "3rem auto 0",
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem",
            color: `${C.sage}55`,
            letterSpacing: "0.1em",
          }}>
            © 2024 Bishop Ambrose College, Coimbatore. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms of Use", "Sitemap"].map(l => (
              <span key={l} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: `${C.sage}44`,
                cursor: "pointer",
              }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* Float + noise keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
