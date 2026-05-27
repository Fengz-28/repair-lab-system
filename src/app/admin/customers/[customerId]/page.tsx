import { notFound } from "next/navigation";

import { AdminNav } from "@/components/admin-nav";
import { RepairContainer } from "@/components/repairlab";
import { CustomerActivityFeed } from "@/components/repairlab/customer-activity-feed";
import { CustomerDevicesCard } from "@/components/repairlab/customer-devices-card";
import { CustomerHero } from "@/components/repairlab/customer-hero";
import { CustomerSidebar } from "@/components/repairlab/customer-sidebar";
import { CustomerTicketHistory } from "@/components/repairlab/customer-ticket-history";
import { getCustomerDetailData } from "@/modules/customers/customer-detail.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  await requireLocalStaff();
  const { customerId } = await params;
  const data = await getCustomerDetailData(customerId);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <AdminNav />
      <CustomerHero
        name={data.customer.name}
        contact={data.customer.contact}
        phone={data.customer.phone ?? data.customer.whatsappPhone}
        email={data.customer.email}
        ticketCount={data.customer.ticketCount}
        invoiceCount={data.customer.invoiceCount}
        totalInvoiced={data.customer.totalInvoiced}
        totalPaid={data.customer.totalPaid}
        balanceDue={data.customer.balanceDue}
      />

      <RepairContainer className="-mt-8 relative z-10 pb-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-6">
            <CustomerTicketHistory tickets={data.tickets} />
            <CustomerDevicesCard devices={data.devices} />
            <CustomerActivityFeed activity={data.activity} />
          </div>
          <CustomerSidebar
            contact={data.customer.contact}
            phone={data.customer.phone}
            whatsappPhone={data.customer.whatsappPhone}
            email={data.customer.email}
            firstTicketAt={data.customer.firstTicketAt}
            ticketCount={data.customer.ticketCount}
            invoiceCount={data.customer.invoiceCount}
            totalInvoiced={data.customer.totalInvoiced}
            totalPaid={data.customer.totalPaid}
            balanceDue={data.customer.balanceDue}
          />
        </div>
      </RepairContainer>
    </main>
  );
}
