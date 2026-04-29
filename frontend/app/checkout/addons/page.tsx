"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart, AddonSchedule } from "@/context/CartContext";
import { PRODUCTS } from "@/constants";
import { getCalendarStartOffset } from "@/utils/frequencyDetection";
import StickyCart from "@/components/checkout/StickyCart";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import ConfirmationModal from "@/components/checkout/ConfirmationModal";
import CheckoutProgressBar from "@/components/checkout/CheckoutProgressBar";

// 0=Sun … 6=Sat
const WEEK_DAYS = [
  { short: "Su", num: 0 },
  { short: "Mo", num: 1 },
  { short: "Tu", num: 2 },
  { short: "We", num: 3 },
  { short: "Th", num: 4 },
  { short: "Fr", num: 5 },
  { short: "Sa", num: 6 },
];


// Helper to convert Date to YYYY-MM-DD in local timezone
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AddonSchedulePanel({
  addonId,
  baseStartDate,
}: {
  addonId: number;
  baseStartDate: string;
}) {
  const { cart, setAddonSchedule } = useCart();
  const sched: AddonSchedule = cart.addonSchedules[addonId] ?? { mode: "same" };
  const [selectedCustomDates, setSelectedCustomDates] = useState<Set<string>>(new Set());

  // Keep local state in sync with cart's customDates
  useEffect(() => {
    if (sched.mode === "different") {
      setSelectedCustomDates(new Set(sched.customDates ?? []));
    }
  }, [sched.customDates, sched.mode]);

  // Calculate subscription dates (for highlighting)
  const subscriptionDates = useMemo(() => {
    const dates = new Set<string>();
    const deselectedSet = new Set<string>(cart.deselectedDates ?? []);
    const offset = getCalendarStartOffset();

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + offset + i);
      const dn = d.getDay();
      const ds = getLocalDateString(d);

      // Check if this date matches the selected delivery days
      // Use deliveryDays as the source of truth for which days are selected
      const isSelectedDay = cart.deliveryDays.includes(dn);

      // Add only if matches selected days and not deselected
      if (isSelectedDay && !deselectedSet.has(ds)) {
        dates.add(ds);
      }
    }
    return dates;
  }, [cart.deliveryDays, cart.deselectedDates]);

  const update = (patch: Partial<AddonSchedule>) => {
    setAddonSchedule(addonId, { ...sched, ...patch });
  };

  const toggleDay = (num: number) => {
    const days = sched.deliveryDays ?? [1, 3, 5];
    const next = days.includes(num) ? days.filter((d) => d !== num) : [...days, num].sort();
    update({ deliveryDays: next });
  };

  const toggleCustomDate = (dateStr: string) => {
    const next = new Set(selectedCustomDates);
    if (next.has(dateStr)) {
      next.delete(dateStr);
    } else {
      next.add(dateStr);
    }
    setSelectedCustomDates(next);
    update({ customDates: Array.from(next) });
  };

  const minDate = (() => {
    const offset = getCalendarStartOffset();
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  // Auto-populate start date with the earliest selected custom date
  const earliestCustomDate = useMemo(() => {
    if (selectedCustomDates.size === 0) return sched.startDate ?? baseStartDate;
    const sorted = Array.from(selectedCustomDates).sort();
    return sorted[0];
  }, [selectedCustomDates, sched.startDate, baseStartDate]);

  return (
    <div className="mt-4 pt-4 border-t border-[#d1c5b3]/40">
      {/* Same / Different toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => update({ mode: "same" })}
          disabled={!baseStartDate}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
            !baseStartDate
              ? "border-[#d1c5b3]/20 bg-[#f5f5f5] text-[#4d4638]/40 cursor-not-allowed"
              : sched.mode === "same"
              ? "border-[#775a11] bg-[#ffdcc3]/40 text-[#2f1500]"
              : "border-[#d1c5b3]/40 bg-[#fff8f5] text-[#4d4638] hover:border-[#c4a052]/60"
          }`}
        >
          Same as subscription
        </button>
        <button
          onClick={() => {
            const freshSchedule: AddonSchedule = {
              mode: "different",
              frequency: sched.frequency ?? "weekly",
              deliveryDays: sched.deliveryDays ?? [0],
              customDates: [],
              startDate: sched.startDate ?? baseStartDate,
            };
            setAddonSchedule(addonId, freshSchedule);
            setSelectedCustomDates(new Set());
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
            sched.mode === "different"
              ? "border-[#775a11] bg-[#ffdcc3]/40 text-[#2f1500]"
              : "border-[#d1c5b3]/40 bg-[#fff8f5] text-[#4d4638] hover:border-[#c4a052]/60"
          }`}
        >
          Custom schedule
        </button>
      </div>

      {/* Different mode: full schedule config */}
      {sched.mode === "different" && (
        <div className="space-y-4">
          {/* Custom dates calendar */}
          <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-2">Delivery Dates (Next 30 Days)</p>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const offset = getCalendarStartOffset();
                  const date = new Date();
                  date.setDate(date.getDate() + offset + idx);
                  const dateStr = getLocalDateString(date);
                  const dayNum = date.getDay();
                  const dayShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayNum];
                  const dateOfMonth = date.getDate();
                  const isSelected = selectedCustomDates.has(dateStr);
                  const isSubDate = subscriptionDates.has(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleCustomDate(dateStr)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 text-xs transition-all ${
                        isSelected
                          ? "border-[#775a11] bg-[#775a11] text-white"
                          : isSubDate
                          ? "border-[#c4a052] bg-[#ffdcc3]/50 text-[#2f1500]"
                          : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                      }`}
                    >
                      <span className="text-[9px] font-bold">{dayShort}</span>
                      <span className="text-xs font-bold">{dateOfMonth}</span>
                    </button>
                  );
                })}
              </div>
              {baseStartDate && (
                <p className="text-[10px] text-[#4d4638]/50">
                  <span className="inline-block w-3 h-3 bg-[#ffdcc3]/50 border border-[#c4a052] rounded mr-1"></span>
                  Subscription dates (highlighted) · Select addon-specific dates
                </p>
              )}
              {selectedCustomDates.size > 0 && (
                <p className="text-xs font-semibold text-[#2f1500] mt-3 pt-3 border-t border-[#d1c5b3]/40">
                  Selected: {selectedCustomDates.size} days
                </p>
              )}
            </div>

          {/* Start date */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-2">Start Date</p>
            <input
              type="date"
              min={minDate}
              value={earliestCustomDate}
              onChange={(e) => update({ startDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] text-sm font-medium focus:outline-none focus:border-[#775a11] transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutAddonsPage() {
  const router = useRouter();
  const { cart, addAddon, removeAddon, getTotal } = useCart();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNoSubscriptionModal, setShowNoSubscriptionModal] = useState(false);

  const getQty = (id: number) => cart.addons.find((a) => a.id === id)?.quantity ?? 0;

  const validateCustomSchedules = (): boolean => {
    for (const addon of cart.addons) {
      const sched = cart.addonSchedules[addon.id];
      if (sched?.mode === "different" && (!sched.customDates || sched.customDates.length === 0)) {
        setValidationError(`Please select at least 1 day for ${addon.title}`);
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleContinue = () => {
    // If no plan and no addons, cart is empty
    if (!cart.planId && cart.addons.length === 0) {
      setValidationError("Please add at least one item to continue");
      return;
    }

    if (validateCustomSchedules()) {
      // If no subscription plan, show confirmation modal
      if (!cart.planId) {
        setShowNoSubscriptionModal(true);
      } else {
        router.push("/checkout/details");
      }
    }
  };

  const handleAdd = (product: (typeof PRODUCTS)[0]) => {
    addAddon({ id: product.id, title: product.title, price: product.price, image: product.image });
    setExpanded(product.id); // auto-expand schedule config on first add
  };

  const handleRemove = (id: number) => {
    removeAddon(id);
    if (expanded === id) setExpanded(null);
  };

  const addonCount = cart.addons.reduce((s, a) => s + a.quantity, 0);

  const scheduleLabel = (id: number) => {
    const sched = cart.addonSchedules[id];
    if (!sched || sched.mode === "same") return "Same as subscription";
    if (sched.mode === "different") {
      if (sched.customDates && sched.customDates.length > 0) return `${sched.customDates.length} selected days`;
      return "Custom Schedule";
    }
    if (sched.frequency === "daily") return "Daily";
    if (sched.frequency === "alternate") return "Alternate days";
    const days = WEEK_DAYS.filter((d) => (sched.deliveryDays ?? []).includes(d.num)).map((d) => d.short);
    return days.length > 0 ? `Weekly: ${days.join(", ")}` : "Weekly";
  };

  return (
    <div className="min-h-screen pb-40 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <CheckoutHeader
        isCartOpen={isCartOpen}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 pt-12">

        <CheckoutProgressBar currentStep={3} />

        {/* Title */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2f1500] tracking-tighter">Elevate Your Ritual</h2>
          <p className="font-['Playfair_Display'] italic text-lg text-[#775a11]">
            Add sacred essentials — each with its own delivery schedule.
          </p>
        </div>

        {/* Plan + schedule summary pill */}
        {cart.planName && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-[#ffdcc3]/50 border border-[#c4a052]/30 rounded-full px-5 py-2.5">
              <span className="material-symbols-outlined text-[#775a11] text-sm">local_florist</span>
              <span className="text-sm font-semibold text-[#2f1500]">
                {cart.planName} · {cart.frequency === "daily" ? "Daily" : cart.frequency === "alternate" ? "Alternate" : cart.deliveryDays.length === 2 && cart.deliveryDays.includes(0) && cart.deliveryDays.includes(6) ? "Weekends" : "Weekly"}
                {cart.startDate
                  ? ` from ${new Date(cart.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : ""}
              </span>
              <Link href="/checkout/schedule" className="text-[#775a11] text-xs underline underline-offset-2">Change</Link>
            </div>
          </div>
        )}

        {/* Add-ons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {PRODUCTS.map((product) => {
            const qty = getQty(product.id);
            const isInCart = qty > 0;
            const isExpanded = expanded === product.id && isInCart;
            const sched = cart.addonSchedules[product.id];

            return (
              <div
                key={product.id}
                className={`bg-[#fff1e9] rounded-2xl overflow-hidden border-2 transition-all ${
                  isInCart
                    ? "border-[#775a11] shadow-[0_8px_24px_rgba(47,21,0,0.08)]"
                    : "border-transparent hover:border-[#c4a052]/30"
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-[#ffdcc3]/30">
                  <Image src={product.image} alt={product.title} fill className="object-cover" />
                  {qty > 0 && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#775a11] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {qty}
                    </div>
                  )}
                  {sched?.mode === "different" && (
                    <div className="absolute top-3 left-3 bg-[#2f1500]/70 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                      Custom
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#2f1500] text-base leading-tight">{product.title}</h3>
                    <span className="text-xs font-semibold bg-[#ffdcc3] text-[#775a11] px-2 py-0.5 rounded-full whitespace-nowrap">
                      Add-On
                    </span>
                  </div>
                  <p className="text-[#4d4638] text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#2f1500]">₹{product.price}</span>
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAdd(product)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#775a11] text-white text-sm font-bold hover:bg-[#5e4409] transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="w-8 h-8 rounded-xl bg-[#ffdcc3] text-[#775a11] font-bold flex items-center justify-center hover:bg-[#c4a052] hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-6 text-center font-bold text-[#2f1500]">{qty}</span>
                        <button
                          onClick={() => handleAdd(product)}
                          className="w-8 h-8 rounded-xl bg-[#775a11] text-white font-bold flex items-center justify-center hover:bg-[#5e4409] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Schedule config — only shown when in cart */}
                  {isInCart && (
                    <div>
                      {/* Collapsed summary / expand toggle */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : product.id)}
                        className="w-full mt-3 flex items-center justify-between text-xs text-[#775a11] font-semibold hover:text-[#5e4409] transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {scheduleLabel(product.id)}
                        </span>
                        <span className="material-symbols-outlined text-sm">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      {/* Expanded inline schedule config */}
                      {isExpanded && (
                        <AddonSchedulePanel
                          addonId={product.id}
                          baseStartDate={cart.startDate}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#4d4638]/50 mb-24">
          Tap an added item's schedule label to customise its delivery days.
        </p>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#775a11]">
              <span className="material-symbols-outlined">shopping_basket</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d4638] tracking-widest uppercase opacity-60">Order Total</p>
              <p className="text-2xl font-extrabold text-[#2f1500]">₹{getTotal()}.00</p>
            </div>
            {addonCount > 0 && (
              <span className="text-xs text-[#775a11] font-semibold bg-[#ffdcc3]/60 px-3 py-1 rounded-full">
                +{addonCount} add-on{addonCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 items-center md:items-end">
            {validationError && (
              <p className="text-sm text-[#ab3500] font-semibold">{validationError}</p>
            )}
            <button
              onClick={handleContinue}
              disabled={!cart.planId && cart.addons.length === 0}
              className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight shadow-[0_20px_40px_rgba(47,21,0,0.06)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Details →
            </button>
          </div>
        </div>
      </div>

      <StickyCart />

      {/* Confirmation Modal for Addon-Only Checkout */}
      <ConfirmationModal
        isOpen={showNoSubscriptionModal}
        title="Are you sure you want to checkout without a ritual plan?"
        confirmText="Yes, Continue"
        cancelText="No"
        onConfirm={() => {
          setShowNoSubscriptionModal(false);
          router.push("/checkout/details");
        }}
        onCancel={() => {
          setShowNoSubscriptionModal(false);
          router.push("/checkout/plan");
        }}
      />

      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
