"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/constants";

export const ProductShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PRODUCTS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 320 : 400;
      const gap = 32;
      const scrollPosition = activeIndex * (cardWidth + gap);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  return (
    <section className="py-32 bg-surface relative overflow-hidden" id="add-ons">
      {/* Decorative Flower Background */}
      <div className="absolute top-20 left-12 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-primary">local_florist</span>
      </div>
      <div className="absolute bottom-16 right-8 opacity-15 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-secondary">local_florist</span>
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-12 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-primary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-4xl font-black tracking-tight">Add Ons</h2>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </motion.button>
          </div>
        </div>

        <div ref={carouselRef} className="flex overflow-x-auto gap-8 no-scrollbar pb-10">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[320px] md:min-w-[400px] bg-surface-container-low rounded-[40px] overflow-hidden shadow-bloom transition-all group"
            >
              <div className="h-96 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${product.image}')` }}
                />
              </div>
              <div className="p-8">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                  {product.category}
                </span>
                <h4 className="text-2xl font-black mt-2 mb-4">{product.title}</h4>
                <p className="text-on-surface-variant text-sm mb-6">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">₹{product.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
