"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/constants";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full bg-gradient-to-r from-primary-container/20 via-secondary-container/20 to-primary-container/20 text-on-surface mt-12 sm:mt-20 border-t border-outline-variant/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Left Section - Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            <Image
              src={LOGO_URL}
              alt="Bloomme Logo"
              width={100}
              height={100}
              className="w-24 sm:w-28 h-auto object-contain"
            />
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base font-semibold">Cultivating faith and freshness.</p>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Link
                href="/contact"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary-fixed text-on-primary rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity active:scale-95"
              >
                Get in Touch
              </Link>
              <Link
                href="/faq"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-surface-container to-surface-container-high text-primary rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity active:scale-95"
              >
                FAQ
              </Link>
            </div>
          </motion.div>

          {/* Right Section - Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-lg sm:text-xl font-bold">Newsletter</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm">Tips for a mindful morning routine.</p>
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

        {/* Legal Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-outline-variant/20 mt-12 pt-8"
        >
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <Link
              href="/faq"
              className="text-on-surface-variant hover:text-primary underline underline-offset-2 decoration-outline-variant/30 transition-colors"
            >
              FAQ
            </Link>
            <span className="text-outline-variant/30">•</span>
            <Link
              href="/privacy"
              className="text-on-surface-variant hover:text-primary underline underline-offset-2 decoration-outline-variant/30 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-outline-variant/30">•</span>
            <Link
              href="/terms"
              className="text-on-surface-variant hover:text-primary underline underline-offset-2 decoration-outline-variant/30 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-outline-variant/30">•</span>
            <a
              href="mailto:info@bloomme.co.in"
              className="text-on-surface-variant hover:text-primary underline underline-offset-2 decoration-outline-variant/30 transition-colors"
            >
              Support
            </a>
          </div>
          <p className="text-center text-on-surface-variant text-xs mt-6 opacity-60">
            © 2024 Bloomme Floral Atelier. Crafted for Devotion.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
