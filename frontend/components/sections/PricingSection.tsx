"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SUBSCRIPTION_PLANS } from "@/constants";
import { Button } from "../common/Button";

export const PricingSection: React.FC = () => {
  const planImages = {
    traditional: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm",
    divine: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
    celestial: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-8Vvzd2Xx3c8ju93HjA4gPOAFSXVeHSRoAoG2zPfB9Rlh_rp8vAB33fDFUKyI94hvjJQ90aIBzynD6haHC3KDdes_fs-Vjhc7hrXbHMox1VUJNu9nTKJk6_rnKXQUoACkEliuItPVLeDfZVPiorKu2hdvVaFRZKKoAd4z3RJjMSEddo6xzk_AQCTmZ3Wikj8Q7ENW9SNtSe9NV9zCWwtfo9UPj8X30qhqbEwfsdvVFpxPEIn-ajau3SoQ5oSEr3q6l0dxudo3xuXL",
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

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Subscription Plans
          </h2>
          <p className="text-on-surface-variant">
            Tailored for your daily spiritual needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      favorite
                    </span>
                    Divine Choice
                  </div>
                )}

                <div className="h-48 overflow-hidden rounded-t-[2rem]">
                  <Image
                    src={imageSrc}
                    alt={plan.name}
                    width={400}
                    height={192}
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
