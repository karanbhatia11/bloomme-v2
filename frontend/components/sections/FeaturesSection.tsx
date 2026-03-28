"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const FeaturesSection: React.FC = () => {
  const featureImages = {
    pause: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm",
    addons: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
    festival: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-8Vvzd2Xx3c8ju93HjA4gPOAFSXVeHSRoAoG2zPfB9Rlh_rp8vAB33fDFUKyI94hvjJQ90aIBzynD6haHC3KDdes_fs-Vjhc7hrXbHMox1VUJNu9nTKJk6_rnKXQUoACkEliuItPVLeDfZVPiorKu2hdvVaFRZKKoAd4z3RJjMSEddo6xzk_AQCTmZ3Wikj8Q7ENW9SNtSe9NV9zCWwtfo9UPj8X30qhqbEwfsdvVFpxPEIn-ajau3SoQ5oSEr3q6l0dxudo3xuXL",
    control: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
    mainCard1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm",
    mainCard2: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
    mainCard3: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-8Vvzd2Xx3c8ju93HjA4gPOAFSXVeHSRoAoG2zPfB9Rlh_rp8vAB33fDFUKyI94hvjJQ90aIBzynD6haHC3KDdes_fs-Vjhc7hrXbHMox1VUJNu9nTKJk6_rnKXQUoACkEliuItPVLeDfZVPiorKu2hdvVaFRZKKoAd4z3RJjMSEddo6xzk_AQCTmZ3Wikj8Q7ENW9SNtSe9NV9zCWwtfo9UPj8X30qhqbEwfsdvVFpxPEIn-ajau3SoQ5oSEr3q6l0dxudo3xuXL",
  };

  return (
    <section className="py-24 bg-surface-container-low relative overflow-hidden" id="features">
      {/* Decorative Flower Background */}
      <div className="absolute top-16 right-10 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-secondary">local_florist</span>
      </div>
      <div className="absolute bottom-12 left-8 opacity-15 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-primary">local_florist</span>
      </div>
      <div className="absolute top-2/3 right-1/3 opacity-12 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-secondary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-12 sm:mb-16"
        >
          Designed for Devotion
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Card - Delivered Before The First Prayer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="p-6 sm:p-10 flex-grow flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 sm:mb-4">
                The Bloomme Standard
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Delivered Before<br />The First Prayer
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant mb-6 sm:mb-8">
                Our specialized logistics team ensures your flowers arrive between 5:30 AM and 7:30 AM, every single day.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 px-6 sm:px-10 pb-6 sm:pb-10">
              <div className="h-24 overflow-hidden rounded-lg">
                <Image
                  src={featureImages.mainCard1}
                  alt="Flowers"
                  width={150}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-24 overflow-hidden rounded-lg">
                <Image
                  src={featureImages.mainCard2}
                  alt="Flowers"
                  width={150}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-24 overflow-hidden rounded-lg">
                <Image
                  src={featureImages.mainCard3}
                  alt="Flowers"
                  width={150}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Pause Anytime */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-[#6b5b3d] text-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="h-40 overflow-hidden">
              <Image
                src={featureImages.pause}
                alt="Pause Anytime"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 flex-grow flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                  pause_circle
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pause Anytime</h3>
              <p className="text-sm opacity-80">
                Going on a vacation? Pause your subscription with a single tap in the app. No questions asked.
              </p>
            </div>
          </motion.div>

          {/* Full Control */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-[#2f1500] text-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="h-40 overflow-hidden">
              <Image
                src={featureImages.control}
                alt="Full Control"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 flex-grow flex flex-col justify-center relative">
              <h3 className="text-2xl font-bold mb-4">Full Control</h3>
              <p className="text-sm opacity-60">
                Manage your calendar, billing, and flower preferences in one place.
              </p>
              <span
                className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10"
                style={{ fontSize: "144px" }}
              >
                settings_suggest
              </span>
            </div>
          </motion.div>

          {/* Custom Add-ons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-[#f5e6d3] rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="h-40 overflow-hidden">
              <Image
                src={featureImages.addons}
                alt="Custom Add-ons"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Custom Add-ons</h3>
                <p className="text-on-surface-variant text-sm mb-6">
                  Need extra Ghee or Incense this Tuesday? Add it to your next box effortlessly.
                </p>
              </div>
              <div className="bg-white/50 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-on-surface">Saffron Pouch</span>
                  <span className="text-xs font-medium text-on-surface">+₹45</span>
                </div>
                <div className="w-full h-1 bg-primary/30 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Festival Specials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="h-40 overflow-hidden">
              <Image
                src={featureImages.festival}
                alt="Festival Specials"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 flex-grow flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface" style={{ fontSize: "24px" }}>
                  celebration
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Festival Specials</h3>
              <p className="text-sm text-on-surface-variant">
                Auto-upgrades for major festivals.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
