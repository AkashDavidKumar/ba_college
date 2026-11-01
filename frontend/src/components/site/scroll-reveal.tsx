"use client";

import React from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  viewportOnce?: boolean;
}

const defaultEase = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

export function FadeUp({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewportOnce = true
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: defaultEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeLeft({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewportOnce = true
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: viewportOnce, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: defaultEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeRight({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewportOnce = true
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: viewportOnce, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: defaultEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewportOnce = true
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: viewportOnce, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: defaultEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerChildren = 0.08,
  className,
  viewportOnce = true
}: {
  children: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  viewportOnce?: boolean;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewportOnce, margin: "-10% 0px -10% 0px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: defaultEase
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
