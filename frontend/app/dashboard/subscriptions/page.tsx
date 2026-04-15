"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useCartUI } from "@/context/CartUIContext";
import { useCart } from "@/context/CartContext";
import PauseModal from "@/components/dashboard/modals/PauseModal";
import SkipDatesModal from "@/components/dashboard/modals/SkipDatesModal";
import ChangeScheduleModal from "@/components/dashboard/modals/ChangeScheduleModal";
import ChangePlanModal from "@/components/dashboard/modals/ChangePlanModal";

interface UserData {
  id: string;
  name: string;
  email: string;
}

const PLAN_LABELS: Record<string, string> = {
  Traditional: "Traditional",
  Divine: "Divine",
  Celestial: "Celestial",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  Traditional: "80–100g fresh devotional mix, 3 rotational variety",
  Divine: "120–150g premium devotional mix, 3 premium rotational variety",
  Celestial: "200g exotic offerings, complete florist's atelier",
};

const PLAN_IMAGES: Record<string, string> = {
  Traditional: "/images/traditional.png",
  Divine: "/images/divine.png",
  Celestial: "/images/celestial.png",
};

type ModalType = "pause" | "skip" | "schedule" | "plan" | null;

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { setIsCartOpen } = useCartUI();
  const { cart } = useCart();
  const cartCount = cart.addons.reduce((s, a) => s + a.quantity, 0) + (cart.planId ? 1 : 0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [priceInfoOpen, setPriceInfoOpen] = useState<string | null>(null);

  const subs = useSubscriptions(token);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!savedToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setToken(savedToken);
      // Fetch subscriptions will be called by useSubscriptions hook
    } catch {
      router.push("/login");
    }
  }, []);

  // Fetch subscriptions when token is set
  useEffect(() => {
    if (token) {
      subs.fetch();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const openModal = (modalType: ModalType, subId: string) => {
    setSelectedSubId(subId);
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSubId(null);
    setCancelConfirm(false);
  };

  const handlePauseSubmit = async (startDate: string, endDate: string) => {
    if (!selectedSubId) return false;
    const success = await subs.pause(selectedSubId, { startDate, endDate });
    return success;
  };

  const handleSkipSubmit = async (dates: string[]) => {
    if (!selectedSubId) return false;
    const success = await subs.skip(selectedSubId, { dates });
    return success;
  };

  const handleScheduleSubmit = async (frequency: string, deliveryDays: string[]) => {
    if (!selectedSubId) return false;
    const success = await subs.changeSchedule(selectedSubId, { frequency, deliveryDays });
    return success;
  };

  const handlePlanSubmit = async (planType: string) => {
    if (!selectedSubId) return false;
    const success = await subs.changePlan(selectedSubId, { planType });
    return success;
  };

  const handleCancelSubmit = async () => {
    if (!selectedSubId) return false;
    const success = await subs.cancel(selectedSubId);
    if (success) closeModal();
    return success;
  };

  if (!user) return null;

  const activeSubscriptions = subs.subscriptions.filter((s) => s.status === "active");
  const pausedSubscriptions = subs.subscriptions.filter((s) => s.status === "paused");

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img alt="Bloomme Logo" className="h-12 w-auto object-contain" src="/images/backgroundlesslogo.png" />
            </Link>
            {/* Mobile hamburger - second from left */}
            <div className="relative md:hidden">
              <button
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowProfile(false); }}
              >
                <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
              </button>
              {mobileMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-2 z-50">
                  <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-base">dashboard</span>Dashboard
                  </a>
                  <a href="/dashboard/subscriptions" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary/5">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>Subscriptions
                  </a>
                  <a href="/dashboard/add-ons" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-base">featured_video</span>Add-ons
                  </a>
                  <a href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-base">calendar_today</span>Calendar
                  </a>
                  <a href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-base">redeem</span>Referrals
                  </a>
                  <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-base">settings</span>Settings
                  </a>
                  <div className="border-t border-outline-variant/10 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/5 transition-colors">
                      <span className="material-symbols-outlined text-base">logout</span>Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav */}
            <div className="hidden md:flex gap-8 mr-4">
              <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">Dashboard</Link>
              <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">Subscriptions</a>
              <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">Support</Link>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-4">No notifications</p>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => { setIsCartOpen(true); setShowNotifications(false); }}
              aria-label="Shopping cart"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile avatar */}
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => { setShowProfile(!showProfile); setMobileMenuOpen(false); }}>
                <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
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
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium" href="/dashboard/subscriptions">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/calendar">
            <span className="material-symbols-outlined">calendar_today</span>Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/referrals">
            <span className="material-symbols-outlined">redeem</span>Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/settings">
            <span className="material-symbols-outlined">settings</span>Settings
          </a>
        </nav>
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 md:px-12 pb-12 min-h-screen">
        <header className="mb-12">
          <span className="font-accent italic text-xl text-primary mb-2 block">Your Floral Sanctuary</span>
          <h1 className="text-4xl font-bold text-on-surface tracking-tight">Active Subscriptions</h1>
        </header>

        {/* Error Toast */}
        {subs.error && (
          <div className="mb-8 bg-error/10 border border-error/30 rounded-lg px-6 py-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-error">{subs.error}</p>
            <button
              onClick={() => subs.clearError()}
              className="text-error hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {subs.loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-on-surface-variant">Loading subscriptions...</div>
          </div>
        ) : subs.subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">local_florist</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">No subscriptions yet</h2>
            <p className="text-on-surface-variant mb-8">Start your floral journey with a subscription plan.</p>
            <Link href="/plans" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-all">
              View Plans
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {subs.subscriptions.map((sub) => (
              <div key={sub.id} className="col-span-12 group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(47,21,0,0.04)] border border-outline-variant/10">
                <div className="p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          {PLAN_IMAGES[sub.planType] && (
                            <img
                              src={PLAN_IMAGES[sub.planType]}
                              alt={sub.planType}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div>
                            <h2 className="text-3xl font-bold text-on-surface">{PLAN_LABELS[sub.planType] || sub.planType}</h2>
                            <p className="text-on-surface-variant font-medium">{PLAN_DESCRIPTIONS[sub.planType] || ""}</p>
                          </div>
                        </div>
                        {sub.status === "active" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        )}
                        {sub.status === "paused" && (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Paused
                          </span>
                        )}
                        {sub.status === "cancelled" && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-surface-container-low p-4 rounded-lg">
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Paid</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-on-surface">₹{(() => {
                              const pDays = sub.customSchedule?.length || 30;
                              const pTotal = Math.round(sub.price / 30) * pDays;
                              const aTotal = (sub.addOns ?? []).reduce((s, a) => s + a.price * (a.deliveryCount ?? 1), 0);
                              return (pTotal + aTotal).toLocaleString();
                            })()}</p>
                            <div className="relative">
                              <button
                                onClick={() => setPriceInfoOpen(priceInfoOpen === sub.id ? null : sub.id)}
                                className="w-5 h-5 rounded-full border border-on-surface-variant/50 text-on-surface-variant text-[10px] font-bold flex items-center justify-center hover:bg-surface-container transition-colors flex-shrink-0"
                              >i</button>
                              {priceInfoOpen === sub.id && (() => {
                                // Plan days: use customSchedule length if specific dates exist, else 30 (monthly default)
                                const planDays = (sub.customSchedule && sub.customSchedule.length > 0)
                                  ? sub.customSchedule.length
                                  : 30;
                                const hasPlan = sub.price > 0;
                                const perDay = Math.round(sub.price / 30);
                                const planTotal = perDay * planDays;
                                const addonTotal = (sub.addOns ?? []).reduce((s, a) => s + a.price * (a.deliveryCount ?? 1), 0);
                                const total = planTotal + addonTotal;

                                // Each add-on has deliveryCount from backend (count of addon_delivery_dates rows)
                                const addonEntries = (sub.addOns ?? []).map(
                                  (addon) => [addon.name, { price: addon.price, count: addon.deliveryCount ?? 1 }] as const
                                );
                                const hasAddons = addonEntries.length > 0;


                                return (
                                  <div className="absolute left-0 top-7 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 p-4 z-50 text-sm">
                                    {hasPlan && (
                                      <div className="flex justify-between items-start py-1.5 border-b border-outline-variant/10">
                                        <span className="text-on-surface-variant flex-shrink-0 mr-2">Plan</span>
                                        <span className="text-right font-medium text-on-surface">
                                          ₹{perDay}/day × {planDays} days
                                          <br /><span className="text-xs text-on-surface-variant">= ₹{planTotal.toLocaleString()}</span>
                                        </span>
                                      </div>
                                    )}
                                    {addonEntries.map(([name, { price, count }]) => (
                                      <div key={name} className="flex justify-between items-start py-1.5 border-b border-outline-variant/10">
                                        <span className="text-on-surface-variant flex-shrink-0 mr-2 max-w-[6rem] leading-tight">{name}</span>
                                        <span className="text-right font-medium text-on-surface">
                                          ₹{price}/day × {count} {count === 1 ? "day" : "days"}
                                          <br /><span className="text-xs text-on-surface-variant">= ₹{(price * count).toLocaleString()}</span>
                                        </span>
                                      </div>
                                    ))}
                                    {(hasPlan || hasAddons) && (
                                      <div className="flex justify-between items-center pt-2 font-bold text-on-surface">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-lg">
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Since</p>
                          <p className="text-base font-semibold text-on-surface">
                            {sub.startDate ? new Date(sub.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </p>
                        </div>
                        {/* Next Delivery Dates */}
                        {(() => {
                          const now = new Date();
                          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

                          const getNext = (dates: string[]) =>
                            dates.filter(d => d >= today).sort()[0] ?? null;

                          const formatNext = (date: string | null) => {
                            if (!date) return "Completed";
                            return new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                          };

                          const planNext = getNext(sub.customSchedule ?? []);
                          const addonRows = (sub.addOns ?? []).map(a => ({
                            name: a.name,
                            next: getNext(a.deliveryDates ?? []),
                          }));

                          const hasAny = planNext !== null || addonRows.some(a => a.next !== null) || (sub.customSchedule ?? []).length > 0 || addonRows.length > 0;
                          if (!hasAny) return null;

                          return (
                            <div className="bg-surface-container-low p-4 rounded-lg col-span-2">
                              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-3">Next Deliveries</p>
                              <div className="space-y-2">
                                {sub.customSchedule && sub.customSchedule.length > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-on-surface font-medium">
                                      {PLAN_LABELS[sub.planType] || sub.planType} Plan
                                    </span>
                                    <span className={`text-sm font-semibold ${planNext ? "text-primary" : "text-on-surface-variant"}`}>
                                      {formatNext(planNext)}
                                    </span>
                                  </div>
                                )}
                                {addonRows.map(({ name, next }) => (
                                  <div key={name} className="flex items-center justify-between">
                                    <span className="text-sm text-on-surface font-medium">{name}</span>
                                    <span className={`text-sm font-semibold ${next ? "text-primary" : "text-on-surface-variant"}`}>
                                      {formatNext(next)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {sub.addOns && sub.addOns.length > 0 && (
                          <div className="bg-surface-container-low p-4 rounded-lg col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-3">Active Add-ons</p>
                            <div className="space-y-2">
                              {sub.addOns.map((addon) => (
                                <div key={addon.id} className="flex items-center justify-between p-2 bg-primary/10 rounded">
                                  <div>
                                    <p className="text-sm font-semibold text-on-surface">{addon.name}</p>
                                    {addon.oneOffDate && (
                                      <p className="text-xs text-on-surface-variant">
                                        {new Date(addon.oneOffDate + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-primary">₹{addon.price.toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-10 space-y-3">
                      <div className="flex flex-col md:flex-row gap-3">
                        {sub.status === "active" ? (
                          <button
                            onClick={() => subs.pause(sub.id, { startDate: "", endDate: "" })}
                            disabled={!!subs.actionLoading}
                            className="flex-1 bg-surface-container-highest text-on-surface py-3 px-6 rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">pause_circle</span>
                            {subs.actionLoading === sub.id + ":pause" ? "Pausing..." : "Pause Subscription"}
                          </button>
                        ) : sub.status === "paused" ? (
                          <button
                            onClick={() => subs.resume(sub.id)}
                            disabled={!!subs.actionLoading}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            {subs.actionLoading === sub.id + ":resume" ? "Resuming..." : "Resume Subscription"}
                          </button>
                        ) : null}
                      </div>

                      {/* Cancel Button */}
                      {sub.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            setSelectedSubId(sub.id);
                            setCancelConfirm(true);
                          }}
                          disabled={!!subs.actionLoading}
                          className="w-full border-b-2 border-transparent hover:border-error text-error/60 py-2 font-semibold text-xs transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                          {subs.actionLoading === sub.id + ":cancel" ? "Cancelling..." : "Cancel Plan"}
                        </button>
                      )}
                    </div>
                </div>
              </div>
            ))}


            {/* Paused Subscriptions */}
            {pausedSubscriptions.map((sub) => (
              <div key={sub.id} className="col-span-12 group bg-surface-container-low/40 rounded-xl p-8 border-2 border-dashed border-outline-variant/30 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center grayscale">
                      <span className="material-symbols-outlined text-3xl text-outline">auto_awesome</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-outline">{PLAN_LABELS[sub.planType] || sub.planType}</h3>
                        <span className="bg-orange-100 text-orange-700 px-3 py-0.5 rounded-full text-[10px] font-bold border border-orange-200 uppercase tracking-tighter">
                          Paused
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">₹{(sub.totalPrice || sub.price + (sub.addOnsPrice || 0)).toLocaleString()} total</p>
                    </div>
                  </div>
                  <button
                    disabled={subs.actionLoading === sub.id + ":resume"}
                    className="bg-on-surface text-surface py-3 px-8 rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      subs.resume(sub.id);
                    }}
                  >
                    {subs.actionLoading === sub.id + ":resume" ? "Resuming..." : "Resume Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedSubId && (
        <>
          <PauseModal
            isOpen={activeModal === "pause"}
            subscriptionId={selectedSubId}
            subscriptionStartDate={
              subs.subscriptions.find((s) => s.id === selectedSubId)?.startDate || undefined
            }
            subscriptionEndDate={
              subs.subscriptions.find((s) => s.id === selectedSubId)?.endDate || undefined
            }
            isLoading={subs.actionLoading === selectedSubId + ":pause"}
            onClose={closeModal}
            onSubmit={handlePauseSubmit}
          />

          <SkipDatesModal
            isOpen={activeModal === "skip"}
            subscriptionId={selectedSubId}
            deliveryDays={
              subs.subscriptions.find((s) => s.id === selectedSubId)?.deliveryDays || []
            }
            isLoading={subs.actionLoading === selectedSubId + ":skip"}
            onClose={closeModal}
            onSubmit={handleSkipSubmit}
          />

          <ChangeScheduleModal
            isOpen={activeModal === "schedule"}
            subscriptionId={selectedSubId}
            currentDays={
              subs.subscriptions.find((s) => s.id === selectedSubId)?.deliveryDays || []
            }
            isLoading={subs.actionLoading === selectedSubId + ":schedule"}
            onClose={closeModal}
            onSubmit={handleScheduleSubmit}
          />

          <ChangePlanModal
            isOpen={activeModal === "plan"}
            subscriptionId={selectedSubId}
            currentPlan={
              subs.subscriptions.find((s) => s.id === selectedSubId)?.planType || ""
            }
            isLoading={subs.actionLoading === selectedSubId + ":plan"}
            onClose={closeModal}
            onSubmit={handlePlanSubmit}
          />

          {/* Cancel Confirmation Modal */}
          {cancelConfirm && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={closeModal}
              />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white rounded-3xl border-2 border-[#d1c5b3]/30 shadow-2xl p-8 space-y-6">
                <div className="space-y-3 text-center">
                  <h3 className="text-2xl font-bold text-[#2f1500] tracking-tight">
                    Cancel Subscription?
                  </h3>
                  <p className="font-['Playfair_Display'] italic text-[#775a11] text-sm">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Keep Plan
                  </button>
                  <button
                    onClick={handleCancelSubmit}
                    disabled={subs.actionLoading === selectedSubId + ":cancel"}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-[#d1c5b3] text-[#775a11] font-bold text-sm tracking-tight hover:bg-[#fff1e9] transition-colors disabled:opacity-50"
                  >
                    {subs.actionLoading === selectedSubId + ":cancel" ? "Cancelling..." : "Cancel Plan"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
