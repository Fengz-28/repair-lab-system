import type { ComponentType } from "react";

import { headers } from "next/headers";
import { FileText, ReceiptText, Wrench } from "lucide-react";

import { ClientTrackingHero } from "@/components/repairlab/client-tracking-hero";
import { RepairBadge, RepairContainer, RepairEmptyState, RepairPanel } from "@/components/repairlab";
import { PublicContactCard, PublicTrackingFooter } from "@/components/repairlab/public-contact-card";
import { DevicePublicCard } from "@/components/repairlab/public-device-card";
import { InvoicePublicCard } from "@/components/repairlab/public-invoice-card";
import { PublicRepairProgress } from "@/components/repairlab/public-repair-progress";
import { QuotePublicCard } from "@/components/repairlab/public-quote-card";
import { PublicTimelinePro } from "@/components/repairlab/public-timeline-pro";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import { getPublicTrackingData } from "@/modules/customer-portal/tracking.service";
import { getClientIdentity } from "@/server/security/client-identity";
import { checkRateLimit, publicRateLimitConfig } from "@/server/security/rate-limit";

export const dynamic = "force-dynamic";

export default async function PublicTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const requestHeaders = await headers();
  const client = getClientIdentity(requestHeaders);
  const rateLimit = checkRateLimit(`public-track:${client.ip}:${token}`, publicRateLimitConfig());

  if (!rateLimit.allowed) {
    return <RateLimitedPage retryAfterSeconds={rateLimit.retryAfterSeconds} />;
  }

  const data = await getPublicTrackingData(token);

  if (!data) {
    return <InvalidTokenPage />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div className="pointer-events-none absolute inset-0 z-0">
        <FlowFieldBackground className="h-full w-full" color="#6e78ff" particleCount={560} speed={0.8} trailOpacity={0.12} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(1,4,18,0.3),rgba(0,0,0,0.94))]" />
      <div className="pointer-events-none absolute inset-0 z-0 fengz-shader-vignette opacity-70" />

      <ClientTrackingHero
        ticketNumber={data.ticket.ticketNumber}
        statusLabel={data.ticket.statusLabel}
        deviceLabel={data.device.label}
        createdAt={data.ticket.createdAt}
      />

      <RepairContainer className="relative z-10 -mt-6 space-y-6 pb-12 sm:-mt-8">
        <PublicRepairProgress status={data.ticket.status} />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <DevicePublicCard
              deviceLabel={data.device.label}
              serial={data.device.serial}
              reportedIssue={data.ticket.reportedIssue}
            />
            <PublicTimelinePro items={data.timeline} />
          </div>
          <RepairPanel className="fengz-carbon-panel fengz-rgb-edge-static space-y-4 border-white/15">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Resumen del caso</p>
            <h2 className="text-2xl font-black text-zinc-50">Estado actual del servicio</h2>
            <p className="text-sm leading-6 text-zinc-300">
              Aquí puedes revisar el avance, documentos disponibles y próximos pasos de tu reparación.
            </p>
            <div className="flex flex-wrap gap-2">
              <RepairBadge tone="cyan">{data.ticket.statusLabel}</RepairBadge>
              <RepairBadge tone={data.quote ? "cyan" : "neutral"}>
                {data.quote ? "Cotización disponible" : "Sin cotización"}
              </RepairBadge>
              <RepairBadge tone={data.invoice ? "cyan" : "neutral"}>
                {data.invoice ? "Factura disponible" : "Sin factura"}
              </RepairBadge>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm leading-6 text-zinc-300">
              Si necesitas soporte, contacta al taller con tu código de ticket. Este portal no muestra notas internas
              ni archivos privados del equipo.
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <QuickPortalSignal icon={Wrench} label="Estado" value={data.ticket.statusLabel} />
              <QuickPortalSignal icon={FileText} label="Cotización" value={data.quote ? "Disponible" : "Pendiente"} />
              <QuickPortalSignal icon={ReceiptText} label="Factura" value={data.invoice ? "Disponible" : "Pendiente"} />
            </div>
          </RepairPanel>
        </div>

        {data.quote ? <QuotePublicCard quote={data.quote} token={token} /> : null}
        {data.invoice ? <InvoicePublicCard invoice={data.invoice} token={token} /> : null}
        <PublicContactCard ticketNumber={data.ticket.ticketNumber} />
      </RepairContainer>

      <PublicTrackingFooter />
    </main>
  );
}

function RateLimitedPage({ retryAfterSeconds }: { retryAfterSeconds: number }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 z-0 fengz-meteor-field opacity-70" />
      <ClientTrackingHero />
      <RepairContainer className="relative z-10 -mt-8 pb-12">
        <RepairEmptyState
          title="Demasiadas solicitudes"
          description={`Por seguridad, espera ${retryAfterSeconds} segundos antes de volver a consultar este enlace.`}
          eyebrow="Protección activa"
          icon="429"
        />
      </RepairContainer>
      <PublicTrackingFooter />
    </main>
  );
}

function InvalidTokenPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div className="pointer-events-none absolute inset-0 z-0 fengz-meteor-field opacity-70" />
      <ClientTrackingHero />
      <RepairContainer className="relative z-10 -mt-8 pb-12">
        <RepairEmptyState
          title="No encontramos este ticket"
          description="Verifica que el enlace esté completo. Si el problema continúa, contacta al taller indicando tu código de ticket."
          eyebrow="Enlace no válido"
          icon="404"
        />
      </RepairContainer>
      <PublicTrackingFooter />
    </main>
  );
}

function QuickPortalSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="repair-rgb-card rounded-2xl border border-white/10 bg-black/55 p-3">
      <Icon className="size-4 text-cyan-300" />
      <p className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-zinc-100">{value}</p>
    </div>
  );
}
