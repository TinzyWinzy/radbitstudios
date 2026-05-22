"use client";

import { useEffect, useRef } from "react";

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
  colors = ["40, 95%, 50%", "185, 80%, 40%", "8, 70%, 45%"],
  speed = 0.3,
  amplitude = 40,
  mouseReactivity = 0.5,
}: WaveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
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

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / canvas.width,
        y: e.clientY / canvas.height,
      };
    };
    window.addEventListener("mousemove", handleMouse);

    const waves = Array.from({ length: waveCount }, (_, i) => ({
      hue: colors[i % colors.length],
      phase: (i / waveCount) * Math.PI * 2,
      freq: 0.002 + i * 0.0008,
      alpha: 0.03 + i * 0.015,
      yOffset: (i / waveCount) * canvas.height + canvas.height * 0.15,
    }));

    const particleCount = 60;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      speedX: -0.15 + Math.random() * 0.3,
      speedY: -0.2 - Math.random() * 0.3,
      opacity: 0.15 + Math.random() * 0.4,
      hue: 35 + Math.random() * 20,
      saturation: 70 + Math.random() * 25,
    }));

    const animate = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const wave of waves) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x <= canvas.width; x += 3) {
          const mouseInfluenceX = (x / canvas.width - mx) * mouseReactivity;
          const mouseInfluenceY = (canvas.height / 2 - my * canvas.height) * mouseReactivity * 0.3;
          const primaryWave = Math.sin(x * wave.freq + t * speed * 0.02 + wave.phase) * amplitude;
          const secondaryWave = Math.sin(x * wave.freq * 2.3 + t * speed * 0.015 + wave.phase * 1.7) * amplitude * 0.4;
          const tertiaryWave = Math.sin(x * wave.freq * 0.5 + t * speed * 0.025 + wave.phase * 0.3) * amplitude * 0.6;
          const mouseWave = Math.sin((x / canvas.width) * Math.PI * 2 - mx * Math.PI * 2) * mouseInfluenceX * amplitude * 0.3;
          const y = canvas.height / 2 + primaryWave + secondaryWave + tertiaryWave + mouseWave + mouseInfluenceY;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
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
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

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
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [waveCount, colors, speed, amplitude, mouseReactivity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
