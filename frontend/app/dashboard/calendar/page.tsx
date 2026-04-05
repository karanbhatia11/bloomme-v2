"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface DeliveryItem {
  type: "subscription" | "addon";
  id: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, DeliveryItem[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token && !userStr) {
      const demoUser = {
        id: "1",
        name: "Demo",
        email: "demo@bloomme.com",
      };
      localStorage.setItem("token", "demo_token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch subscription ID on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/subs/my-subscriptions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const active = data.subscriptions?.find((s: any) => s.status === "active") ?? data.subscriptions?.[0];
        if (active) setSubscriptionId(active.id);
      })
      .catch(() => {});
  }, []);

  // Fetch preview when subscriptionId or currentMonth changes
  useEffect(() => {
    if (!subscriptionId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

    setLoading(true);
    fetch(`/api/preview/subscription/${subscriptionId}?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPreview(data.queue ?? {}))
      .catch(() => setPreview({}))
      .finally(() => setLoading(false));
  }, [subscriptionId, currentMonth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return null;
  }

  // Compute calendar values dynamically
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Build delivery/addon sets from preview queue
  const deliveryDateSet = new Set(
    Object.entries(preview)
      .filter(([_, items]) => items.some((i) => i.type === "subscription"))
      .map(([date]) => date)
  );
  const addonDateSet = new Set(
    Object.entries(preview)
      .filter(([_, items]) => items.some((i) => i.type === "addon"))
      .map(([date]) => date)
  );

  const dayToDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Past deliveries for sidebar
  const pastDeliveries = [...deliveryDateSet]
    .filter((d) => d < todayStr)
    .sort()
    .reverse()
    .slice(0, 5);

  const calendarDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              alt="Bloomme Logo"
              className="h-12 w-auto object-contain"
              src="/images/backgroundlesslogo.png"
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">
              Calendar
            </a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications Dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowCart(false);
                }}
              >
                notifications
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>

            {/* Cart Dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowCart(!showCart);
                  setShowNotifications(false);
                }}
              >
                shopping_cart
              </span>
              {showCart && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">Your cart is empty</p>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                  setShowCart(false);
                }}
              >
                <img
                  alt="User profile avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGCW-2Yg-NfYjvjLMP5mjP8d1L0cygpIsoBCu_DLMevAPbeW6H-8_HIlvhViti-HMJICGXqq7FpY6YqmE2peGWZlqDr7Iirxtncmch1qEfWH_vLzdiOF1Luh1Oq8VDCwXD6GtPinM7VGqYjiq1HffL5N7vBJE_vxr2Xy1cZMqgaFj_5ZvqeEECObl0iBkzpNfMFjad91kXlqPIT_djKcN8y9MwSQ8KgXDQcN_UYeXU9gtRezXaNFlOkKD1SXQrJcINvMgsXgCwe-r"
                />
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-3 z-50">
                  <p className="text-sm font-medium text-on-surface mb-3">{user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2"
                  >
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              loyalty
            </span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/calendar">
            <span className="material-symbols-outlined">calendar_today</span>
            Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/referrals">
            <span className="material-symbols-outlined">redeem</span>
            Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/settings">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>

        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>
            Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-8 pb-12 min-h-screen">
        {/* Header */}
        <header className="mb-12">
          <span className="font-editorial italic text-xl text-primary mb-2 block">Your Floral Journey</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4">Delivery Calendar</h1>
          <p className="text-on-surface-variant max-w-xl leading-relaxed">
            {subscriptionId
              ? `Manage your recurring arrangements and ceremonial blooms. ${currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} is looking vibrant.`
              : "No active subscription found. Start one to view your delivery schedule."}
          </p>
        </header>

        {!subscriptionId && !loading ? (
          <div className="text-center py-16">
            <p className="text-on-surface-variant mb-6">No active subscription found.</p>
            <Link href="/checkout/plan" className="inline-block px-8 py-3 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
              Start Your Subscription →
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Calendar Section */}
          <section className="lg:col-span-6 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm max-w-md relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                    }
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                    }
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-2 relative">
                {/* Previous month days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square p-2 rounded-lg opacity-20 flex items-center justify-center text-sm">
                    {new Date(year, month, -(firstDayOfWeek - i - 1)).getDate()}
                  </div>
                ))}

                {/* Current month days */}
                {calendarDays.map((day) => {
                  const dateStr = dayToDateStr(day);
                  const isToday = dateStr === todayStr;
                  const hasDelivery = deliveryDateSet.has(dateStr);
                  const hasAddon = addonDateSet.has(dateStr);

                  if (isToday) {
                    return (
                      <div
                        key={day}
                        className="aspect-square p-2 rounded-full border-2 border-primary text-primary flex items-center justify-center text-sm font-extrabold bg-surface-container-lowest"
                      >
                        {day}
                      </div>
                    );
                  }

                  if (hasDelivery || hasAddon) {
                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold shadow-md ${
                          hasDelivery ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high"
                        }`}
                      >
                        <span>{day}</span>
                        {hasDelivery && (
                          <span className="material-symbols-outlined text-xs mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_florist
                          </span>
                        )}
                        {hasAddon && (
                          <span className="material-symbols-outlined text-xs mt-1">redeem</span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day}
                      className="aspect-square p-2 rounded-lg bg-surface-container flex flex-col items-center justify-center text-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
                    >
                      <span>{day}</span>
                    </div>
                  );
                })}

                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                    <span className="w-6 h-6 rounded-full border-2 border-[#d1c5b3] border-t-[#775a11] animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 items-center text-sm font-medium opacity-80">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary-container shadow-sm"></div>
                <span>Scheduled Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-200"></div>
                <span>Skipped Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary"></div>
                <span>Today</span>
              </div>
            </div>
          </section>

          {/* Sidebar Actions & Lists */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Past Deliveries */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant opacity-60">history</span>
                Past Deliveries
              </h3>
              {pastDeliveries.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No past deliveries yet</p>
              ) : (
                <div className="space-y-3">
                  {pastDeliveries.map((dateStr) => {
                    const date = new Date(dateStr + "T00:00:00");
                    const formattedDate = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                    return (
                      <div
                        key={dateStr}
                        className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm group hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">task_alt</span>
                          </div>
                          <div>
                            <p className="font-semibold">{formattedDate}</p>
                            <p className="text-xs text-on-surface-variant">Subscription Delivery</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          Delivered <span className="material-symbols-outlined text-sm">check</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-surface">
        <div className="border-t border-outline-variant/10 mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-8 opacity-60 max-w-[1440px] mx-auto space-y-4 md:space-y-0">
          <p className="text-xs leading-relaxed text-on-surface-variant">© 2026 blomme Crafted for devotion</p>
          <div className="flex gap-8">
            <Link className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="/privacy">Privacy Policy</Link>
            <Link className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="/terms">Terms of Service</Link>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="mailto:info@bloomme.co.in">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
