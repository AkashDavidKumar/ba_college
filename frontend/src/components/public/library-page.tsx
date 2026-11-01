"use client";
import { ChevronRight, BookOpen, Wifi, Monitor, Database, Clock, Users, Download, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/site/primitives";

const LIB_STATS = [
  { label: "Total Books",        value: "25,000+", icon: BookOpen },
  { label: "Journals (Print)",   value: "85",      icon: BookOpen },
  { label: "E-Journals",         value: "5,000+",  icon: Monitor },
  { label: "E-Books",            value: "10,000+", icon: Database },
  { label: "Seating Capacity",   value: "200",     icon: Users },
  { label: "Reading Hours",      value: "9AM–8PM", icon: Clock },
];

const DATABASES = [
  { name: "INFLIBNET – N-LIST", desc: "Access to 6,000+ e-journals and 1.35 lakh+ e-books via UGC's national digital library." },
  { name: "DELNET",             desc: "Cooperative network for sharing library resources among libraries in India and South Asia." },
  { name: "Shodhganga",         desc: "Reservoir of Indian theses and dissertations provided by UGC." },
  { name: "JSTOR",              desc: "Digital library of academic journals, books, and primary sources." },
  { name: "OpenDOAR",           desc: "Open access academic journal repository for research papers." },
  { name: "Project Gutenberg",  desc: "Free library of over 60,000 classic literature e-books." },
];

const LIB_SERVICES = [
  "Circulation and Issue/Return of Books",
  "Reference and Bibliographic Services",
  "Newspaper and Periodical Reading",
  "E-Resource Access (N-LIST, DELNET)",
  "Inter-Library Loan Facility",
  "Book Reservation on Request",
  "Library Orientation for New Students",
  "Digital Repository of Institutional Publications",
  "Bibliographic Verification Service",
  "Photocopying and Printing Facility",
];

export function LibraryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-gold-light">Library</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">Central Library</h1>
          <p className="text-white/70">Knowledge hub of Bishop Ambrose College — books, e-resources, and research support.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Library Image */}
        <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80 shadow-sm">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=70" alt="BAC Library" className="w-full h-full object-cover" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {LIB_STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={i} delay={i * 0.06}>
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gold-light flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4.5 h-4.5 text-gold-dark" />
                  </div>
                  <p className="text-lg font-bold text-navy">{s.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <h3 className="text-xl font-bold text-navy mb-4">About the Library</h3>
          <div className="space-y-3 text-slate-600">
            <p>The Central Library of Bishop Ambrose College is a well-equipped knowledge resource centre supporting the academic, research, and co-curricular needs of students and faculty. The library houses over 25,000 books, 85 print journals, and provides access to thousands of e-books and e-journals through national digital library networks.</p>
            <p>The library is Wi-Fi enabled and provides individual and group reading spaces, a separate reference section, a periodical reading room, and a digital resource lab. It is managed by qualified library professionals committed to supporting student learning and faculty research.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Services */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-navy px-6 py-4"><h3 className="text-white font-bold">Library Services</h3></div>
            <ul className="divide-y divide-slate-50">
              {LIB_SERVICES.map((s, i) => (
                <li key={i} className="flex items-center gap-2 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-dark shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Resources */}
          <div>
            <h3 className="text-lg font-bold text-navy mb-4">Digital Resources & Databases</h3>
            <div className="space-y-3">
              {DATABASES.map((d, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-navy text-sm mb-1">{d.name}</p>
                        <p className="text-xs text-slate-600">{d.desc}</p>
                      </div>
                      <button className="shrink-0 w-7 h-7 rounded-lg bg-navy/10 flex items-center justify-center hover:bg-navy hover:text-white transition-colors text-navy">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Timing & Contact */}
        <div className="bg-navy-dark text-white rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div><h4 className="font-bold mb-2 text-gold-light">Library Hours</h4>
              <p className="text-sm text-white/80">Mon – Fri: 9:00 AM – 8:00 PM</p>
              <p className="text-sm text-white/80">Saturday: 9:00 AM – 5:00 PM</p>
              <p className="text-sm text-white/60 mt-1">Closed on Sundays & Public Holidays</p>
            </div>
            <div><h4 className="font-bold mb-2 text-gold-light">Librarian</h4>
              <p className="text-sm text-white/80">Mr. S. Rajan, M.Lib, M.Phil</p>
              <p className="text-sm text-white/60">Ext: 108</p>
            </div>
            <div><h4 className="font-bold mb-2 text-gold-light">N-LIST Access</h4>
              <p className="text-sm text-white/80 mb-2">Registered students can access N-LIST e-resources using their student credentials.</p>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Access N-LIST
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
