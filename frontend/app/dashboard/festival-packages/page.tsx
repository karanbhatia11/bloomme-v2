"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const FESTIVAL_IMAGES = [
  { alt: "Buddh Purnima — Bloomme Shanti Puja Kit", src: "/images/Festivals/23April-Update/FestivalPlan1.jpeg" },
  { alt: "Apara Ekadashi — Bloomme Ekadashi Bhakti Kit", src: "/images/Festivals/23April-Update/FestivalPlan2.jpeg" },
  { alt: "Shani Jayanti — Bloomme Shani Puja Kit", src: "/images/Festivals/23April-Update/FestivalPlan4.jpeg" },
];

const FESTIVALS = [
  {
    name: "Buddh Purnima",
    subtitle: "Shanti Puja",
    date: "📅 1 May 2026",
    description: "Shanti, sadgi aur bhakti ka din — Buddha Purnima. The most sacred Purnima of the year calls for a simple, pure puja with fresh white flowers and mild incense.",
    image: FESTIVAL_IMAGES[0].src,
    bestFor: ["White flowers (jasmine, white rose)", "Mild fragrance incense", "Diya + batti", "Mishri / fruits", "Shanti Puja setup"],
    blogSlug: "buddh-purnima-2026-puja-guide",
  },
  {
    name: "Apara Ekadashi",
    subtitle: "Ekadashi Bhakti",
    date: "📅 13 May 2026",
    description: "Ekadashi ke din bhakti me shuddhta sabse zaruri hoti hai. Bloomme ensures fresh tulsi availability, fresh flowers, and a ready puja setup every Ekadashi.",
    image: FESTIVAL_IMAGES[1].src,
    bestFor: ["Fresh tulsi leaves (essential)", "Fresh flowers", "Diya + batti", "Incense sticks", "Mishri prasad"],
    blogSlug: "apara-ekadashi-2026-puja-guide",
  },
  {
    name: "Shani Jayanti",
    subtitle: "Shani Dev Puja",
    date: "📅 16 May 2026",
    description: "Shani dev ki puja me sahi samagri ka hona bahut zaruri hai. Every item in the Shani Puja Kit has a specific purpose — missing even one is considered inauspicious.",
    image: FESTIVAL_IMAGES[2].src,
    bestFor: ["Black sesame / kala til (essential)", "Blue / dark flowers", "Mustard oil (add-on)", "Diya + batti", "Incense"],
    blogSlug: "shani-jayanti-2026-puja-guide",
  },
];

interface UserData { id: string; name: string; email: string; }

export default function FestivalPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!savedToken || !userStr) { router.push("/login"); return; }
    try { setUser(JSON.parse(userStr)); } catch { router.push("/login"); }
  }, []);

  useEffect(() => {
    if (showDetails) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FESTIVALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showDetails]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  const festival = FESTIVALS[currentIndex];

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <img alt="Bloomme Logo" className="h-12 w-auto object-contain" src="/images/backgroundlesslogo.png" />
          </Link>
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
                <a href="/dashboard/festival-packages" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary/5">
                  <span className="material-symbols-outlined text-base">celebration</span>Festival Packages
                </a>
                <a href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">calendar_today</span>Calendar
                </a>
                <a href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
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
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">Dashboard</Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">Festival Packages</a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">Support</Link>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
                notifications
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>
            <div className="relative">
              <div
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setMobileMenuOpen(false); }}
              >
                <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-3 z-50">
                  <p className="text-sm font-medium text-on-surface mb-3">{user?.name}</p>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>Sign Out
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
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
            Subscriptions & Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/festival-packages">
            <span className="material-symbols-outlined">celebration</span>
            Festival Packages
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
      <main className="md:ml-64 pt-24 px-8 pb-16 min-h-screen bg-gradient-to-b from-surface via-surface to-surface-container-low">
        {/* Page header */}
        <header className="mb-10">
          <span className="editorial-accent text-base text-secondary block mb-1">Cosmic Celebrations</span>
          <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">Festival Packages</h1>
          <p className="font-accent italic text-on-surface-variant text-lg">Special arrangements for every ritual — flowers, incense & puja essentials.</p>
        </header>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl mb-10"
          style={{ background: "linear-gradient(135deg, #fff8ed, #fef3c7)", border: "1px solid #f6c94e" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪔</span>
            <div>
              <p className="text-sm font-bold text-[#7c4a00]">Festival Kits — Coming Soon</p>
              <p className="text-xs text-[#9a5f10] mt-0.5">One-tap puja kits delivered fresh for every upcoming festival.</p>
            </div>
          </div>
          <Link
            href="/plans"
            className="shrink-0 bg-[#C4A052] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#b08d3e] transition-colors whitespace-nowrap"
          >
            Explore Plans
          </Link>
        </motion.div>

        {/* Festival Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative rounded-2xl shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  alt={festival.name}
                  src={festival.image}
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority={currentIndex === 0}
                />
              </motion.div>
            </AnimatePresence>
            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {FESTIVALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i); setShowDetails(false); }}
                  className={`h-2 rounded-full transition-all ${i === currentIndex ? "bg-secondary w-8" : "bg-white/50 w-2 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{festival.name}</h2>
                    <p className="text-secondary font-semibold text-sm mt-1">{festival.date}</p>
                  </div>
                  <button
                    onClick={() => { setCurrentIndex((currentIndex + 1) % FESTIVALS.length); setShowDetails(false); }}
                    className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5 transition-all shrink-0"
                  >
                    Next
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </button>
                </div>

                {!showDetails ? (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="border border-primary text-primary px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary/5 transition-all"
                  >
                    Explore Festival Packages
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 space-y-4"
                  >
                    <p className="text-sm text-on-surface-variant leading-relaxed">{festival.description}</p>
                    <div>
                      <p className="text-xs font-bold uppercase text-secondary mb-2">Best for:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1">
                        {festival.bestFor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-secondary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Coming soon chip + blog link per festival */}
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #fff8ed, #fef3c7)", border: "1px solid #f6c94e" }}
                >
                  <div className="flex items-center gap-2">
                    <span>🪔</span>
                    <p className="text-xs font-semibold text-[#7c4a00]">Festival Kit — Coming Soon</p>
                  </div>
                  <Link
                    href={`/blog/${festival.blogSlug}`}
                    className="text-xs font-bold text-[#5c3300] underline underline-offset-2 hover:text-[#7c4a00] transition-colors whitespace-nowrap"
                  >
                    Read Puja Guide →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Explore Plans CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 bg-surface-container border border-outline-variant/10"
            >
              <p className="text-base font-bold mb-1">Get notified when festival kits launch</p>
              <p className="text-sm text-on-surface-variant mb-4">Subscribe to a plan and be the first to access curated puja kits for every upcoming festival.</p>
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>spa</span>
                Explore Plans
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
