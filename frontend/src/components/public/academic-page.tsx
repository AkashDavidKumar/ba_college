"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Building2, Monitor, Target, Calendar, FileText,
  ChevronRight, Users, Clock, Award, GraduationCap, CheckCircle,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { Reveal } from "@/components/site/primitives";

// ─── BAC Courses ──────────────────────────────────────────────────────────────

const BAC_COURSES = [
  {
    dept: "Computer Science",
    icon: Monitor,
    color: "bg-blue-50 text-blue-700",
    iconBg: "bg-blue-100",
    programs: [
      { name: "B.Sc. Computer Science",  duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 with Mathematics or Computer Science" },
      { name: "BCA",                     duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Any stream with Mathematics)" },
      { name: "B.Sc. Information Technology", duration: "3 Years", type: "UG", seats: 40, eligibility: "10+2 with Mathematics or Computer Science" },
    ],
  },
  {
    dept: "Commerce",
    icon: Award,
    color: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-100",
    programs: [
      { name: "B.Com",                    duration: "3 Years", type: "UG", seats: 120, eligibility: "10+2 (Any stream)" },
      { name: "B.Com (Computer Applications)", duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Any stream)" },
      { name: "B.Com (Professional Accounting)", duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Commerce recommended)" },
      { name: "B.Com (Corporate Secretaryship)", duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Any stream)" },
      { name: "B.Com (CSCA)",             duration: "3 Years", type: "UG", seats: 40, eligibility: "10+2 (Any stream)" },
    ],
  },
  {
    dept: "Management",
    icon: Building2,
    color: "bg-violet-50 text-violet-700",
    iconBg: "bg-violet-100",
    programs: [
      { name: "BBA",                     duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Any stream)" },
      { name: "BBA (Computer Applications)", duration: "3 Years", type: "UG", seats: 40, eligibility: "10+2 (Any stream)" },
    ],
  },
  {
    dept: "Science",
    icon: Award,
    color: "bg-amber-50 text-amber-700",
    iconBg: "bg-amber-100",
    programs: [
      { name: "B.Sc. Mathematics",        duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 with Mathematics" },
      { name: "B.Sc. Biotechnology",      duration: "3 Years", type: "UG", seats: 40, eligibility: "10+2 with Biology and Chemistry" },
    ],
  },
  {
    dept: "Arts & Languages",
    icon: BookOpen,
    color: "bg-rose-50 text-rose-700",
    iconBg: "bg-rose-100",
    programs: [
      { name: "B.A. English",             duration: "3 Years", type: "UG", seats: 60, eligibility: "10+2 (Any stream with English)" },
    ],
  },
];

const ACADEMIC_NAV = [
  { id: "courses",      label: "Courses Offered",        icon: BookOpen },
  { id: "departments",  label: "Departments",             icon: Building2 },
  { id: "curriculum",   label: "Curriculum Dev. Cell",    icon: FileText },
  { id: "outcomes",     label: "Programme Outcomes",      icon: Target },
  { id: "ict",          label: "ICT Facilities",          icon: Monitor },
  { id: "calendar",     label: "Academic Calendar",       icon: Calendar },
];

const DEPARTMENTS_DATA = [
  {
    name: "Computer Science", hod: "Dr. A. Jeyaraj", faculty: 12, students: 350,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70",
    desc: "Offers B.Sc. CS, BCA and B.Sc. IT programmes with strong industry linkage and excellent placement record.",
    programs: 3,
  },
  {
    name: "Commerce", hod: "Dr. S. Arulraj", faculty: 15, students: 480,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=70",
    desc: "Five specialised B.Com programmes preparing students for accounting, corporate and financial careers.",
    programs: 5,
  },
  {
    name: "Management (BBA)", hod: "Dr. M. Priya", faculty: 8, students: 180,
    image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=600&q=70",
    desc: "BBA and BBA(CA) programmes developing future business leaders with industry exposure.",
    programs: 2,
  },
  {
    name: "Mathematics", hod: "Dr. R. Sundar", faculty: 6, students: 120,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=70",
    desc: "B.Sc. Mathematics with a rigorous curriculum and emphasis on analytical and research skills.",
    programs: 1,
  },
  {
    name: "Biotechnology", hod: "Dr. L. Kavitha", faculty: 7, students: 80,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=70",
    desc: "B.Sc. Biotechnology with modern laboratory facilities and industry collaboration.",
    programs: 1,
  },
  {
    name: "English", hod: "Dr. P. Malar", faculty: 5, students: 120,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=70",
    desc: "B.A. English fostering literary appreciation, communication excellence and critical thinking.",
    programs: 1,
  },
];

const CALENDAR_EVENTS = [
  { month: "June", events: ["Commencement of Odd Semester Classes", "Orientation Programme for I Year Students", "Enrollment & Scholarship Applications"] },
  { month: "July", events: ["Internal Assessment – I (CIA-1)", "Sports Selection Trials", "Anti-Ragging Awareness Programme"] },
  { month: "August", events: ["Independence Day Celebration", "Association Inauguration", "Department Seminars"] },
  { month: "September", events: ["Internal Assessment – II (CIA-2)", "Fine Arts Competitions", "NSS Special Camp Registration"] },
  { month: "October", events: ["Odd Semester Examinations", "Alumni Meet", "Industry Visit Programme"] },
  { month: "November", events: ["Commencement of Even Semester Classes", "Placement Drives – Season 1", "Cultural Festival Preparations"] },
  { month: "December", events: ["Christmas Celebrations", "Internal Assessment – III (CIA-3)", "College Annual Sports Day"] },
  { month: "January", events: ["Internal Assessment – IV (CIA-4)", "Republic Day Celebration", "Placement Drives – Season 2"] },
  { month: "February", events: ["Even Semester Internal Examinations", "National Seminar / Workshop", "Department Annual Day Celebrations"] },
  { month: "March", events: ["Even Semester Examinations", "Publication of Results", "Farewell to Final Year Students"] },
  { month: "April", events: ["Summer Holidays", "NSS Camp Activities", "Faculty Development Programmes"] },
  { month: "May", events: ["Summer Holidays", "Admission Process Begins", "Board of Studies Meetings"] },
];

// ─── Courses View ─────────────────────────────────────────────────────────────

function CoursesView() {
  const { goAdmissions } = useNav();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Computer Science", "Commerce", "Management", "Science", "Arts & Languages"];

  const filtered = filter === "All" ? BAC_COURSES : BAC_COURSES.filter(c => c.dept === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === f ? "bg-navy text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy/30"}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {filtered.map((dept, i) => {
          const Icon = dept.icon;
          return (
            <Reveal key={dept.dept} delay={i * 0.05}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 flex items-center gap-3 ${dept.color}`}>
                  <div className={`w-9 h-9 rounded-xl ${dept.iconBg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Department of {dept.dept}</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {dept.programs.map((p, j) => (
                    <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="font-semibold text-navy">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.eligibility}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold-dark" />{p.duration}</div>
                        <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gold-dark" />{p.seats} seats</div>
                        <span className="px-2 py-0.5 bg-gold-light text-navy-dark rounded-full font-semibold">{p.type}</span>
                        <button onClick={goAdmissions} className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors">Apply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function DepartmentsView() {
  const { goDepartment } = useNav();
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {DEPARTMENTS_DATA.map((dept, i) => (
        <Reveal key={dept.name} delay={i * 0.06}>
          <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="relative overflow-hidden h-44">
              <img src={dept.image} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold text-sm">{dept.name}</p>
                <p className="text-white/70 text-xs">HOD: {dept.hod}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{dept.desc}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{dept.faculty} Faculty</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{dept.students} Students</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{dept.programs} Programmes</span>
              </div>
              <button
                onClick={() => goDepartment(dept.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                className="w-full flex items-center justify-center gap-1 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-dark transition-colors"
              >
                View Department <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function CalendarView() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {CALENDAR_EVENTS.map((month, i) => (
        <Reveal key={month.month} delay={i * 0.04}>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-navy px-4 py-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-light" />
              <span className="text-white font-bold text-sm">{month.month}</span>
            </div>
            <ul className="p-4 space-y-2">
              {month.events.map((e, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-dark mt-1.5 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function GenericSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <h3 className="text-xl font-bold text-navy mb-6 pb-4 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AcademicPage({ section }: { section?: string }) {
  const [activeSection, setActiveSection] = useState(section ?? "courses");
  const { goAcademic } = useNav();

  const active = ACADEMIC_NAV.find(n => n.id === activeSection) ?? ACADEMIC_NAV[0];

  const renderContent = () => {
    switch (activeSection) {
      case "courses":     return <CoursesView />;
      case "departments": return <DepartmentsView />;
      case "calendar":    return <CalendarView />;
      case "curriculum":
        return (
          <GenericSection title="Curriculum Development Cell">
            <p className="text-slate-600 mb-6">The Curriculum Development Cell at Bishop Ambrose College continuously reviews and updates programmes to align with industry needs, UGC guidelines, and Bharathiar University regulations.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {["Industry-aligned syllabi updated every 3 years","Board of Studies reviews programme outcomes","Skill-based electives and value-added courses","Feedback from alumni, students, and industry experts","Integration of MOOC and online certifications","Mapping of courses to Programme and Course Outcomes"].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-gold-dark mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </GenericSection>
        );
      case "outcomes":
        return (
          <GenericSection title="Programme Outcomes">
            <p className="text-slate-600 mb-6">Programme Outcomes (POs) define the knowledge, skills, and values that students acquire through our undergraduate programmes.</p>
            {["Critical Thinking & Problem Solving","Communication & Language Proficiency","Digital & Information Literacy","Ethical Values & Social Responsibility","Leadership & Teamwork","Research & Analytical Skills","Lifelong Learning & Adaptability","Professional & Career Readiness"].map((po, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">PO{i + 1}</div>
                <span className="text-slate-700 font-medium">{po}</span>
              </div>
            ))}
          </GenericSection>
        );
      case "ict":
        return (
          <GenericSection title="ICT Facilities">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: "Computer Laboratories", count: "6 Labs", desc: "250+ computers with latest configurations and high-speed internet" },
                { name: "Smart Classrooms",     count: "12 Rooms", desc: "Interactive projectors, digital boards, and audio-visual systems" },
                { name: "Wi-Fi Campus",         count: "Full Coverage", desc: "High-speed campus-wide Wi-Fi for students and faculty" },
                { name: "Digital Library",      count: "10,000+ E-books", desc: "Access to INFLIBNET, N-LIST, and online journal databases" },
                { name: "Language Lab",         count: "40 Systems", desc: "Interactive language learning software for communication skills" },
                { name: "Video Conferencing",   count: "2 Suites", desc: "For virtual guest lectures, webinars, and inter-institutional programmes" },
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-navy text-sm">{f.name}</h4>
                    <span className="text-xs bg-navy text-white font-semibold px-2 py-0.5 rounded-full">{f.count}</span>
                  </div>
                  <p className="text-xs text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </GenericSection>
        );
      default:
        return <CoursesView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span>Academic</span>
            <ChevronRight className="w-3 h-3" /><span className="text-gold-light">{active.label}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">Academic</h1>
          <p className="text-white/70">Explore programmes, departments, curriculum and academic resources at BAC.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-navy-dark px-5 py-4">
                <h3 className="text-white font-bold text-sm">Academic</h3>
              </div>
              <nav className="divide-y divide-slate-50">
                {ACADEMIC_NAV.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id}
                      onClick={() => { setActiveSection(item.id); goAcademic(item.id); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left ${activeSection === item.id ? "bg-gold-light text-navy font-semibold border-l-4 border-gold-dark" : "text-slate-600 hover:text-navy hover:bg-slate-50"}`}>
                      <Icon className="w-4 h-4 shrink-0" />{item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
