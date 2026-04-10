"use client";

import React, { createContext, useContext, useState } from "react";

interface CartUIContextType {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartUIContext.Provider value={{ isCartOpen, setIsCartOpen }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartUIContext);
  if (!context) {
    throw new Error("useCartUI must be used within CartUIProvider");
  }
  return context;
}
