"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

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
              src="https://lh3.googleusercontent.com/aida/ADBb0uh7ZKyDJvwqw8ovYvtb0IHQdG6Jv2KaAOnHu1AGUxaY7f5yWx8Bm8bW4DdhajWiRGZI7aDPD80yHUQvArr709jqO0Rind89sxZ8IGlrzj_y9d76cmJXkujDpYGK96y1vFLGvzNj-84QvcdHvqUDZ0V9CeBkTJn-SpYg1fdwMw49RF6jD4a2hqRJw8d1kv9dDTXF8PRjNUwzz12qcm7zXkim20_naL4SjhWp0jH2caARUwlDppLyhWakTC5HuWY9y3cjlT0VSdPZjp8"
            />
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
            <a className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="#">
              Support
            </a>
            <a className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="#">
              Help Center
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              notifications
            </span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              shopping_cart
            </span>
            <div className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden">
              <img
                alt="User profile avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGCW-2Yg-NfYjvjLMP5mjP8d1L0cygpIsoBCu_DLMevAPbeW6H-8_HIlvhViti-HMJICGXqq7FpY6YqmE2peGWZlqDr7Iirxtncmch1qEfWH_vLzdiOF1Luh1Oq8VDCwXD6GtPinM7VGqYjiq1HffL5N7vBJE_vxr2Xy1cZMqgaFj_5ZvqeEECObl0iBkzpNfMFjad91kXlqPIT_djKcN8y9MwSQ8KgXDQcN_UYeXU9gtRezXaNFlOkKD1SXQrJcINvMgsXgCwe-r"
              />
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
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/subscriptions">
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
      <main className="md:ml-64 pt-24 px-12 pb-12 min-h-screen">
        {/* Header */}
        <header className="mb-12">
          <span className="font-accent italic text-xl text-primary mb-2 block">Your Floral Sanctuary</span>
          <h1 className="text-4xl font-bold text-on-surface tracking-tight">Active Subscriptions</h1>
        </header>

        {/* Subscription Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Primary Subscription Card: Divine Plan */}
          <div className="col-span-12 lg:col-span-8 group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(47,21,0,0.04)] border border-outline-variant/10">
            <div className="flex flex-col md:flex-row">
              {/* Visual Branding Section */}
              <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbCqqfjohc801QFlkeo3--3K4yyeex-kN9nExxrxELZFhQ_fmrwDu6w6Wj6luu2xTAmHh7UXVoIEZWJq_U5wuJgtlASEaU8yiGzsP6rJzZBcQoeOpyuyG7ZljSUi56nFWhKENpIknxthOBLtubxvS_Zb5x5qeVKATLZZAxXj-e7mqshILOUU9gJPNAMV2QTrExQ0Wk_ktGfF2ZYJjkd0EANIMr9hvtPnE-R1aoICqNzDXPwh6EbjBsujpEqlvuU-xlgJmC9SZDEEX9"
                  alt="Divine Plan flowers"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-primary/90 backdrop-blur-sm text-on-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                    Recommended
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-8 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-on-surface">Divine Plan</h2>
                      <p className="text-on-surface-variant font-medium">Spiritual & Daily Offering</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                      <p className="text-xs text-on-surface-variant mt-2 font-accent italic">Next delivery: Tomorrow, 6:00 AM</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="bg-surface-container-low p-4 rounded-lg">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Pricing</p>
                      <p className="text-xl font-bold text-on-surface">
                        ₹89<span className="text-sm font-normal text-on-surface-variant">/month</span>
                      </p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-lg">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Billing Cycle</p>
                      <p className="text-base font-semibold text-on-surface">Monthly Auto-pay</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-lg col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Daily Items</p>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary scale-90">eco</span>
                        <p className="text-base font-semibold text-on-surface">150g Fresh Seasonal Flowers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button className="flex-1 bg-surface-container-highest text-on-surface py-3 px-6 rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">pause_circle</span>
                    Pause
                  </button>
                  <button className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Add Add-ons
                  </button>
                  <div className="w-full flex gap-3 mt-2">
                    <button className="flex-1 border-b-2 border-transparent hover:border-primary text-on-surface-variant py-2 font-semibold text-xs transition-all uppercase tracking-widest">
                      View Details
                    </button>
                    <button className="flex-1 border-b-2 border-transparent hover:border-error text-error/60 py-2 font-semibold text-xs transition-all uppercase tracking-widest">
                      Cancel Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Context Side Column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Delivery Status Mini-Card */}
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

            {/* Ritual Chip Section */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Upcoming Occasions</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-secondary text-on-secondary text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    stars
                  </span>
                  Ganesh Chaturthi
                </span>
                <span className="bg-surface-container-highest text-on-surface text-[10px] font-bold px-3 py-1.5 rounded-full">
                  Weekly Puja
                </span>
                <span className="bg-surface-container-highest text-on-surface text-[10px] font-bold px-3 py-1.5 rounded-full">
                  Housewarming
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-4 font-accent italic">
                Schedule special arrangements for these dates in your calendar.
              </p>
            </div>

            {/* Referral Teaser */}
            <div className="relative rounded-xl overflow-hidden bg-on-surface p-6 text-on-primary">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">card_giftcard</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Invite a Friend</h3>
              <p className="text-xs text-surface-variant mb-4 opacity-80">Gift a week of freshness and get ₹200 off your next billing.</p>
              <button className="bg-primary-container text-on-primary-container w-full py-2 rounded-lg text-xs font-bold hover:bg-white hover:text-on-surface transition-colors">
                Refer Now
              </button>
            </div>
          </div>

          {/* Paused Subscription Example */}
          <div className="col-span-12 group bg-surface-container-low/40 rounded-xl p-8 border-2 border-dashed border-outline-variant/30 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center grayscale">
                  <span className="material-symbols-outlined text-3xl text-outline">auto_awesome</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-outline">Eternal Blooms</h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-0.5 rounded-full text-[10px] font-bold border border-orange-200 uppercase tracking-tighter">
                      Paused
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">Residential Decor Subscription • Bi-weekly</p>
                </div>
              </div>
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Resume Delivery On
                  </label>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm">
                    <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                    <span className="text-sm font-semibold">Oct 12, 2023</span>
                    <span className="material-symbols-outlined text-sm text-outline ml-2">edit</span>
                  </div>
                </div>
                <button className="bg-on-surface text-surface py-3 px-8 rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform">
                  Resume Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
