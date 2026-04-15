"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import StickyCart from "@/components/checkout/StickyCart";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutProgressBar from "@/components/checkout/CheckoutProgressBar";

const PLANS = [
  {
    id: "TRADITIONAL",
    name: "Traditional",
    price: 59,
    icon: "eco",
    features: [
      "80-100 gms Fresh Devotional Mix",
      "3 Rotational Variety Flower Mix*",
      "Consistent freshness, sourced daily",
      "Ideal for quick and simple morning rituals",
      "Carefully packed to maintain purity",
    ],
    featured: false,
  },
  {
    id: "DIVINE",
    name: "Divine",
    price: 89,
    icon: "auto_awesome",
    features: [
      "120-150 gms Premium Devotional Mix",
      "3 Premium Rotational Variety Flower Mix*",
      "Enhanced variety for a more fulfilling puja",
      "Balanced quantity for complete daily rituals",
      "Designed for families with regular offerings",
    ],
    featured: true,
  },
  {
    id: "CELESTIAL",
    name: "Celestial",
    price: 179,
    icon: "star",
    features: [
      "200gms Exotic Offerings",
      "4 Exotic Rotational Flower Mix*",
      "Premium selection with superior quality flowers",
      "Perfect for special rituals and detailed puja",
      "Elevates your daily devotion experience",
    ],
    featured: false,
  },
];


export default function CheckoutPlanPage() {
  const router = useRouter();
  const { cart, setPlan, removePlan } = useCart();
  const [selectedPlan, setSelectedPlan] = useState<string>(cart.planId || "DIVINE");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (cart.planId) setSelectedPlan(cart.planId);
  }, [cart.planId]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = PLANS.find((p) => p.id === planId)!;
    setPlan(plan.id, plan.name, plan.price);
  };

  const handleContinue = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan)!;
    setPlan(plan.id, plan.name, plan.price);
    router.push("/checkout/schedule");
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen pb-32 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <CheckoutHeader
        isCartOpen={isCartOpen}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 pt-12">

        <CheckoutProgressBar currentStep={1} />

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
                    <span className="text-[#4d4638]">/day</span>
                  </div>
                  <ul className="space-y-2 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#2f1500]">
                        <span className="material-symbols-outlined text-base text-[#ab3500] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
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
                  <span className="text-[#4d4638]">/day</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#4d4638]">
                      <span className="material-symbols-outlined text-base text-[#775a11] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
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

        <div className="text-center mb-24">
          <button
            onClick={() => {
              removePlan();
              router.push("/checkout/addons");
            }}
            className="text-[#4d4638] font-medium border-b-2 border-[#d1c5b3] hover:text-[#775a11] hover:border-[#775a11] transition-all pb-1"
          >
            Continue with add-ons only
          </button>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10" />
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
            Set Schedule →
          </button>
        </div>
      </div>

      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
