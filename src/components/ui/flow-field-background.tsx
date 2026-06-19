"use client";

import { useEffect, useRef } from "react";

interface FlowFieldBackgroundProps {
  className?: string;
  color?: string;
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
}

export default function FlowFieldBackground({
  className,
  color = "#7c83ff",
  trailOpacity = 0.13,
  particleCount = 520,
  speed = 0.82,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileViewport = window.innerWidth < 768;
    const shouldUseLowPowerMode = prefersReducedMotion || isCoarsePointer || isMobileViewport;
    const mouse = { x: -1000, y: -1000 };
    let lastFrameTime = 0;
    const targetFrameInterval = shouldUseLowPowerMode ? 1000 / 24 : 1000 / 60;

    class Particle {
      x = Math.random() * width;
      y = Math.random() * height;
      vx = 0;
      vy = 0;
      age = 0;
      life = Math.random() * 200 + 100;

      update() {
        const angle = (Math.cos(this.x * 0.0045) + Math.sin(this.y * 0.0045)) * Math.PI;
        this.vx += Math.cos(angle) * 0.16 * speed;
        this.vy += Math.sin(angle) * 0.16 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 130;

        if (!prefersReducedMotion && distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.038;
          this.vy -= dy * force * 0.038;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.age += 1;
        if (this.age > this.life) this.reset();

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = color;
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.globalAlpha = alpha;
        context.fillRect(this.x, this.y, 1.2, 1.2);
      }
    }

    const init = () => {
      const dpr = shouldUseLowPowerMode ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      const count = shouldUseLowPowerMode
        ? Math.max(72, Math.floor(particleCount * 0.18))
        : particleCount;
      for (let i = 0; i < count; i += 1) {
        particles.push(new Particle());
      }
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime < targetFrameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);

      for (const particle of particles) {
        particle.update();
        particle.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    animate(0);

    window.addEventListener("resize", handleResize);
    if (!shouldUseLowPowerMode) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (!shouldUseLowPowerMode) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, particleCount, speed, trailOpacity]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-black ${className}`}
      aria-hidden
    >
      <div className="repair-canvas-fallback-flow absolute inset-0" />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
