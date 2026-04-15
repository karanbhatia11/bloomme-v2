"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import StickyCart from "@/components/checkout/StickyCart";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutProgressBar from "@/components/checkout/CheckoutProgressBar";

export default function CheckoutDetailsPage() {
  const router = useRouter();
  const { cart, setCustomer, getTotal } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; email?: string; phone?: string } | null>(null);

  const [form, setForm] = useState({
    name: cart.customer?.name ?? "",
    phone: cart.customer?.phone ?? "",
    email: cart.customer?.email ?? "",
    addressLine1: cart.customer?.addressLine1 ?? "",
    addressLine2: cart.customer?.addressLine2 ?? "",
    suburb: cart.customer?.suburb ?? "",
    postcode: cart.customer?.postcode ?? "",
    deliveryNotes: cart.customer?.deliveryNotes ?? "",
    timeSlot: cart.customer?.timeSlot ?? "5:30 to 6:30",
    buildingType: cart.customer?.buildingType ?? "house",
    createAccount: cart.customer?.createAccount ?? false,
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        setIsLoggedIn(true);
        // Autofill form with user data if not already filled from cart
        setForm((prev) => ({
          ...prev,
          name: prev.name || parsedUser.name || "",
          email: prev.email || parsedUser.email || "",
          phone: prev.phone || parsedUser.phone || "",
        }));
      } catch {}
    }
    setHydrated(true);
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid 10-digit mobile number";
    if (!form.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!form.suburb.trim()) errs.suburb = "Suburb is required";
    if (!form.postcode.trim()) errs.postcode = "Postcode is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setCustomer({ ...form });

    if (form.createAccount && !isLoggedIn) {
      const params = new URLSearchParams({
        name: form.name,
        email: form.email,
        phone: form.phone,
        redirect: "/checkout/pay",
      });
      router.push(`/signup?${params.toString()}`);
      return;
    }

    router.push("/checkout/pay");
  };

  return (
    <div className="min-h-screen pb-40 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <CheckoutHeader
        isCartOpen={isCartOpen}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-2xl mx-auto px-6 pt-12">

        <CheckoutProgressBar currentStep={4} />

        {/* Title */}
        <div className="mb-10 space-y-2">
          <h2 className="text-4xl font-bold text-[#2f1500] tracking-tighter">Your Details</h2>
          <p className="font-['Playfair_Display'] italic text-[#775a11]">
            Where shall we deliver your morning blooms?
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Full Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.name ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Mobile Number *</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4d4638] font-semibold text-sm">+91</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9XXXXXXXXX"
                type="tel"
                maxLength={10}
                className={`w-full pl-14 pr-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                  errors.phone ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
                }`}
              />
            </div>
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">
              Email *
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              type="email"
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.email ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Address *</label>
            <input
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="House/Flat no., Street, Colony..."
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.addressLine1 ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.addressLine1 && <p className="text-red-400 text-xs mt-1">{errors.addressLine1}</p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">
              Address Line 2 <span className="font-normal normal-case text-[#4d4638]/40">(optional)</span>
            </label>
            <input
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Apartment, building details..."
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.addressLine2 ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.addressLine2 && <p className="text-red-400 text-xs mt-1">{errors.addressLine2}</p>}
          </div>

          {/* Suburb */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Suburb *</label>
            <input
              name="suburb"
              value={form.suburb}
              onChange={handleChange}
              placeholder="Suburb or locality..."
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.suburb ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.suburb && <p className="text-red-400 text-xs mt-1">{errors.suburb}</p>}
          </div>

          {/* Postcode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Postcode *</label>
            <input
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
              placeholder="PIN/Postcode..."
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors ${
                errors.postcode ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.postcode && <p className="text-red-400 text-xs mt-1">{errors.postcode}</p>}
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">
              Delivery Notes <span className="font-normal normal-case text-[#4d4638]/40">(optional)</span>
            </label>
            <textarea
              name="deliveryNotes"
              value={form.deliveryNotes}
              onChange={handleChange}
              placeholder="Landmark, gate number, special instructions..."
              rows={2}
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] placeholder-[#4d4638]/40 focus:outline-none transition-colors resize-none ${
                errors.deliveryNotes ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            />
            {errors.deliveryNotes && <p className="text-red-400 text-xs mt-1">{errors.deliveryNotes}</p>}
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Preferred Delivery Time *</label>
            <select
              name="timeSlot"
              value={form.timeSlot}
              onChange={handleChange}
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] focus:outline-none transition-colors cursor-pointer ${
                errors.timeSlot ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            >
              <option value="5:30 to 6:30">5:30 AM - 6:30 AM</option>
              <option value="6:30 to 7:30">6:30 AM - 7:30 AM</option>
              <option value="7:30 to 8:30">7:30 AM - 8:30 AM</option>
              <option value="8:30 to 9:30">8:30 AM - 9:30 AM</option>
            </select>
            {errors.timeSlot && <p className="text-red-400 text-xs mt-1">{errors.timeSlot}</p>}
          </div>

          {/* Building Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4d4638]/60 mb-2">Building Type *</label>
            <select
              name="buildingType"
              value={form.buildingType}
              onChange={handleChange}
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-[#fff1e9] text-[#2f1500] focus:outline-none transition-colors cursor-pointer ${
                errors.buildingType ? "border-red-400" : "border-[#d1c5b3]/40 focus:border-[#775a11]"
              }`}
            >
              <option value="house">House</option>
              <option value="office">Office</option>
            </select>
            {errors.buildingType && <p className="text-red-400 text-xs mt-1">{errors.buildingType}</p>}
          </div>

          {/* Create Account — only show for guest checkout */}
          {hydrated && !isLoggedIn && (
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                form.createAccount ? "bg-[#775a11] border-[#775a11]" : "border-[#d1c5b3] group-hover:border-[#c4a052]"
              }`}>
                {form.createAccount && (
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "14px" }}>check</span>
                )}
              </div>
              <input
                name="createAccount"
                type="checkbox"
                checked={form.createAccount}
                onChange={handleChange}
                className="sr-only"
              />
              <div>
                <p className="font-semibold text-[#2f1500] text-sm">Create a Bloomme account</p>
                <p className="text-[#4d4638]/60 text-xs mt-0.5">Track orders, manage subscriptions & get exclusive offers.</p>
              </div>
            </label>
          )}

          <div className="h-24" />
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#775a11]">
              <span className="material-symbols-outlined">shopping_basket</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d4638] tracking-widest uppercase opacity-60">Order Total</p>
              <p className="text-2xl font-extrabold text-[#2f1500]">₹{getTotal()}.00</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight shadow-[0_20px_40px_rgba(47,21,0,0.06)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Continue to Pay →
          </button>
        </div>
      </div>

      <StickyCart />

      {/* Decorative blobs */}
      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
