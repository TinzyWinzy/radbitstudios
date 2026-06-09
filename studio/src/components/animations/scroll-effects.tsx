"use client";

import { motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { useDevice } from "@/contexts/device-context";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

// Background gradient orb that follows mouse
export function GradientOrb() {
  const { reducedAnimations, isTouchDevice } = useDevice();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (reducedAnimations || isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reducedAnimations, isTouchDevice]);

  if (reducedAnimations || isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ x: springX, y: springY }}
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] -translate-x-1/2 -translate-y-1/2"
      />
    </motion.div>
  );
}

// Parallax wrapper
interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = "", speed = 0.5 }: ParallaxProps) {
  const { reducedAnimations } = useDevice();
  const y = useMotionValue(0);

  useEffect(() => {
    if (reducedAnimations) return;

    const handleScroll = () => {
      y.set(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [y, speed, reducedAnimations]);

  if (reducedAnimations) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
