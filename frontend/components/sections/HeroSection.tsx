"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface HeroContent {
  title: string;
  subtitle: string;
  cta_text: string;
  image_url: string;
  metadata?: {
    social_proof?: string;
  };
}

const DEFAULT_HERO: HeroContent = {
  title: "Daily Fresh Puja Flowers & Essentials Delivered at Your Doorsteps.",
  subtitle: "India's trusted daily puja flower delivery subscription. Fresh flowers at your doorstep every morning between 5:30–7:30 AM.",
  cta_text: "YOUR DAILY DEVOTION, STARTING FROM ONLY ₹59/DAY",
  image_url: "/images/hero-section-background.png",
  metadata: {
    social_proof: "Join 100 families who start every morning with Bloomme"
  }
};

export const HeroSection: React.FC = () => {
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        const content = await response.json();
        const heroSection = Array.isArray(content)
          ? content.find((item: any) => item.section_name === 'hero')
          : null;

        if (heroSection) {
          setHero({
            title: heroSection.title || DEFAULT_HERO.title,
            subtitle: heroSection.subtitle || DEFAULT_HERO.subtitle,
            cta_text: heroSection.cta_text || DEFAULT_HERO.cta_text,
            image_url: heroSection.image_url || DEFAULT_HERO.image_url,
            metadata: heroSection.metadata || DEFAULT_HERO.metadata
          });
        }
      } catch (err) {
        // Keep DEFAULT_HERO on error
      }
    };

    fetchHeroContent();
  }, []);

  return (
    <header className="relative w-full pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 flex items-center justify-center overflow-hidden min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-90px)] md:min-h-[calc(100vh-100px)]">
      {/* Hero background image */}
      <Image
        src={hero.image_url}
        alt="Fresh puja flowers arranged for morning prayer — Bloomme daily delivery"
        fill
        priority
        quality={85}
        className="object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35 z-[1]"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-[2]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            {hero.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>

          <p className="text-white/75 text-xs sm:text-sm font-medium tracking-wide">
            Now delivering in Faridabad · NIT areas · Puja flower subscription from ₹59/day
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="bg-secondary text-on-secondary px-4 sm:px-6 md:px-10 lg:px-12 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg transition-all hover:shadow-xl">
              {hero.cta_text}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-6 sm:pt-8"
          >
            <span className="material-symbols-outlined text-secondary text-lg sm:text-xl md:text-2xl">favorite</span>
            <p className="text-white/80 text-xs sm:text-sm md:text-lg">
              {hero.metadata?.social_proof || DEFAULT_HERO.metadata?.social_proof}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};
