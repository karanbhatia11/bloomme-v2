"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SUBSCRIPTION_PLANS } from "@/constants";
import { Button } from "../common/Button";
import { useCart } from "@/context/CartContext";

const PLAN_ID_MAP: Record<string, string> = {
  Traditional: "TRADITIONAL",
  Divine: "DIVINE",
  Celestial: "CELESTIAL",
};

export const PricingSection: React.FC = () => {
  const router = useRouter();
  const { setPlan } = useCart();
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());

  const handleSelectPlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    const planId = PLAN_ID_MAP[plan.name] || "TRADITIONAL";
    setPlan(planId, plan.name, plan.price);
    localStorage.setItem("checkout_plan", planId);
    router.push("/checkout/plan");
  };

  const toggleExpandPlan = (planId: number) => {
    setExpandedPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const planImages = {
    traditional: "/images/Traditional_Updated.jpg",
    divine: "/images/Divine_Updated.jpg",
    celestial: "/images/Celestial_Updated.jpg",
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

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Puja Flower Subscription Plans
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-on-surface-variant px-2 sm:px-0">
            Tailored for your daily spiritual needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
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
                className={`rounded-[1.5rem] sm:rounded-[2rem] flex flex-col relative w-full ${
                  plan.highlighted
                    ? "bg-primary text-on-primary lg:scale-105 shadow-2xl"
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

                <div className="h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden rounded-t-[1.5rem] sm:rounded-t-[2rem] bg-gray-50 flex items-center justify-center w-full">
                  <Image
                    src={imageSrc}
                    alt={plan.name}
                    width={400}
                    height={256}
                    className="w-full h-full object-contain object-center"
                  />
                </div>

                <div className="p-6 sm:p-8 lg:p-10 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{plan.name}</h3>
                  <p
                    className={`text-xs sm:text-sm mb-6 sm:mb-8 ${
                      plan.highlighted ? "opacity-70" : "text-on-surface-variant"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2 justify-center">
                    <span className="text-3xl sm:text-4xl font-bold">₹{plan.price}</span>
                    <span className={`text-xs sm:text-sm ${plan.highlighted ? "opacity-70" : ""}`}>
                      {plan.period}
                    </span>
                    {plan.originalPrice && (
                      <span className={`text-xl sm:text-2xl font-semibold line-through leading-none ${plan.highlighted ? "opacity-50" : "text-on-surface-variant opacity-60"}`}>
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>

                  {expandedPlans.has(plan.id) && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 mb-8 overflow-hidden"
                    >
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
                    </motion.ul>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className={`w-full text-center justify-center ${
                      plan.highlighted ? "border-white text-white hover:bg-white/20" : ""
                    }`}
                    onClick={() => toggleExpandPlan(plan.id)}
                  >
                    {expandedPlans.has(plan.id) ? "Show Less" : "Show More Details"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8 opacity-60">
          *Flower rotations vary based on seasonal availability
        </p>

        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/checkout/plan')}
            className="px-8 py-3 bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
          >
            Start Your Ritual Today
          </motion.button>
        </div>
      </div>
    </section>
  );
};
