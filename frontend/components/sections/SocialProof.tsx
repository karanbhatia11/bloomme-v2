"use client";

import React from "react";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/constants";

export const SocialProof: React.FC = () => {
  return (
    <section className="py-20 bg-surface relative overflow-hidden">
      {/* Decorative Petal Elements */}
      <div className="absolute top-20 left-10 opacity-15 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-secondary">local_florist</span>
      </div>
      <div className="absolute bottom-20 right-10 opacity-15 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-primary">local_florist</span>
      </div>
      <div className="absolute top-1/2 left-1/2 opacity-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-primary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">Voices of Devotion</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Join over 2,000 families in Faridabad who have transformed their morning rituals with Bloomme.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface p-10 rounded-[32px] shadow-xl shadow-on-surface/5 flex flex-col gap-6"
            >
              <div className="flex gap-1 text-primary">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-lg leading-relaxed italic font-display">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div
                  className="w-12 h-12 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${testimonial.image}')` }}
                />
                <div>
                  <h5 className="font-bold">{testimonial.name}</h5>
                  <p className="text-xs text-on-surface-variant">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
