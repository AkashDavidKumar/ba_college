"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  ChevronRight,
  Play,
  X,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  universityEvents,
  eventCategories,
  guestSpeakers,
  eventGallery,
  eventsHeroStats,
  type UniversityEvent,
} from "@/lib/university-data";
import {
  SectionHeading,
  GlassCard,
  AnimatedCounter,
  Reveal,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { cn } from "@/lib/utils";

const categoryColorMap: Record<string, string> = {
  "All Events": "bg-navy text-white",
  Workshops: "bg-emerald-600 text-white",
  Hackathons: "bg-violet-600 text-white",
  Seminars: "bg-navy text-white",
  "Guest Lectures": "bg-gold text-navy",
  Cultural: "bg-rose-500 text-white",
  Sports: "bg-amber-600 text-white",
  Placements: "bg-teal-600 text-white",
};

export function EventsPage() {
  const { goAdmissions, goHome } = useNav();
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [selectedEvent, setSelectedEvent] = useState<UniversityEvent | null>(null);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All Events") return universityEvents;
    return universityEvents.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  const featuredEvent = universityEvents[0];
  const upcomingEvents = useMemo(
    () => [...universityEvents].sort((a, b) => a.dateISO.localeCompare(b.dateISO)).slice(0, 6),
    []
  );

  const galleryCategories = ["All", "Workshops", "Labs", "Sports", "Cultural", "Graduation", "Placement"];
  const filteredGallery = useMemo(() => {
    if (galleryFilter === "All") return eventGallery;
    return eventGallery.filter((g) => g.category === galleryFilter);
  }, [galleryFilter]);

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">Events</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-navy-gradient text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2400&q=80"
            alt="Events at BAC"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/85 via-navy/70 to-navy-dark/85" />
        </div>
        <div className="absolute -top-20 right-0 w-80 h-80 blob bg-gold/20" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 blob bg-violet-500/15" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-navy text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              200+ Events Annually
            </div>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-5">
              Events & <span className="text-gold-gradient">Activities</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Explore workshops, hackathons, seminars, competitions, cultural activities, and experiences
              shaping future leaders. There&apos;s always something happening at BAC.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              <PremiumButton
                variant="gold"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => document.getElementById("upcoming")?.scrollIntoView({ behavior: "smooth" })}
              >
                Upcoming Events
              </PremiumButton>
              <PremiumButton
                variant="outline-light"
                size="lg"
                icon={<Play className="w-4 h-4" />}
                onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
              >
                Event Gallery
              </PremiumButton>
              <PremiumButton
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={goAdmissions}
              >
                Register Now
              </PremiumButton>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              {eventsHeroStats.map((stat) => (
                <div key={stat.label} className="glass-navy rounded-xl p-4 text-center sm:text-left">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-light mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-white/75 text-xs sm:text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Event */}
      <section className="py-10 sm:py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Featured Event"
            title={<>Spotlight on <span className="text-gold-gradient">{featuredEvent.title}</span></>}
            description="Our flagship event of the season — three days of talks, workshops, and networking with global AI leaders."
          />

          <Reveal>
            <div className="mt-10 rounded-3xl overflow-hidden shadow-premium grid lg:grid-cols-2 bg-white">
              {/* Image */}
              <div className="relative h-72 lg:h-auto overflow-hidden">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gold-gradient text-navy text-xs font-bold uppercase">
                  Featured
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                  {featuredEvent.speakers?.map((sp) => (
                    <span key={sp.name} className="px-2.5 py-1 rounded-full glass-navy text-white text-[11px]">
                      {sp.name} · {sp.company}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", categoryColorMap[featuredEvent.category])}>
                    {featuredEvent.category}
                  </span>
                  <span className="text-xs text-muted-foreground">Flagship</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy mb-3 leading-tight">
                  {featuredEvent.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{featuredEvent.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-gold-dark mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Date</div>
                      <div className="text-sm font-semibold text-navy">{featuredEvent.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gold-dark mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Venue</div>
                      <div className="text-sm font-semibold text-navy">{featuredEvent.venue}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-gold-dark mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Participants</div>
                      <div className="text-sm font-semibold text-navy">{featuredEvent.participants.toLocaleString()}+</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Trophy className="w-4 h-4 text-gold-dark mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Prize</div>
                      <div className="text-sm font-semibold text-navy">{featuredEvent.prizePool}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <PremiumButton variant="navy" size="md" onClick={() => setSelectedEvent(featuredEvent)} icon={<ArrowRight className="w-4 h-4" />}>
                    View Details
                  </PremiumButton>
                  <PremiumButton variant="gold" size="md" onClick={goAdmissions}>
                    Register
                  </PremiumButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Event Categories Filter + Cards */}
      <section id="upcoming" className="py-10 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Upcoming Events"
            title={<>Find your next <span className="text-gold-gradient">BAC experience</span></>}
            description="Filter by category to discover workshops, hackathons, seminars, and more happening across our campus."
          />

          {/* Filter pills */}
          <Reveal>
            <div className="flex flex-wrap gap-2 justify-center mt-10 mb-10">
              {eventCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border",
                    activeCategory === cat
                      ? "bg-navy text-white border-navy shadow-premium"
                      : "bg-white text-navy border-navy/10 hover:border-gold/40 hover:bg-gold/5"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Event cards grid */}
          <motion.div
            layout
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  layout
                  key={event.id}
                  variants={staggerItem}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => setSelectedEvent(event)}
                  className="group rounded-2xl overflow-hidden bg-white border border-navy/8 hover:border-gold/40 hover:shadow-premium transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", categoryColorMap[event.category])}>
                        {event.category}
                      </span>
                    </div>
                    {event.prizePool !== "—" && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold-gradient text-navy text-[10px] font-bold">
                        {event.prizePool}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-serif text-lg font-bold leading-tight">{event.title}</h4>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{event.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-navy font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-navy font-medium">
                        <Users className="w-3.5 h-3.5 text-gold-dark" />
                        {event.participants.toLocaleString()}+
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-navy font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-3 border-t border-navy/8">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="flex-1 px-3 py-2 rounded-lg border border-navy/15 text-navy text-xs font-semibold hover:bg-navy hover:text-white transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goAdmissions();
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-gold-gradient text-navy text-xs font-semibold hover:brightness-105 transition-all"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Event Timeline */}
      <section className="py-10 sm:py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Timeline"
            title={<>What&apos;s <span className="text-gold-gradient">coming up</span></>}
            description="A chronological view of our next flagship events with countdown timers and registration deadlines."
          />

          <div className="mt-12 relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-navy/15 md:-translate-x-1/2" />

            <div className="space-y-8">
              {upcomingEvents.map((event, idx) => (
                <Reveal key={event.id} delay={idx * 0.05}>
                  <div
                    className={cn(
                      "relative grid md:grid-cols-2 gap-4 md:gap-8",
                      idx % 2 === 0 ? "" : "md:[direction:rtl]"
                    )}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 z-10">
                      <div className="w-4 h-4 rounded-full bg-gold border-4 border-cream shadow-gold" />
                    </div>

                    {/* Content card */}
                    <div className={cn("pl-12 md:pl-0", idx % 2 === 0 ? "md:text-right md:pr-12" : "md:[direction:ltr] md:pl-12")}>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="block w-full text-left glass-card rounded-2xl p-5 hover:shadow-premium transition-all"
                      >
                        <div className={cn("flex items-center gap-2 mb-2", idx % 2 === 0 ? "md:justify-end" : "")}>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", categoryColorMap[event.category])}>
                            {event.category}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">{event.date}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-navy mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                        <div className={cn("flex items-center gap-3 mt-2 text-xs text-muted-foreground", idx % 2 === 0 ? "md:justify-end" : "")}>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold-dark" />
                            {event.venue}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-gold-dark" />
                            {event.participants.toLocaleString()}+
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Empty side */}
                    <div className="hidden md:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guest Speakers */}
      <section className="py-10 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Guest Speakers"
            title={<>Learn from <span className="text-gold-gradient">global leaders</span></>}
            description="CEOs, Nobel laureates, Turing Award winners, and leading researchers who have graced the BAC stage."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {guestSpeakers.map((speaker, idx) => (
              <Reveal key={speaker.name} delay={idx * 0.08}>
                <div className="group rounded-2xl overflow-hidden bg-white border border-navy/8 hover:border-gold/40 hover:shadow-premium transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-serif text-base font-bold leading-tight">{speaker.name}</h4>
                      <p className="text-xs text-gold-light font-medium">{speaker.company}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Topic</div>
                    <p className="text-sm text-navy font-medium leading-snug mb-2">{speaker.topic}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 text-gold-dark" />
                      {speaker.date}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Event Gallery */}
      <section id="gallery" className="py-10 sm:py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Event Gallery"
            title={<>Moments that <span className="text-gold-gradient">last a lifetime</span></>}
            description="Relive the energy of past BAC events — workshops, labs, sports, cultural festivals, and convocations."
          />

          <Reveal>
            <div className="flex flex-wrap gap-2 justify-center mt-8 mb-8">
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    galleryFilter === cat
                      ? "bg-navy text-white"
                      : "bg-white text-navy border border-navy/10 hover:border-gold/40"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div
            layout
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
          >
            <AnimatePresence>
               {filteredGallery.map((item, idx) => (
                <motion.div
                  layout
                  key={item.url}
                  variants={staggerItem}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => setLightboxImage(item.url)}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-premium border border-navy/5 hover:border-gold/30 transition-all duration-300"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ aspectRatio: idx % 3 === 0 ? "3/4" : idx % 3 === 1 ? "1/1" : "4/3" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] uppercase tracking-wider text-gold-light font-semibold mb-1">
                      {item.category}
                    </div>
                    <h4 className="font-serif text-sm font-bold">{item.title}</h4>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.url);
                      alert("Image link copied to clipboard!");
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full glass-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Event Registration CTA */}
      <section className="py-10 sm:py-16 lg:py-24 bg-navy-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-15 mix-blend-overlay" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 blob bg-gold/30" />
        <div className="container mx-auto px-4 sm:px-6 relative text-center">
          <Reveal>
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl mb-5 leading-tight">
                Ready to join the next event?
              </h2>
              <p className="text-white/80 mb-8">
                Register today to secure your spot. Every event comes with a QR pass for seamless check-in,
                workshop materials, and networking opportunities.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <PremiumButton variant="gold" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />}>
                  Register Now
                </PremiumButton>
                <PremiumButton variant="outline-light" size="lg" onClick={goAdmissions}>
                  View Full Calendar
                </PremiumButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-navy-dark/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl max-h-[88vh] overflow-y-auto scrollbar-premium bg-white rounded-2xl shadow-premium z-50"
            >
              <div className="relative">
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 to-transparent" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center text-navy hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-2", categoryColorMap[selectedEvent.category])}>
                      {selectedEvent.category}
                    </span>
                    <h3 className="font-serif text-2xl font-bold mt-2">{selectedEvent.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{selectedEvent.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={selectedEvent.date} />
                    <DetailRow icon={<MapPin className="w-4 h-4" />} label="Venue" value={selectedEvent.venue} />
                    <DetailRow icon={<Users className="w-4 h-4" />} label="Participants" value={`${selectedEvent.participants.toLocaleString()}+`} />
                    <DetailRow icon={<Trophy className="w-4 h-4" />} label="Prize Pool" value={selectedEvent.prizePool} />
                  </div>

                  {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-serif text-sm font-bold text-navy mb-3">Speakers</h4>
                      <div className="space-y-2">
                        {selectedEvent.speakers.map((sp) => (
                          <div key={sp.name} className="flex items-center gap-3 p-3 rounded-lg bg-navy/3">
                            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-navy font-bold text-xs">
                              {sp.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-navy">{sp.name}</div>
                              <div className="text-xs text-muted-foreground">{sp.company} · {sp.topic}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-gold/8 border border-gold/20 mb-5">
                    <h4 className="font-serif text-sm font-bold text-navy mb-2">Registration Form</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="px-3.5 py-2.5 min-h-[44px] rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-white transition-all duration-300 w-full"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="px-3.5 py-2.5 min-h-[44px] rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-white transition-all duration-300 w-full"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="px-3.5 py-2.5 min-h-[44px] rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-white transition-all duration-300 w-full"
                      />
                      <input
                        type="text"
                        placeholder="Student / Professional"
                        className="px-3.5 py-2.5 min-h-[44px] rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-white transition-all duration-300 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <PremiumButton variant="navy" size="md" className="flex-1" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />}>
                      Register & Generate QR Pass
                    </PremiumButton>
                    <PremiumButton variant="outline" size="md" onClick={() => setSelectedEvent(null)}>
                      Cancel
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 bg-navy-dark/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.img
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={lightboxImage}
                alt="Enlarged gallery view"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-navy/3">
      <div className="w-7 h-7 rounded-md bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="text-sm font-semibold text-navy truncate">{value}</div>
      </div>
    </div>
  );
}
