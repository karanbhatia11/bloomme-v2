"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "@/constants";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface ActiveAddOn {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

export default function AddOnsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeAddOns, setActiveAddOns] = useState<ActiveAddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, []);

  // Fetch active add-ons when token is set
  useEffect(() => {
    if (token) {
      fetchActiveAddOns();
    }
  }, [token]);

  const fetchActiveAddOns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addons/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('[AddOns Page] API Response:', data);
      console.log('[AddOns Page] Response Status:', response.status);

      if (response.ok) {
        setActiveAddOns(data.activeAddOns || []);
      }
    } catch (error) {
      console.error("Error fetching active add-ons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return null;
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
              Add-ons
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj_6SqDxnawiUNEguNe52pFHVY8Azcgb-MnmxwswOzd_ywMWT_At6qKqd9nRvhhoHD_CdhbOt-xBRK9wWcUuNhINZJ68h1n9q7g0IT9giHUJhexCTsaqYSy7cZBrj6hxTQmJDj448V9qNrNWMBlNliYCa6a4VrlCniE5imWzpSy6vfNJcv_nltz03UMKFYi2iMCH2bwtLqNuDgSMV4lUZV-UbgHyql2sTuLBY_JCW6Wh42aD0esg5zERodh8vTDCuOjX9PWuw1TG1N"
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
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/add-ons">
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
      <main className="md:ml-64 pt-24 px-8 pb-12 min-h-screen bg-gradient-to-b from-surface via-surface to-surface-container-low">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">Add-ons Management</h1>
          <p className="font-accent italic text-on-surface-variant text-lg">Curate your daily rituals with our artisanal essentials.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-on-surface-variant">Loading add-ons...</div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Current Add-ons & Browse Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Current Add-ons Section */}
            {activeAddOns.length > 0 ? (
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                    Current Ritual Add-ons
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">{activeAddOns.length} Items Active</span>
                </div>

                <div className="flex flex-col gap-4">
                  {activeAddOns.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low group hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center gap-4">
                        {addon.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              alt={addon.name}
                              className="w-full h-full object-cover"
                              src={addon.image}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-headline font-bold text-on-surface">{addon.name}</h3>
                          {addon.description && (
                            <p className="text-sm text-on-surface-variant">{addon.description}</p>
                          )}
                          <p className="text-primary font-bold mt-1">₹{addon.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-surface-container-lowest rounded-full p-1 border border-outline-variant/30">
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="px-4 font-bold text-sm">1</span>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <button className="text-on-surface-variant hover:text-error transition-colors p-2">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-surface-container-lowest rounded-xl p-12 shadow-sm text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-4 block">local_florist</span>
                <h2 className="text-2xl font-bold text-on-surface mb-2">No active add-ons</h2>
                <p className="text-on-surface-variant mb-8">Start your add-ons journey with a subscription plan</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Link href="/checkout/plan" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-all">
                    Start Subscription Plan
                  </Link>
                  <Link href="/checkout/addons" className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition-all">
                    Add-ons Only
                  </Link>
                </div>
              </section>
            )}

            {/* Browse Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-semibold">Enhance Your Experience</h2>
                <a className="text-primary text-sm font-bold flex items-center gap-1 hover:underline" href="#">
                  View All <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group">
                    <div className="h-40 overflow-hidden relative bg-surface-container-low flex items-center justify-center">
                      <img
                        alt={product.title}
                        className="w-full h-full object-contain transition-transform duration-500"
                        src={product.image}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold text-on-surface">{product.title}</h3>
                        <span className="text-primary font-bold">₹{product.price}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{product.description}</p>
                      <button className="w-full py-2 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> Add to Subscription
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
