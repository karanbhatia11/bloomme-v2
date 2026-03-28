"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    tier: string;
    amount: number;
    nextDelivery: string;
    daysSince: number;
    daysTotal: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // For demo purposes, allow access with token or use demo user
    if (!token && !userStr) {
      // Set demo user for testing
      const demoUser = {
        id: "1",
        name: "Demo User",
        email: "demo@bloomme.com",
        subscription: {
          plan: "Divine Plan",
          tier: "Divine",
          amount: 89,
          nextDelivery: "Tomorrow",
          daysSince: 42,
          daysTotal: 365,
        },
      };
      localStorage.setItem("token", "demo_token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      setLoading(false);
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setLoading(false);
      }
    } else {
      // Try to fetch user data with token
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Use demo user as fallback
          const demoUser = {
            id: "1",
            name: "Demo User",
            email: "demo@bloomme.com",
          };
          setUser(demoUser);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background text-on-surface font-body">
      {/* Shell: SideNavBar (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col p-4 space-y-2 bg-[#fff8f5] dark:bg-stone-950 z-40 border-r-0">
        <div className="flex items-center gap-3 px-2 py-6">
          <img
            alt="Bloomme Logo"
            className="h-20 w-auto object-contain mx-auto"
            src="https://lh3.googleusercontent.com/aida/ADBb0uh7ZKyDJvwqw8ovYvtb0IHQdG6Jv2KaAOnHu1AGUxaY7f5yWx8Bm8bW4DdhajWiRGZI7aDPD80yHUQvArr709jqO0Rind89sxZ8IGlrzj_y9d76cmJXkujDpYGK96y1vFLGvzNj-84QvcdHvqUDZ0V9CeBkTJn-SpYg1fdwMw49RF6jD4a2hqRJw8d1kv9dDTXF8PRjNUwzz12qcm7zXkim20_naL4SjhWp0jH2caARUwlDppLyhWakTC5HuWY9y3cjlT0VSdPZjp8"
          />
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-300 ease-in-out ${
              activeTab === "dashboard"
                ? "bg-[#775a11] text-white"
                : "text-gray-300 hover:bg-[#3a3a3a]"
            }`}
          >
            <span className="material-symbols-outlined" data-icon="dashboard">
              dashboard
            </span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
              activeTab === "subscriptions"
                ? "bg-[#775a11] text-white"
                : "text-gray-300 hover:bg-[#3a3a3a]"
            }`}
          >
            <span className="material-symbols-outlined" data-icon="card_membership">
              card_membership
            </span>
            <span className="text-sm font-medium">Subscriptions</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
              activeTab === "orders"
                ? "bg-[#775a11] text-white"
                : "text-gray-300 hover:bg-[#3a3a3a]"
            }`}
          >
            <span className="material-symbols-outlined" data-icon="shopping_cart">
              shopping_cart
            </span>
            <span className="text-sm font-medium">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
              activeTab === "settings"
                ? "bg-[#775a11] text-white"
                : "text-gray-300 hover:bg-[#3a3a3a]"
            }`}
          >
            <span className="material-symbols-outlined" data-icon="settings">
              settings
            </span>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 space-y-1 border-t border-[#3a3a3a]">
          <button className="w-full bg-primary text-on-primary rounded-xl py-3 px-4 font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 mb-4 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined text-sm" data-icon="add">
              add
            </span>
            New Plan
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-error text-xs font-medium opacity-80 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg" data-icon="logout">
              logout
            </span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* TopAppBar (Mobile & Global Actions) */}
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 glass-nav bg-white/80 dark:bg-stone-900/80 z-30 flex items-center justify-between px-6 md:px-12 border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-on-surface">Bloomme</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-8 text-sm font-semibold tracking-tight">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === "dashboard"
                    ? "text-[#C4A052] border-[#C4A052]"
                    : "text-stone-500 hover:text-[#C4A052] border-transparent"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === "subscriptions"
                    ? "text-[#C4A052] border-[#C4A052]"
                    : "text-stone-500 hover:text-[#C4A052] border-transparent"
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "text-[#C4A052] border-[#C4A052]"
                    : "text-stone-500 hover:text-[#C4A052] border-transparent"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === "settings"
                    ? "text-[#C4A052] border-[#C4A052]"
                    : "text-stone-500 hover:text-[#C4A052] border-transparent"
                }`}
              >
                Account
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="mt-20 px-6 md:px-12 py-8 flex-1 max-w-[1440px] w-full mx-auto">
          {activeTab === "dashboard" && <DashboardTab user={user} />}
          {activeTab === "subscriptions" && <SubscriptionsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "settings" && <SettingsTab user={user} />}
        </div>
      </main>

      {/* Shell: Footer */}
      <footer className="w-full py-12 bg-[#fff8f5] dark:bg-stone-950 mt-16 border-t border-stone-200/20 dark:border-stone-800/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 opacity-60">
          <span className="font-['Inter'] text-xs leading-relaxed text-[#4d4638] dark:text-stone-500">
            © 2024 Bloomme Atelier. All rights reserved.
          </span>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link
              href="/privacy"
              className="text-[#4d4638] dark:text-stone-500 hover:text-[#C4A052] text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[#4d4638] dark:text-stone-500 hover:text-[#C4A052] text-xs transition-colors"
            >
              Terms of Service
            </Link>
            <a
              href="#"
              className="text-[#4d4638] dark:text-stone-500 hover:text-[#C4A052] text-xs transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>

      {/* Shell: BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-outline-variant/10 py-3 px-6 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "dashboard" ? "text-[#C4A052]" : "text-on-surface-variant opacity-60"
          }`}
        >
          <span
            className="material-symbols-outlined"
            data-icon="dashboard"
            style={{ fontVariationSettings: activeTab === "dashboard" ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "subscriptions" ? "text-[#C4A052]" : "text-on-surface-variant opacity-60"
          }`}
        >
          <span className="material-symbols-outlined" data-icon="card_membership">
            card_membership
          </span>
          <span className="text-[10px] font-bold">Plans</span>
        </button>
        <div className="relative -top-6">
          <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl" data-icon="add">
              add
            </span>
          </button>
        </div>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "orders" ? "text-[#C4A052]" : "text-on-surface-variant opacity-60"
          }`}
        >
          <span className="material-symbols-outlined" data-icon="shopping_cart">
            shopping_cart
          </span>
          <span className="text-[10px] font-bold">Orders</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "settings" ? "text-[#C4A052]" : "text-on-surface-variant opacity-60"
          }`}
        >
          <span className="material-symbols-outlined" data-icon="person">
            person
          </span>
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ user }: { user: UserData }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Greeting */}
      <section className="mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-on-surface mb-2">
          Welcome Back, {user.name.split(" ")[0]}
        </h2>
        <p className="font-accent italic text-lg text-on-surface-variant">
          Your atelier is in full bloom today.
        </p>
      </section>

      {/* Quick Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Active Subscriptions
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">1</span>
            <span className="text-sm text-on-surface-variant font-medium">Tier: Divine</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Next Delivery
          </span>
          <div className="mt-4 flex flex-col">
            <span className="text-xl font-bold text-on-surface">Tomorrow</span>
            <span className="text-sm text-secondary font-semibold">6:15 AM</span>
          </div>
        </div>

        <div className="bg-surface-container-highest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Total Spent
          </span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">₹146</span>
            <span className="text-sm text-on-surface-variant font-medium">/month</span>
          </div>
        </div>

        <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg shadow-primary/10 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Active Add-ons</span>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-bold">2</span>
            <span className="material-symbols-outlined opacity-60" data-icon="featured_seasonal">
              featured_seasonal_and_gifts
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Subscription Card */}
        <div className="lg:col-span-8">
          <div className="group relative overflow-hidden bg-surface-container-lowest rounded-2xl shadow-xl shadow-on-surface/5 border border-outline-variant/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="relative p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-emerald-200">
                      Active
                    </span>
                    <span className="font-accent italic text-primary-container text-xl">
                      The Divine Collection
                    </span>
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight">Divine Plan</h3>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-on-surface">₹89</span>
                  <span className="text-sm font-medium text-on-surface-variant">/month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-surface-container rounded-lg">
                      <span
                        className="material-symbols-outlined text-primary"
                        data-icon="calendar_today"
                      >
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        Delivery Schedule
                      </p>
                      <p className="text-base font-semibold">Mon - Fri, Morning Shift</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-surface-container rounded-lg">
                      <span
                        className="material-symbols-outlined text-primary"
                        data-icon="local_shipping"
                      >
                        local_shipping
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        Next Arrival
                      </p>
                      <p className="text-base font-semibold">Tomorrow at 6:15 AM</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Subscription Progress
                    </span>
                    <span className="text-sm font-bold text-primary">42 / 365 Days</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-[0_0_8px_rgba(196,160,82,0.4)]"
                      style={{ width: "11.5%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-outline-variant/10">
                <button className="flex-1 min-w-[140px] py-3 bg-surface-container-highest text-primary font-bold rounded-xl hover:bg-surface-container transition-colors">
                  Manage Plan
                </button>
                <button className="flex-1 min-w-[140px] py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Renew Early
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Deliveries Grid */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6 px-2">
              <h4 className="text-xl font-bold tracking-tight">Upcoming Deliveries</h4>
              <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                View Full Calendar
                <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-xl border border-outline-variant/10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-low rounded-lg flex flex-col items-center justify-center text-primary">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-lg font-bold leading-none">25</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Wed - White Lilies</p>
                    <p className="text-xs text-on-surface-variant font-medium">6:15 AM Delivery</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    Skip
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-outline-variant/10 shadow-sm flex items-center justify-between opacity-80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-low rounded-lg flex flex-col items-center justify-center text-on-surface-variant">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-lg font-bold leading-none">26</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Thu - Marigold Mix</p>
                    <p className="text-xs text-on-surface-variant font-medium">6:15 AM Delivery</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    Skip
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rituals & Stats */}
        <div className="lg:col-span-4 space-y-10">
          {/* Ritual Chips Section */}
          <div className="bg-[#fff1e9] p-8 rounded-2xl border border-[#ffdcc3]/50">
            <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              Upcoming Rituals
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-xl flex items-center gap-4 border border-white/40">
                <span className="px-3 py-1 bg-secondary text-on-secondary text-[10px] font-bold rounded-full uppercase">
                  Ceremonial
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Ganesh Chaturthi</p>
                  <p className="text-xs text-on-surface-variant">Special Arrangement Active</p>
                </div>
              </div>

              <div className="p-4 bg-white/40 rounded-xl flex items-center gap-4 border border-white/20">
                <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold rounded-full uppercase">
                  Weekly
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Friday Offering</p>
                  <p className="text-xs text-on-surface-variant">Regular Lotus Stem</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2 text-xs font-bold text-secondary underline hover:no-underline transition-all">
              Add Ritual Reminder
            </button>
          </div>

          {/* Live Freshness Tracker */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                Live Freshness
              </h4>
              <span
                className="material-symbols-outlined text-emerald-500 animate-pulse"
                data-icon="energy_savings_leaf"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                energy_savings_leaf
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-surface-container"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                  ></circle>
                  <circle
                    className="text-emerald-500"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="34"
                    stroke="currentColor"
                    strokeDasharray="213.6"
                    strokeDashoffset="21.36"
                    strokeWidth="6"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">90%</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold">Peak Vitality</p>
                <p className="text-xs text-on-surface-variant">Current batch checked 2h ago</p>
              </div>
            </div>

            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mt-6 relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-sm"></div>
              <div className="h-full bg-emerald-500 rounded-full relative z-10" style={{ width: "90%" }}></div>
            </div>

            <p className="text-[10px] text-center mt-3 font-semibold text-emerald-700 uppercase tracking-tighter">
              Certified Organic &amp; Pesticide Free
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Placeholder Tab Components
function SubscriptionsTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Your Subscriptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
            <div className="p-4">
              <h3 className="font-bold text-on-surface mb-1">Plan {i}</h3>
              <p className="text-sm text-on-surface-variant">Subscription plan details</p>
              <button className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:scale-105 transition-transform">
                Manage Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrdersTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Your Orders</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-on-surface">Order #{1001 + i}</h3>
              <p className="text-sm text-on-surface-variant">Placed on Oct {20 + i}, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">₹{89 * i}</p>
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Delivered
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SettingsTab({ user }: { user: UserData }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Account Settings</h2>
      <div className="max-w-2xl space-y-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <h3 className="font-bold text-lg mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-on-surface-variant mb-2 block">
                Name
              </label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/10 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface-variant mb-2 block">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/10 focus:border-primary outline-none transition-colors"
              />
            </div>
            <button className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:scale-105 transition-transform">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <h3 className="font-bold text-lg mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              <span className="text-sm text-on-surface">Delivery notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              <span className="text-sm text-on-surface">Promotional offers</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
