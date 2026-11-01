"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Calculator,
  GitCompare,
  MapPin,
  Upload,
  FileText,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  X,
  Loader2
} from "lucide-react";
import { admissionsPortalFeatures, departments } from "@/lib/university-data";
import {
  SectionHeading,
  GlassCard,
  Reveal,
  PremiumButton,
  staggerContainer,
  staggerItem,
} from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { useSiteData } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof FileText> = {
  FileText,
  CheckCircle,
  Calculator,
  GitCompare,
  MapPin,
  Upload,
};

export function AdmissionsPage() {
  const { goHome, goDepartment } = useNav();
  const { data, submitApplication } = useSiteData();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState("");
  const [gpa, setGpa] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const deptList = data?.departments || departments;
  const featuresList = data?.admissionsPortalFeatures || admissionsPortalFeatures;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !program) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast({
        title: "Required Fields",
        description: "Please fill in all mandatory fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const ok = await submitApplication({
        name,
        email,
        phone,
        program,
        gpa,
        notes,
      });

      if (ok) {
        setSuccess(true);
        toast({
          title: "Application Submitted!",
          description: "Your application has been received. Our review team will update your status soon.",
        });
        setTimeout(() => {
          setFormOpen(false);
          setSuccess(false);
          setName("");
          setEmail("");
          setPhone("");
          setProgram("");
          setGpa("");
          setNotes("");
        }, 2200);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applicationSteps = [
    { number: 1, title: "Create Profile", description: "Sign up with your email and basic details." },
    { number: 2, title: "Choose Program", description: "Browse 200+ programs and select your fit." },
    { number: 3, title: "Eligibility Check", description: "Instant verification based on your academics." },
    { number: 4, title: "Upload Documents", description: "Secure upload of transcripts and ID proof." },
    { number: 5, title: "Pay Application Fee", description: "Online payment with multiple options." },
    { number: 6, title: "Track Application", description: "Real-time status updates via email and portal." },
  ];

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">Admissions</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-navy-gradient text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80"
            alt="Admissions"
            className="w-full h-full object-cover opacity-25"
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
              Admissions Open · 2026 Intake
            </div>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-5">
              Your journey to <span className="text-gold-gradient">BAC</span> starts here
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              A modern, transparent admissions experience. Apply in 6 simple steps, track your
              application in real-time, and join 20,000+ students who chose BAC.
            </p>
            <div className="flex flex-wrap gap-3">
              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => setFormOpen(true)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Your Application
              </PremiumButton>
              <PremiumButton variant="outline-light" size="lg" icon={<FileText className="w-4 h-4" />}>
                Download Prospectus
              </PremiumButton>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl">
              <div className="glass-navy rounded-xl p-4">
                <div className="font-serif text-2xl font-bold text-gold-light mb-0.5">200+</div>
                <div className="text-xs text-white/70">Programs</div>
              </div>
              <div className="glass-navy rounded-xl p-4">
                <div className="font-serif text-2xl font-bold text-gold-light mb-0.5">₹50Cr+</div>
                <div className="text-xs text-white/70">Scholarships</div>
              </div>
              <div className="glass-navy rounded-xl p-4">
                <div className="font-serif text-2xl font-bold text-gold-light mb-0.5">95%</div>
                <div className="text-xs text-white/70">Placement</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Admissions Portal Features */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Admissions Portal"
            title={<>Everything you need, <span className="text-gold-gradient">in one place</span></>}
            description="A modern admissions portal designed to make your application journey seamless, transparent, and stress-free."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12"
          >
            {featuresList.map((feature) => {
              const Icon = iconMap[feature.icon] ?? FileText;
              return (
                <motion.div key={feature.name} variants={staggerItem}>
                  <GlassCard className="p-6 h-full group">
                    <div className="w-12 h-12 rounded-xl bg-navy/8 group-hover:bg-gold group-hover:text-navy text-navy flex items-center justify-center mb-4 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-navy mb-2">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Application Process Timeline */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Application Process"
            title={<>Six simple steps to <span className="text-gold-gradient">enrollment</span></>}
            description="Our streamlined process takes you from interest to enrollment in days, not months."
          />

          <div className="mt-12 grid lg:grid-cols-3 gap-5">
            {applicationSteps.map((step, idx) => (
              <Reveal key={step.number} delay={idx * 0.05}>
                <div
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                    activeStep === idx
                      ? "bg-navy-gradient text-white shadow-premium"
                      : "glass-card text-navy hover:shadow-premium"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-xl shrink-0 ${
                        activeStep === idx
                          ? "bg-gold-gradient text-navy"
                          : "bg-navy/8 text-navy"
                      }`}
                    >
                      {step.number}
                    </div>
                    {idx < applicationSteps.length - 1 && (
                      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-px bg-navy/15 z-10" />
                    )}
                  </div>
                  <h4 className="font-serif text-lg font-bold mb-1">{step.title}</h4>
                  <p className={`text-sm leading-relaxed ${activeStep === idx ? "text-white/80" : "text-muted-foreground"}`}>
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 text-center">
              <PremiumButton
                variant="navy"
                size="lg"
                onClick={() => setFormOpen(true)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Your Application
              </PremiumButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Eligibility + Scholarship Calculator */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Tools"
            title={<>Plan your <span className="text-gold-gradient">BAC journey</span></>}
            description="Use our tools to check eligibility, estimate scholarships, and compare programs side-by-side."
          />

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            {/* Eligibility Checker */}
            <Reveal>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy">Eligibility Checker</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                      Highest Qualification
                    </label>
                    <select className="w-full px-3 py-2.5 rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold bg-white">
                      <option>10+2 (Higher Secondary)</option>
                      <option>Bachelor&apos;s Degree</option>
                      <option>Master&apos;s Degree</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                        Aggregate %
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 85"
                        className="w-full px-3 py-2.5 rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                        Stream
                      </label>
                      <select className="w-full px-3 py-2.5 rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold bg-white">
                        <option>Science (PCM)</option>
                        <option>Science (PCB)</option>
                        <option>Commerce</option>
                        <option>Arts/Humanities</option>
                      </select>
                    </div>
                  </div>
                  <PremiumButton variant="navy" size="md" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
                    Check Eligibility
                  </PremiumButton>
                </div>
              </GlassCard>
            </Reveal>

            {/* Scholarship Calculator */}
            <Reveal delay={0.08}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy">Scholarship Calculator</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                      Program of Interest
                    </label>
                    <select className="w-full px-3 py-2.5 rounded-lg border border-navy/10 text-sm focus:outline-none focus:border-gold bg-white">
                      {deptList.flatMap((d) => d.programs).slice(0, 6).map((p) => (
                        <option key={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                      Academic Score (%)
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      defaultValue="80"
                      className="w-full accent-gold"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/8 border border-gold/20">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Estimated Scholarship
                    </div>
                    <div className="font-serif text-2xl font-bold text-navy">₹2,40,000 / year</div>
                    <div className="text-xs text-gold-dark font-medium mt-0.5">Merit-based · Subject to verification</div>
                  </div>
                  <PremiumButton variant="gold" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                    Apply for Scholarship
                  </PremiumButton>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Program Comparison */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Compare Programs"
            title={<>Find the <span className="text-gold-gradient">perfect fit</span></>}
            description="Compare up to four programs side-by-side across curriculum, fees, placements, and career outcomes."
          />

          <Reveal>
            <div className="flex items-center justify-between mt-8 mb-2 sm:hidden text-xs text-muted-foreground px-1 font-medium">
              <span>Swipe horizontally to compare programs</span>
              <span>→</span>
            </div>
            <div className="mt-2 sm:mt-12 overflow-x-auto scrollbar-premium rounded-2xl border border-navy/10 sm:border-0">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Program
                    </th>
                    <th className="text-center py-4 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Duration
                    </th>
                    <th className="text-center py-4 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Level
                    </th>
                    <th className="text-center py-4 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Avg Package
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deptList
                    .flatMap((d) => d.programs.slice(0, 1).map((p) => ({ ...p, dept: d.shortName })))
                    .slice(0, 6)
                    .map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-navy/5 hover:bg-navy/3 transition-colors group"
                      >
                        <td className="py-4 px-4">
                          <div className="font-serif text-sm font-bold text-navy leading-tight">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.dept}</div>
                        </td>
                        <td className="text-center py-4 px-4 text-sm text-navy">{p.duration}</td>
                        <td className="text-center py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase">
                            {p.level}
                          </span>
                        </td>
                        <td className="text-center py-4 px-4 text-sm font-semibold text-navy">₹12 LPA</td>
                        <td className="text-right py-4 px-4">
                          <button
                            onClick={() => goDepartment(deptList.find((d) => d.shortName === p.dept)!.slug, "programs")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold-dark transition-colors"
                          >
                            View
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 lg:py-24 bg-navy-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-15 mix-blend-overlay" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 blob bg-gold/30" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <Reveal>
              <div>
                <Shield className="w-10 h-10 text-gold-light mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold mb-2">Secure & Encrypted</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  Bank-grade encryption and ISO 27001 certified data security for every application.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <Clock className="w-10 h-10 text-gold-light mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold mb-2">Real-Time Updates</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  Track every step of your application with real-time status updates via email and SMS.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div>
                <CheckCircle className="w-10 h-10 text-gold-light mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold mb-2">Transparent Process</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  Clear eligibility, fees, and scholarship criteria — no hidden charges, no surprises.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Dynamic Admission Application Modal */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={isShaking ? { duration: 0.4 } : { type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl bg-white text-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-premium border border-slate-100 flex flex-col max-h-[92vh] z-10 my-auto"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-navy text-white relative">
                <div className="absolute right-0 top-0 w-32 h-32 blob bg-gold/10 -translate-y-8 translate-x-8" />
                <div className="min-w-0 pr-2">
                  <h3 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                    <Sparkles className="w-5 h-5 text-gold-light shrink-0" /> BAC Application Form
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">Enroll for academic term 2026-2027.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body / Success Screen */}
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-5 shadow-lg shadow-green-100"
                    >
                      <CheckCircle className="w-8 h-8" />
                    </motion.div>
                    <h4 className="font-serif text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h4>
                    <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                      Your details have been successfully uploaded. Our review board will notify you once a reviewer updates your status!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Rahul Sharma"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul.sharma@example.com"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Program of Choice *
                        </label>
                        <select
                          required
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        >
                          <option value="">Select a Program...</option>
                          {deptList.map((dept) => (
                            <optgroup key={dept.slug} label={dept.name}>
                              {dept.programs.map((prog) => (
                                <option key={prog.id} value={`${prog.name} (${dept.shortName})`}>
                                  {prog.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Academic GPA / Percentage (Optional)
                        </label>
                        <input
                          type="text"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="e.g. 9.4 CGPA or 92%"
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                          Supporting Statement / Notes (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Explain your academic interests, sports achievements, or scholarship requests..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 bg-slate-50/40 focus:bg-white transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col-reverse xs:flex-row justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFormOpen(false)}
                        className="px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer w-full xs:w-auto"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center gap-1.5 px-6 py-2.5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all shadow-sm cursor-pointer w-full xs:w-auto"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {submitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
