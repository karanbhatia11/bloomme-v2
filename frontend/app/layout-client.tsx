"use client";

import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingWhatsApp />
    </>
  );
}
