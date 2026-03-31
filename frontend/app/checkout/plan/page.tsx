"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = [
  {
    id: "TRADITIONAL",
    name: "Traditional",
    price: 59,
    icon: "eco",
    description: "Essential daily blooms for prayer and peace. A simple touch of nature for your sanctuary.",
    featured: false,
  },
  {
    id: "DIVINE",
    name: "Divine",
    price: 89,
    icon: "auto_awesome",
    description: "A premium curation of exotic marigolds and jasmine. Perfect for festive households and daily rituals.",
    featured: true,
  },
  {
    id: "CELESTIAL",
    name: "Celestial",
    price: 179,
    icon: "star",
    description: "The ultimate floral experience. Rare temple-grade blooms delivered fresh every dawn.",
    featured: false,
  },
];

export default function CheckoutPlanPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("DIVINE");

  useEffect(() => {
    const saved = localStorage.getItem("checkout_plan");
    if (saved) setSelectedPlan(saved);
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    localStorage.setItem("checkout_plan", planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      localStorage.setItem("checkout_plan", selectedPlan);
    }
    router.push("/checkout/addons");
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen pb-32 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="bg-[#fff8f5] sticky top-0 z-50 border-b border-[#d1c5b3]/20">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/plans" className="hover:opacity-80 transition-opacity text-[#775a11]">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-semibold tracking-tight text-[#2f1500] text-lg">Flower Subscription</h1>
          </div>
          <div className="text-[#775a11]">
            <span className="material-symbols-outlined">local_florist</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">

        {/* Progress Indicator */}
        <div className="mb-16">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            <div className="absolute top-5 left-0 w-full h-px bg-[#d1c5b3]/30 -z-10"></div>
            {[
              { step: 1, label: "Plan", href: "/checkout/plan", active: true },
              { step: 2, label: "Add-ons", href: "/checkout/addons", active: false },
              { step: 3, label: "Details", href: "/checkout/details", active: false },
              { step: 4, label: "Pay", href: "/checkout/pay", active: false },
            ].map(({ step, label, href, active }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <Link href={href}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-all ${
                    active ? "bg-[#775a11] text-white" : "bg-[#ffe3d0] text-[#4d4638] hover:bg-[#ffdcc3]"
                  }`}>
                    {step}
                  </div>
                </Link>
                <span className={`text-xs font-bold tracking-widest uppercase ${active ? "text-[#2f1500]" : "text-[#4d4638]/60"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold text-[#2f1500] tracking-tighter">Choose Your Essence</h2>
          <p className="font-['Playfair_Display'] italic text-xl text-[#775a11] max-w-xl mx-auto">
            Select a curated subscription plan that resonates with your space and spirit.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            if (plan.featured) {
              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`relative bg-[#ffdcc3] rounded-xl p-10 flex flex-col shadow-[0_20px_40px_rgba(47,21,0,0.06)] scale-105 border-2 z-10 overflow-hidden cursor-pointer transition-all ${
                    isSelected ? "border-[#775a11] ring-8 ring-[#775a11]/10" : "border-[#c4a052]/40 hover:border-[#775a11]/60"
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-[#775a11] text-white text-[10px] font-bold tracking-[0.2em] px-6 py-2 uppercase">
                    Most Cherished
                  </div>
                  <div className="mb-8">
                    <span className="material-symbols-outlined text-[#ab3500] text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <h3 className="text-3xl font-bold text-[#2f1500]">{plan.name}</h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-[#2f1500]">₹{plan.price}</span>
                    <span className="text-[#4d4638]">/mo</span>
                  </div>
                  <p className="text-[#2f1500] font-medium mb-8 leading-relaxed">{plan.description}</p>
                  <div className="mt-auto">
                    <button className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white shadow-lg"
                        : "bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white opacity-80 hover:opacity-100"
                    }`}>
                      {isSelected ? "Selected ✓" : "Select Plan"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`bg-[#fff1e9] rounded-xl p-8 flex flex-col transition-all cursor-pointer group border-2 ${
                  isSelected
                    ? "border-[#775a11] shadow-[0_20px_40px_rgba(47,21,0,0.06)] translate-y-[-4px]"
                    : "border-transparent hover:translate-y-[-4px] hover:border-[#c4a052]/40"
                }`}
              >
                <div className="mb-8">
                  <span className="material-symbols-outlined text-[#775a11] text-4xl mb-4 block group-hover:scale-110 transition-transform">
                    {plan.icon}
                  </span>
                  <h3 className="text-2xl font-bold text-[#2f1500]">{plan.name}</h3>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#2f1500]">₹{plan.price}</span>
                  <span className="text-[#4d4638]">/mo</span>
                </div>
                <p className="text-[#4d4638] mb-8 leading-relaxed">{plan.description}</p>
                <div className="mt-auto">
                  <button className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-colors ${
                    isSelected
                      ? "bg-[#775a11] text-white"
                      : "bg-[#ffdcc3] text-[#775a11] hover:bg-[#c4a052] hover:text-white"
                  }`}>
                    {isSelected ? "Selected ✓" : "Select Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Action */}
        <div className="text-center mb-24">
          <button
            onClick={() => { localStorage.removeItem("checkout_plan"); router.push("/checkout/addons"); }}
            className="inline-block text-[#4d4638] font-medium border-b-2 border-[#d1c5b3] hover:text-[#775a11] hover:border-[#775a11] transition-all pb-1"
          >
            Continue with add-ons only
          </button>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#775a11]">
              <span className="material-symbols-outlined">shopping_basket</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d4638] tracking-widest uppercase opacity-60">Estimated Total</p>
              <p className="text-2xl font-extrabold text-[#2f1500]">
                {selectedPlanData ? `₹${selectedPlanData.price}.00` : "₹0.00"}
              </p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight shadow-[0_20px_40px_rgba(47,21,0,0.06)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Add-ons →
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-[#d1c5b3]/15 shadow-[0_-20px_40px_rgba(47,21,0,0.06)] rounded-t-[2rem] flex justify-around items-center px-4 pt-3 pb-8">
        <Link href="/checkout/plan" className="flex flex-col items-center justify-center bg-[#ffdcc3] text-[#2f1500] rounded-full px-5 py-1">
          <span className="material-symbols-outlined">local_florist</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Plan</span>
        </Link>
        <Link href="/checkout/addons" className="flex flex-col items-center justify-center text-[#4d4638] opacity-60 hover:bg-[#fff1e9] rounded-full px-5 py-1">
          <span className="material-symbols-outlined">redeem</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Add-ons</span>
        </Link>
        <Link href="/checkout/details" className="flex flex-col items-center justify-center text-[#4d4638] opacity-60 hover:bg-[#fff1e9] rounded-full px-5 py-1">
          <span className="material-symbols-outlined">contact_mail</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Details</span>
        </Link>
        <Link href="/checkout/pay" className="flex flex-col items-center justify-center text-[#4d4638] opacity-60 hover:bg-[#fff1e9] rounded-full px-5 py-1">
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Pay</span>
        </Link>
      </nav>

      {/* Decorative blobs */}
      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
}
