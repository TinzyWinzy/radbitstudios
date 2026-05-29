"use client";

import { useEffect, useRef, useState } from "react";

interface WaveFieldProps {
  className?: string;
  waveCount?: number;
  colors?: [string, string, string];
  speed?: number;
  amplitude?: number;
  mouseReactivity?: number;
}

export function WaveField({
  className,
  waveCount = 5,
  colors = ["18, 85%, 55%", "25, 75%, 45%", "5, 80%, 50%"],
  speed = 0.3,
  amplitude = 40,
  mouseReactivity = 0.5,
}: WaveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const pageVisible = useRef(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const mq = window.matchMedia('(max-width: 768px)');
    // Mobile: faster step, fewer waves, no particles
    const step = mq.matches ? 8 : 3;
    const wCount = mq.matches ? 3 : waveCount;
    const pCount = mq.matches ? 20 : 60;
    const mReactivity = mq.matches ? 0 : mouseReactivity;

    const waves = Array.from({ length: wCount }, (_, i) => ({
      hue: colors[i % 3],
      phase: (i / wCount) * Math.PI * 2,
      freq: 0.002 + i * 0.0008,
      alpha: 0.03 + i * 0.015,
      yOffset: (i / wCount) * canvas.height / dpr + (canvas.height / dpr) * 0.15,
    }));

    const particles = Array.from({ length: pCount }, () => ({
      x: Math.random() * (canvas.width / dpr),
      y: Math.random() * (canvas.height / dpr),
      size: 1 + Math.random() * 2,
      speedX: -0.15 + Math.random() * 0.3,
      speedY: -0.2 - Math.random() * 0.3,
      opacity: 0.15 + Math.random() * 0.4,
      hue: 35 + Math.random() * 20,
      saturation: 70 + Math.random() * 25,
    }));

    // Pause when page is hidden
    const handleVisibility = () => { pageVisible.current = !document.hidden; };
    document.addEventListener("visibilitychange", handleVisibility);

    const animate = () => {
      if (!pageVisible.current) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      timeRef.current += 1;      const t = timeRef.current;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      for (const wave of waves) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / dpr / 2);

        for (let x = 0; x <= canvas.width / dpr; x += step) {
          const mouseInfluenceX = (x / (canvas.width / dpr) - mx) * mReactivity;
          const mouseInfluenceY = ((canvas.height / dpr) / 2 - my * (canvas.height / dpr)) * mReactivity * 0.3;
          const primaryWave = Math.sin(x * wave.freq + t * speed * 0.02 + wave.phase) * amplitude;
          const secondaryWave = Math.sin(x * wave.freq * 2.3 + t * speed * 0.015 + wave.phase * 1.7) * amplitude * 0.4;
          const tertiaryWave = Math.sin(x * wave.freq * 0.5 + t * speed * 0.025 + wave.phase * 0.3) * amplitude * 0.6;
          const mouseWave = Math.sin((x / (canvas.width / dpr)) * Math.PI * 2 - mx * Math.PI * 2) * mouseInfluenceX * amplitude * 0.3;
          const y = (canvas.height / dpr) / 2 + primaryWave + secondaryWave + tertiaryWave + mouseWave + mouseInfluenceY;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width / dpr, canvas.height / dpr);
        ctx.lineTo(0, canvas.height / dpr);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / dpr);
        const midStop = Math.min(0.3 + t * 0.001 * wave.freq * 100, 1);
        gradient.addColorStop(0, `hsla(${wave.hue}, 0)`);
        gradient.addColorStop(midStop, `hsla(${wave.hue}, ${wave.alpha})`);
        gradient.addColorStop(1, `hsla(${wave.hue}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -5) {
          p.y = (canvas.height / dpr) + 5;
          p.x = Math.random() * (canvas.width / dpr);
        }
        if (p.x < -5) p.x = (canvas.width / dpr) + 5;
        if (p.x > (canvas.width / dpr) + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 60%, ${p.opacity})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [waveCount, colors, speed, amplitude, mouseReactivity, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
