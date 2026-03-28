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
    bestFor: ["New year puja setups", "Home entrance decor", "Festive subscriptions"],
  },
  {
    name: "Hanuman Jayanti",
    date: "📅 19 April 2026",
    description: "Offer devotion with marigold malas, sindoor, diyas, and sacred puja items dedicated to Lord Hanuman. Ideal for temple offerings, home puja, and strength-focused spiritual rituals.",
    bestFor: ["Marigold malas", "Sindoor kits", "Incense", "Diya sets"],
  },
  {
    name: "Akshaya Tritiya",
    date: "📅 27 April 2026",
    description: "A highly auspicious day symbolizing prosperity, abundance, and new purchases. Perfect for premium puja arrangements, lotus flowers, and complete spiritual setups for wealth and blessings.",
    bestFor: ["Premium Celestial plan", "Full puja kits", "Prosperity rituals"],
  },
  {
    name: "Buddha Purnima",
    date: "📅 1 May 2026",
    description: "A peaceful celebration focused on mindfulness, calmness, and spiritual reflection. Soft lotus flowers, diyas, and incense create a serene environment for meditation and prayer.",
    bestFor: ["Lotus flowers", "Calm puja setups", "Meditation offerings"],
  },
];

export const FestivalMode: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FESTIVAL_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="festivals" className="py-24 bg-surface relative overflow-hidden">
      {/* Decorative Flower Background */}
      <div className="absolute top-20 right-12 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-secondary">local_florist</span>
      </div>
      <div className="absolute bottom-12 left-8 opacity-15 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-primary">local_florist</span>
      </div>
      <div className="absolute top-1/2 left-1/3 opacity-12 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-secondary/50">local_florist</span>
      </div>

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
                  alt={FESTIVAL_IMAGES[currentImageIndex].alt}
                  src={FESTIVAL_IMAGES[currentImageIndex].src}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain object-center"
                  priority={currentImageIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {FESTIVAL_IMAGES.map((_, index) => (
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
            {FESTIVAL_DETAILS[currentImageIndex].description}
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
                  {FESTIVAL_DETAILS[currentImageIndex].name}
                </h3>
                <p className="text-secondary font-semibold text-sm mb-2">
                  {FESTIVAL_DETAILS[currentImageIndex].date}
                </p>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  {FESTIVAL_DETAILS[currentImageIndex].description}
                </p>
                <div>
                  <p className="text-xs font-bold uppercase text-secondary mb-2">Best for:</p>
                  <ul className="text-sm text-on-surface-variant space-y-1">
                    {FESTIVAL_DETAILS[currentImageIndex].bestFor.map((item, idx) => (
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
