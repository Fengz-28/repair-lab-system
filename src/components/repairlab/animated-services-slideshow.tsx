"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { RepairBadge, RepairButton } from "@/components/repairlab";

type ServiceSlide = {
  title: string;
  description: string;
  badge: string;
  image: string;
  highlights: string[];
};

const defaultSlides: ServiceSlide[] = [
  {
    title: "Diagnóstico electrónico",
    description: "Evaluación técnica para encontrar la causa de la falla y definir la ruta de reparación.",
    badge: "Diagnóstico",
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Revisión de placa", "Pruebas de energía", "Informe técnico inicial"],
  },
  {
    title: "Reparación de consolas",
    description: "Servicio técnico para fallas de video, encendido, puertos, temperatura y almacenamiento.",
    badge: "Consolas",
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Cambio de puertos", "Limpieza interna", "Control de temperatura"],
  },
  {
    title: "Microsoldadura de precisión",
    description: "Intervención sobre conectores y componentes críticos para recuperar equipos complejos.",
    badge: "Microsoldadura",
    image:
      "https://images.unsplash.com/photo-1563770660941-10a636076f89?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Trabajo board-level", "Soldadura fina", "Reacondicionamiento de pistas"],
  },
];

export function AnimatedServicesSlideshow({
  slides = defaultSlides,
}: {
  slides?: ServiceSlide[];
}) {
  const safeSlides = useMemo(
    () => (slides.length > 0 ? slides : defaultSlides),
    [slides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [safeSlides.length]);

  const active = safeSlides[index];

  return (
    <section className="repair-premium-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 p-4 shadow-2xl shadow-black/35 sm:p-6">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10">
        {safeSlides.map((slide, slideIndex) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority={slideIndex === 0}
            />
          </div>
        ))}
        <div className="relative min-h-[20rem] bg-gradient-to-b from-black/30 via-black/35 to-black/90 p-6 sm:min-h-[24rem] sm:p-8">
          <RepairBadge tone="cyan">{active.badge}</RepairBadge>
          <h3 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
            {active.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            {active.description}
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
            {active.highlights.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-emerald-300" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <RepairButton href="/contact" size="sm">
              Solicitar revisión
            </RepairButton>
            <RepairButton href="/products" tone="secondary" size="sm">
              Ver productos
            </RepairButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {safeSlides.map((slide, dotIndex) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 rounded-full transition-all ${
                dotIndex === index ? "w-8 bg-emerald-400" : "w-2.5 bg-zinc-600 hover:bg-zinc-500"
              }`}
              aria-label={`Ver slide ${dotIndex + 1}`}
            />
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {String(index + 1).padStart(2, "0")} / {String(safeSlides.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
