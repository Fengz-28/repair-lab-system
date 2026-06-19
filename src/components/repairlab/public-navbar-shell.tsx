"use client";

import { useEffect, useState } from "react";

export function PublicNavbarShell({
  children,
  hideOnScroll = false,
}: {
  children: React.ReactNode;
  hideOnScroll?: boolean;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!hideOnScroll) {
      return;
    }

    let lastY = window.scrollY;
    let frameId = 0;
    let nextHidden = false;

    const commitVisibility = () => {
      frameId = 0;
      setHidden((prev) => (prev === nextHidden ? prev : nextHidden));
    };

    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 24) {
        nextHidden = false;
      } else if (currentY > lastY + 6) {
        nextHidden = true;
      } else if (currentY < lastY - 6) {
        nextHidden = false;
      } else {
        return;
      }

      lastY = currentY;

      if (!frameId) {
        frameId = window.requestAnimationFrame(commitVisibility);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [hideOnScroll]);

  return (
    <div
      className={`sticky top-0 z-30 border-b border-white/10 bg-black/85 shadow-sm shadow-black/30 backdrop-blur-xl transition-transform duration-300 ${hideOnScroll && hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      {children}
    </div>
  );
}
