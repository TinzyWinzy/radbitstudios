"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  hue: number;
  life: number;
  maxLife: number;
  layer: number;
  trail: { x: number; y: number }[];
  waveOffset: number;
  waveAmplitude: number;
  waveFrequency: number;
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  colors?: [string, string, string, string];
  mouseRadius?: number;
  connectionDistance?: number;
  depthLayers?: number;
  showTrails?: boolean;
  waveDistortion?: boolean;
  orbitStrength?: number;
}

export function ParticleField({
  className,
  particleCount = 100,
  colors = ["40, 95%, 50%", "185, 80%, 40%", "8, 70%, 45%", "30, 20%, 50%"],
  mouseRadius = 180,
  connectionDistance = 140,
  depthLayers = 3,
  showTrails = true,
  waveDistortion = true,
  orbitStrength = 0.02,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const perLayer = Math.floor(particleCount / depthLayers);

    for (let layer = 0; layer < depthLayers; layer++) {
      for (let i = 0; i < perLayer; i++) {
        const hue = colors[Math.floor(Math.random() * colors.length)];
        const depthFactor = 1 - layer / depthLayers;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6 * depthFactor,
          vy: (Math.random() - 0.5) * 0.6 * depthFactor,
          radius: (Math.random() * 2 + 0.5) * (1 + layer * 0.5),
          baseRadius: (Math.random() * 2 + 0.5) * (1 + layer * 0.5),
          alpha: (0.15 + Math.random() * 0.25) * (1 - layer * 0.15),
          hue: parseFloat(hue),
          life: 0,
          maxLife: Math.random() * 300 + 100,
          layer,
          trail: [],
          waveOffset: Math.random() * Math.PI * 2,
          waveAmplitude: 0.3 + Math.random() * 0.5,
          waveFrequency: 0.005 + Math.random() * 0.01,
        });
      }
    }
    particlesRef.current = particles;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    window.addEventListener("mousemove", handleMouse);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      timeRef.current += 1;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mx, y: my, active } = mouseRef.current;
      const particlesArr = particlesRef.current;

      for (let i = 0; i < particlesArr.length; i++) {
        const p = particlesArr[i];
        p.life++;

        if (p.life > p.maxLife) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.vx = (Math.random() - 0.5) * 0.6 * (1 - p.layer / depthLayers);
          p.vy = (Math.random() - 0.5) * 0.6 * (1 - p.layer / depthLayers);
          p.life = 0;
          p.maxLife = Math.random() * 300 + 100;
          p.trail = [];
        }

        const depthFactor = 1 - p.layer / depthLayers;

        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const force = ((mouseRadius - dist) / mouseRadius) * depthFactor;
            const angle = Math.atan2(dy, dx);
            const orbitForce = force * orbitStrength;
            p.vx -= Math.cos(angle + Math.PI / 2) * orbitForce * 2;
            p.vy -= Math.sin(angle + Math.PI / 2) * orbitForce * 2;
            p.vx -= (dx / dist) * force * 0.4 * depthFactor;
            p.vy -= (dy / dist) * force * 0.4 * depthFactor;
          }
        }

        if (waveDistortion) {
          p.vx += Math.sin(t * p.waveFrequency + p.waveOffset) * p.waveAmplitude * 0.02 * depthFactor;
          p.vy += Math.cos(t * p.waveFrequency * 0.7 + p.waveOffset) * p.waveAmplitude * 0.02 * depthFactor;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        const radiusOscillation = 0.7 + 0.3 * Math.sin(t * 0.02 + p.waveOffset);
        p.radius = p.baseRadius * radiusOscillation;

        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        if (showTrails && p.layer === 0) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 6) p.trail.shift();
        }
      }

      for (let i = 0; i < particlesArr.length; i++) {
        const p = particlesArr[i];

        if (showTrails && p.layer === 0 && p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = `hsla(${p.hue}, ${p.alpha * 0.3})`;
          ctx.lineWidth = p.radius * 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.alpha})`;
        ctx.fill();

        if (p.layer === 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.alpha * 0.08})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < particlesArr.length; i++) {
        for (let j = i + 1; j < particlesArr.length; j++) {
          if (particlesArr[i].layer !== particlesArr[j].layer) continue;
          const dx = particlesArr[i].x - particlesArr[j].x;
          const dy = particlesArr[i].y - particlesArr[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = connectionDistance * (1 - particlesArr[i].layer * 0.15);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particlesArr[i].x, particlesArr[i].y);
            ctx.lineTo(particlesArr[j].x, particlesArr[j].y);
            const avgHue = (particlesArr[i].hue + particlesArr[j].hue) / 2;
            const lineAlpha = (1 - dist / maxDist) * 0.12 * (1 - particlesArr[i].layer * 0.1);
            ctx.strokeStyle = `hsla(${avgHue}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount, colors, mouseRadius, connectionDistance, depthLayers, showTrails, waveDistortion, orbitStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
