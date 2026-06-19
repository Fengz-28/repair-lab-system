import { HomeLanding } from "@/components/repairlab/home-landing";
import { PublicShell } from "@/components/repairlab/public-site";

export default function HomePage() {
  return (
    <PublicShell accent="cyan" homeHideNavOnScroll>
      <HomeLanding />
    </PublicShell>
  );
}
