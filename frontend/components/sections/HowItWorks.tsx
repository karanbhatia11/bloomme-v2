"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/constants";

interface Card {
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksContent {
  title: string;
  subtitle: string;
  metadata?: {
    cards?: Card[];
  };
}

const DEFAULT_CONTENT: HowItWorksContent = {
  title: "How Our Flower Delivery Works",
  subtitle: "From our garden to your sanctuary in four mindful steps.",
  metadata: {
    cards: HOW_IT_WORKS
  }
};

export const HowItWorks: React.FC = () => {
  const [content, setContent] = useState<HowItWorksContent>(DEFAULT_CONTENT);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        const data = await response.json();
        const section = Array.isArray(data)
          ? data.find((item: any) => item.section_name === 'how-it-works')
          : null;

        if (section && section.metadata?.cards) {
          setContent({
            title: section.title || DEFAULT_CONTENT.title,
            subtitle: section.subtitle || DEFAULT_CONTENT.subtitle,
            metadata: section.metadata
          });
        }
      } catch (err) {
        // Keep DEFAULT_CONTENT on error
      }
    };

    fetchContent();
  }, []);

  const cards = content.metadata?.cards || DEFAULT_CONTENT.metadata?.cards || HOW_IT_WORKS;

  return (
    <section className="py-32 bg-surface-container-low overflow-hidden relative" id="how-it-works">
      {/* Decorative Flower Background */}
      <div className="absolute top-10 left-12 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-secondary">local_florist</span>
      </div>
      <div className="absolute bottom-20 right-8 opacity-15 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-primary">local_florist</span>
      </div>
      <div className="absolute top-1/2 right-12 opacity-12 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-secondary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {content.title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-on-surface-variant italic font-display mb-12 sm:mb-20 max-w-xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Connector Line (Hidden on Mobile) */}
          <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 border-t-2 border-dashed border-primary-container/30"></div>

          {cards.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg text-primary z-10 transition-transform hover:scale-110"
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  data-icon={step.icon}
                >
                  {step.icon}
                </span>
              </motion.div>
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-lg">{step.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed px-4">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
