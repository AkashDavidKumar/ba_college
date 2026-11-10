"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Palette, Trophy, Heart, Briefcase, ChevronRight, Star, Calendar, Award, ArrowRight } from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { Reveal } from "@/components/site/primitives";
import { ClubsDirectorySection } from "@/components/public/clubs-directory-section";

const CLUBS = [
  { name: "Computer Science Association",   dept: "CS", members: 180, events: 12, image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=70", desc: "Tech talks, hackathons, coding competitions and industry visits." },
  { name: "Commerce Association",           dept: "Commerce", members: 220, events: 10, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=70", desc: "Business fests, CA interaction sessions and entrepreneurship workshops." },
  { name: "BBA Students Association",       dept: "BBA", members: 120, events: 8, image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=500&q=70", desc: "Management games, industry interaction and leadership development." },
  { name: "Science Students Forum",         dept: "Science", members: 90, events: 7, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=500&q=70", desc: "Science exhibitions, lab demonstrations and research symposia." },
  { name: "English Literary Association",   dept: "English", members: 85, events: 9, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=70", desc: "Debates, elocutions, literary contests and drama productions." },
  { name: "NSS Unit",                       dept: "College-wide", members: 200, events: 15, image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=500&q=70", desc: "Community service, blood donation camps and village adoption programmes." },
];

const SPORTS_DATA = [
  { sport: "Cricket",      level: "University", achievement: "Inter-University Quarter-Finals 2024", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=500&q=70" },
  { sport: "Football",     level: "District",   achievement: "District Champions 2023", image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=500&q=70" },
  { sport: "Basketball",   level: "University", achievement: "Inter-College Runner-up 2024", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=70" },
  { sport: "Kabaddi",      level: "State",      achievement: "State-level Participants 2024", image: "https://images.unsplash.com/photo-1519767770432-8c0b08c5f6f1?auto=format&fit=crop&w=500&q=70" },
  { sport: "Volleyball",   level: "University", achievement: "Inter-College Semi-Finals 2024", image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=500&q=70" },
  { sport: "Athletics",    level: "State",      achievement: "Multiple gold medals at district meets", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=70" },
];

const FINE_ARTS = [
  { category: "Classical Music",    icon: "🎵", events: ["Carnatic Vocal Competitions","Instrumental Performance","Choir Competitions"] },
  { category: "Dance",              icon: "💃", events: ["Bharatanatyam Performances","Folk Dance Competitions","Western Dance Events"] },
  { category: "Drama & Theatre",    icon: "🎭", events: ["Street Plays","One-Act Plays","Mime Competitions"] },
  { category: "Visual Arts",        icon: "🎨", events: ["Painting & Drawing","Rangoli","Collage Making","Photography"] },
  { category: "Literary Arts",      icon: "✍️", events: ["Tamil Poetry","English Creative Writing","Elocution & Debate"] },
  { category: "Annual Cultural Fest",icon: "🌟", events: ["Kaleidoscope — Inter-College Cultural Festival","Department Annual Days","Freshers Welcome"] },
];

const SA_NAV = [
  { id: "council",      label: "Student Council",    icon: Users },
  { id: "clubs",        label: "Clubs & Committees", icon: Award },
  { id: "fine-arts",    label: "Fine Arts",           icon: Palette },
  { id: "sports",       label: "Sports",              icon: Trophy },
  { id: "associations", label: "Associations",        icon: Users },
  { id: "extension",    label: "Extension Activities",icon: Heart },
  { id: "placement",    label: "Placement",           icon: Briefcase },
];

function CouncilView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-navy mb-4">Student Council 2024-25</h3>
        <p className="text-slate-600 mb-6">The Student Council at Bishop Ambrose College is the elected body representing the student community. It serves as a bridge between students and college management, organising events, resolving student concerns, and promoting a vibrant campus life.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { role: "President",          name: "Mr. J. Solomon",    dept: "B.Com III Year" },
            { role: "Vice President",     name: "Ms. P. Preethi",    dept: "BCA III Year" },
            { role: "Secretary",          name: "Mr. R. Daniel",     dept: "BBA III Year" },
            { role: "Joint Secretary",    name: "Ms. A. Selvi",      dept: "B.Sc CS III Year" },
            { role: "Cultural Secretary", name: "Ms. M. Kavitha",    dept: "B.A. English III Year" },
            { role: "Sports Secretary",   name: "Mr. T. Raj",        dept: "B.Com CA III Year" },
            { role: "NSS Rep",            name: "Ms. S. Dharani",    dept: "B.Sc Bio III Year" },
            { role: "Arts Club Head",     name: "Mr. P. Clement",    dept: "B.Sc Maths III Year" },
          ].map((m, i) => (
            <div key={i} className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-navy" />
              </div>
              <p className="text-xs font-bold text-navy">{m.name}</p>
              <p className="text-[10px] text-gold-dark font-semibold">{m.role}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{m.dept}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudentActivitiesPage({ section }: { section?: string }) {
  const { goStudentActivities, goPlacements } = useNav();
  const [active, setActive] = useState(section ?? "council");

  const renderContent = () => {
    switch (active) {
      case "council": return <CouncilView />;
      case "clubs": return <ClubsDirectorySection />;
      case "sports":
        return (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {SPORTS_DATA.map((s, i) => (
              <Reveal key={s.sport} delay={i * 0.06}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="relative h-44 overflow-hidden">
                    <img src={s.image} alt={s.sport} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />
                    <div className="absolute bottom-3 left-4"><p className="text-white font-bold">{s.sport}</p><p className="text-white/70 text-xs">{s.level} Level</p></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-2"><Award className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" /><p className="text-sm text-slate-700">{s.achievement}</p></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        );
      case "fine-arts":
        return (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {FINE_ARTS.map((f, i) => (
              <Reveal key={f.category} delay={i * 0.06}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-navy mb-3">{f.category}</h3>
                  <ul className="space-y-1.5">
                    {f.events.map((e, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600"><Star className="w-3.5 h-3.5 text-gold-dark shrink-0 mt-0.5" />{e}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        );
      case "associations":
        return (
          <div className="grid md:grid-cols-2 gap-5">
            {CLUBS.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.06}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all flex">
                  <img src={c.image} alt={c.name} className="w-24 h-24 object-cover shrink-0 self-stretch" />
                  <div className="p-4 flex-1 min-w-0">
                    <p className="font-bold text-navy text-sm">{c.name}</p>
                    <p className="text-xs text-gold-dark font-medium mb-1">{c.dept} Department</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.desc}</p>
                    <div className="flex gap-3 mt-2 text-[10px] text-slate-500">
                      <span>{c.members} members</span><span>·</span><span>{c.events} events/year</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        );
      case "extension":
        return (
          <div className="space-y-5">
            {[
              { title: "NSS (National Service Scheme)", desc: "Two NSS units actively engage in community service, blood donation camps, tree plantation, village adoption, literacy programmes, and disaster relief activities.", activities: ["Village Adoption Programme","Blood Donation Camps","Swachh Bharat Abhiyan","COVID-19 Awareness Drives","Literacy Programmes in Rural Areas"] },
              { title: "NCC (National Cadet Corps)", desc: "NCC cadets at BAC participate in drill, adventure activities, social service, and national-level camps, developing discipline and patriotism.", activities: ["Republic Day & Independence Day Parades","Trekking and Adventure Camps","Social Service Activities","National Integration Camps","B and C Certificate Training"] },
              { title: "Community Service Projects", desc: "Students regularly undertake community outreach activities in the neighbourhood of the college, addressing local needs and building social responsibility.", activities: ["Rural Healthcare Awareness","Digital Literacy Drives","Environmental Conservation","Senior Citizen Support","Women Empowerment Programmes"] },
            ].map((e, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-navy text-lg mb-2">{e.title}</h3>
                <p className="text-slate-600 mb-4">{e.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {e.activities.map((a, j) => (
                    <span key={j} className="px-3 py-1.5 bg-gold-light text-navy-dark text-xs font-medium rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case "placement":
        goPlacements();
        return null;
      default:
        return <CouncilView />;
    }
  };

  const activeNav = SA_NAV.find(n => n.id === active) ?? SA_NAV[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-gold-light">Student Activities</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">Student Activities</h1>
          <p className="text-white/70">Vibrant campus life — sports, arts, social service, and student leadership at BAC.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-navy-dark px-5 py-4"><h3 className="text-white font-bold text-sm">Student Activities</h3></div>
              <nav className="divide-y divide-slate-50">
                {SA_NAV.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => { setActive(item.id); goStudentActivities(item.id); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left ${active === item.id ? "bg-gold-light text-navy font-semibold border-l-4 border-gold-dark" : "text-slate-600 hover:text-navy hover:bg-slate-50"}`}>
                      <Icon className="w-4 h-4 shrink-0" />{item.label}
                    </button>
                  );
                })}
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
