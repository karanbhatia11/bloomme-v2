"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/constants";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full bg-gradient-to-r from-primary-container/20 via-secondary-container/20 to-primary-container/20 text-on-surface mt-20 border-t border-outline-variant/20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Section - Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Image
              src={LOGO_URL}
              alt="Bloomme Logo"
              width={100}
              height={100}
              className="w-28 h-auto object-contain"
            />
            <div className="space-y-3">
              <p className="text-base font-semibold">Cultivating faith and freshness.</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Delivering the finest puja flowers and daily puja essentials to your home, every single day.
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              <motion.a
                href="https://instagram.com"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">public</span>
              </motion.a>
              <motion.a
                href="https://facebook.com"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">public</span>
              </motion.a>
              <motion.a
                href="https://twitter.com"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">public</span>
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">public</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Middle Section - Contact Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl mt-0.5">mail</span>
                <div>
                  <p className="text-on-surface-variant text-xs mb-0.5">Email</p>
                  <a href="mailto:info@bloomme.co.in" className="text-sm hover:text-primary transition-colors">
                    info@bloomme.co.in
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl mt-0.5">location_on</span>
                <div>
                  <p className="text-on-surface-variant text-xs mb-0.5">Location</p>
                  <p className="text-sm">Faridabad, Haryana</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold">Newsletter</h3>
            <p className="text-on-surface-variant text-sm">Tips for a mindful morning routine.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-sm rounded-xl bg-surface-container-low text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 text-sm rounded-full bg-primary-fixed text-on-primary font-bold hover:bg-primary-fixed-dim transition-colors"
              >
                JOIN
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
