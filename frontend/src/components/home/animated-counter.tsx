"use client";

import React, { useEffect, useRef } from "react";
import { useMotionValue, animate, useInView } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 2.0,
  prefix = "",
  suffix = "",
  decimals = 0
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: [0.16, 1, 0.3, 1] // Out-quint ease for smooth deceleration
      });
      return () => controls.stop();
    }
  }, [isInView, value, duration, count]);

  useEffect(() => {
    return count.on("change", (latest) => {
      if (ref.current) {
        let displayVal = latest.toFixed(decimals);
        // Format large integer values with commas
        if (decimals === 0) {
          displayVal = Math.round(latest).toLocaleString();
        }
        ref.current.textContent = prefix + displayVal + suffix;
      }
    });
  }, [count, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
