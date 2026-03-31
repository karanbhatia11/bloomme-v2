"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  id: string;
  planType: string;
  status: string;
  price: number;
  deliveryDays: string[];
  startDate: string | null;
  createdAt: string;
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

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchSubscriptions(token);
    } catch {
      router.push("/login");
    }
  }, []);

  const fetchSubscriptions = async (token: string) => {
    setSubLoading(true);
    try {
      const res = await fetch("/api/subs/my-subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleAction = async (subId: string, action: "pause" | "resume" | "cancel") => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActionLoading(subId + action);
    try {
      const res = await fetch(`/api/subs/${subId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSubscriptions(token);
      }
    } catch (err) {
      console.error(`Failed to ${action} subscription:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const pausedSubscriptions = subscriptions.filter((s) => s.status === "paused");

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

        {subLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-on-surface-variant">Loading subscriptions...</div>
          </div>
        ) : subscriptions.length === 0 ? (
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
                          <p className="text-xl font-bold text-on-surface">₹{sub.price.toLocaleString()}<span className="text-sm font-normal text-on-surface-variant">/month</span></p>
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
                      </div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleAction(sub.id, "pause")}
                        disabled={actionLoading === sub.id + "pause"}
                        className="flex-1 bg-surface-container-highest text-on-surface py-3 px-6 rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">pause_circle</span>
                        {actionLoading === sub.id + "pause" ? "Pausing..." : "Pause"}
                      </button>
                      <Link href="/dashboard/add-ons" className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Add Add-ons
                      </Link>
                      <div className="w-full flex gap-3 mt-2">
                        <button
                          onClick={() => handleAction(sub.id, "cancel")}
                          disabled={actionLoading === sub.id + "cancel"}
                          className="flex-1 border-b-2 border-transparent hover:border-error text-error/60 py-2 font-semibold text-xs transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                          {actionLoading === sub.id + "cancel" ? "Cancelling..." : "Cancel Plan"}
                        </button>
                      </div>
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
                      <p className="text-sm text-on-surface-variant">₹{sub.price.toLocaleString()}/month</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(sub.id, "resume")}
                    disabled={actionLoading === sub.id + "resume"}
                    className="bg-on-surface text-surface py-3 px-8 rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {actionLoading === sub.id + "resume" ? "Resuming..." : "Resume Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
