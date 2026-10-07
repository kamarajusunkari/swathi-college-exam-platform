"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        !anchor.href.startsWith("mailto:") &&
        !anchor.href.startsWith("tel:") &&
        !anchor.href.includes("#") &&
        anchor.origin === window.location.origin
      ) {
        if (anchor.pathname !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#0A6F34] via-[#D9E739] to-[#075FA7] animate-pulse shadow-sm shadow-[#0A6F34]/50" style={{
        width: "100%",
        animation: "navProgress 1.2s ease-in-out infinite",
      }} />
      <style jsx>{`
        @keyframes navProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
