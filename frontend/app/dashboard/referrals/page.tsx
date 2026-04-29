"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartUI } from "@/context/CartUIContext";
import { useCart } from "@/context/CartContext";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  expires_at: string | null;
  created_at: string;
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  earn_purchase:          { icon: "shopping_basket", label: "Purchase",          color: "text-[#775a11] bg-[#ffdcc3]" },
  earn_referral_given:    { icon: "redeem",          label: "Referral Given",    color: "text-purple-700 bg-purple-100" },
  earn_referral_received: { icon: "card_giftcard",   label: "Referral Bonus",    color: "text-green-700 bg-green-100" },
  redeem:                 { icon: "payments",         label: "Redeemed",          color: "text-red-600 bg-red-100" },
};

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsCartOpen } = useCartUI();
  const { cart } = useCart();
  const cartCount = cart.addons.reduce((s, a) => s + a.quantity, 0) + (cart.planId ? 1 : 0);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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
      if (userData.referralCode) setReferralCode(userData.referralCode);
      setLoading(false);

      const headers = { Authorization: `Bearer ${token}` };

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credits/balance`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setBalance(d.credits); })
        .catch(() => {});

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credits/history`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setHistory(d.transactions); })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));

    } catch {
      router.push("/login");
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-on-surface-variant">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <img
              alt="Bloomme Logo"
              className="h-12 w-auto object-contain"
              src="/images/backgroundlesslogo.png"
            />
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
                <a href="/dashboard/subscriptions" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">loyalty</span>Subscriptions & Add-ons
                </a>
                <a href="/dashboard/festival-packages" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">celebration</span>Festival Packages
                </a>
                <a href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">calendar_today</span>Calendar
                </a>
                <a href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary/5">
                  <span className="material-symbols-outlined text-base">redeem</span>Referrals
                </a>
                <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">settings</span>Settings
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">
              Referrals
            </a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
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

            {/* Cart */}
            <button
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => { setIsCartOpen(true); setShowNotifications(false); setShowProfile(false); }}
              aria-label="Shopping cart"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-base font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                        <p className="text-xs text-on-surface-variant">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Sign Out
                    </button>
                  </div>
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/festival-packages">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/calendar">
            <span className="material-symbols-outlined">calendar_today</span>
            Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/referrals">
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
      <main className="md:ml-64 pt-24 min-h-screen pb-12">
        {/* Hero Section */}
        <section className="px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <img
                alt="Bloomme Logo"
                className="w-auto self-start h-32"
                src="/images/backgroundlesslogo.png"
              />
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-on-surface leading-none">
                Spread the <span className="font-editorial italic text-primary">Beauty</span>,
                <br />
                Earn Bloom Credits.
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Every rupee spent, every friend referred — it all becomes Bloom Credits. Real value you can use on any order.
              </p>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">01.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Spend & Earn</h3>
                  <p className="text-sm text-on-surface-variant">Every ₹2 you spend earns 1 Bloom Credit — on plans, add-ons, everything.</p>
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">02.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Refer & Both Win</h3>
                  <p className="text-sm text-on-surface-variant">Share your code. When your friend places their first order, you get 500 credits (₹50) and they get 300 (₹30).</p>
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">03.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Redeem Anytime</h3>
                  <p className="text-sm text-on-surface-variant">100 credits = ₹10. Use up to 20% off any order. Credits are valid for 12 months.</p>
                </div>
              </div>
            </div>

            {/* Referral Card */}
            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-lg border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-on-surface">Your Invitation Link</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Exclusive Bloom Credits</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20">
                      <div className="w-40 h-40 bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-6xl">qr_code_2</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Box */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center block">
                      Referral Code
                    </label>
                    <div className="flex bg-surface-container-low rounded-xl p-2 border border-outline-variant/30">
                      <div className="flex-1 flex items-center justify-center font-bold text-2xl tracking-widest text-on-surface">
                        {referralCode}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span className="font-bold text-xs uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="flex justify-center gap-4">
                    <button className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">chat</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">groups</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">alternate_email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CREDITS HISTORY ─────────────────────────────────── */}
        <section className="px-6 md:px-12 pb-12">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Current Balance", value: balance, suffix: "credits", sub: `₹${Math.floor(balance * 0.10)} value` },
                { label: "Earned from Orders", value: history.filter(t => t.type === "earn_purchase").reduce((s, t) => s + t.amount, 0), suffix: "credits", sub: "purchases" },
                { label: "Earned from Referrals", value: history.filter(t => t.type.startsWith("earn_referral")).reduce((s, t) => s + t.amount, 0), suffix: "credits", sub: "referrals" },
                { label: "Total Redeemed", value: Math.abs(history.filter(t => t.type === "redeem").reduce((s, t) => s + t.amount, 0)), suffix: "credits", sub: "used" },
              ].map(({ label, value, suffix, sub }) => (
                <div key={label} className="bg-[#fff1e9] rounded-2xl p-5 border border-[#d1c5b3]/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-1">{label}</p>
                  <p className="text-2xl font-extrabold text-[#2f1500]">{value.toLocaleString()} <span className="text-sm font-semibold text-[#775a11]">{suffix}</span></p>
                  <p className="text-xs text-[#4d4638]/50 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Transaction list */}
            <div className="bg-white rounded-3xl border border-[#d1c5b3]/30 overflow-hidden">
              <div className="px-6 py-5 border-b border-[#d1c5b3]/30">
                <h2 className="font-bold text-[#2f1500] text-base">Points History</h2>
                <p className="text-xs text-[#4d4638]/50 mt-0.5">All your Bloom Credit transactions</p>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#775a11]" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-[#d1c5b3] mb-3 block">stars</span>
                  <p className="text-sm text-[#4d4638]/50">No transactions yet. Place your first order to start earning.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#d1c5b3]/20">
                  {history.map((tx) => {
                    const meta = TYPE_META[tx.type] ?? { icon: "circle", label: tx.type, color: "text-gray-600 bg-gray-100" };
                    const date = new Date(tx.created_at);
                    const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                    const isEarn = tx.amount > 0;
                    return (
                      <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#fff8f5] transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#2f1500] truncate">{tx.description}</p>
                          <p className="text-xs text-[#4d4638]/50 mt-0.5">{meta.label} · {dateStr}</p>
                        </div>
                        <p className={`text-base font-extrabold flex-shrink-0 ${isEarn ? "text-green-600" : "text-red-500"}`}>
                          {isEarn ? "+" : ""}{tx.amount.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="md:ml-64 bg-[#fff1e9] w-full py-16 px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-on-surface-variant text-center">© 2026 blomme Crafted for devotion</p>
        </div>
      </footer>
    </div>
  );
}
