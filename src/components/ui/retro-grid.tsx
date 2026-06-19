"use client";

import { useEffect, useRef, useState } from "react";

interface RetroGridProps {
  gridColor?: string;
  showScanlines?: boolean;
  glowEffect?: boolean;
  className?: string;
  disableOnMobile?: boolean;
}

export default function RetroGrid({
  gridColor = "#22d3ee",
  showScanlines = true,
  glowEffect = true,
  className = "",
  disableOnMobile = false,
}: RetroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(() => !disableOnMobile);

  useEffect(() => {
    if (!disableOnMobile) {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setShouldRender(!mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [disableOnMobile]);

  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileViewport = window.innerWidth < 768;
    const shouldUseLowPowerMode = prefersReducedMotion || isCoarsePointer || isMobileViewport;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(parent);
    resizeCanvas();

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 34, g: 211, b: 238 };
    };

    const cellWidth = shouldUseLowPowerMode ? 150 : 130;
    const cellDepth = shouldUseLowPowerMode ? 110 : 90;
    const numCellsWide = shouldUseLowPowerMode ? 10 : 16;
    const numCellsDeep = shouldUseLowPowerMode ? 12 : 22;

    const cameraX = 0;
    const cameraY = 60;
    const cameraZ = 430;
    const focalLength = 540;

    let offset = 0;
    const speed = shouldUseLowPowerMode ? 0.55 : 1.45;
    let rafId = 0;
    let lastFrameTime = 0;
    const targetFrameInterval = shouldUseLowPowerMode ? 1000 / 18 : 1000 / 60;

    const project3DTo2D = (x: number, y: number, z: number) => {
      const relX = x - cameraX;
      const relY = y - cameraY;
      const relZ = z - cameraZ;

      if (relZ <= 10) return null;

      const scale = focalLength / relZ;
      const screenX = canvas.width / 2 + relX * scale;
      const screenY = canvas.height * 0.57 - relY * scale;

      return { x: screenX, y: screenY, scale, z: relZ };
    };

    const drawCell = (x: number, z: number, zOffset: number) => {
      const actualZ = z - zOffset;
      if (actualZ < -cellDepth || actualZ > numCellsDeep * cellDepth) return;

      const topLeft = project3DTo2D(x - cellWidth / 2, 0, actualZ);
      const topRight = project3DTo2D(x + cellWidth / 2, 0, actualZ);
      const bottomLeft = project3DTo2D(x - cellWidth / 2, 0, actualZ + cellDepth);
      const bottomRight = project3DTo2D(x + cellWidth / 2, 0, actualZ + cellDepth);

      if (!topLeft || !topRight || !bottomLeft || !bottomRight || actualZ < 0) return;

      const distanceFactor = Math.min(1, actualZ / (numCellsDeep * cellDepth));
      const alpha = Math.max(0.22, 1 - distanceFactor * 0.72);
      const lineWidth = Math.max(0.9, 2.4 * (1 - distanceFactor * 0.55));

      if (glowEffect) {
        ctx.shadowBlur = 10 * (1 - distanceFactor);
        ctx.shadowColor = gridColor;
      }

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = gridColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(bottomLeft.x, bottomLeft.y);
      ctx.lineTo(bottomRight.x, bottomRight.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(topLeft.x, topLeft.y);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const drawScanlines = () => {
      if (!showScanlines) return;

      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#000000";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }
      ctx.globalAlpha = 1;
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime < targetFrameInterval) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rgb = hexToRgb(gridColor);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.56);
      skyGradient.addColorStop(0, `rgba(${rgb.r * 0.04}, ${rgb.g * 0.06}, ${rgb.b * 0.18}, 1)`);
      skyGradient.addColorStop(0.4, `rgba(${rgb.r * 0.08}, ${rgb.g * 0.11}, ${rgb.b * 0.25}, 1)`);
      skyGradient.addColorStop(0.75, `rgba(${rgb.r * 0.18}, ${rgb.g * 0.24}, ${rgb.b * 0.44}, 1)`);
      skyGradient.addColorStop(1, `rgba(${rgb.r * 0.32}, ${rgb.g * 0.38}, ${rgb.b * 0.56}, 1)`);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.56);

      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.56, 0, canvas.height);
      groundGradient.addColorStop(0, `rgba(${rgb.r * 0.07}, ${rgb.g * 0.09}, ${rgb.b * 0.14}, 1)`);
      groundGradient.addColorStop(0.4, `rgba(${rgb.r * 0.03}, ${rgb.g * 0.04}, ${rgb.b * 0.08}, 1)`);
      groundGradient.addColorStop(1, "#000000");
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.56, canvas.width, canvas.height * 0.44);

      offset += speed;
      if (offset >= cellDepth) offset = 0;

      for (let row = -5; row < numCellsDeep + 5; row++) {
        const z = row * cellDepth;
        for (let col = -Math.floor(numCellsWide / 2); col <= Math.floor(numCellsWide / 2); col++) {
          drawCell(col * cellWidth, z, offset);
        }
      }

      drawScanlines();

      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.85,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.58)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rafId = requestAnimationFrame(animate);
    };

    if (shouldUseLowPowerMode) {
      animate(targetFrameInterval);
    } else {
      animate(0);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [gridColor, showScanlines, glowEffect, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div className="repair-canvas-fallback-grid absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
