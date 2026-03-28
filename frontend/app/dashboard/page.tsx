"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
            <a className="text-[#C4A052] font-semibold tracking-tight border-b-2 border-[#C4A052]" href="#">
              Dashboard
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHhyc1TjbQpgDV4EvaZYIBZl2PmpmUeGGZRfZaMTRz80LDFCO9qZZ10dXaJ2kK5xyhe_NlNVvP6bKIXHXPuxQS60SPC8jYn4wXFvTj-4ovjTjNynvdo_mMm7cnj_P51RkJxUWPQ7xFAGN8vmTHjk6tegBW6YAIlNbPtQYy46MkbKOiz9WeCGUgYnOcojT0bU64QFv_mqrixESzuQL4DRbfEOKD5wpKG689p4K7DrS0ezaVHoNtnoOF-3_cExJ2Yn64xwwzfOY3zisv"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-[#fff1e9] flex flex-col gap-2 p-4 hidden md:flex">
        <div className="px-4 py-2 mb-4">
          <div className="text-lg font-bold text-on-surface font-headline">Atelier Dashboard</div>
          <div className="text-xs text-on-surface-variant font-medium">Premium Floral Management</div>
        </div>

        <nav className="flex-grow space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/subscriptions">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              loyalty
            </span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">local_shipping</span>
            Orders
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">redeem</span>
            Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
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
              <span className="text-4xl font-bold text-on-surface">1</span>
              <span className="text-secondary font-semibold text-xs px-2 py-0.5 bg-secondary-fixed rounded-full">Pro</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Next Delivery</span>
            <div className="mt-4">
              <div className="text-xl font-bold text-on-surface">Tomorrow</div>
              <div className="text-primary font-semibold text-sm">6:15 AM</div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Monthly Investment</span>
            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-bold text-on-surface">₹146</span>
              <span className="text-xs text-on-surface-variant">Estimated Spend</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <span className="text-on-surface-variant text-sm font-medium">Active Add-ons</span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-4xl font-bold text-on-surface">2</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold">
                  L
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold">
                  G
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Current Arrangement */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Current Arrangement</h2>
              <span className="font-editorial italic text-lg text-primary opacity-80">Divine Ritual</span>
            </div>

            {/* Arrangement Card with Image */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest group shadow-sm">
              <div className="h-64 relative">
                <img
                  alt="Beautiful bouquet of pink and white flowers"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLe0DFrvz-LPEQFjnroX-qRLSDtdFyE87idX4RJx8OSNmbyGSHafIU2gK3IqI93-D3wLAvHf2lv6lCQV64ynWOoMfHfnseWR4Doq2Ny2jz8TjduYf9sVvXrw1jKbdSS4zwr2IGNuzULZrzsZNWQrqvymTv98F-QGtZNKBXbRmnn9AanLVTmEkjdKqq7IaY1k_uVgBgbQKGIPNFGOkMPXeoMkO_y5jhEPOBbZoVVfVvqjPJVdqonVkVD5msbQo1R7XQLZEBHtGubJZn"
                />
                <div className="absolute top-6 right-6 bg-emerald-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-on-surface mb-1">Divine Plan</h3>
                    <p className="text-on-surface-variant text-sm">Mon - Fri • Morning Freshness</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ₹89
                      <span className="text-sm font-medium text-on-surface-variant">/mo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-on-surface-variant mb-2">
                      <span>Subscription Journey</span>
                      <span>42 / 365 Days</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[11.5%] shadow-[0_0_8px_rgba(196,160,82,0.4)]"></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button className="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-3 px-6 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Add Add-ons
                    </button>
                    <button className="flex-1 bg-surface-container-highest text-primary font-bold py-3 px-6 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">pause_circle</span>
                      Pause Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Enhancements */}
            <div className="bg-surface-container-low rounded-2xl p-8">
              <h4 className="font-bold text-lg mb-6">Subscription Enhancements</h4>
              <div className="flex gap-6">
                <div className="flex-1 flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      eco
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm">Sacred Lotus</div>
                    <div className="text-xs text-on-surface-variant">Daily (2 qty)</div>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      oil_barrel
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm">Organic Ghee</div>
                    <div className="text-xs text-on-surface-variant">Weekly (500g)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming Cycles */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">Upcoming Cycles</h2>

              <div className="space-y-4">
                {/* Delivery Items */}
                {[
                  { date: "OCT 24", title: "Morning Ritual Bundle", time: "6:15 AM", tags: ["FLOWERS", "LOTUS", "GHEE"] },
                  { date: "OCT 25", title: "Divine Base Arrangement", time: "6:15 AM", tags: ["FLOWERS"] },
                  { date: "OCT 26", title: "Divine Base Arrangement", time: "6:15 AM", tags: ["FLOWERS"] },
                  { date: "OCT 27", title: "Divine Base Arrangement", time: "6:15 AM", tags: ["FLOWERS"] },
                  { date: "OCT 28", title: "Weekly Stock-up Delivery", time: "6:15 AM", tags: ["GHEE", "OILS"] },
                ].map((delivery, idx) => {
                  const [month, day] = delivery.date.split(" ");
                  return (
                    <div key={idx} className="bg-surface-container-low p-5 rounded-xl group hover:bg-surface-container transition-colors duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center justify-center bg-surface-container-highest w-14 h-14 rounded-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{month}</span>
                            <span className="text-lg font-extrabold text-on-surface">{day}</span>
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{delivery.title}</div>
                            <div className="text-sm text-on-surface-variant">Scheduled for {delivery.time}</div>
                            <div className="flex gap-2 mt-2">
                              {delivery.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded text-primary">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline opacity-40 group-hover:opacity-100 transition-opacity">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-8 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant font-medium text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Schedule Additional Ritual Delivery
              </button>
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
