"use client";

import { motion, useInView, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ============== SectionHeading ============== */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  variant = "default",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  variant?: "default" | "on-dark";
  className?: string;
}) {
  const isDark = variant === "on-dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 max-w-3xl",
        align === "center" ? "mx-auto text-center items-center" : "text-left items-start",
        className
      )}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all",
            isDark
              ? "bg-white/15 text-emerald-200 border border-emerald-300/40 backdrop-blur-md shadow-xs"
              : "bg-[#F1F8F2] text-[#14532D] border border-[#DCE8DE] shadow-xs"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full animate-pulse", isDark ? "bg-emerald-300" : "bg-[#2E7D32]")} />
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={cn(
          "font-serif font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl leading-[1.18]",
          isDark ? "text-white text-shadow-on-dark" : "text-[#14532D]"
        )}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={cn(
            "text-base sm:text-lg leading-relaxed font-medium tracking-normal",
            isDark ? "text-white/90" : "text-[#68766C]",
            align === "center" && "max-w-2xl"
          )}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

/* ============== GlassCard ============== */
export function GlassCard({
  children,
  className,
  variant = "default",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "navy";
  hover?: boolean;
}) {
  const variantClass =
    variant === "strong" ? "glass-strong" : variant === "navy" ? "glass-navy" : "glass-card";
  return (
    <motion.div
      whileHover={hover ? { y: -6, transition: { duration: 0.25, ease: "easeOut" } } : undefined}
      className={cn(
        variantClass,
        "rounded-2xl sm:rounded-3xl transition-all duration-300 relative overflow-hidden",
        hover && "hover:shadow-2xl hover:border-emerald-500/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/* ============== AnimatedCounter ============== */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2000,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      const formatted =
        value >= 1000
          ? Math.floor(latest).toLocaleString("en-US")
          : Math.floor(latest).toString();
      setDisplay(formatted);
    });
  }, [springValue, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ============== Reveal (smooth scroll reveal animation) ============== */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  key?: React.Key;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* ============== DepartmentIcon ============== */
import {
  Cpu,
  BrainCircuit,
  Briefcase,
  Dna,
  Brain,
  Palette,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  BrainCircuit,
  Briefcase,
  Dna,
  Brain,
  Palette,
  GraduationCap,
  ShieldCheck,
};

export function DepartmentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Cpu;
  return <Icon className={className} />;
}

import { useSiteData } from "@/lib/site-context";

/* ============== Logo ============== */
export function Logo({
  variant = "dark",
  onClick,
  className,
}: {
  variant?: "dark" | "light";
  onClick?: () => void;
  className?: string;
}) {
  const { data } = useSiteData();
  const text1 = data?.logo?.text1 && data?.logo?.text1 !== "BAC" ? data.logo.text1 : "Bishop Ambrose College";
  const text2 = data?.logo?.text2 && data?.logo?.text2 !== "Global University" ? data.logo.text2 : "— ESTD. 1968 —";
  const logoImage = data?.logo?.image;

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 sm:gap-2.5 min-h-[44px] group text-left cursor-pointer shrink-0 select-none", className)}
      aria-label={`${text1} ${text2} Home`}
    >
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
        {logoImage ? (
          <img
            src={logoImage}
            alt="Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105 shrink-0" fill="none">
            {/* Academic laurel crest in Institutional Green */}
            <circle cx="24" cy="24" r="22" stroke={variant === "dark" ? "#2E7D32" : "#81C784"} strokeWidth="1.75" strokeDasharray="3 2" />
            <circle cx="24" cy="24" r="18" fill={variant === "dark" ? "#F1F8F2" : "rgba(255,255,255,0.15)"} stroke={variant === "dark" ? "#14532D" : "#FFFFFF"} strokeWidth="1.5" />
            {/* Open Book */}
            <path d="M15 28C18 26.5 21 26.5 24 28V19C21 17.5 18 17.5 15 19V28Z" fill={variant === "dark" ? "#14532D" : "#FFFFFF"} />
            <path d="M33 28C30 26.5 27 26.5 24 28V19C27 17.5 30 17.5 33 19V28Z" fill={variant === "dark" ? "#2E7D32" : "#81C784"} />
            <path d="M24 19V28" stroke={variant === "dark" ? "#F1F8F2" : "#14532D"} strokeWidth="1" />
          </svg>
        )}
      </div>
      <div className="flex flex-col items-start leading-none min-w-0 whitespace-nowrap">
        <span
          className={cn(
            "font-serif font-bold text-base sm:text-lg tracking-tight whitespace-nowrap",
            variant === "dark" ? "text-[#14532D]" : "text-white"
          )}
        >
          {text1}
        </span>
        <span
          className={cn(
            "text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap mt-1",
            variant === "dark" ? "text-[#2E7D32]" : "text-white/80"
          )}
        >
          {text2}
        </span>
      </div>
    </button>
  );
}

/* ============== Premium Button ============== */
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "navy" | "gold" | "outline" | "ghost" | "white" | "outline-light" | "primary" | "secondary" | "highlight";
type ButtonSize = "sm" | "md" | "lg";

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  className,
  icon,
  ...props
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-bold rounded-lg min-h-[42px] transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2E7D32]/80 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none overflow-hidden group touch-manipulation cursor-pointer";
  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs sm:text-sm px-4 py-2 rounded-md",
    md: "text-sm px-5 py-2.5 rounded-lg",
    lg: "text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "btn-primary bg-[#2E7D32] text-white hover:bg-[#14532D] shadow-sm hover:shadow-md",
    secondary: "btn-secondary bg-white text-[#2E7D32] border-2 border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white shadow-xs",
    highlight: "btn-highlight bg-[#4CAF50] text-white hover:bg-[#2E7D32] shadow-sm",
    navy: "btn-navy bg-[#14532D] text-white hover:bg-[#0B3B24] shadow-sm",
    gold: "btn-primary bg-[#2E7D32] text-white hover:bg-[#14532D] shadow-sm",
    outline: "border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white",
    ghost: "text-[#14532D] hover:bg-[#F1F8F2] hover:text-[#2E7D32]",
    white: "bg-white text-[#14532D] hover:bg-[#F1F8F2] shadow-sm",
    "outline-light": "border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props as any}
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <span className="relative inline-flex items-center gap-1.5">
        {children}
        {icon && (
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
}

/* ============== Badge ============== */
export function Badge({
  children,
  variant = "navy",
  className,
}: {
  children: React.ReactNode;
  variant?: "navy" | "gold" | "emerald" | "outline";
  className?: string;
}) {
  const variants = {
    navy: "bg-navy/10 text-navy border-navy/20",
    gold: "bg-gold/20 text-gold-dark border-gold/40",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
    outline: "bg-transparent text-slate-700 border-slate-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant] || variants.navy,
        className
      )}
    >
      {children}
    </span>
  );
}
