"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  referralCode?: string;
  referralBalance?: number;
}

interface DashboardStats {
  activeSubscriptions: number;
  upcomingDeliveries: number;
  totalSpentThisMonth: number;
  referralBalance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
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

      // Fetch dashboard stats
      fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch stats");
          return res.json();
        })
        .then((data) => {
          setStats(data);
        })
        .catch((error) => {
          console.error("Error fetching stats:", error);
          // Set default stats if fetch fails
          setStats({
            activeSubscriptions: 0,
            upcomingDeliveries: 0,
            totalSpentThisMonth: 0,
            referralBalance: userData.referralBalance || 0,
          });
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm overflow-x-hidden">
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center">
            <img
              alt="Bloomme Logo"
              className="h-10 sm:h-12 w-auto object-contain"
              src="/images/backgroundlesslogo.png"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-shrink-0">
          <div className="hidden md:flex gap-6 md:gap-8">
            <a className="text-[#C4A052] font-semibold tracking-tight border-b-2 border-[#C4A052] text-xs md:text-sm whitespace-nowrap" href="#">
              Dashboard
            </a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors text-xs md:text-sm whitespace-nowrap" href="/contact">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative flex-shrink-0">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowCart(false);
                }}
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50 max-h-[80vh] overflow-y-auto">
                  <p className="text-xs sm:text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>

            {/* Cart Dropdown */}
            <div className="relative">
              <button
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowCart(!showCart);
                  setShowNotifications(false);
                }}
                aria-label="Shopping cart"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              {showCart && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50 max-h-[80vh] overflow-y-auto">
                  <p className="text-xs sm:text-sm text-on-surface-variant text-center py-8">Your cart is empty</p>
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHhyc1TjbQpgDV4EvaZYIBZl2PmpmUeGGZRfZaMTRz80LDFCO9qZZ10dXaJ2kK5xyhe_NlNVvP6bKIXHXPuxQS60SPC8jYn4wXFvTj-4ovjTjNynvdo_mMm7cnj_P51RkJxUWPQ7xFAGN8vmTHjk6tegBW6YAIlNbPtQYy46MkbKOiz9WeCGUgYnOcojT0bU64QFv_mqrixESzuQL4DRbfEOKD5wpKG689p4K7DrS0ezaVHoNtnoOF-3_cExJ2Yn64xwwzfOY3zisv"
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/subscriptions">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              loyalty
            </span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/calendar">
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
      <main className="md:ml-64 pt-24 px-8 pb-12">
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Active Subscriptions</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-on-surface">{stats?.activeSubscriptions || 0}</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Upcoming Deliveries</span>
            <div className="mt-4">
              <div className="text-4xl font-bold text-on-surface">{stats?.upcomingDeliveries || 0}</div>
              <div className="text-primary font-semibold text-sm">Next 30 days</div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Monthly Investment</span>
            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-bold text-on-surface">₹{stats?.totalSpentThisMonth || 0}</span>
              <span className="text-xs text-on-surface-variant">This month</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Referral Balance</span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-on-surface">₹{stats?.referralBalance || 0}</span>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Welcome, {user?.name}!</h2>
            </div>

            {/* User Info Card */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest group shadow-sm p-8">
              <h3 className="text-2xl font-bold text-on-surface mb-6">Your Account</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">Email</span>
                  <span className="font-medium text-on-surface">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Phone</span>
                    <span className="font-medium text-on-surface">{user?.phone}</span>
                  </div>
                )}
                {user?.referralCode && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-on-surface-variant">Referral Code</span>
                    <span className="font-mono font-medium text-primary">{user?.referralCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Links */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">Quick Actions</h2>

              <div className="space-y-4">
                <Link href="/dashboard/subscriptions" className="block bg-surface-container-low p-5 rounded-xl group hover:bg-surface-container transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center bg-surface-container-highest w-14 h-14 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-2xl">loyalty</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">My Subscriptions</div>
                        <div className="text-sm text-on-surface-variant">Manage your active plans</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline opacity-40 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </div>
                </Link>

                <Link href="/dashboard/add-ons" className="block bg-surface-container-low p-5 rounded-xl group hover:bg-surface-container transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center bg-surface-container-highest w-14 h-14 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">Add-ons</div>
                        <div className="text-sm text-on-surface-variant">Enhance your deliveries</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline opacity-40 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </div>
                </Link>

                <Link href="/dashboard/referrals" className="block bg-surface-container-low p-5 rounded-xl group hover:bg-surface-container transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center bg-surface-container-highest w-14 h-14 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-2xl">redeem</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">Referrals</div>
                        <div className="text-sm text-on-surface-variant">Earn rewards & credits</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline opacity-40 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          local_florist
        </span>
      </button>
    </div>
  );
}
