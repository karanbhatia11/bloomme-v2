"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AddonSummary {
  title: string;
  price: number;
  quantity: number;
  deliveryCount: number;
  customDates: string[];
  scheduleMode: string;
}

interface OrderSummary {
  razorpayPaymentId: string;
  planName: string;
  planPrice: number;
  deliveryCount: number;
  frequency: string;
  startDate: string;
  endDate: string;
  addons: AddonSummary[];
  creditsRedeemed: number;
  creditDiscount: number;
  total: number;
  creditsEarned: number;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    timeSlot?: string;
  } | null;
}

const fmt = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

const freqLabel: Record<string, string> = {
  daily: "Daily",
  alternate: "Alternate days",
  weekly: "Weekly",
  custom: "Custom schedule",
};

export default function CheckoutConfirmedPage() {
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("confirmedOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  const handlePrint = () => window.print();

  const handleRating = (r: number) => {
    setRating(r);
  };

  const submitRating = async () => {
    if (!rating || !order?.razorpayPaymentId) return;
    setRatingLoading(true);
    try {
      // Find orderId from sessionStorage — we store razorpayPaymentId, use it as reference
      // Backend accepts the razorpay payment ID to look up the order
      await fetch(`/api/orders/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayPaymentId: order.razorpayPaymentId,
          rating,
          comment: comment.trim() || null,
        }),
      });
    } catch {}
    setRatingSubmitted(true);
    setRatingLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] px-4 py-16 relative overflow-hidden print:bg-white print:py-4" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Decorative blobs — hidden in print */}
      <div className="print:hidden absolute top-[-80px] right-[-80px] w-72 h-72 bg-[#ffdcc3]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="print:hidden absolute bottom-[-80px] left-[-80px] w-80 h-80 bg-[#c4a052]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto">

        {/* Success icon */}
        {mounted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c4a052] to-[#775a11] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(119,90,17,0.3)] print:hidden"
          >
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2f1500] tracking-tighter">Order Confirmed!</h1>
          <p className="font-['Playfair_Display'] italic text-[#775a11] mt-1">Your blooms are on their way.</p>
        </motion.div>

        {/* ── ORDER SUMMARY ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-[#fff1e9] rounded-3xl p-6 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-5">Order Summary</p>

          {/* Plan row */}
          {order?.planName && (
            <div className="flex items-start gap-4 pb-4 border-b border-[#d1c5b3]/30">
              <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#775a11] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#2f1500] text-sm">{order.planName} Plan — {order.deliveryCount} deliveries</p>
                <p className="text-[#4d4638]/60 text-xs mt-0.5">
                  {freqLabel[order.frequency] || order.frequency}
                  {order.startDate && order.endDate && ` · from ${fmt(order.startDate)} to ${fmt(order.endDate)}`}
                </p>
              </div>
              <p className="font-bold text-[#2f1500] text-sm flex-shrink-0">₹{order.planPrice.toLocaleString()}</p>
            </div>
          )}

          {/* Addon rows */}
          {order?.addons.map((addon, i) => (
            <div key={i} className="py-4 border-b border-[#d1c5b3]/20 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#ffdcc3]/60 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#775a11] text-sm">redeem</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2f1500] text-sm">{addon.title} — {addon.deliveryCount} deliveries</p>
                  <p className="text-[#4d4638]/60 text-xs mt-0.5">Qty {addon.quantity} · {addon.scheduleMode === "different" ? "Custom schedule" : "Same as subscription"}</p>
                  {addon.customDates.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#775a11] mb-1.5">Selected Dates:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {addon.customDates.map(d => (
                          <span key={d} className="text-[11px] bg-white border border-[#d1c5b3]/50 text-[#2f1500] px-2 py-0.5 rounded-lg font-medium">
                            {fmt(d)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="font-bold text-[#2f1500] text-sm flex-shrink-0">₹{addon.price.toLocaleString()}</p>
              </div>
            </div>
          ))}

          {/* Incl. all taxes */}
          {order && (
            <p className="text-[10px] text-[#4d4638]/40 pt-2">Incl. all taxes</p>
          )}

          {/* Credits discount */}
          {order && order.creditsRedeemed > 0 && (
            <div className="flex items-center justify-between pt-3 pb-1">
              <p className="text-sm font-semibold text-[#775a11]">Bloom Credits ({order.creditsRedeemed} credits)</p>
              <p className="text-sm font-bold text-[#775a11]">−₹{order.creditDiscount.toFixed(0)}</p>
            </div>
          )}

          {/* Total */}
          {order && (
            <div className="flex items-center justify-between pt-3 border-t border-[#d1c5b3]/30 mt-1">
              <p className="font-bold text-[#2f1500] text-base">Total</p>
              <p className="text-2xl font-extrabold text-[#2f1500]">₹{order.total.toLocaleString()}.00</p>
            </div>
          )}
        </motion.div>

        {/* ── CREDITS EARNED ──────────────────────────────────── */}
        {order && order.creditsEarned > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="bg-gradient-to-r from-[#ffdcc3]/60 to-[#fff1e9] border border-[#c4a052]/30 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#775a11] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <div>
              <p className="font-bold text-[#2f1500] text-sm">You earned {order.creditsEarned.toLocaleString()} Bloom Credits!</p>
              <p className="text-xs text-[#4d4638]/60">Worth ₹{Math.ceil(order.creditsEarned * 0.10)}<sup className="text-[8px] ml-0.5">*</sup></p>
            </div>
          </motion.div>
        )}

        {/* ── DELIVERY DETAILS ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="bg-[#fff1e9] rounded-3xl p-6 mb-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50">Delivery Details</p>

          {[
            { icon: "schedule",     label: "Time Slot",      value: order?.customer?.timeSlot || "5:30 AM – 7:30 AM" },
            { icon: "location_on",  label: "Address",         value: order?.customer?.address && order?.customer?.city ? `${order.customer.address}, ${order.customer.city}` : null },
            { icon: "mail",         label: "Email",           value: order?.customer?.email || null },
            { icon: "phone",        label: "Phone",           value: order?.customer?.phone ? `+91 ${order.customer.phone}` : null },
            { icon: "receipt_long", label: "Transaction ID",  value: order?.razorpayPaymentId || null },
          ].filter(row => row.value).map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffdcc3] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#775a11] text-sm">{icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50">{label}</p>
                <p className="text-[#2f1500] font-semibold text-sm mt-0.5 break-all">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── EXPERIENCE RATING ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          className="bg-[#fff1e9] rounded-3xl p-6 mb-6 text-center print:hidden">
          <p className="text-sm font-bold text-[#2f1500] mb-1">How was your experience?</p>
          <p className="text-xs text-[#4d4638]/50 mb-4">Optional — helps us improve</p>
          {ratingSubmitted ? (
            <p className="text-sm font-semibold text-[#775a11]">Thank you for your feedback! 🌸</p>
          ) : (
            <div className="space-y-4">
              {/* Stars */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125 active:scale-110"
                  >
                    <span className="material-symbols-outlined" style={{
                      fontSize: "32px",
                      color: star <= (hoverRating || rating) ? "#c4a052" : "#d1c5b3",
                      fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0",
                    }}>
                      star
                    </span>
                  </button>
                ))}
              </div>

              {/* Comment box — appears after a star is selected */}
              {rating > 0 && (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us more... (optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1c5b3]/50 bg-white text-[#2f1500] text-sm font-medium placeholder:text-[#4d4638]/40 focus:outline-none focus:border-[#c4a052] resize-none transition-colors"
                  />
                  <button
                    onClick={submitRating}
                    disabled={ratingLoading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                  >
                    {ratingLoading ? "Submitting…" : "Submit Feedback"}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── CTAs ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-4 rounded-2xl border-2 border-[#d1c5b3] text-[#4d4638] font-semibold text-sm flex items-center justify-center gap-2 hover:border-[#c4a052] hover:text-[#775a11] transition-all"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print
            </button>
            <Link href="/dashboard"
              className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-sm text-center flex items-center justify-center shadow-[0_12px_30px_rgba(119,90,17,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
              View Dashboard
            </Link>
          </div>
          <Link href="/"
            className="w-full py-3 rounded-2xl border-2 border-[#d1c5b3] text-[#4d4638] font-semibold text-sm text-center hover:border-[#c4a052] hover:text-[#775a11] transition-all">
            Back to Home
          </Link>
        </motion.div>

        <p className="text-center font-['Playfair_Display'] italic text-[#c4a052] text-sm mt-8 print:hidden">
          &ldquo;Every morning begins with devotion.&rdquo;
        </p>

        {/* Fine print */}
        <div className="mt-6 px-2 space-y-1 print:hidden">
          <p className="text-[10px] text-[#4d4638]/40 leading-relaxed">
            <sup>*</sup> Bloom Credits are valid for 12 months from the date of earning. Minimum 100 credits required to redeem. Maximum redemption is 20% of order value per transaction. Credits can only be redeemed on active subscriptions. Credits are earned only on cash amount paid, not on credits-redeemed portion. Referral credits (500 for you, 300 for friend) unlock after friend's first paid order.
          </p>
        </div>
      </div>
    </div>
  );
}
