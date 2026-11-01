"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Headset,
} from "lucide-react";
import { SectionHeading, Reveal, staggerContainer, staggerItem } from "@/components/site/primitives";

const contactDetails = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["College Campus, Knowledge City,", "Bangalore, Karnataka – 560100"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 80 4567 8900", "+91 80 4567 8901"],
    isLink: "tel",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["admissions@college.edu", "info@college.edu"],
    isLink: "mailto",
  },
  {
    icon: Headset,
    title: "Admission Helpline",
    lines: ["1800-XXX-XXXX (Toll Free)", "Mon – Sat, 9 AM – 6 PM"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    lines: ["Monday – Friday: 9 AM – 5 PM", "Saturday: 9 AM – 1 PM"],
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    lines: ["+91 98765 43210", "Quick replies within 30 mins"],
  },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="relative py-12 sm:py-20 lg:py-28 bg-background overflow-hidden">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-64 blob bg-gold/8 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 blob bg-navy/5 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          eyebrow="Get in Touch"
          title={
            <>
              We'd love to{" "}
              <span className="text-gold-gradient">hear from you</span>
            </>
          }
          description="Have questions about admissions, programs, or campus life? Reach out and our team will respond within one business day."
        />

        <div className="grid lg:grid-cols-5 gap-8 mt-14">
          {/* Left: maroon panel with contact details */}
          <Reveal className="lg:col-span-2">
            <div className="bg-navy-gradient text-white rounded-2xl p-7 h-full relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 blob bg-gold/20 pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 blob bg-white/5 pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-widest mb-5">
                  <MapPin className="w-3 h-3" />
                  Contact Details
                </div>

                <h3 className="font-serif text-2xl font-bold mb-6 leading-tight">
                  Let's start a conversation
                </h3>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="space-y-5"
                >
                  {contactDetails.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <motion.div key={detail.title} variants={staggerItem} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4.5 h-4.5 text-emerald-300" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1">
                            {detail.title}
                          </div>
                          {detail.lines.map((line, i) =>
                            detail.isLink ? (
                              <a
                                key={i}
                                href={`${detail.isLink}:${line.replace(/\s/g, "")}`}
                                className="block text-sm text-white/95 hover:text-white transition-colors font-medium"
                              >
                                {line}
                              </a>
                            ) : (
                              <div key={i} className="text-sm text-white/95 font-medium">
                                {line}
                              </div>
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </Reveal>

          {/* Right: form + map */}
          <Reveal delay={0.1} className="lg:col-span-3 space-y-6">
            {/* Inquiry form */}
            <div className="glass-card rounded-2xl p-7 border border-emerald-200/60 shadow-lg">
              <h3 className="font-serif text-xl font-bold text-[#14532D] mb-5">Send us a message</h3>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-12 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#166534]" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#14532D]">Message Sent!</h4>
                  <p className="text-[#374151] text-sm max-w-xs font-normal">
                    Thank you for reaching out. Our admissions team will get back to you within one business day.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="text-sm font-bold text-[#166534] hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] focus:outline-none text-sm bg-white text-[#1F2937] placeholder:text-gray-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] focus:outline-none text-sm bg-white text-[#1F2937] placeholder:text-gray-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] focus:outline-none text-sm bg-white text-[#1F2937] placeholder:text-gray-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                        Subject *
                      </label>
                      <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] focus:outline-none text-sm bg-white text-[#1F2937] transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option>Admission Enquiry</option>
                        <option>Program Information</option>
                        <option>Scholarship Details</option>
                        <option>Campus Visit</option>
                        <option>General Enquiry</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] focus:outline-none text-sm bg-white text-[#1F2937] placeholder:text-gray-500 resize-none transition-colors"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#14532D] text-white font-bold text-sm hover:bg-navy-dark transition-all shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden shadow-premium border border-navy/8 h-64">
              <iframe
                title="College Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.44923192442!2d77.49085452139964!3d12.954517000000014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
