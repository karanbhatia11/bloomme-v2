"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function CalendarPage() {
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

  const daysInMonth = 31;
  const firstDayOfWeek = 6; // March 1, 2026 is Saturday
  const deliveryDays = [6, 20, 27];
  const skippedDay = 10;
  const todayDay = 13;

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
              Calendar
            </a>
            <a className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="#">
              Support
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">local_shipping</span>
            Orders
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
          <p className="text-on-surface-variant max-w-xl leading-relaxed">Manage your recurring arrangements and ceremonial blooms. March 2026 is looking vibrant.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Calendar Section */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-semibold">March 2026</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors">
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
              <div className="grid grid-cols-7 gap-2">
                {/* Previous month days */}
                {[22, 23, 24, 25, 26, 27, 28].slice(0, firstDayOfWeek).map((day) => (
                  <div key={`prev-${day}`} className="aspect-square p-2 rounded-lg opacity-20 flex items-center justify-center text-sm">
                    {day}
                  </div>
                ))}

                {/* Current month days */}
                {calendarDays.map((day) => {
                  const isDelivery = deliveryDays.includes(day);
                  const isSkipped = day === skippedDay;
                  const isToday = day === todayDay;

                  if (isToday) {
                    return (
                      <div key={day} className="aspect-square p-2 rounded-full border-2 border-primary text-primary flex items-center justify-center text-sm font-extrabold bg-surface-container-lowest">
                        {day}
                      </div>
                    );
                  }

                  if (isDelivery) {
                    return (
                      <div key={day} className="aspect-square p-2 rounded-lg bg-primary-container text-on-primary-container flex flex-col items-center justify-center text-sm font-bold shadow-md">
                        <span>{day}</span>
                        <span className="material-symbols-outlined text-xs mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                          local_florist
                        </span>
                      </div>
                    );
                  }

                  if (isSkipped) {
                    return (
                      <div key={day} className="aspect-square p-2 rounded-lg bg-stone-200 text-on-surface-variant flex flex-col items-center justify-center text-sm line-through opacity-60">
                        <span>{day}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={day} className="aspect-square p-2 rounded-lg bg-surface-container flex flex-col items-center justify-center text-sm hover:bg-surface-container-highest transition-colors cursor-pointer">
                      <span>{day}</span>
                    </div>
                  );
                })}
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
            {/* Upcoming Deliveries */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pending_actions</span>
                Upcoming Deliveries
              </h3>

              {/* Card 1 */}
              <div className="bg-surface-container-low rounded-xl p-5 space-y-4 border-l-4 border-primary shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Friday, March 20</p>
                    <h4 className="text-lg font-semibold mt-1">'The Aurelian Dream' Bouquet</h4>
                    <p className="text-sm text-on-surface-variant">Luxe Weekly Subscription</p>
                  </div>
                  <img
                    alt="Floral bouquet"
                    className="w-16 h-16 rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD88yAUtsccFXuK1P94_XiocS4UrDulsRH_t2fxt4C1pVaaxXPFDMrh9DHkvNOylNhGrbRZ912l1WUYhuaRFDQvz5r4kdewcWSdjdkTU5C_a078knMbi5I3kW1DBiPuSnfkmNsY_JWqvEMOcFUslzCt7CEpTOv1iRvXHvzKQk1AmRj_fFBbzE8fhqxD9FSEy9gdErvxjpz9tlKrkMRlETpNwZSMvM9CN-D9bZhJwOWKQwB2BCpbot-DiZmCAlRAkSkz5osxO5O4kJNZ"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-surface-container-highest py-2 px-3 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-all">Reschedule</button>
                  <button className="flex-1 border border-primary/20 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-error-container hover:text-on-error-container transition-all">Skip</button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-low rounded-xl p-5 space-y-4 border-l-4 border-primary-container shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-container">Friday, March 27</p>
                    <h4 className="text-lg font-semibold mt-1">Custom Orchid Arrangement</h4>
                    <p className="text-sm text-on-surface-variant">Office Reception Decor</p>
                  </div>
                  <img
                    alt="White orchids"
                    className="w-16 h-16 rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7mBz4iPdnMkvdyhhaLqSXEdFf5H98DndJEftMYryg9KijWJ_PiByEglAHYGGLtyU7EthzgVoqKMnGYFxD8PJ67k5B7H5mbsdlF-b6P_aT003MTYzWQ5RgfBsYZ-a41oXXlu4vf-_urvHppojU8HXODPQhtSYppBRkgRK_InI_ppXHiogitvLTSHoZ377deRAhBkFje5qixGYfMrLoCiQaGroiI-8h9Nu1uTjIGVueAoo-MDdJ_KoinnW-mtUG7EE-XiaY8YtrwXZs"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-surface-container-highest py-2 px-3 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-all">Reschedule</button>
                  <button className="flex-1 border border-primary/20 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-error-container hover:text-on-error-container transition-all">Skip</button>
                </div>
              </div>
            </div>

            {/* Past Deliveries */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant opacity-60">history</span>
                Past Deliveries
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm group hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">task_alt</span>
                    </div>
                    <div>
                      <p className="font-semibold">March 06, 2026</p>
                      <p className="text-xs text-on-surface-variant">'Meadow Whisper' Set</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Delivered <span className="material-symbols-outlined text-sm">check</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <span className="material-symbols-outlined">block</span>
                    </div>
                    <div>
                      <p className="font-semibold">Feb 27, 2026</p>
                      <p className="text-xs">Weekly Subscription</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-500">Skipped</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden bg-primary rounded-2xl p-6 text-white shadow-xl">
              <div className="relative z-10">
                <h4 className="font-editorial text-2xl mb-2">Host an event?</h4>
                <p className="text-sm opacity-90 mb-6">Let our artisans handle the botanical styling for your next gathering.</p>
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm tracking-tight hover:bg-surface-container-highest transition-all transform hover:scale-105 active:scale-95 shadow-md">
                  Book Consultant
                </button>
              </div>
              {/* Decorative Circles */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-container/20 rounded-full"></div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-surface">
        <div className="border-t border-outline-variant/10 mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-8 opacity-60 max-w-[1440px] mx-auto space-y-4 md:space-y-0">
          <p className="text-xs leading-relaxed text-on-surface-variant">© 2026 blomme Crafted for devotion</p>
          <div className="flex gap-8">
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
