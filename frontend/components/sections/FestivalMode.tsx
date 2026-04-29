"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SHANI_JAYANTI = {
  name: "Shani Jayanti",
  date: "16 May 2026",
  emoji: "⚫",
  urgency: "VERY IMPORTANT",
  tagline: "Shani dev ki puja me sahi samagri ka hona bahut zaruri hai",
  subtext: "Is din galat ya incomplete puja avoid karna chahiye",
  cta: "Get Shani Puja Kit",
  image: "/images/Festivals/23April-Update/FestivalPlan4.jpeg",
  kitItems: [
    { label: "Black sesame (til)", star: true },
    { label: "Mustard oil", note: "optional add-on" },
    { label: "Blue / dark flowers" },
    { label: "Diya + batti" },
    { label: "Roli + chawal" },
    { label: "Incense" },
  ],
};

const FESTIVAL_IMAGES = [
  {
    alt: "Buddh Purnima — Bloomme Shanti Puja Kit",
    src: "/images/Festivals/23April-Update/FestivalPlan1.jpeg",
  },
  {
    alt: "Apara Ekadashi — Bloomme Ekadashi Bhakti Kit",
    src: "/images/Festivals/23April-Update/FestivalPlan2.jpeg",
  },
  {
    alt: "Shani Jayanti — Bloomme Shani Puja Kit",
    src: "/images/Festivals/23April-Update/FestivalPlan4.jpeg",
  },
];

const FESTIVAL_DETAILS = [
  {
    name: "Buddh Purnima",
    subtitle: "Shanti Puja",
    date: "📅 1 May 2026",
    description: "Shanti, sadgi aur bhakti ka din — Buddha Purnima. The most sacred Purnima of the year calls for a simple, pure puja with fresh white flowers and mild incense. Is pavitra din par ek shuddh puja sabse mahatvapurn hoti hai.",
    image: FESTIVAL_IMAGES[0].src,
    bestFor: ["White flowers (jasmine, white rose)", "Mild fragrance incense", "Diya + batti", "Mishri / fruits", "Shanti Puja setup"],
    blogSlug: "buddh-purnima-2026-puja-guide",
  },
  {
    name: "Apara Ekadashi",
    subtitle: "Ekadashi Bhakti",
    date: "📅 13 May 2026",
    description: "Ekadashi ke din bhakti me shuddhta sabse zaruri hoti hai. Sabse bada challenge hota hai sahi samagri ka milna — especially fresh tulsi. Bloomme ensures fresh tulsi availability, fresh flowers, and a ready puja setup every Ekadashi.",
    image: FESTIVAL_IMAGES[1].src,
    bestFor: ["Fresh tulsi leaves (essential)", "Fresh flowers", "Diya + batti", "Incense sticks", "Mishri prasad"],
    blogSlug: "apara-ekadashi-2026-puja-guide",
  },
  {
    name: "Shani Jayanti",
    subtitle: "Shani Dev Puja",
    date: "📅 16 May 2026",
    description: "Shani dev ki puja me sahi samagri ka hona bahut zaruri hai. Is din galat ya incomplete puja avoid karna chahiye. Every item in the Shani Puja Kit has a specific purpose — missing even one is considered inauspicious.",
    image: FESTIVAL_IMAGES[2].src,
    bestFor: ["Black sesame / kala til (essential)", "Blue / dark flowers", "Mustard oil (add-on)", "Diya + batti", "Incense"],
    blogSlug: "shani-jayanti-2026-puja-guide",
  },
];

interface FestivalItem {
  name: string;
  subtitle?: string;
  date: string;
  description: string;
  image: string;
  bestFor: string[];
  blogSlug?: string;
}

export const FestivalMode: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [festivals, setFestivals] = useState<FestivalItem[]>(FESTIVAL_DETAILS as any);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchFestivalContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        if (!response.ok) {
          return; // silently use fallback FESTIVAL_DETAILS
        }

        const text = await response.text();
        if (!text) {
          console.warn('Empty response from festival API');
          return;
        }

        const data = JSON.parse(text);
        const section = Array.isArray(data)
          ? data.find((item: any) => item.section_name === 'festival-mode')
          : null;

        if (section?.metadata?.carousel_items && Array.isArray(section.metadata.carousel_items)) {
          setFestivals(section.metadata.carousel_items);
        }
      } catch (err) {
        console.error('Failed to fetch festival content:', err);
        // Continue with default festival details
      } finally {
        setLoading(false);
      }
    };

    fetchFestivalContent();
  }, []);

  useEffect(() => {
    if (showDetails) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % festivals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [festivals.length, showDetails]);

  return (
    <section id="festivals" className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">

        {/* Full-width header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10"
        >
          <span className="editorial-accent text-base sm:text-lg md:text-xl text-secondary block mb-2">
            Cosmic Celebrations
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Festival Mode: Never Miss a Ritual
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed mt-2 italic max-w-3xl">
            Special arrangements with all required add-ons available for all the festivals and important rituals.
          </p>
        </motion.div>

        {/* Image + Details side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6 md:gap-8 items-start lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bloom-image-trigger"
          >
            <div className="relative rounded-2xl shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Image
                    alt={festivals[currentImageIndex]?.name || "Festival"}
                    src={festivals[currentImageIndex]?.image || FESTIVAL_IMAGES[0].src}
                    width={800}
                    height={600}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    priority={currentImageIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Carousel Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {festivals.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => { setCurrentImageIndex(index); setShowDetails(false); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-secondary w-8"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4 sm:space-y-6">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className="text-2xl font-bold">
                      {festivals[currentImageIndex]?.name || FESTIVAL_DETAILS[currentImageIndex]?.name}
                    </h3>
                    <motion.button
                      onClick={() => { setCurrentImageIndex((currentImageIndex + 1) % festivals.length); setShowDetails(false); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5 transition-all shrink-0"
                    >
                      Next
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                    </motion.button>
                  </div>
                  <p className="text-secondary font-semibold text-sm mb-2">
                    {festivals[currentImageIndex]?.date || FESTIVAL_DETAILS[currentImageIndex]?.date}
                  </p>
                </div>

                {!showDetails ? (
                  <motion.button
                    onClick={() => setShowDetails(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="border border-primary text-primary px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary/5 transition-all"
                  >
                    Explore Festival Packages
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 space-y-4"
                  >
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {festivals[currentImageIndex]?.description || FESTIVAL_DETAILS[currentImageIndex]?.description}
                    </p>
                    <div>
                      <p className="text-xs font-bold uppercase text-secondary mb-2">Best for:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1">
                        {(festivals[currentImageIndex]?.bestFor || FESTIVAL_DETAILS[currentImageIndex]?.bestFor || []).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-secondary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </motion.div>
                )}

                {/* Coming Soon + Blog Link */}
                {(festivals[currentImageIndex]?.blogSlug || FESTIVAL_DETAILS[currentImageIndex]?.blogSlug) && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, #fff8ed, #fef3c7)", border: "1px solid #f6c94e" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🪔</span>
                      <p className="text-xs font-semibold text-[#7c4a00]">Festival Kit — Coming Soon</p>
                    </div>
                    <Link
                      href={`/blog/${festivals[currentImageIndex]?.blogSlug || FESTIVAL_DETAILS[currentImageIndex]?.blogSlug}`}
                      className="text-xs font-bold text-[#5c3300] underline underline-offset-2 hover:text-[#7c4a00] transition-colors whitespace-nowrap"
                    >
                      Read Puja Guide →
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* DRAFT: Shani Jayanti cards — see _ShaniJayantiCards component below FestivalMode */}

      </div>
    </section>
  );
};

// DRAFT — Shani Jayanti scrollable cards. Not rendered anywhere.
// To re-enable: import and place <_ShaniJayantiCards /> inside FestivalMode after the main grid.
const _ShaniJayantiCards = () => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="mt-10 sm:mt-14"
  >
    <div
      className="flex overflow-x-auto pb-4"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {[0, 1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="flex-shrink-0 rounded-2xl overflow-hidden w-full"
          style={{
            scrollSnapAlign: "start",
            background: "linear-gradient(135deg, #0d0d0d 0%, #1c1209 50%, #0d0d0d 100%)",
            boxShadow: "0 0 0 1px rgba(201,162,39,0.15), 0 24px 48px rgba(0,0,0,0.45)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
            <div className="relative overflow-hidden">
              <Image
                src={SHANI_JAYANTI.image}
                alt="Shani Jayanti Puja"
                width={1149}
                height={1369}
                className="w-full h-auto lg:h-full block"
                style={{ objectFit: "cover" }}
              />
              <div
                className="absolute inset-0 lg:hidden pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(13,13,13,0.75) 100%)" }}
              />
              <div
                className="absolute inset-0 hidden lg:block pointer-events-none"
                style={{ background: "linear-gradient(to right, transparent 65%, rgba(13,13,13,0.7) 100%)" }}
              />
              <div className="absolute top-4 left-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                  style={{
                    background: "rgba(13,13,13,0.8)",
                    border: "1px solid rgba(201,162,39,0.5)",
                    color: "#c9a227",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                  VERY IMPORTANT
                </span>
              </div>
            </div>
            <div className="px-6 py-7 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl">{SHANI_JAYANTI.emoji}</span>
                  <h3 className="text-xl font-bold tracking-tight" style={{ color: "#f5f0e8" }}>
                    {SHANI_JAYANTI.name}
                  </h3>
                </div>
                <p className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>
                  📅 {SHANI_JAYANTI.date}
                </p>
                <div className="w-10 h-px mb-4" style={{ background: "linear-gradient(to right, #c9a227, transparent)" }} />
                <blockquote
                  className="text-sm leading-relaxed italic mb-1"
                  style={{ color: "rgba(245,240,232,0.85)", fontFamily: "'Georgia', serif", borderLeft: "2px solid rgba(201,162,39,0.4)", paddingLeft: "0.875rem" }}
                >
                  &ldquo;{SHANI_JAYANTI.tagline}&rdquo;
                </blockquote>
                <p className="text-xs mb-5 pl-3.5" style={{ color: "rgba(245,240,232,0.45)" }}>
                  {SHANI_JAYANTI.subtext}
                </p>
                <p className="text-xs font-bold tracking-widest uppercase mb-2.5" style={{ color: "#c9a227" }}>
                  🧺 Shani Puja Kit Includes
                </p>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {SHANI_JAYANTI.kitItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span style={{ color: "#c9a227", marginTop: "3px", fontSize: "9px" }}>◆</span>
                      <span className="text-xs" style={{ color: "rgba(245,240,232,0.72)" }}>
                        {item.label}
                        {item.star && <span style={{ color: "#c9a227" }}> ⭐</span>}
                        {item.note && <span className="ml-1" style={{ color: "rgba(245,240,232,0.38)" }}>({item.note})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all"
                style={{ background: "linear-gradient(135deg, #c9a227 0%, #e8c547 50%, #c9a227 100%)", color: "#0d0d0d", boxShadow: "0 4px 20px rgba(201,162,39,0.3)" }}
              >
                <span>🪔</span>
                {SHANI_JAYANTI.cta}
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);
