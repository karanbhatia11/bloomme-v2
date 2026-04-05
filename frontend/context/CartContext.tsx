"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartAddon {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AddonSchedule {
  mode: "same" | "different";
  frequency?: "daily" | "alternate" | "weekly";
  deliveryDays?: number[];   // 0=Sun … 6=Sat
  startDate?: string;        // "YYYY-MM-DD"
  customDates?: string[];    // Array of "YYYY-MM-DD" for custom date selection
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  email: string;
  createAccount: boolean;
}

export interface CartState {
  planId: string;
  planName: string;
  planPrice: number;
  adjustedPrice: number;     // Price after applying frequency multiplier
  selectedDeliveryDatesCount: number; // Number of delivery dates selected on calendar
  frequency: "daily" | "alternate" | "weekly" | "custom";
  deliveryDays: number[];    // 0=Sun … 6=Sat; used only when frequency="weekly"
  customDates?: string[];    // Actual selected dates when frequency="custom" (YYYY-MM-DD format)
  startDate: string;
  deselectedDates: string[]; // Dates deselected from the calendar (YYYY-MM-DD format)
  addons: CartAddon[];
  addonSchedules: Record<number, AddonSchedule>;
  customer: CustomerDetails | null;
}

const DEFAULT_CART: CartState = {
  planId: "",
  planName: "",
  planPrice: 0,
  adjustedPrice: 0,
  selectedDeliveryDatesCount: 0,
  frequency: "daily",
  deliveryDays: [],
  startDate: "",
  deselectedDates: [],
  addons: [],
  addonSchedules: {},
  customer: null,
};

interface CartContextType {
  cart: CartState;
  setPlan: (planId: string, planName: string, planPrice: number) => void;
  setSchedule: (frequency: "daily" | "alternate" | "weekly", days: number[], startDate: string, adjustedPrice: number, datesCount: number, deselectedDates?: string[]) => void;
  setPlanAndSchedule: (
    planId: string, planName: string, planPrice: number,
    frequency: "daily" | "alternate" | "weekly", days: number[], startDate: string, adjustedPrice: number, datesCount: number, deselectedDates?: string[]
  ) => void;
  addAddon: (addon: Omit<CartAddon, "quantity">) => void;
  removeAddon: (id: number) => void;
  setAddonSchedule: (id: number, schedule: AddonSchedule) => void;
  setCustomer: (customer: CustomerDetails) => void;
  getAddonsTotal: () => number;
  getTotal: () => number;
  removePlan: () => void;
  clearCart: () => void;
  /** Build the addons array for buildDeliveryQueue / preview API */
  buildAddonPayload: () => AddonApiItem[];
}

export interface AddonApiItem {
  id: string;
  type: "same_as_subscription" | "recurring" | "one_time";
  frequency?: "daily" | "alternate" | "weekly";
  deliveryDays?: number[];
  customDates?: string[];
  startDate?: string;
  endDate?: string;
  date?: string;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(DEFAULT_CART);

  useEffect(() => {
    const saved = localStorage.getItem("bloomme_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Back-compat: migrate old string[] deliveryDays to number[]
        if (Array.isArray(parsed.deliveryDays) && typeof parsed.deliveryDays[0] === "string") {
          parsed.deliveryDays = [];
        }
        if (!parsed.addonSchedules) parsed.addonSchedules = {};
        // Ensure selectedDeliveryDatesCount is present (for older cart data)
        if (!parsed.selectedDeliveryDatesCount) {
          parsed.selectedDeliveryDatesCount = 0;
        }
        setCart({ ...DEFAULT_CART, ...parsed });
      } catch {}
    }
  }, []);

  const save = (updated: CartState) => {
    setCart(updated);
    localStorage.setItem("bloomme_cart", JSON.stringify(updated));
  };

  const setPlan = (planId: string, planName: string, planPrice: number) => {
    save({ ...cart, planId, planName, planPrice });
  };

  const setSchedule = (
    frequency: "daily" | "alternate" | "weekly" | "custom",
    days: number[],
    startDate: string,
    adjustedPrice: number,
    datesCount: number,
    deselectedDates: string[] = [],
    customDates?: string[],
  ) => {
    // Always update deselectedDates - if empty array, this clears them
    save({ ...cart, frequency, deliveryDays: days, startDate, adjustedPrice, selectedDeliveryDatesCount: datesCount, deselectedDates: deselectedDates || [], customDates });
  };

  const setPlanAndSchedule = (
    planId: string, planName: string, planPrice: number,
    frequency: "daily" | "alternate" | "weekly" | "custom", days: number[], startDate: string, adjustedPrice: number, datesCount: number, deselectedDates: string[] = [], customDates?: string[],
  ) => {
    save({ ...cart, planId, planName, planPrice, frequency, deliveryDays: days, startDate, adjustedPrice, selectedDeliveryDatesCount: datesCount, deselectedDates, customDates });
  };

  const addAddon = (addon: Omit<CartAddon, "quantity">) => {
    const existing = cart.addons.find((a) => a.id === addon.id);
    const updated = existing
      ? cart.addons.map((a) => a.id === addon.id ? { ...a, quantity: a.quantity + 1 } : a)
      : [...cart.addons, { ...addon, quantity: 1 }];
    // Default new addon to "same" schedule
    const addonSchedules = { ...cart.addonSchedules };
    if (!addonSchedules[addon.id]) {
      addonSchedules[addon.id] = { mode: "same" };
    }
    save({ ...cart, addons: updated, addonSchedules });
  };

  const removeAddon = (id: number) => {
    const addonSchedules = { ...cart.addonSchedules };
    delete addonSchedules[id];
    save({ ...cart, addons: cart.addons.filter((a) => a.id !== id), addonSchedules });
  };

  const setAddonSchedule = (id: number, schedule: AddonSchedule) => {
    save({ ...cart, addonSchedules: { ...cart.addonSchedules, [id]: schedule } });
  };

  const setCustomer = (customer: CustomerDetails) => {
    save({ ...cart, customer });
  };

  const getAddonsTotal = () => {
    return cart.addons.reduce((sum, a) => {
      const sched = cart.addonSchedules[a.id] ?? { mode: "same" };
      let multiplier = 1;

      if (sched.mode === "same") {
        // If addon is "same as subscription", multiply by number of delivery dates
        multiplier = cart.selectedDeliveryDatesCount || 1;
      } else if (sched.mode === "different" && sched.customDates) {
        // If addon has custom dates, multiply by number of custom dates selected
        multiplier = sched.customDates.length || 1;
      }

      return sum + a.price * a.quantity * multiplier;
    }, 0);
  };

  const getTotal = () => (cart.adjustedPrice || cart.planPrice) + getAddonsTotal();

  /**
   * Builds the `addons` array for POST /api/preview/inline or POST /api/subs/subscribe.
   * Each CartAddon is flattened — quantity > 1 still maps to a single addon entry
   * (the scheduler works per item-id, not quantity).
   *
   * - "same" mode: sends ONLY { id, type: "same_as_subscription" }
   * - "different" mode: sends { id, type: "recurring", frequency, deliveryDays (if weekly), startDate }
   * - Removes undefined/null fields before returning
   */
  const buildAddonPayload = (): AddonApiItem[] => {
    return cart.addons.map((a) => {
      const sched = cart.addonSchedules[a.id] ?? { mode: "same" };

      if (sched.mode === "same") {
        // Minimal payload: only id and type
        return { id: String(a.id), type: "same_as_subscription" };
      }

      // "different" → recurring with its own schedule
      const payload: AddonApiItem = {
        id: String(a.id),
        type: "recurring",
      };

      // If customDates are present, use ONLY those (not frequency/deliveryDays)
      if (sched.customDates && sched.customDates.length > 0) {
        payload.customDates = sched.customDates;
      } else {
        // Otherwise use frequency-based schedule
        // Add frequency if different from subscription
        if (sched.frequency) {
          payload.frequency = sched.frequency;
        } else {
          payload.frequency = cart.frequency;
        }

        // Add deliveryDays only if frequency is weekly
        if (sched.frequency === "weekly" || (!sched.frequency && cart.frequency === "weekly")) {
          payload.deliveryDays = sched.deliveryDays ?? [];
        }
      }

      // Add startDate (use addon's or fall back to subscription's)
      if (sched.startDate) {
        payload.startDate = sched.startDate;
      } else if (cart.startDate) {
        payload.startDate = cart.startDate;
      }

      return payload;
    });
  };

  const removePlan = () => {
    save({ ...cart, planId: "", planName: "", planPrice: 0, adjustedPrice: 0, frequency: "daily", deliveryDays: [], customDates: undefined, startDate: "", deselectedDates: [], selectedDeliveryDatesCount: 0 });
  };

  const clearCart = () => {
    localStorage.removeItem("bloomme_cart");
    setCart(DEFAULT_CART);
  };

  return (
    <CartContext.Provider value={{
      cart,
      setPlan,
      setSchedule,
      setPlanAndSchedule,
      addAddon,
      removeAddon,
      setAddonSchedule,
      setCustomer,
      getAddonsTotal,
      getTotal,
      removePlan,
      clearCart,
      buildAddonPayload,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
