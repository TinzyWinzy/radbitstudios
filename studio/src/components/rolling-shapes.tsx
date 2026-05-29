"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Shape {
  size: number;
  x: string;
  y: string;
  color: string;
  duration: number;
  delay: number;
  rotateRange: number;
}

const shapes: Shape[] = [
  { size: 500, x: "10%", y: "15%", color: "bg-orange-600/10", duration: 35, delay: 0, rotateRange: 180 },
  { size: 600, x: "70%", y: "10%", color: "bg-red-800/8", duration: 42, delay: 2, rotateRange: 120 },
  { size: 450, x: "40%", y: "60%", color: "bg-amber-700/10", duration: 28, delay: 5, rotateRange: 200 },
  { size: 550, x: "85%", y: "55%", color: "bg-orange-900/12", duration: 38, delay: 1, rotateRange: 160 },
  { size: 400, x: "20%", y: "80%", color: "bg-red-600/8", duration: 30, delay: 7, rotateRange: 140 },
  { size: 480, x: "55%", y: "30%", color: "bg-orange-700/10", duration: 45, delay: 3, rotateRange: 190 },
  { size: 350, x: "75%", y: "85%", color: "bg-red-700/8", duration: 33, delay: 4, rotateRange: 170 },
  { size: 520, x: "5%", y: "45%", color: "bg-amber-800/10", duration: 40, delay: 6, rotateRange: 150 },
];

export function RollingShapes() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Mobile: only 3 static blobs, no animation
  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {shapes.slice(0, 3).map((shape, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[80px] ${shape.color}`}
            style={{
              width: shape.size * 0.6,
              height: shape.size * 0.6,
              left: shape.x,
              top: shape.y,
            }}
          />
        ))}
      </div>
    );
  }

  // Reduced motion: static blobs
  if (prefersReducedMotion) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {shapes.slice(0, 4).map((shape, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[100px] ${shape.color}`}
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
          />
        ))}
      </div>
    );
  }

  // Desktop: full animation with will-change for GPU acceleration
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style={{ contain: 'layout style' }}>
      {shapes.slice(0, 6).map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[120px] ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            willChange: 'transform',
          }}
          animate={{
            x: [0, 80, -60, 40, 0],
            y: [0, -50, 70, -30, 0],
            rotate: [0, shape.rotateRange, -shape.rotateRange * 0.5, shape.rotateRange * 0.8, 0],
            scale: [1, 1.15, 0.9, 1.05, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
}
