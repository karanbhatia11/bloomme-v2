"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const FESTIVAL_IMAGES = [
  {
    alt: "Gudi Padwa / Ugadi — Hindu New Year",
    src: "/images/Festivals/Gudi Padwa celebration offerings and decorations.png",
  },
  {
    alt: "Hanuman Jayanti",
    src: "/images/Festivals/Serene Hanuman Jayanti devotion setup.png",
  },
  {
    alt: "Akshaya Tritiya",
    src: "/images/Festivals/Akshaya Tritiya celebration with gold offerings.png",
  },
  {
    alt: "Buddha Purnima",
    src: "/images/Festivals/Buddha Purnima celebration with serene offerings.png",
  },
];

const FESTIVAL_DETAILS = [
  {
    name: "Gudi Padwa / Ugadi",
    subtitle: "Hindu New Year",
    date: "📅 9 April 2026",
    description: "Celebrate the beginning of a prosperous new year with fresh malas, vibrant flowers, and auspicious puja essentials. Perfect for welcoming positivity, new beginnings, and festive home decorations.",
    image: FESTIVAL_IMAGES[0].src,
    bestFor: ["New year puja setups", "Home entrance decor", "Festive subscriptions"],
  },
  {
    name: "Hanuman Jayanti",
    date: "📅 19 April 2026",
    description: "Offer devotion with marigold malas, sindoor, diyas, and sacred puja items dedicated to Lord Hanuman. Ideal for temple offerings, home puja, and strength-focused spiritual rituals.",
    image: FESTIVAL_IMAGES[1].src,
    bestFor: ["Marigold malas", "Sindoor kits", "Incense", "Diya sets"],
  },
  {
    name: "Akshaya Tritiya",
    date: "📅 27 April 2026",
    description: "A highly auspicious day symbolizing prosperity, abundance, and new purchases. Perfect for premium puja arrangements, lotus flowers, and complete spiritual setups for wealth and blessings.",
    image: FESTIVAL_IMAGES[2].src,
    bestFor: ["Premium Celestial plan", "Full puja kits", "Prosperity rituals"],
  },
  {
    name: "Buddha Purnima",
    date: "📅 1 May 2026",
    description: "A peaceful celebration focused on mindfulness, calmness, and spiritual reflection. Soft lotus flowers, diyas, and incense create a serene environment for meditation and prayer.",
    image: FESTIVAL_IMAGES[3].src,
    bestFor: ["Lotus flowers", "Calm puja setups", "Meditation offerings"],
  },
];

interface FestivalItem {
  name: string;
  subtitle?: string;
  date: string;
  description: string;
  image: string;
  bestFor: string[];
}

export const FestivalMode: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [festivals, setFestivals] = useState<FestivalItem[]>(FESTIVAL_DETAILS as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivalContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        const data = await response.json();
        const section = Array.isArray(data)
          ? data.find((item: any) => item.section_name === 'festival-mode')
          : null;

        if (section?.metadata?.carousel_items) {
          setFestivals(section.metadata.carousel_items);
        }
      } catch (err) {
        console.error('Failed to fetch festival content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivalContent();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % festivals.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [festivals.length]);

  return (
    <section id="festivals" className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1 relative bloom-image-trigger"
        >
          <div className="relative aspect-[5/4] shadow-xl overflow-hidden bg-surface-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <Image
                  alt={festivals[currentImageIndex]?.name || "Festival"}
                  src={festivals[currentImageIndex]?.image || FESTIVAL_IMAGES[0].src}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain object-center"
                  priority={currentImageIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {festivals.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
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
          className="order-1 lg:order-2"
        >
          <span className="editorial-accent text-lg sm:text-xl md:text-2xl text-secondary block mb-2 sm:mb-4">
            Celestial Celebrations
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-8">
            Festival Mode: <br />
            Never Miss a Ritual
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-on-surface-variant mb-6 sm:mb-8 md:mb-10 leading-relaxed">
            {festivals[currentImageIndex]?.description || FESTIVAL_DETAILS[currentImageIndex]?.description}
          </p>
          <div className="space-y-4 sm:space-y-6">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {festivals[currentImageIndex]?.name || FESTIVAL_DETAILS[currentImageIndex]?.name}
                </h3>
                <p className="text-secondary font-semibold text-sm mb-2">
                  {festivals[currentImageIndex]?.date || FESTIVAL_DETAILS[currentImageIndex]?.date}
                </p>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
