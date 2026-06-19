import type React from "react";

export function AnimatedShaderBackground({
  className = "",
  intensity = "md",
}: {
  className?: string;
  intensity?: "sm" | "md" | "lg";
}) {
  const opacityClass = {
    sm: "opacity-45",
    md: "opacity-60",
    lg: "opacity-80",
  }[intensity];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${opacityClass} ${className}`} aria-hidden>
      <div className="repair-shader-grid hidden sm:block" />
      <div className="repair-shader-orb repair-shader-orb-emerald" />
      <div className="repair-shader-orb repair-shader-orb-cyan hidden sm:block" />
      <div className="repair-shader-sweep hidden md:block" />
    </div>
  );
}
