"use client";

import { useEffect, useRef } from "react";

type Beam = {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
};

function createBeam(width: number, height: number): Beam {
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 26 + Math.random() * 58,
    length: Math.max(height * 1.9, 620),
    angle: -34 + Math.random() * 12,
    speed: 0.45 + Math.random() * 1.05,
    opacity: 0.1 + Math.random() * 0.16,
    hue: 188 + Math.random() * 45,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.015 + Math.random() * 0.024,
  };
}

export function BeamsBackground({
  className = "",
  intensity = "medium",
}: {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const opacityScale = intensity === "strong" ? 1 : intensity === "medium" ? 0.85 : 0.68;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const syncCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(Math.floor(rect.width), 1);
      const height = Math.max(Math.floor(rect.height), 1);
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const beamCount = Math.max(14, Math.min(34, Math.floor(width / 85)));
      beamsRef.current = Array.from({ length: beamCount }, () => createBeam(width, height));
    };

    const resetBeam = (beam: Beam, index: number, total: number) => {
      const rect = container.getBoundingClientRect();
      const col = index % 4;
      const spacing = rect.width / 4;
      beam.y = rect.height + 120;
      beam.x = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.6;
      beam.width = 26 + Math.random() * 64;
      beam.length = Math.max(rect.height * 1.9, 620);
      beam.speed = 0.42 + Math.random() * 0.9;
      beam.hue = 186 + (index * 45) / total;
      beam.opacity = 0.1 + Math.random() * 0.14;
      beam.pulse = Math.random() * Math.PI * 2;
      return beam;
    };

    const drawBeam = (beam: Beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const opacity = beam.opacity * (0.84 + Math.sin(beam.pulse) * 0.16) * opacityScale;
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 88%, 64%, 0)`);
      gradient.addColorStop(0.15, `hsla(${beam.hue}, 88%, 64%, ${opacity * 0.5})`);
      gradient.addColorStop(0.45, `hsla(${beam.hue}, 88%, 64%, ${opacity})`);
      gradient.addColorStop(0.65, `hsla(${beam.hue}, 88%, 64%, ${opacity * 0.9})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 88%, 64%, ${opacity * 0.35})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 88%, 64%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const paint = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.filter = "blur(28px)";
      ctx.globalCompositeOperation = "screen";

      const total = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -90) resetBeam(beam, index, total);
        drawBeam(beam);
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
    };

    syncCanvas();

    if (reduceMotion) {
      paint();
      return;
    }

    const tick = () => {
      paint();
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    const observer = new ResizeObserver(syncCanvas);
    observer.observe(container);
    window.addEventListener("resize", syncCanvas);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(56,189,248,0.12),transparent_38%),radial-gradient(circle_at_80%_4%,rgba(34,211,238,0.1),transparent_34%),linear-gradient(170deg,rgba(2,6,23,0.35),rgba(2,6,23,0.78))]" />
    </div>
  );
}

