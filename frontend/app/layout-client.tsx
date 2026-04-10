"use client";

import { FloatingFlowers } from "@/components/ambient/FloatingFlowers";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import StickyCart from "@/components/checkout/StickyCart";
import { CartProvider } from "@/context/CartContext";
import { CartUIProvider, useCartUI } from "@/context/CartUIContext";

function LayoutClientContent({ children }: { children: React.ReactNode }) {
  const { isCartOpen, setIsCartOpen } = useCartUI();

  return (
    <>
      <FloatingFlowers />
      {children}
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FloatingWhatsApp />
    </>
  );
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CartUIProvider>
        <LayoutClientContent>{children}</LayoutClientContent>
      </CartUIProvider>
    </CartProvider>
  );
}
