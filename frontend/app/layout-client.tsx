"use client";

import { FloatingFlowers } from "@/components/ambient/FloatingFlowers";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <FloatingFlowers />
      {children}
      <FloatingWhatsApp />
    </CartProvider>
  );
}
