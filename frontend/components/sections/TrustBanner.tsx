"use client";

import React from "react";
import { motion } from "framer-motion";

export const TrustBanner: React.FC = () => {
  const brands = [
    "ORGANIC INDIA",
    "VEDIC ROOTS",
    "HARVEST DAILY",
    "PRANA FLOWERS",
    "DIVINE CRAFT",
  ];

  return (
    <div className="py-12 bg-surface border-y border-outline-variant/10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1440px] mx-auto px-6 overflow-hidden flex flex-wrap justify-center gap-12 md:gap-24 grayscale hover:grayscale-0 transition-all duration-500"
      >
        {brands.map((brand, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="text-2xl font-black italic tracking-tighter whitespace-nowrap"
          >
            {brand}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
