"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Send,
  Train,
  User,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";

const CONTACT_DEPARTMENTS = [
  { name: "Admissions Office", phone: "0422-2316731", email: "admissions@bishopambrosecollege.edu.in", timing: "08:30 AM – 04:30 PM" },
  { name: "Principal's Office", phone: "0422-2310656", email: "principal@bishopambrosecollege.edu.in", timing: "09:00 AM – 04:00 PM" },
  { name: "Controller of Examinations (COE)", phone: "0422-2310657", email: "coe@bishopambrosecollege.edu.in", timing: "09:00 AM – 04:30 PM" },
  { name: "Placement & Career Guidance Cell", phone: "0422-2310658", email: "placement@bishopambrosecollege.edu.in", timing: "08:30 AM – 04:30 PM" },
  { name: "Accounts & Fees Section", phone: "0422-2310655", email: "accounts@bishopambrosecollege.edu.in", timing: "09:00 AM – 03:30 PM" },
  { name: "IQAC Office", phone: "0422-2310655 (Ext. 112)", email: "iqac@bishopambrosecollege.edu.in", timing: "09:00 AM – 04:00 PM" },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Admissions Inquiry",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <span className="text-gold-light">Contact Us</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5" /> We're Here to Help
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Get in Touch with Bishop Ambrose College
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Have questions regarding admissions, academic programmes, campus visits, or administrative services? Reach out to our dedicated faculty and staff.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-12">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Reveal delay={0.05}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                  <MapPin className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-bold text-base text-navy">Campus Location</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bishop Ambrose College<br />
                  Sungam Bypass Road, Ramanathapuram,<br />
                  Coimbatore, Tamil Nadu – 641045, India
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=Bishop+Ambrose+College+Coimbatore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-dark hover:underline"
              >
                View on Google Maps <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                  <Phone className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-bold text-base text-navy">Call Us</h3>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p><strong>Admission Helpline:</strong> 0422-2316731</p>
                  <p><strong>College Landline:</strong> 0422-2310655</p>
                  <p><strong>Principal's Desk:</strong> 0422-2310656</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Available Monday to Saturday</span>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                  <Mail className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-bold text-base text-navy">Email Inquiries</h3>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p><strong>General:</strong> bishopambrosecollege1@gmail.com</p>
                  <p><strong>Admissions:</strong> admissions@bishopambrosecollege.edu.in</p>
                  <p><strong>Controller of Exams:</strong> coe@bishopambrosecollege.edu.in</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Typical response time: 24–48 hours</span>
            </div>
          </Reveal>
        </div>

        {/* Main Grid: Form + Department Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-navy">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to Bishop Ambrose College. Our admissions / administrative desk will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-dark"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-2xl font-serif font-bold text-navy">Send an Inquiry</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below and the relevant college department will respond to your query.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Maria Joseph"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number *
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
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none bg-white"
                    >
                      <option>Admissions & Eligibility (2026-27)</option>
                      <option>Fee Structure & Scholarships</option>
                      <option>Examination & Results</option>
                      <option>Placement & Campus Drives</option>
                      <option>Alumni Affairs</option>
                      <option>General Administration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Subject *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Brief summary of your query"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your query or requirement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-navy-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-gold" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Department Directory */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-navy">Department Extensions</h3>
                <Badge variant="navy">Direct Contacts</Badge>
              </div>

              <div className="divide-y divide-slate-100">
                {CONTACT_DEPARTMENTS.map((dept, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-navy">{dept.name}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{dept.timing}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <Phone className="w-3 h-3 text-gold-dark" /> {dept.phone}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3 h-3 text-gold-dark" /> {dept.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timings card */}
            <div className="bg-navy text-white rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <Clock className="w-4 h-4" />
                <h4 className="font-bold text-sm">Working Hours</h4>
              </div>
              <div className="space-y-1.5 text-xs text-white/80">
                <div className="flex justify-between">
                  <span>Monday – Friday:</span>
                  <span className="font-semibold text-white">08:30 AM – 04:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold text-white">08:30 AM – 01:00 PM</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Sunday & Public Holidays:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Reach BAC */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-2xl font-serif font-bold text-navy">How to Reach Bishop Ambrose College</h3>
            <p className="text-xs text-slate-500 mt-1">
              Located conveniently in Ramanathapuram, Coimbatore along Sungam Bypass Road with excellent public transit access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-navy font-bold text-sm">
                <Navigation className="w-4 h-4 text-gold-dark" /> City Bus Connectivity
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct city buses from <strong>Gandhipuram</strong> (Bus Stand), <strong>Ukkadam</strong>, and <strong>Singanallur</strong> stop right at Ramanathapuram / Sungam Bypass junction (300m from college gate).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-navy font-bold text-sm">
                <Train className="w-4 h-4 text-gold-dark" /> From Railway Station
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Coimbatore Junction (CBE)</strong> is approximately <strong>4.5 km</strong> away. Taxi and auto-rickshaws take 10–15 minutes via Trichy Road / Sungam Bypass.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-navy font-bold text-sm">
                <Plane className="w-4 h-4 text-gold-dark" /> From Coimbatore Airport
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Coimbatore International Airport (CJB)</strong> is approximately <strong>9.0 km</strong> away. Reachable in 20 minutes via Avinashi Road and Sungam Bypass.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
