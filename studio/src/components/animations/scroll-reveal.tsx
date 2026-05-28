"use client";

import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitial = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: 60 };
      case "down": return { opacity: 0, y: -60 };
      case "left": return { opacity: 0, x: 60 };
      case "right": return { opacity: 0, x: -60 };
      case "none": return { opacity: 0 };
      default: return { opacity: 0, y: 60 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitial()}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : getInitial()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered children container
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayStart?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayStart = 0,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayStart,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

// Stagger item for use inside StaggerContainer
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
}: StaggerItemProps) {
  const getVariants = (): Variants => {
    const base = { opacity: 0 };
    switch (direction) {
      case "up": return { hidden: { ...base, y: 40 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { ...base, y: -40 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { ...base, x: 40 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { ...base, x: -40 }, visible: { opacity: 1, x: 0 } };
      case "scale": return { hidden: { ...base, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
      default: return { hidden: { ...base, y: 40 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
