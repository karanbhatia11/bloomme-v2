"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutConfirmedPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-[#ffdcc3]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 bg-[#c4a052]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Success Icon */}
        {mounted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c4a052] to-[#775a11] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(119,90,17,0.3)]"
          >
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-3"
        >
          <h1 className="text-4xl font-bold text-[#2f1500] tracking-tighter">Order Confirmed!</h1>
          <p className="font-['Playfair_Display'] italic text-xl text-[#775a11]">
            Your blooms are on their way.
          </p>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-[#4d4638] leading-relaxed mb-10"
        >
          Thank you for choosing Bloomme. Your first delivery of fresh puja flowers will arrive at your doorstep early morning on your chosen start date.
        </motion.p>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#fff1e9] rounded-3xl p-6 mb-8 space-y-4 text-left"
        >
          {[
            { icon: "schedule", label: "Delivery Time", value: "5:30 AM – 7:30 AM daily" },
            { icon: "notifications", label: "Confirmation", value: "You'll receive a WhatsApp update" },
            { icon: "support_agent", label: "Support", value: "WhatsApp us at +91 9950707995" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#775a11] text-sm">{icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60">{label}</p>
                <p className="text-[#2f1500] font-semibold text-sm mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Decorative flower quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="font-['Playfair_Display'] italic text-[#c4a052] text-lg mb-10"
        >
          &ldquo;Every morning begins with devotion.&rdquo;
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/dashboard"
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight text-center shadow-[0_12px_30px_rgba(119,90,17,0.25)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            View My Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-4 rounded-2xl border-2 border-[#d1c5b3] text-[#4d4638] font-semibold text-center hover:border-[#c4a052] hover:text-[#775a11] transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
