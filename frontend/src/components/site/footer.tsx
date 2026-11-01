"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Download,
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Award,
  Crown,
  ShieldCheck,
  Star,
  BadgeCheck,
  ChevronRight,
  Send,
} from "lucide-react";
import { departments } from "@/lib/university-data";
import { useNav } from "./nav-context";
import { Logo, PremiumButton, DepartmentIcon, Reveal } from "./primitives";
import { useSiteData, defaultFooterSections } from "@/lib/site-context";
import { LocationSection } from "./location-section";

const quickLinks = ["Privacy Policy", "Terms & Conditions", "Accessibility", "Sitemap", "RTI", "Anti-Ragging", "Grievance Redressal"];

const accreditationBadges = [
  { name: "Autonomous", icon: Star, color: "text-gold" },
  { name: "Bharathiar University", icon: Crown, color: "text-gold" },
  { name: "UGC 2(f) & 12(B)", icon: BadgeCheck, color: "text-gold" },
  { name: "NAAC Accredited", icon: ShieldCheck, color: "text-gold" },
  { name: "NIRF Participated", icon: Award, color: "text-gold" },
  { name: "AICTE Approved", icon: BadgeCheck, color: "text-gold" },
];

const socials = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

export function Footer() {
  const shouldReduceMotion = useReducedMotion();
  const {
    goHome, goDepartment, goEvents, goAdmissions, goAbout, goAcademic,
    goStudentActivities, goIqac, goExamination, goAutonomous, goLibrary,
    goNirf, goAlumni, goContact, goFacilities, goGallery, goPlacements, goNews,
  } = useNav();
  const goErp = goAdmissions;
  const [email, setEmail] = useState("");
  const { data } = useSiteData();

  const scrollToLocation = () => {
    const el = document.getElementById("campus-location");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      goContact();
    }
  };

  const footerData = data?.footer;
  const currentSections = footerData?.sections && footerData.sections.length > 0 ? footerData.sections : defaultFooterSections;
  const ctaBadge = footerData?.ctaBadge || "Admissions Open 2026-27";
  const ctaTitle = footerData?.ctaTitle || "Begin Your Academic Journey at BAC";
  const ctaDescription = footerData?.ctaDescription || "Join thousands of students who chose Bishop Ambrose College for quality higher education, modern infrastructure, and proven campus placements in Coimbatore.";
  const aboutText = footerData?.aboutText || "Bishop Ambrose College is an Autonomous, Co-Educational institution affiliated with Bharathiar University, Coimbatore. Established in 1994, the college is dedicated to academic excellence, ethical values, and holistic career formation.";
  const address = footerData?.address || "Sungam Bypass Road, Ramanathapuram, Coimbatore, Tamil Nadu – 641045";
  const phone = footerData?.phone || "0422-2316731 / 0422-2310655";
  const emailVal = footerData?.email || "bishopambrosecollege1@gmail.com";

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: footerData?.facebook || "#" },
    { name: "Twitter", icon: Twitter, href: footerData?.twitter || "#" },
    { name: "Instagram", icon: Instagram, href: footerData?.instagram || "#" },
    { name: "LinkedIn", icon: Linkedin, href: footerData?.linkedin || "#" },
    { name: "YouTube", icon: Youtube, href: footerData?.youtube || "#" },
  ];

  return (
    <footer className="bg-navy-dark text-white relative overflow-hidden mt-auto">
      {/* Decorative */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 blob bg-gold/10" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 blob bg-violet-500/10" />
      <div className="absolute inset-0 pattern-grid opacity-5 mix-blend-overlay" />

      {/* Footer CTA */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-14 lg:py-20">
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <Star className="w-3 h-3" />
                  {ctaBadge}
                </div>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-3 text-shadow-subtle">
                  {ctaTitle}
                </h2>
                <p className="text-white/90 max-w-xl font-normal leading-relaxed text-shadow-subtle">
                  {ctaDescription}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 lg:justify-end w-full lg:w-auto">
                <PremiumButton variant="gold" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
                  Apply Now
                </PremiumButton>
                <PremiumButton variant="outline-light" size="lg" onClick={goAdmissions} icon={<Download className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
                  Download Brochure
                </PremiumButton>
                <PremiumButton variant="ghost" size="lg" className="text-white hover:bg-white/10 w-full sm:w-auto justify-center border border-white/20" icon={<Calendar className="w-4 h-4" />} onClick={scrollToLocation}>
                  Campus Visit
                </PremiumButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Location / Find Us Section */}
      <LocationSection onContactClick={goAdmissions} />

      {/* Main footer */}
      <div className="relative container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Top: brand + newsletter */}
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-10 pb-10 border-b border-white/10">
            <div className="max-w-md">
              <Logo variant="light" onClick={goHome} />
              <p className="text-white/90 text-sm leading-relaxed mt-5 mb-5 font-normal">
                {aboutText}
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-white/95 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/95 font-medium">
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-emerald-200 transition-colors py-1">
                    {phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-white/95 font-medium">
                  <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                  <a href={`mailto:${emailVal}`} className="hover:text-emerald-200 transition-colors py-1">
                    {emailVal}
                  </a>
                </div>
              </div>

              {/* Socials */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.7 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.4,
                        delay: shouldReduceMotion ? 0 : 0.12 + idx * 0.05,
                        ease: "easeOut",
                      }}
                      whileHover={shouldReduceMotion ? {} : { scale: 1.12, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-gold hover:text-navy flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

          {/* Newsletter */}
          <div className="lg:justify-self-end lg:max-w-md w-full">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="font-serif text-lg font-bold mb-2 text-white">Stay Updated</h3>
              <p className="text-sm text-white/90 mb-4 leading-relaxed font-normal">
                Subscribe to our newsletter for admissions updates, event invitations, and stories from the BAC community.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail("");
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="w-11 h-11 rounded-full bg-white text-[#14532D] flex items-center justify-center hover:bg-emerald-50 transition-all shrink-0 font-bold shadow-md"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4 text-[#14532D]" />
                </button>
              </form>
              <div className="text-[10px] text-white/75 leading-relaxed">
                By subscribing, you agree to receive emails from BAC. You can unsubscribe at any time. We respect your privacy.
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        {/* Footer link sections */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 py-10 border-b border-white/10">
          {currentSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : idx * 0.08,
                ease: "easeOut",
              }}
            >
              <h4 className="font-serif text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => {
                  const isDeptLink = section.isDepartment;
                  const dept = isDeptLink
                    ? departments.find((d) => d.shortName === link || d.name === link)
                    : null;
                  return (
                    <li key={link}>
                      <button
                        onClick={() => {
                          const l = link.toLowerCase();
                          if (l.includes("map") || l.includes("visit") || l.includes("contact")) goContact();
                          else if (l.includes("about") || l.includes("history") || l.includes("governance")) goAbout();
                          else if (l.includes("autonomous")) goAutonomous();
                          else if (l.includes("library")) goLibrary();
                          else if (l.includes("nirf")) goNirf();
                          else if (l.includes("iqac") || l.includes("aqar")) goIqac();
                          else if (l.includes("exam")) goExamination();
                          else if (l.includes("placement") || l.includes("recruit")) goPlacements();
                          else if (l.includes("alumni")) goAlumni();
                          else if (l.includes("facilit") || l.includes("lab") || l.includes("hostel")) goFacilities();
                          else if (l.includes("activit") || l.includes("sport") || l.includes("club") || l.includes("council")) goStudentActivities();
                          else if (l.includes("news") || l.includes("announc")) goNews();
                          else if (l.includes("gallery")) goGallery();
                          else if (section.title === "Admissions" || l.includes("apply") || l.includes("fee") || l.includes("scholarship")) goAdmissions();
                          else if (section.title === "Events" || l.includes("event")) goEvents();
                          else if (dept) goDepartment(dept.slug);
                          else goHome();
                        }}
                        className="text-sm text-white/85 hover:text-white transition-colors text-left inline-flex items-center gap-1 group py-0.5 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all text-gold" />
                        {link}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Accreditation badges */}
        <div className="py-8 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="text-xs uppercase tracking-widest text-gold-light/90 font-bold w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
              Accredited by
            </div>
            {accreditationBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.4,
                    delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.05,
                    ease: "easeOut",
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                >
                  <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                  <span className="text-xs font-semibold text-white/90">{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-xs text-white/80">
            © 2026 Bishop Ambrose College, Coimbatore. All rights reserved. ·{" "}
            <span className="text-gold-light font-medium">Autonomous · Affiliated to Bharathiar University.</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {quickLinks.map((link) => (
              <button
                key={link}
                className="text-xs text-white/80 hover:text-white transition-colors py-1 cursor-pointer"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
