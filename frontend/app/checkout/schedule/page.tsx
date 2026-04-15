"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { calculatePrice, getFrequencyLabel, getCalendarStartOffset } from "@/utils/frequencyDetection";
import StickyCart from "@/components/checkout/StickyCart";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutProgressBar from "@/components/checkout/CheckoutProgressBar";

const WEEK_DAYS: { label: string; short: string; num: number }[] = [
  { label: "Sunday",    short: "Su", num: 0 },
  { label: "Monday",    short: "Mo", num: 1 },
  { label: "Tuesday",   short: "Tu", num: 2 },
  { label: "Wednesday", short: "We", num: 3 },
  { label: "Thursday",  short: "Th", num: 4 },
  { label: "Friday",    short: "Fr", num: 5 },
  { label: "Saturday",  short: "Sa", num: 6 },
];


const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Pure preset detection — takes the date list as a parameter so it works anywhere
function detectPresetFromDates(dayNums: number[], deselected: string[], next30: Date[]): string {
  const selected = next30.filter(d => {
    if (!dayNums.includes(d.getDay())) return false;
    return !deselected.includes(getLocalDateString(d));
  });

  const totals: Record<number, number> = {};
  const counts: Record<number, number> = {};

  next30.forEach(d => {
    const n = d.getDay();
    totals[n] = (totals[n] || 0) + 1;
  });
  selected.forEach(d => {
    const n = d.getDay();
    counts[n] = (counts[n] || 0) + 1;
  });

  // Any weekday with partial selection = custom
  const hasPartial = Object.keys(counts).some(n => counts[+n] !== totals[+n]);
  if (hasPartial) return "custom";

  const fullDays = Object.keys(counts).map(Number).sort((a, b) => a - b);
  if (fullDays.length === 0) return "custom";
  if (fullDays.length === 7) return "daily";
  if (fullDays.length === 2 && fullDays[0] === 0 && fullDays[1] === 6) return "weekends";
  if (fullDays.length === 3 && fullDays[0] === 1 && fullDays[1] === 3 && fullDays[2] === 5) return "alternate";
  return "weekly";
}

export default function CheckoutSchedulePage() {
  const router = useRouter();
  const { cart, setSchedule } = useCart();

  // ── Core UX state — stable defaults match SSR output (no localStorage reads here) ──

  const [selectedDayNums, setSelectedDayNums] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [deselectedDates, setDeselectedDates] = useState<string[]>([]);
  const [preset, setPreset] = useState<string>("daily");
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ── Build next-30 dates client-side only (inside useMemo, not module scope) ────────

  const next30Dates = useMemo<Date[]>(() => {
    if (!hydrated) return [];
    const offset = getCalendarStartOffset();
    const dates: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offset + i);
      dates.push(d);
    }
    return dates;
  }, [hydrated]);

  // ── Hydrate from localStorage after mount (avoids SSR/client mismatch) ─────────────

  useEffect(() => {
    // Read cart deliveryDays from localStorage
    let days = [0, 1, 2, 3, 4, 5, 6];
    try {
      const cartSaved = localStorage.getItem("bloomme_cart");
      if (cartSaved) {
        const parsed = JSON.parse(cartSaved);
        if (Array.isArray(parsed.deliveryDays) && parsed.deliveryDays.length > 0 && typeof parsed.deliveryDays[0] === "number") {
          days = parsed.deliveryDays;
        }
      }
    } catch {}

    // Read persisted deselected dates
    let desel: string[] = [];
    try {
      const deselSaved = localStorage.getItem("bloomme_schedule_deselected");
      if (deselSaved) desel = JSON.parse(deselSaved);
    } catch {}

    // Build dates now (client-side only, correct timezone)
    const offset = getCalendarStartOffset();
    const dates: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offset + i);
      dates.push(d);
    }

    // Filter deselectedDates to only include dates that match the current recurring pattern
    // This prevents old deselected dates from a different pattern being applied to a new pattern
    desel = desel.filter(dateStr => {
      const dayNum = new Date(dateStr + "T00:00:00").getDay();
      return days.includes(dayNum);
    });

    setSelectedDayNums(days);
    setDeselectedDates(desel);
    setPreset(detectPresetFromDates(days, desel, dates));
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist deselectedDates across navigation ──────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("bloomme_schedule_deselected", JSON.stringify(deselectedDates));
    } catch {}
  }, [deselectedDates, hydrated]);

  // ── Derived state ──────────────────────────────────────────────────────────────────

  const allowedDates = useMemo(
    () => next30Dates.filter(d => selectedDayNums.includes(d.getDay())),
    [next30Dates, selectedDayNums]
  );

  const selectedDatesArr = useMemo(
    () => {
      return allowedDates.filter(d => !deselectedDates.includes(getLocalDateString(d)));
    },
    [allowedDates, deselectedDates]
  );

  const startDate = useMemo(() => {
    if (selectedDatesArr.length === 0) return "";
    return getLocalDateString(selectedDatesArr[0]);
  }, [selectedDatesArr]);

  // ── Weekend Discount Unlock Logic ──────────────────────────────────────────
  // Step 1: Count weekday deliveries (Mon–Fri only)
  const weekdaysAdded = useMemo(() => {
    return selectedDatesArr.filter(d => {
      const dayNum = d.getDay();
      return dayNum >= 1 && dayNum <= 5; // Mon(1) to Fri(5)
    }).length;
  }, [selectedDatesArr]);

  // Count weekend deliveries (Sat + Sun)
  const weekendDeliveriesCount = useMemo(() => {
    return selectedDatesArr.filter(d => {
      const dayNum = d.getDay();
      return dayNum === 0 || dayNum === 6; // Sun(0) or Sat(6)
    }).length;
  }, [selectedDatesArr]);

  // Calculate price: weekdays at 1x, weekends at 1.5x (or 1x if unlock reached)
  const weekdayPrice = useMemo(() => {
    return Math.round(cart.planPrice * weekdaysAdded);
  }, [cart.planPrice, weekdaysAdded]);

  const weekendMultiplier = useMemo(() => {
    return weekdaysAdded >= 5 ? 1 : 1.5;
  }, [weekdaysAdded]);

  const weekendPrice = useMemo(() => {
    return Math.round(cart.planPrice * weekendDeliveriesCount * weekendMultiplier);
  }, [cart.planPrice, weekendDeliveriesCount, weekendMultiplier]);

  const adjustedPrice = useMemo(() => {
    return weekdayPrice + weekendPrice;
  }, [weekdayPrice, weekendPrice]);

  const frequencyLabel = useMemo(
    () => getFrequencyLabel(preset as "daily" | "alternate" | "weekends" | "weekly" | "custom", selectedDatesArr.length),
    [preset, selectedDatesArr.length]
  );

  // Reorder week days to match calendar order (starting from first date in next30)
  const orderedWeekDays = useMemo(() => {
    if (next30Dates.length === 0) return WEEK_DAYS;
    const firstDayNum = next30Dates[0].getDay();
    const reordered: typeof WEEK_DAYS = [];
    for (let i = 0; i < 7; i++) {
      const dayNum = (firstDayNum + i) % 7;
      const day = WEEK_DAYS.find(d => d.num === dayNum);
      if (day) reordered.push(day);
    }
    return reordered;
  }, [next30Dates]);

  // Step 2: Calculate remaining to unlock
  const remainingToUnlock = useMemo(() => {
    const remaining = 5 - weekdaysAdded;
    return remaining < 0 ? 0 : remaining;
  }, [weekdaysAdded]);

  // Step 3: Determine if banner should show
  // ── Event handlers ─────────────────────────────────────────────────────────────────

  const applyPreset = (type: string) => {
    let newDays: number[];
    switch (type) {
      case "daily":     newDays = [0, 1, 2, 3, 4, 5, 6]; break;
      case "alternate": newDays = [1, 3, 5]; break;
      case "weekends":  newDays = [0, 6]; break;
      case "weekly":    newDays = [2]; break; // Tuesday default
      case "custom":    newDays = selectedDayNums; break; // Keep current selection
      default: return;
    }
    setSelectedDayNums(newDays);
    setDeselectedDates([]);
    setPreset(type);
  };

  const toggleDay = (dayNum: number) => {
    setSelectedDayNums(prev => {
      if (prev.includes(dayNum)) {
        if (prev.length === 1) return prev; // enforce minimum 1 day
        const next = prev.filter(x => x !== dayNum);
        // When removing a day, clear deselections ONLY for that day
        const filtered = deselectedDates.filter(dateStr => {
          const d = new Date(dateStr + "T00:00:00");
          return d.getDay() !== dayNum;
        });
        setDeselectedDates(filtered);
        setPreset(detectPresetFromDates(next, filtered, next30Dates));
        return next;
      } else {
        const next = [...prev, dayNum].sort((a, b) => a - b);
        // When adding a day, keep deselections for other days
        setPreset(detectPresetFromDates(next, deselectedDates, next30Dates));
        return next;
      }
    });
  };

  const toggleDate = (dateStr: string) => {
    const dayNum = new Date(dateStr + "T00:00:00").getDay();
    const isDayCurrentlySelected = selectedDayNums.includes(dayNum);
    const isDateCurrentlySelected = !deselectedDates.includes(dateStr);

    let deselNext: string[] = [...deselectedDates];
    let daysNext: number[] = [...selectedDayNums];

    // Case 1: Clicking a date from a NON-selected day
    if (!isDayCurrentlySelected) {
      // Add the day to selectedDayNums
      daysNext = [...daysNext, dayNum].sort((a, b) => a - b);

      // Deselect ALL other dates of this day except the clicked one
      const datesOfThisDay = next30Dates.filter(d => d.getDay() === dayNum);
      const otherDates = datesOfThisDay
        .map(d => getLocalDateString(d))
        .filter(d => d !== dateStr);

      deselNext = [
        ...deselNext.filter(d => !otherDates.includes(d) && d !== dateStr), // remove any that are in otherDates OR the clicked date
        ...otherDates // add all other dates of this day
      ];
    } else {
      // Case 2: Clicking a date from a SELECTED day
      if (isDateCurrentlySelected) {
        // Deselecting this date
        deselNext = [...deselNext, dateStr];
      } else {
        // Selecting this date
        deselNext = deselNext.filter(s => s !== dateStr);
      }

      // Check if any dates of this day remain active
      const datesOfThisDay = next30Dates.filter(d => d.getDay() === dayNum);
      const activeDatesOfThisDay = datesOfThisDay.filter(d => !deselNext.includes(getLocalDateString(d)));

      // If no active dates remain, remove the day
      if (activeDatesOfThisDay.length === 0 && daysNext.length > 1) {
        daysNext = daysNext.filter(d => d !== dayNum);
      }
    }

    setDeselectedDates(deselNext);
    setSelectedDayNums(daysNext);
    setPreset(detectPresetFromDates(daysNext, deselNext, next30Dates));
  };

  const canContinue = selectedDatesArr.length > 0;

  const handleContinue = () => {
    const mappedFrequency = (
      preset === "weekends" ? "weekly" :
      preset
    ) as "daily" | "alternate" | "weekly" | "custom";

    // Convert selectedDatesArr to string format for customDates
    const customDatesForCart = preset === "custom"
      ? selectedDatesArr.map(d => getLocalDateString(d))
      : undefined;

    setSchedule(mappedFrequency, selectedDayNums, startDate, adjustedPrice, selectedDatesArr.length, deselectedDates, customDatesForCart);
    router.push("/checkout/addons");
  };

  // ── Render ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-32 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <CheckoutHeader
        isCartOpen={isCartOpen}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 pt-12">

        <CheckoutProgressBar currentStep={2} />

        {/* Title */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2f1500] tracking-tighter">Set Your Schedule</h2>
          <p className="font-['Playfair_Display'] italic text-lg text-[#775a11]">
            Choose how often your blooms arrive at your door.
          </p>
        </div>

        {/* Plan summary pill */}
        {cart.planName && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-[#ffdcc3]/50 border border-[#c4a052]/30 rounded-full px-5 py-2.5">
              <span className="material-symbols-outlined text-[#775a11] text-sm">local_florist</span>
              <span className="text-sm font-semibold text-[#2f1500]">{cart.planName} Plan · ₹{cart.planPrice}/day</span>
              <Link href="/checkout/plan" className="text-[#775a11] text-xs underline underline-offset-2">Change</Link>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-24">
          {/* Left column: Quick Select + Delivery Days + Calendar */}
          <div className="lg:col-span-3 space-y-8">
            {/* Frequency quick select */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-4">Quick Select</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => applyPreset("daily")}
                  className={`px-4 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    preset === "daily"
                      ? "bg-[#775a11] text-white border-[#775a11]"
                      : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => applyPreset("alternate")}
                  className={`px-4 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    preset === "alternate"
                      ? "bg-[#775a11] text-white border-[#775a11]"
                      : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                  }`}
                >
                  Alternate
                </button>
                <button
                  onClick={() => applyPreset("weekends")}
                  className={`px-4 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    preset === "weekends"
                      ? "bg-[#ab3500] text-white border-[#ab3500]"
                      : "border-[#ab3500]/30 bg-[#ab3500]/10 text-[#ab3500] hover:border-[#ab3500]"
                  }`}
                >
                  Weekends ✨
                </button>
                <button
                  onClick={() => applyPreset("weekly")}
                  className={`px-4 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    preset === "weekly"
                      ? "bg-[#775a11] text-white border-[#775a11]"
                      : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => applyPreset("custom")}
                  className={`px-4 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    preset === "custom"
                      ? "bg-[#775a11] text-white border-[#775a11]"
                      : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Delivery days picker */}
            <div>
              <p className="text-base font-bold text-[#2f1500] mb-3">Select Delivery Days</p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
                <p className="text-sm text-blue-900">
                  Selecting delivery days automatically schedules flowers for every occurrence of those days. You can fine-tune by clicking individual dates below to skip specific deliveries.
                </p>
              </div>
              <p className="text-xs text-[#4d4638]/70 mb-3">
                {preset === "custom"
                  ? "Select your preferred days. Frequency is auto-detected (e.g., Sat + Sun + Mon = Custom)"
                  : "Select your preferred delivery days. Frequency will be automatically detected."}
              </p>
              <div className="flex gap-2 flex-wrap">
                {orderedWeekDays.map((day) => {
                  const isActive = selectedDayNums.includes(day.num);
                  return (
                    <button
                      type="button"
                      key={day.num}
                      onClick={() => toggleDay(day.num)}
                      className={`w-12 h-12 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer ${
                        isActive
                          ? "bg-[#775a11] text-white border-[#775a11]"
                          : "bg-[#fff1e9] text-[#4d4638] border-[#d1c5b3]/30 hover:border-[#c4a052]"
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar section */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-4">
                Delivery Dates (Next 30 Days)
              </p>
              {selectedDayNums.length > 0 && (
                <p className="text-xs text-[#4d4638]/60 mb-3">
                  Days in your schedule are pre-selected. Tap any date to skip or add a one-off delivery.
                </p>
              )}

              {/* 30-day calendar */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {next30Dates.map((date) => {
                  const dateStr = getLocalDateString(date);
                  const dayNum = date.getDay();
                  const dayShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayNum];
                  const dateOfMonth = date.getDate();
                  const isActive = selectedDayNums.includes(dayNum) && !deselectedDates.includes(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleDate(dateStr)}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 text-xs transition-all ${
                        isActive
                          ? "border-[#775a11] bg-[#775a11] text-white"
                          : "border-[#d1c5b3]/40 bg-[#fff1e9] text-[#2f1500] hover:border-[#c4a052]"
                      }`}
                    >
                      <span className="text-[9px] font-bold">{dayShort}</span>
                      <span className="text-xs font-bold">{dateOfMonth}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#4d4638]/50">
                Total deliveries: {selectedDatesArr.length} days
              </p>
            </div>
          </div>

          {/* Right column: Delivery cards + Start Date + Discount Banner + Summary */}
          <div className="lg:col-span-2 space-y-6 lg:mt-32">
            {/* Breakdown Cards - side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weekday deliveries card */}
              <div className="border-2 border-[#d1c5b3]/40 rounded-2xl p-5 bg-[#fff1e9]">
                <p className="text-sm text-[#4d4638] mb-2">Weekday deliveries</p>
                <p className="text-3xl font-bold text-[#2f1500] mb-2">{weekdaysAdded}</p>
                <p className="text-sm text-[#4d4638] mb-3">Rate 1x</p>
                <p className="text-2xl font-bold text-[#775a11]">₹{weekdayPrice}</p>
              </div>

              {/* Weekend deliveries card */}
              <div className="border-2 border-[#ab3500]/40 rounded-2xl p-5 bg-[#ab3500]/10">
                <p className="text-sm text-[#4d4638] mb-2">Weekend deliveries</p>
                <p className="text-3xl font-bold text-[#2f1500] mb-2">{weekendDeliveriesCount}</p>
                <p className="text-sm text-[#ab3500] mb-3">Rate {weekendMultiplier}x {weekdaysAdded < 5 && <span className="text-xs bg-[#ab3500]/20 px-2 py-0.5 rounded">Premium</span>}</p>
                <p className="text-2xl font-bold text-[#ab3500]">₹{weekendPrice}</p>
              </div>
            </div>

            {/* Delivery start date */}
            {startDate && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-3">Delivery Start Date</p>
                <div className="bg-[#ffdcc3]/20 border-2 border-[#c4a052]/40 rounded-2xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#775a11]">calendar_today</span>
                    <div>
                      <p className="text-xs text-[#4d4638]/60 font-semibold">First Delivery</p>
                      <p className="text-lg font-bold text-[#2f1500]">
                        {(() => {
                          const [year, month, day] = startDate.split("-");
                          const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString("en-IN", { month: "long" });
                          return `${day} ${monthName} ${year}`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#775a11] text-2xl">📦</span>
                </div>
              </div>
            )}

            {/* Weekend Discount Unlock Banner */}
            {weekendDeliveriesCount > 0 && (
              <div className={`rounded-2xl p-6 border-2 ${
                weekdaysAdded >= 5
                  ? "bg-[#1d6e1f]/10 border-[#1d6e1f]/30"
                  : "bg-[#ab3500]/10 border-[#ab3500]/30"
              }`}>
                <div className="flex items-start gap-4">
                  <span className={`material-symbols-outlined text-2xl mt-0.5 ${
                    weekdaysAdded >= 5 ? "text-[#1d6e1f]" : "text-[#ab3500]"
                  }`}>
                    {weekdaysAdded >= 5 ? "celebration" : "local_offer"}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold mb-2 ${
                      weekdaysAdded >= 5 ? "text-[#1d6e1f]" : "text-[#ab3500]"
                    }`}>
                      {weekdaysAdded >= 5 ? "🎉 Congratulations! Weekday Pricing Unlocked" : "Weekend Discount Unlock — Logic"}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-[#2f1500] font-semibold">
                        Weekdays added: {weekdaysAdded} / 5
                      </p>
                      {weekdaysAdded >= 5 ? (
                        <p className="text-sm text-[#1d6e1f] font-semibold">
                          Weekend deliveries now at 1x rate — same as weekdays!
                        </p>
                      ) : (
                        <p className="text-sm text-[#4d4638]">
                          {remainingToUnlock === 0
                            ? "Add 0 more to unlock — keep selecting weekdays!"
                            : `Add ${remainingToUnlock} more weekday${remainingToUnlock === 1 ? "" : "s"} to unlock 1x weekend rate`}
                        </p>
                      )}
                      <p className="text-xs text-[#4d4638]/70 mt-3 pt-3 border-t border-current/20">
                        Current weekend rate: <span className={`font-bold ${weekdaysAdded >= 5 ? "text-[#1d6e1f]" : "text-[#ab3500]"}`}>×{weekendMultiplier}</span> premium
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live summary card */}
            <div className={`rounded-2xl p-5 border-2 flex items-center gap-4 ${
              weekendDeliveriesCount > 0 && weekdaysAdded < 5
                ? "bg-[#ab3500]/10 border-[#ab3500]/30"
                : "bg-[#ffdcc3]/30 border-[#c4a052]/20"
            }`}>
              <span className={`material-symbols-outlined text-2xl ${
                weekendDeliveriesCount > 0 && weekdaysAdded < 5 ? "text-[#ab3500]" : "text-[#775a11]"
              }`}>
                {weekendDeliveriesCount > 0 && weekdaysAdded < 5 ? "crown" : "local_florist"}
              </span>
              <div className="flex-1">
                <p className={`font-bold text-sm ${
                  weekendDeliveriesCount > 0 && weekdaysAdded < 5 ? "text-[#ab3500]" : "text-[#2f1500]"
                }`}>{cart.planName || "Subscription"}</p>
                <p className="text-[#4d4638] text-xs mt-0.5">
                  {frequencyLabel}
                  {startDate
                    ? ` · Starting ${new Date(startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#4d4638]/60">{weekendDeliveriesCount > 0 && weekdaysAdded < 5 ? "Premium Total" : "Total"}</p>
                <p className={`text-2xl font-extrabold ${
                  weekendDeliveriesCount > 0 && weekdaysAdded < 5 ? "text-[#ab3500]" : "text-[#775a11]"
                }`}>₹{adjustedPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#775a11]">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d4638] tracking-widest uppercase opacity-60">Detected Schedule</p>
              <p className="text-lg font-extrabold text-[#2f1500]">{frequencyLabel}</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight shadow-[0_20px_40px_rgba(47,21,0,0.06)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add-ons →
          </button>
        </div>
      </div>

      <StickyCart />

      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
