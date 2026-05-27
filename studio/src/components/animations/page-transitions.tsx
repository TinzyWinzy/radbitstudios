"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Skeleton loader
export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-muted rounded-md ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4 p-6 rounded-xl border border-border">
          <SkeletonPulse className="h-12 w-12" />
          <SkeletonPulse className="h-6 w-3/4" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-border">
          <SkeletonPulse className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-1/3" />
            <SkeletonPulse className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
