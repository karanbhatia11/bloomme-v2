"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../common/Button";

export const HeroSection: React.FC = () => {
  const petals = [
    { id: 1, left: "10%", delay: 0 },
    { id: 2, left: "30%", delay: 2 },
    { id: 3, left: "55%", delay: 5 },
    { id: 4, left: "80%", delay: 1 },
    { id: 5, left: "95%", delay: 8 },
  ];

  return (
    <header className="relative w-full pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 flex items-center justify-center overflow-hidden bg-cover bg-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-90px)] md:min-h-[calc(100vh-100px)]"
      style={{
        backgroundImage: "url('/images/Hero Section background.png')"
      }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35"></div>

      <div className="max-w-[1200px] mx-auto px-2 sm:px-3 md:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Daily Fresh Puja Flowers &amp; Essentials Delivered at Your Doorsteps.
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Fresh puja flowers &amp; essentials delivered before sunrise - every single day.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="bg-secondary text-on-secondary px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg transition-all hover:shadow-xl">
              YOUR DAILY DEVOTION, STARTING FROM ONLY ₹49/DAY
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 pt-8"
          >
            <span className="material-symbols-outlined text-secondary text-lg sm:text-xl md:text-2xl">favorite</span>
            <p className="text-white/80 text-xs sm:text-sm md:text-lg">
              Join 100 families who start every morning with Bloomme
            </p>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};
