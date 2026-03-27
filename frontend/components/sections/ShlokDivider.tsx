"use client";

import React from "react";
import { motion } from "framer-motion";

interface ShlokDividerProps {
  shlok: string;
  translation: string;
  author?: string;
}

export const ShlokDivider: React.FC<ShlokDividerProps> = ({
  shlok,
  translation,
  author,
}) => {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-r from-primary-container/20 via-secondary-container/20 to-primary-container/20 border-y border-outline-variant/20">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-primary text-lg">ॐ</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary"></div>
          </div>

          {/* Sanskrit Shlok */}
          <p className="text-lg md:text-xl font-display italic text-primary font-medium leading-relaxed">
            &ldquo;{shlok}&rdquo;
          </p>

          {/* English Translation */}
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            {translation}
          </p>

          {/* Author if provided */}
          {author && (
            <p className="text-xs md:text-sm text-on-surface-variant/70 pt-2">
              — {author}
            </p>
          )}

          {/* Decorative element */}
          <div className="flex items-center justify-center gap-3 mt-6 pt-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-primary text-lg">✦</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
