"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Globe2,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";

const DISTINGUISHED_ALUMNI = [
  {
    name: "Dr. Stephen Raj",
    batch: "B.Sc Computer Science (1997)",
    role: "VP of Engineering, Cloud Architecture",
    company: "Tech Mahindra, USA",
    quote: "Bishop Ambrose College provided the rock-solid foundation in logic and analytical rigor that propelled my international career in cloud computing.",
    location: "California, USA",
  },
  {
    name: "Priya Sundaram",
    batch: "B.Com (2005)",
    role: "Senior Director – Financial Advisory",
    company: "Deloitte India",
    quote: "The values of integrity, disciplined work ethic, and leadership inculcated by our BAC professors continue to guide my professional milestones.",
    location: "Bangalore, India",
  },
  {
    name: "Karthik Narayanan",
    batch: "BCA (2012)",
    role: "Founder & CEO",
    company: "NexGen Fintech Labs",
    quote: "From late-night coding sessions at BAC labs to pitching to global venture capitalists, Bishop Ambrose was where my entrepreneurial spark ignited.",
    location: "Chennai, India",
  },
  {
    name: "Ananya Mathews",
    batch: "B.A. English (2016)",
    role: "Content Strategist & Author",
    company: "Penguin Random House",
    quote: "The literary forums and creative mentorship at Bishop Ambrose College honed my expressive voice and opened doors to global publishing.",
    location: "London, UK",
  },
];

const ALUMNI_EVENTS = [
  {
    title: "Grand Annual Alumni Reunion 2026",
    date: "August 15, 2026",
    time: "09:30 AM – 04:00 PM",
    venue: "College Main Auditorium, BAC Campus",
    desc: "Join fellow Ambroseans across batches for a day of nostalgic reminiscing, networking, cultural performances, and felicitation of silver jubilee batches.",
    tag: "Campus Event",
    registered: 420,
  },
  {
    title: "Global Chapter Virtual Summit: AI & Career Shifts",
    date: "October 10, 2026",
    time: "06:30 PM – 08:30 PM IST",
    venue: "Live on Zoom / YouTube Live",
    desc: "Interactive panel discussion featuring BAC alumni leaders in Silicon Valley, London, and Bangalore discussing careers in the AI era.",
    tag: "Webinar",
    registered: 850,
  },
  {
    title: "BAC Mentorship Connect & Mock Interviews",
    date: "November 21, 2026",
    time: "10:00 AM – 02:00 PM",
    venue: "Placement Training Hall / Hybrid",
    desc: "Senior alumni guide final-year UG students through technical interview simulations, resume reviews, and industry readiness mentoring.",
    tag: "Mentorship",
    registered: 180,
  },
];

const CHAPTERS = [
  { name: "Coimbatore Chapter (Parent)", head: "Mr. R. Vijayakumar (B.Com '99)", email: "alumni.cbe@bishopambrosecollege.edu.in", members: "1,850+" },
  { name: "Chennai Chapter", head: "Mrs. Revathi Raman (BCA '07)", email: "chennai.alumni@bishopambrosecollege.edu.in", members: "640+" },
  { name: "Bangalore Chapter", head: "Mr. David Prakash (B.Sc CS '03)", email: "blr.alumni@bishopambrosecollege.edu.in", members: "920+" },
  { name: "Gulf & Middle East Chapter", head: "Mr. Mohammed Riyas (B.Com '09)", email: "gulf.alumni@bishopambrosecollege.edu.in", members: "410+" },
  { name: "North America Chapter", head: "Dr. Stephen Raj (B.Sc '97)", email: "usa.alumni@bishopambrosecollege.edu.in", members: "280+" },
];

export function AlumniPage({ section }: { section?: string }) {
  const [activeTab, setActiveTab] = useState<string>(section || "events");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    batchYear: "2020",
    degree: "B.Sc Computer Science",
    currentRole: "",
    company: "",
    city: "Coimbatore",
    country: "India",
    linkedin: "",
    mentorship: true,
  });

  useEffect(() => {
    if (section) setActiveTab(section);
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative bg-navy-dark text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark/95 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-light">BAC Alumni Association</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <GraduationCap className="w-3.5 h-3.5" /> Ambrosean Global Network
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Bishop Ambrose College Alumni Association
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Connecting thousands of Ambroseans worldwide. Celebrate shared memories, inspire current students, network with industry peers, and contribute to your alma mater.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm mb-10">
          {[
            { id: "events", label: "Alumni Events & Reunions", icon: Calendar },
            { id: "registration", label: "Alumni Registration", icon: UserCheck },
            { id: "association", label: "Association & Chapters", icon: Globe2 },
            { id: "hall-of-fame", label: "Distinguished Alumni", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
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

        {/* Tab 1: Alumni Events */}
        {activeTab === "events" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ALUMNI_EVENTS.map((evt, idx) => (
                <Reveal key={idx} delay={idx * 0.08}>
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold/40 transition-all flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="gold">{evt.tag}</Badge>
                        <span className="text-xs text-slate-500 font-medium">{evt.registered} RSVP'd</span>
                      </div>
                      <h3 className="font-bold text-lg text-navy leading-snug">{evt.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{evt.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                        <span className="font-semibold text-slate-700">{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                        <span>{evt.venue}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("registration")}
                        className="w-full mt-3 py-2.5 px-4 bg-navy text-white font-semibold rounded-xl text-xs hover:bg-navy-dark transition-colors cursor-pointer"
                      >
                        Register for Event
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Memories banner */}
            <div className="bg-gradient-to-r from-navy to-navy-dark text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-serif font-bold text-gold">Share Your Campus Nostalgia</h3>
                <p className="text-xs text-white/80 max-w-xl">
                  Have photographs or stories from your college days? Submit them to the BAC Alumni Archives to be featured in the annual commemorative newsletter.
                </p>
              </div>
              <PremiumButton
                variant="gold"
                size="sm"
                onClick={() => setActiveTab("registration")}
              >
                Submit Memories
              </PremiumButton>
            </div>
          </div>
        )}

        {/* Tab 2: Alumni Registration Form */}
        {activeTab === "registration" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-navy">Welcome Back, Ambrosean!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for registering with the Bishop Ambrose College Alumni Directory. Your profile has been updated and you will receive invitations to alumni gatherings.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-dark"
                >
                  Register Another Member
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-gold/15 text-navy">
                      <UserCheck className="w-6 h-6 text-gold-dark" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-navy">Alumni Registration</h3>
                      <p className="text-xs text-slate-500">Update your details to stay connected with BAC events and mentorship.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Ambrose"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Passing Out Year *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2018"
                      value={formData.batchYear}
                      onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Programme Graduated *
                    </label>
                    <select
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none bg-white"
                    >
                      <option>B.Sc Computer Science</option>
                      <option>B.Sc Information Technology</option>
                      <option>B.Sc Mathematics</option>
                      <option>BCA (Computer Applications)</option>
                      <option>B.Com (General)</option>
                      <option>B.Com Computer Applications (CA)</option>
                      <option>B.Com Professional Accounting (PA)</option>
                      <option>B.Com Corporate Secretaryship (CS)</option>
                      <option>BBA (Business Administration)</option>
                      <option>B.A. English Literature</option>
                      <option>B.A. Tamil Literature</option>
                      <option>M.Com</option>
                      <option>M.Sc Computer Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Current Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Software Architect"
                      value={formData.currentRole}
                      onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Infosys / Government of TN"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Current City & Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Coimbatore, India"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="mentorship"
                    checked={formData.mentorship}
                    onChange={(e) => setFormData({ ...formData, mentorship: e.target.checked })}
                    className="w-4 h-4 text-navy rounded border-slate-300"
                  />
                  <label htmlFor="mentorship" className="text-xs text-slate-700 cursor-pointer">
                    I am willing to mentor juniors, deliver guest lectures, or support campus placement drives.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-navy-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-gold" /> Complete Alumni Registration
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Association & Chapters */}
        {activeTab === "association" && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-navy text-gold">
                  <Globe2 className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-navy">Alumni Chapters Across the Globe</h3>
                  <p className="text-xs text-slate-500">Reach out to your regional BAC chapter coordinator.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {CHAPTERS.map((ch, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-navy text-base">{ch.name}</h4>
                      <Badge variant="navy">{ch.members} Members</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">Coordinator:</strong> {ch.head}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Mail className="w-3.5 h-3.5 text-gold-dark" /> {ch.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Distinguished Alumni */}
        {activeTab === "hall-of-fame" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DISTINGUISHED_ALUMNI.map((alumnus, idx) => (
              <Reveal key={idx} delay={idx * 0.08}>
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-navy">{alumnus.name}</h4>
                        <p className="text-xs text-gold-dark font-semibold">{alumnus.batch}</p>
                      </div>
                      <span className="p-2 bg-navy/5 rounded-xl text-navy">
                        <Award className="w-5 h-5 text-gold-dark" />
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{alumnus.role}</p>
                      <p className="text-slate-500">{alumnus.company} • {alumnus.location}</p>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      "{alumnus.quote}"
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
