"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { RepairBadge, RepairButton, RepairPanel } from "@/components/repairlab";

type ServiceSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  badge: string;
};

const defaultSlides: ServiceSlide[] = [
  {
    id: "diagnostico",
    title: "Diagnóstico electrónico",
    subtitle: "Análisis de falla y ruta de reparación",
    description:
      "Evaluamos energía, placa, puertos y estado general para definir un diagnóstico claro antes de cotizar.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092919535-7146ff1a5906?auto=format&fit=crop&w=1600&q=80",
    badge: "Diagnóstico",
  },
  {
    id: "consolas",
    title: "Reparación de consolas",
    subtitle: "Servicio técnico para equipos de alto uso",
    description:
      "Atendemos fallas de video, temperatura, puertos y encendido con control de calidad previo a la entrega.",
    imageUrl:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1600&q=80",
    badge: "Consolas",
  },
  {
    id: "microsoldadura",
    title: "Microsoldadura",
    subtitle: "Intervención board-level de precisión",
    description:
      "Trabajo sobre conectores, pistas y componentes finos para recuperar placas y módulos críticos.",
    imageUrl:
      "https://images.unsplash.com/photo-1563770660941-10a636076f89?auto=format&fit=crop&w=1600&q=80",
    badge: "Board level",
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento preventivo",
    subtitle: "Limpieza y estabilidad térmica",
    description:
      "Limpieza profunda, reemplazo de pasta térmica y ajuste de flujo para prolongar la vida del equipo.",
    imageUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80",
    badge: "Preventivo",
  },
  {
    id: "controles",
    title: "Reparación de controles",
    subtitle: "Corrección de drift, botones y carga",
    description:
      "Servicio para mandos con fallas de sticks, flex, puertos de carga o respuesta inconsistente.",
    imageUrl:
      "https://images.unsplash.com/photo-1629429407756-531fcbf67e02?auto=format&fit=crop&w=1600&q=80",
    badge: "Accesorios",
  },
];

export function ServicesHoverSlideshow({
  slides = defaultSlides,
}: {
  slides?: ServiceSlide[];
}) {
  const items = useMemo(() => (slides.length > 0 ? slides : defaultSlides), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = items[activeIndex];

  useEffect(() => {
    if (items.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  return (
    <section className="repair-premium-card repair-rgb-card-always rounded-[2rem] border border-white/10 bg-black/75 p-4 shadow-2xl shadow-black/30 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Servicios Fengz Lab</p>
          <div className="space-y-1">
            {items.map((slide, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={`repair-focus-ring w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-cyan-300/35 bg-cyan-500/10 text-white"
                      : "border-white/10 bg-zinc-950/40 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  }`}
                >
                  <span className="block text-xl font-black uppercase tracking-tight sm:text-2xl">
                    {slide.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <RepairPanel className="repair-rgb-card-always relative overflow-hidden p-0">
          <div className="relative min-h-[20rem] sm:min-h-[24rem]">
            {items.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === activeIndex
                    ? "z-10 translate-y-0 opacity-100"
                    : "z-0 translate-y-2 opacity-0"
                }`}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 720px"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/90" />
              </div>
            ))}
            <div className="relative z-20 flex h-full flex-col justify-end p-6">
              <RepairBadge tone="cyan">{activeSlide.badge}</RepairBadge>
              <h3 className="mt-4 text-3xl font-black text-white">{activeSlide.title}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">
                {activeSlide.subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-200">{activeSlide.description}</p>
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
        </RepairPanel>
      </div>
    </section>
  );
}
