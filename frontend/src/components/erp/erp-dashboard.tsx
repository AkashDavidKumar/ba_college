"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  CalendarCheck,
  Award,
  CalendarDays,
  ClipboardList,
  CreditCard,
  BookOpen,
  PenLine,
  ClipboardCheck,
  FlaskConical,
  Users,
  UserPlus,
  Building2,
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle,
  Calculator,
  GitCompare,
  MapPin,
  Upload,
  ArrowRight,
  Bell,
  Search,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { erpModules, admissionsPortalFeatures } from "@/lib/university-data";
import { SectionHeading, GlassCard, AnimatedCounter, Reveal, DepartmentIcon, PremiumButton } from "@/components/site/primitives";
import { useNav } from "@/components/site/nav-context";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  CalendarCheck,
  Award,
  CalendarDays,
  ClipboardList,
  CreditCard,
  BookOpen,
  PenLine,
  ClipboardCheck,
  FlaskConical,
  Users,
  UserPlus,
  Building2,
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle,
  Calculator,
  GitCompare,
  MapPin,
  Upload,
};

type Role = "student" | "faculty" | "admin";

export function ErpDashboard() {
  const { goHome, goAdmissions } = useNav();
  const [role, setRole] = useState<Role>("student");

  const roleConfig: Record<Role, { label: string; icon: typeof Users; name: string; id: string }> = {
    student: { label: "Student", icon: Users, name: "Arjun Sharma", id: "VER2023-CS-1042" },
    faculty: { label: "Faculty", icon: BookOpen, name: "Dr. Priya Sharma", id: "FAC-CSE-2018" },
    admin: { label: "Admin", icon: Settings, name: "Registrar Office", id: "ADM-VER-001" },
  };

  const currentRole = roleConfig[role];

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-navy-dark text-white/70 text-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5">
          <button onClick={goHome} className="hover:text-gold transition-colors font-medium">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-light font-medium">ERP Portal</span>
        </div>
      </div>

      {/* Header strip */}
      <section className="bg-navy-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center text-navy font-bold text-xl shrink-0">
                {currentRole.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold leading-tight">{currentRole.name}</h1>
                <p className="text-white/70 text-sm">
                  {currentRole.label} ID: <span className="text-gold-light font-mono">{currentRole.id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full glass-navy flex items-center justify-center text-white hover:bg-white/15">
                <Search className="w-4 h-4" />
              </button>
              <button className="relative w-10 h-10 rounded-full glass-navy flex items-center justify-center text-white hover:bg-white/15">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />
              </button>
              <button className="w-10 h-10 rounded-full glass-navy flex items-center justify-center text-white hover:bg-white/15">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={goHome} className="w-10 h-10 rounded-full glass-navy flex items-center justify-center text-white hover:bg-white/15">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role switcher */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(roleConfig) as Role[]).map((r) => {
              const cfg = roleConfig[r];
              const Icon = cfg.icon;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                    role === r
                      ? "bg-gold-gradient text-navy shadow-gold"
                      : "glass-navy text-white hover:bg-white/15"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cfg.label} ERP
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats overview */}
      <section className="container mx-auto px-4 sm:px-6 py-10">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {role === "student" && (
              <>
                <OverviewStat icon={CalendarCheck} label="Attendance" value="87%" trend="+2%" />
                <OverviewStat icon={Award} label="Current GPA" value="8.7" trend="+0.3" />
                <OverviewStat icon={ClipboardList} label="Pending Tasks" value="4" trend="2 due today" />
                <OverviewStat icon={CreditCard} label="Fee Status" value="Paid" trend="Next: Mar 2026" />
              </>
            )}
            {role === "faculty" && (
              <>
                <OverviewStat icon={Users} label="Students Mentored" value="42" trend="+5 this term" />
                <OverviewStat icon={BookOpen} label="Active Courses" value="3" trend="2 UG, 1 PG" />
                <OverviewStat icon={ClipboardCheck} label="Pending Evaluations" value="28" trend="Due Friday" />
                <OverviewStat icon={FlaskConical} label="Active Projects" value="6" trend="2 with industry" />
              </>
            )}
            {role === "admin" && (
              <>
                <OverviewStat icon={UserPlus} label="Applications 2026" value={1248} trend="+18% YoY" />
                <OverviewStat icon={Building2} label="Active Departments" value="8" trend="200+ programs" />
                <OverviewStat icon={Users} label="Total Students" value={20180} trend="+540 this year" />
                <OverviewStat icon={TrendingUp} label="Placement Rate" value="95%" trend="+2% vs 2024" />
              </>
            )}
          </div>
        </Reveal>
      </section>

      {/* Module grid */}
      <section className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy mb-1">
              {currentRole.label} Modules
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick access to all {currentRole.label.toLowerCase()} ERP modules.
            </p>
          </div>
          <button className="text-sm font-semibold text-navy hover:text-gold-dark transition-colors hidden sm:block">
            View all →
          </button>
        </div>

        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="contents"
            >
              {erpModules[role].map((module, idx) => {
                const Icon = iconMap[module.icon] ?? BookOpen;
                return (
                  <GlassCard key={module.name} className="p-5 group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-navy/8 group-hover:bg-gold group-hover:text-navy text-navy flex items-center justify-center transition-colors shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base font-bold text-navy mb-1">{module.name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{module.description}</p>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-navy group-hover:text-gold-dark transition-colors">
                          Open module
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Admissions Portal (shown for all roles as a separate highlight) */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Admissions Portal"
            title={
              <>
                A modern <span className="text-gold-gradient">admissions experience</span>
              </>
            }
            description="A seamless, end-to-end admissions portal that takes applicants from interest to enrollment — fully integrated with the BAC ERP."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {admissionsPortalFeatures.map((feature, idx) => {
              const Icon = iconMap[feature.icon] ?? FileText;
              return (
                <Reveal key={feature.name} delay={idx * 0.06}>
                  <GlassCard className="p-6 h-full group">
                    <div className="w-11 h-11 rounded-xl bg-gold/15 group-hover:bg-gold group-hover:text-navy text-gold-dark flex items-center justify-center mb-4 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-navy mb-2">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="mt-12 text-center">
              <PremiumButton variant="navy" size="lg" onClick={goAdmissions} icon={<ArrowRight className="w-4 h-4" />}>
                Open Admissions Portal
              </PremiumButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function OverviewStat({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-navy/8 text-navy flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-semibold text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-bold text-navy mb-0.5">
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </GlassCard>
  );
}
