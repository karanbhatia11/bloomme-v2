"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";
import { SUBSCRIPTION_PLANS } from "@/constants";
import { Button } from "@/components/common/Button";

export default function PlansPage() {
  const router = useRouter();
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());

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
    <>
      <Navigation />
      <main className="min-h-screen bg-surface pt-32 pb-20">
        <section className="py-24 bg-surface relative overflow-hidden">
          {/* Decorative Flower Background */}
          <div className="absolute top-12 right-16 opacity-15 select-none pointer-events-none">
            <span className="material-symbols-outlined text-[200px] text-primary">
              local_florist
            </span>
          </div>
          <div className="absolute bottom-16 left-10 opacity-15 -rotate-12 select-none pointer-events-none">
            <span className="material-symbols-outlined text-[180px] text-secondary">
              local_florist
            </span>
          </div>
          <div className="absolute top-1/3 left-1/4 opacity-12 rotate-45 select-none pointer-events-none">
            <span className="material-symbols-outlined text-[160px] text-primary/50">
              local_florist
            </span>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Puja Flower Subscription Plans
              </h1>
              <p className="text-on-surface-variant">
                Tailored for your daily spiritual needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
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
                        ? "bg-primary text-on-primary scale-105 shadow-2xl"
                        : "bg-surface-container-lowest border border-transparent hover:border-primary-container/20"
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg z-20 flex items-center gap-2">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "16px" }}
                        >
                          favorite
                        </span>
                        Divine Choice
                      </div>
                    )}

                    <div className="h-64 overflow-hidden rounded-t-[2rem] bg-gray-50 flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={`${plan.name} puja flower arrangement — Bloomme daily subscription plan`}
                        width={400}
                        height={256}
                        className="w-full h-full object-contain object-center"
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

                      {expandedPlans.has(plan.id) && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mb-8 overflow-hidden"
                        >
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm">
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
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-sm opacity-40"
                            >
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{ fontSize: "20px" }}
                              >
                                cancel
                              </span>
                              {feature}
                            </li>
                          ))}
                        </motion.ul>
                      )}

                      <Button
                        variant={plan.highlighted ? "ghost" : "outline"}
                        size="lg"
                        className={`w-full ${
                          plan.highlighted ? "bg-on-primary text-primary hover:bg-on-primary/90" : ""
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
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-12 opacity-60">
            *Flower rotations vary based on seasonal availability
          </p>

          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/checkout/plan')}
              className="px-8 py-3 bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
            >
              Start Your Ritual Today
            </motion.button>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="max-w-screen-lg mx-auto px-8 py-6">
          <h2 className="text-3xl font-bold text-center mb-16 font-headline">
            Compare our rituals
          </h2>
          <div className="overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="p-6 font-semibold text-on-surface-variant text-sm">
                    Features
                  </th>
                  <th className="p-6 font-bold text-on-surface">Traditional</th>
                  <th className="p-6 font-bold text-primary">Divine</th>
                  <th className="p-6 font-bold text-on-surface">Celestial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                <tr>
                  <td className="p-6 text-sm text-on-surface-variant">
                    Flower Count
                  </td>
                  <td className="p-6 text-sm">80-100 gms</td>
                  <td className="p-6 text-sm font-semibold">120-150 gms</td>
                  <td className="p-6 text-sm">200 gms</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm text-on-surface-variant">
                    Exotic Variety
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-error/30">
                      close
                    </span>
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-primary">
                      done
                    </span>
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-primary">
                      done_all
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-sm text-on-surface-variant">
                    Rotational Variety
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-primary">
                      done
                    </span>
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-primary">
                      done
                    </span>
                  </td>
                  <td className="p-6 text-sm">
                    <span className="material-symbols-outlined text-primary">
                      done
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Social Proof / Bento Grid Style */}
        <section className="max-w-screen-xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface-container-low p-10 rounded-xl relative overflow-hidden group flex flex-col gap-6"
          >
            <div className="relative z-10 flex flex-col gap-6">
              <span className="material-symbols-outlined text-4xl text-primary">eco</span>
              <div>
                <h3 className="text-5xl font-black mb-2">100%</h3>
                <p className="text-lg font-semibold text-on-surface mb-1">Sustainably Crafted</p>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Every bloom is sourced from ethical local farms that prioritise soil health and water conservation. Fresh flowers, delivered with purpose — no compromises.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Eco Packaging", "Local Sourcing", "Zero Waste"].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="absolute right-[-20%] bottom-[-20%] opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[200px]">spa</span>
            </div>
          </motion.div>

<motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-tertiary p-10 rounded-xl text-on-tertiary flex flex-col gap-6"
          >
            <span className="material-symbols-outlined text-4xl">favorite</span>
            <div>
              <p className="text-5xl font-black leading-tight mb-2">4.9/5</p>
              <p className="text-on-tertiary/90 text-base font-semibold">Loved by our subscribers</p>
            </div>
            <p className="text-on-tertiary/70 text-sm leading-relaxed">
              Families across Faridabad rate us highly for freshness, punctuality, and the joy our flowers bring to their morning puja.
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
