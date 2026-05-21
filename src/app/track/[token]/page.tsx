import { ClientTrackingHero } from "@/components/repairlab/client-tracking-hero";
import { RepairContainer, RepairEmptyState } from "@/components/repairlab";
import { PublicContactCard, PublicTrackingFooter } from "@/components/repairlab/public-contact-card";
import { DevicePublicCard } from "@/components/repairlab/public-device-card";
import { InvoicePublicCard } from "@/components/repairlab/public-invoice-card";
import { PublicRepairProgress } from "@/components/repairlab/public-repair-progress";
import { QuotePublicCard } from "@/components/repairlab/public-quote-card";
import { PublicTimeline } from "@/components/repairlab/public-timeline";
import { getPublicTrackingData } from "@/modules/customer-portal/tracking.service";

export const dynamic = "force-dynamic";

export default async function PublicTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPublicTrackingData(token);

  if (!data) {
    return <InvalidTokenPage />;
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <ClientTrackingHero
        ticketNumber={data.ticket.ticketNumber}
        statusLabel={data.ticket.statusLabel}
        deviceLabel={data.device.label}
        createdAt={data.ticket.createdAt}
      />

      <RepairContainer className="-mt-8 relative z-10 pb-12">
        <div className="grid gap-6">
          <PublicRepairProgress status={data.ticket.status} />

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <DevicePublicCard
              deviceLabel={data.device.label}
              serial={data.device.serial}
              reportedIssue={data.ticket.reportedIssue}
            />
            <PublicTimeline items={data.timeline} />
          </div>

          {data.quote ? <QuotePublicCard quote={data.quote} token={token} /> : null}

          {data.invoice ? <InvoicePublicCard invoice={data.invoice} token={token} /> : null}

          <PublicContactCard ticketNumber={data.ticket.ticketNumber} />
        </div>
      </RepairContainer>

      <PublicTrackingFooter />
    </main>
  );
}

function InvalidTokenPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <ClientTrackingHero />
      <RepairContainer className="-mt-8 relative z-10 pb-12">
        <RepairEmptyState
          title="No encontramos este ticket"
          description="Verifica que el enlace este completo o contacta al taller con tu codigo de ticket."
        />
      </RepairContainer>
      <PublicTrackingFooter />
    </main>
  );
}
