"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SUBSCRIPTION_PLANS } from "@/constants";
import { Button } from "../common/Button";

export const PricingSection: React.FC = () => {
  const planImages = {
    traditional: "/images/traditional.png",
    divine: "/images/divine.png",
    celestial: "/images/celestial.png",
  };

  return (
    <section className="py-24 bg-surface-container-low relative overflow-hidden" id="plans">
      {/* Decorative Flower Background */}
      <div className="absolute top-12 right-16 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-primary">local_florist</span>
      </div>
      <div className="absolute bottom-16 left-10 opacity-15 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-secondary">local_florist</span>
      </div>
      <div className="absolute top-1/3 left-1/4 opacity-12 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-primary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Subscription Plans
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-on-surface-variant">
            Tailored for your daily spiritual needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const imageKey = (plan.name.toLowerCase() as keyof typeof planImages) || "traditional";
            const imageSrc = planImages[imageKey] || planImages.traditional;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`rounded-[2rem] flex flex-col relative ${
                  plan.highlighted
                    ? "bg-primary text-on-primary md:scale-105 shadow-2xl"
                    : "bg-surface-container-lowest border border-transparent hover:border-primary-container/20"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg z-20 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      favorite
                    </span>
                    Divine Choice
                  </div>
                )}

                <div className="h-64 overflow-hidden rounded-t-[2rem] bg-gray-50 flex items-center justify-center">
                  <Image
                    src={imageSrc}
                    alt={plan.name}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p
                    className={`text-sm mb-8 ${
                      plan.highlighted ? "opacity-70" : "text-on-surface-variant"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className={plan.highlighted ? "opacity-70" : ""}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontSize: "20px" }}
                        >
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                    {plan.disabled?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm opacity-40">
                        <span className="material-symbols-outlined text-sm" style={{ fontSize: "20px" }}>
                          cancel
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlighted ? "ghost" : "outline"}
                    size="lg"
                    className={`w-full ${
                      plan.highlighted ? "bg-on-primary text-primary hover:bg-on-primary/90" : ""
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
