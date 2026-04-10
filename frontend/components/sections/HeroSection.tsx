"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  image_url: "/images/HeroSectionTest_1.png",
  metadata: {
    social_proof: "Join 100 families who start every morning with Bloomme"
  }
};

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        if (!response.ok) {
          console.warn('Failed to fetch hero content:', response.status);
          return;
        }
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
    <header className="relative w-full pt-32 pb-12 sm:pb-16 md:pb-20 flex items-center justify-center overflow-hidden min-h-[85vh] sm:min-h-[85vh] md:min-h-[85vh]">
      {/* Hero background image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={hero.image_url}
          alt="Fresh puja flowers arranged for morning prayer — Bloomme daily delivery"
          fill
          priority
          quality={85}
          className="object-cover object-[center_65%] scale-[1.30]"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35 z-[1]"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-[2] w-full h-full flex flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto px-2 sm:px-0">
            {hero.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            {hero.subtitle}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="-mt-6"
          >
            <button
              onClick={() => router.push('/plans')}
              className="bg-secondary/85 text-white px-3 sm:px-6 md:px-10 lg:px-12 py-2 sm:py-3 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-xs md:text-sm lg:text-base shadow-lg transition-all hover:shadow-xl cursor-pointer min-h-[40px] inline-flex items-center justify-center min-w-[120px]"
            >
              {hero.cta_text}
            </button>
          </motion.div>

          <div className="pt-4 sm:pt-6 md:pt-8"></div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6 md:pt-8"
        >
          <span className="material-symbols-outlined text-secondary text-base sm:text-lg md:text-xl lg:text-2xl flex-shrink-0">favorite</span>
        </motion.div>
      </div>
    </header>
  );
};
