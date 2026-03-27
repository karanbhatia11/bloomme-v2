"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const FESTIVAL_IMAGES = [
  {
    alt: "Diwali Lights",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7C8yfQ-vt6ULu2wKoL7OP13ar13RsmcXnffj_-c4cmj0jxsz_Jy-3304xOkZKO0stkNN_h7CCv_9_9nO1didaieHrevHVjvu_yonqpbizvrc4-y41ermDCkK9e0pdOs5mjWTooQOEk-gZn8ZilMaba6cAwNd_qDdjQSciYkknTzVFR7pFZ09YVLe9bTw8SH_X1ykMUrc6b_h6eqJsP8N1w0vQ9z21_03Y7jnnJ0u00m0xYyrLv-j9O1zj4p73VRYBJAE7msEbhZvH",
  },
  {
    alt: "Ganesh Chaturthi",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd0-84wxBJfdq3134lg128mQChLtCMYzK18NNhk0THVaByXB-yfNGPqYgoBjCP8iUVLs00OJkB0tlZT5bDEKnsz8BD3A8VOCWd8bS4BjQEmO5x-qpgs4SGqNiePyAXFaHCJ38soazN9uB_kXJV6hdN9KBW_ESSb3vNYwv3qryN_MHQqhzWGHMmEblPIKbNxh7tUayhKp5CjfelV9-TgRrtPoXu-y3OZdVSqAyQeFAsdhEJdRA_uN03u2C-U-lgjIaOHl4wVwfLyGgU",
  },
  {
    alt: "Navratri Celebration",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDh4Hu7y1K8D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B",
  },
  {
    alt: "Holi Festival",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuFi5Iv8z2L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I",
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

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1 relative bloom-image-trigger"
        >
          <div className="relative aspect-square rounded-3xl shadow-xl overflow-hidden bg-surface-container">
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
                  className="object-cover"
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
          <span className="editorial-accent text-2xl text-secondary block mb-4">
            Celestial Celebrations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Festival Mode: <br />
            Never Miss a Ritual
          </h2>
          <p className="text-lg text-on-surface-variant mb-10 leading-relaxed">
            During Diwali, Navratri, or Ganesh Chaturthi, Bloomme automatically
            upgrades your daily box with traditional garlands, specific auspicious
            flowers, and ritual essentials required for the occasion.
          </p>
          <div className="space-y-4">
            <motion.div
              whileHover={{ x: 8 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "24px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  stars
                </span>
              </div>
              <div>
                <p className="font-bold">Diwali Special</p>
                <p className="text-sm text-on-surface-variant">
                  Laxmi Puja essentials &amp; decorative garlands included.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 8 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "24px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  stars
                </span>
              </div>
              <div>
                <p className="font-bold">Ganesh Chaturthi</p>
                <p className="text-sm text-on-surface-variant">
                  Durva grass and Hibiscus flowers prioritized.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
