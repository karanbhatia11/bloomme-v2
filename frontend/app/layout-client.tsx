"use client";

import { FloatingFlowers } from "@/components/ambient/FloatingFlowers";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingFlowers />
      {children}
      <FloatingWhatsApp />
    </>
  );
}
