"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
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
  BASIC: "Basic Plan",
  PREMIUM: "Premium Plan",
  ELITE: "Elite Plan",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  BASIC: "60–100g fresh flowers, 3 varieties",
  PREMIUM: "150g premium flowers, Bloomme box",
  ELITE: "200g exotic flowers, luxury box",
};

type ModalType = "pause" | "skip" | "schedule" | "plan" | null;

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

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
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img alt="Bloomme Logo" className="h-12 w-auto object-contain" src="/images/backgroundlesslogo.png" />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">
              Subscriptions
            </a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => { setShowNotifications(!showNotifications); setShowCart(false); }}>
                notifications
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => { setShowCart(!showCart); setShowNotifications(false); }}>
                shopping_cart
              </span>
              {showCart && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">Your cart is empty</p>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowCart(false); }}>
                <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-3 z-50">
                  <p className="text-sm font-medium text-on-surface mb-3">{user?.name}</p>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
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
      <main className="md:ml-64 pt-24 px-12 pb-12 min-h-screen">
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
        ) : activeSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">local_florist</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">No active subscriptions</h2>
            <p className="text-on-surface-variant mb-8">Your subscriptions are currently paused. Start a new subscription or resume an existing one.</p>
            <Link href="/plans" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-all">
              Start Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Active Subscriptions */}
            {activeSubscriptions.map((sub) => (
              <div key={sub.id} className="col-span-12 lg:col-span-8 group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(47,21,0,0.04)] border border-outline-variant/10">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 relative h-auto overflow-hidden bg-primary-container/20 flex items-center justify-center min-h-[200px]">
                    <span className="material-symbols-outlined text-8xl text-primary opacity-30">local_florist</span>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-primary/90 backdrop-blur-sm text-on-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                        {sub.planType}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-on-surface">{PLAN_LABELS[sub.planType] || sub.planType}</h2>
                          <p className="text-on-surface-variant font-medium">{PLAN_DESCRIPTIONS[sub.planType] || ""}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-surface-container-low p-4 rounded-lg">
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Pricing</p>
                          <div>
                            <p className="text-xl font-bold text-on-surface">₹{(sub.totalPrice || sub.price).toLocaleString()}<span className="text-sm font-normal text-on-surface-variant">/month</span></p>
                            {sub.addOnsPrice && sub.addOnsPrice > 0 && (
                              <p className="text-xs text-on-surface-variant mt-1">
                                Plan: ₹{sub.price.toLocaleString()} + Add-ons: ₹{sub.addOnsPrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-lg">
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Since</p>
                          <p className="text-base font-semibold text-on-surface">
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </p>
                        </div>
                        {sub.deliveryDays && sub.deliveryDays.length > 0 && (
                          <div className="bg-surface-container-low p-4 rounded-lg col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Delivery Days</p>
                            <p className="text-base font-semibold text-on-surface">{Array.isArray(sub.deliveryDays) ? sub.deliveryDays.join(", ") : sub.deliveryDays}</p>
                          </div>
                        )}

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
                      {/* Primary Actions Row */}
                      <div className="flex flex-col md:flex-row gap-3">
                        <button
                          onClick={() => openModal("pause", sub.id)}
                          disabled={subs.actionLoading === sub.id + ":pause"}
                          className="flex-1 bg-surface-container-highest text-on-surface py-3 px-6 rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">pause_circle</span>
                          {subs.actionLoading === sub.id + ":pause" ? "Loading..." : "Pause"}
                        </button>
                        <button
                          onClick={() => openModal("skip", sub.id)}
                          disabled={subs.actionLoading === sub.id + ":skip"}
                          className="flex-1 bg-surface-container-highest text-on-surface py-3 px-6 rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {subs.actionLoading === sub.id + ":skip" ? "Loading..." : "Skip Dates"}
                        </button>
                        <Link href="/dashboard/add-ons" className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Add Add-ons
                        </Link>
                      </div>

                      {/* Secondary Actions Row */}
                      <div className="flex flex-col md:flex-row gap-3">
                        <button
                          onClick={() => openModal("schedule", sub.id)}
                          disabled={subs.actionLoading === sub.id + ":schedule"}
                          className="flex-1 bg-surface-container-high text-on-surface py-2 px-4 rounded-lg font-semibold text-xs hover:bg-surface-variant transition-colors disabled:opacity-50 uppercase tracking-tight"
                        >
                          {subs.actionLoading === sub.id + ":schedule" ? "Loading..." : "Change Schedule"}
                        </button>
                        <button
                          onClick={() => openModal("plan", sub.id)}
                          disabled={subs.actionLoading === sub.id + ":plan"}
                          className="flex-1 bg-surface-container-high text-on-surface py-2 px-4 rounded-lg font-semibold text-xs hover:bg-surface-variant transition-colors disabled:opacity-50 uppercase tracking-tight"
                        >
                          {subs.actionLoading === sub.id + ":plan" ? "Loading..." : "Change Plan"}
                        </button>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => {
                          setSelectedSubId(sub.id);
                          setCancelConfirm(true);
                        }}
                        disabled={subs.actionLoading === sub.id + ":cancel"}
                        className="w-full border-b-2 border-transparent hover:border-error text-error/60 py-2 font-semibold text-xs transition-all uppercase tracking-widest disabled:opacity-50"
                      >
                        {subs.actionLoading === sub.id + ":cancel" ? "Cancelling..." : "Cancel Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Stats Side Column */}
            {activeSubscriptions.length > 0 && (
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/5">
                  <h3 className="text-lg font-bold mb-4">Atelier Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary">local_florist</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Farm to Doorstep</p>
                        <p className="text-xs text-on-surface-variant">Sourced from Ooty Highlands</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-secondary">verified</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Freshness Guaranteed</p>
                        <p className="text-xs text-on-surface-variant">Delivered within 4 hours of harvest</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-on-surface p-6 text-on-primary">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl">card_giftcard</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Invite a Friend</h3>
                  <p className="text-xs text-surface-variant mb-4 opacity-80">Gift a week of freshness and get ₹200 off your next billing.</p>
                  <Link href="/dashboard/referrals" className="bg-primary-container text-on-primary-container w-full py-2 rounded-lg text-xs font-bold hover:bg-white hover:text-on-surface transition-colors block text-center">
                    Refer Now
                  </Link>
                </div>
              </div>
            )}

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
                      <p className="text-sm text-on-surface-variant">₹{(sub.totalPrice || sub.price).toLocaleString()}/month</p>
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
