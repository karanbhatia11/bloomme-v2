"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartUI } from "@/context/CartUIContext";
import { useCart } from "@/context/CartContext";
import { useSubscriptions, Subscription } from "@/hooks/useSubscriptions";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface DateInfo {
  activePlans: string[]; // plan type names
  pausedPlans: string[]; // plan type names
  addons: string[];      // addon names
}

const PLAN_COLORS: Record<string, string> = {
  Traditional: "bg-amber-50 border-amber-200 text-amber-800",
  Divine:      "bg-[#ffdcc3] border-[#c4a052] text-[#775a11]",
  Celestial:   "bg-purple-50 border-purple-200 text-purple-800",
};

const STATUS_DOT: Record<string, string> = {
  active:    "bg-green-500",
  paused:    "bg-amber-400",
  cancelled: "bg-red-400",
};

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsCartOpen } = useCartUI();
  const { cart } = useCart();
  const cartCount = cart.addons.reduce((s, a) => s + a.quantity, 0) + (cart.planId ? 1 : 0);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const subs = useSubscriptions(token);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!savedToken || !userStr) { router.push("/login"); return; }
    try {
      setUser(JSON.parse(userStr));
      setToken(savedToken);
    } catch { router.push("/login"); }
  }, []);

  useEffect(() => {
    if (token) subs.fetch();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  // ── Build date map — filtered by selected subscription if any ───────────────
  const dateMap: Record<string, DateInfo> = {};

  const addDate = (date: string, isActive: boolean, planType?: string, addonName?: string) => {
    if (!dateMap[date]) dateMap[date] = { activePlans: [], pausedPlans: [], addons: [] };
    if (addonName) {
      if (!dateMap[date].addons.includes(addonName)) dateMap[date].addons.push(addonName);
    } else if (planType) {
      if (isActive && !dateMap[date].activePlans.includes(planType)) dateMap[date].activePlans.push(planType);
      if (!isActive && !dateMap[date].pausedPlans.includes(planType)) dateMap[date].pausedPlans.push(planType);
    }
  };

  const visibleSubs = selectedSubId
    ? subs.subscriptions.filter(s => s.id === selectedSubId)
    : subs.subscriptions;

  for (const sub of visibleSubs) {
    const isActive = sub.status === "active";
    const isPaused = sub.status === "paused";
    if (!isActive && !isPaused) continue;

    for (const date of sub.customSchedule ?? []) {
      addDate(date, isActive, sub.planType);
    }
    for (const addon of sub.addOns ?? []) {
      for (const date of addon.deliveryDates ?? []) {
        addDate(date, isActive, undefined, addon.name);
      }
    }
  }

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayToDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Upcoming deliveries (next 5 across all subscriptions)
  const upcomingDates = Object.entries(dateMap)
    .filter(([d]) => d >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 7);

  const pastDates = Object.entries(dateMap)
    .filter(([d]) => d < todayStr)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5);

  const activeSubs  = subs.subscriptions.filter(s => s.status === "active");
  const pausedSubs  = subs.subscriptions.filter(s => s.status === "paused");

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <img alt="Bloomme Logo" className="h-12 w-auto object-contain" src="/images/backgroundlesslogo.png" />
          </Link>
          <div className="relative md:hidden">
            <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowProfile(false); }}>
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
            {mobileMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-2 z-50">
                <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-base">dashboard</span>Dashboard</a>
                <a href="/dashboard/subscriptions" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-base">loyalty</span>Subscriptions</a>
                <a href="/dashboard/add-ons" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-base">featured_video</span>Add-ons</a>
                <a href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary/5"><span className="material-symbols-outlined text-base">calendar_today</span>Calendar</a>
                <a href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-base">redeem</span>Referrals</a>
                <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-base">settings</span>Settings</a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">Dashboard</Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">Calendar</a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">Support</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}>
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-4">No notifications</p>
                </div>
              )}
            </div>
            <button className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => { setIsCartOpen(true); setShowNotifications(false); }}>
              <span className="material-symbols-outlined">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </button>
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setMobileMenuOpen(false); }}>
                <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-3 z-50">
                  <p className="text-sm font-medium text-on-surface mb-3">{user?.name}</p>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-[#fff1e9] flex flex-col gap-2 p-4 hidden md:flex">
        <div className="px-4 py-2 mb-4">
          <div className="text-lg font-bold text-on-surface font-headline">Bloomme Dashboard</div>
          <div className="text-xs text-on-surface-variant font-medium">Premium Floral Management</div>
        </div>
        <nav className="flex-grow space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/subscriptions"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>Subscriptions</a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons"><span className="material-symbols-outlined">featured_video</span>Add-ons</a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium" href="/dashboard/calendar"><span className="material-symbols-outlined">calendar_today</span>Calendar</a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/referrals"><span className="material-symbols-outlined">redeem</span>Referrals</a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/settings"><span className="material-symbols-outlined">settings</span>Settings</a>
        </nav>
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all"><span className="material-symbols-outlined">logout</span>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 md:px-12 pb-12 min-h-screen">
        <header className="mb-8">
          <span className="font-accent italic text-xl text-primary mb-2 block">Your Floral Journey</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">Delivery Calendar</h1>
        </header>

        {/* Subscription Pills */}
        {subs.loading ? (
          <div className="flex gap-2 mb-8">
            {[1,2].map(i => <div key={i} className="h-8 w-32 bg-surface-container animate-pulse rounded-full" />)}
          </div>
        ) : subs.subscriptions.length === 0 ? (
          <div className="mb-8 p-4 bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
            No subscriptions found. <Link href="/checkout/plan" className="text-primary font-semibold underline">Start one →</Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-8">
            {/* All pill */}
            <button
              onClick={() => setSelectedSubId(null)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                selectedSubId === null
                  ? "bg-[#2f1500] text-white border-[#2f1500] shadow-md"
                  : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-on-surface-variant"
              }`}
            >
              All
            </button>

            {subs.subscriptions.filter(s => s.status !== "cancelled").map(sub => {
              const isSelected = selectedSubId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(isSelected ? null : sub.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                    isSelected
                      ? "ring-2 ring-offset-1 ring-[#775a11] " + (PLAN_COLORS[sub.planType] ?? "bg-surface-container border-outline-variant text-on-surface")
                      : "opacity-70 hover:opacity-100 " + (PLAN_COLORS[sub.planType] ?? "bg-surface-container border-outline-variant text-on-surface")
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[sub.status]}`} />
                  {sub.planType} Plan
                  {(sub.addOns ?? []).length > 0 && (
                    <span className="opacity-70">+ {sub.addOns!.length} add-on{sub.addOns!.length > 1 ? "s" : ""}</span>
                  )}
                  <span className="opacity-50 capitalize">{sub.status}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Calendar */}
          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              {/* Month nav */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-on-surface">
                  {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Blank cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = dayToDateStr(day);
                  const info = dateMap[dateStr];
                  const isToday = dateStr === todayStr;
                  const hasActive = (info?.activePlans ?? []).length > 0;
                  const hasPaused = (info?.pausedPlans ?? []).length > 0;
                  const hasAddon  = (info?.addons ?? []).length > 0;
                  const hasAny    = hasActive || hasPaused || hasAddon;

                  return (
                    <div key={day} className={`aspect-square relative group flex flex-col items-center justify-center rounded-lg text-xs transition-all cursor-default
                      ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                      ${hasActive  ? "bg-[#ffdcc3]/60 border border-[#c4a052]/60 hover:bg-[#ffdcc3]" :
                        hasPaused  ? "bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container-highest" :
                        hasAddon   ? "bg-purple-50 border border-purple-200 hover:bg-purple-100" :
                        "bg-surface-container border border-transparent hover:border-outline-variant/20"}
                    `}>
                      <span className={`font-bold leading-none ${isToday ? "text-primary" : hasAny ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {day}
                      </span>

                      {/* Icons row */}
                      {hasAny && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {(hasActive || hasPaused) && (
                            <span className="material-symbols-outlined leading-none text-[#775a11]" style={{ fontSize: "10px", fontVariationSettings: "'FILL' 1" }}>
                              local_florist
                            </span>
                          )}
                          {hasAddon && (
                            <span className="material-symbols-outlined leading-none text-[#ab3500]" style={{ fontSize: "10px" }}>
                              redeem
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hover tooltip */}
                      {hasAny && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block pointer-events-none">
                          <div className="bg-[#2f1500] text-white text-[10px] rounded-lg px-2.5 py-2 shadow-xl min-w-[120px] max-w-[160px] whitespace-nowrap">
                            <p className="font-bold mb-1 text-[#ffdcc3]">
                              {new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                            {info.activePlans.map(plan => (
                              <p key={plan} className="flex items-center gap-1"><span className="material-symbols-outlined text-[#ffdcc3]" style={{ fontSize: "10px" }}>local_florist</span>{plan} Plan</p>
                            ))}
                            {info.pausedPlans.map(plan => (
                              <p key={plan} className="flex items-center gap-1 opacity-60"><span className="material-symbols-outlined" style={{ fontSize: "10px" }}>local_florist</span>{plan} Plan (paused)</p>
                            ))}
                            {info.addons.map(name => (
                              <p key={name} className="flex items-center gap-1 text-[#ffb89a]">
                                <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>redeem</span>
                                <span className="truncate max-w-[120px]">{name}</span>
                              </p>
                            ))}
                          </div>
                          {/* Arrow */}
                          <div className="w-2 h-2 bg-[#2f1500] rotate-45 mx-auto -mt-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#ffdcc3] border border-[#c4a052]/60" />
                  <span>Active delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-surface-container-high border border-outline-variant/30" />
                  <span>Paused delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-purple-50 border border-purple-200" />
                  <span>Add-on only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full ring-2 ring-primary" />
                  <span>Today</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-6">
            {/* Upcoming */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Upcoming Deliveries</h3>
              {upcomingDates.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No upcoming deliveries</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDates.map(([dateStr, info]) => {
                    const d = new Date(dateStr + "T00:00:00");
                    const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                    return (
                      <div key={dateStr} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dateStr === todayStr ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}>
                            {d.getDate()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{label}</p>
                            <div className="flex gap-1 flex-wrap">
                              {info.activePlans.map(plan => (
                                <span key={plan} className="text-[10px] text-[#775a11] font-medium">{plan} Plan</span>
                              ))}
                              {info.pausedPlans.map(plan => (
                                <span key={plan} className="text-[10px] text-on-surface-variant font-medium">{plan} Plan (paused)</span>
                              ))}
                              {info.addons.map(name => (
                                <span key={name} className="text-[10px] text-[#ab3500] font-medium">{name}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">local_florist</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past */}
            {pastDates.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Past Deliveries</h3>
                <div className="space-y-2">
                  {pastDates.map(([dateStr]) => {
                    const d = new Date(dateStr + "T00:00:00");
                    return (
                      <div key={dateStr} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                        <p className="text-sm text-on-surface-variant">
                          {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          Delivered <span className="material-symbols-outlined text-sm">check</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
