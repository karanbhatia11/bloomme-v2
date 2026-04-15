"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/constants";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full bg-gradient-to-r from-primary-container/20 via-secondary-container/20 to-primary-container/20 text-on-surface mt-12 sm:mt-20 border-t border-outline-variant/20 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
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
                href="https://www.facebook.com/share/1F7b5e79qy/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </motion.a>
              <motion.a
                href="https://www.instagram.com/bloommeofficial?igsh=ZHB6dzhkb3pncng4&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </motion.a>
              <motion.a
                href="mailto:info@bloomme.co.in"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                aria-label="Email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 w-full">
              <Link
                href="/contact"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary-fixed text-on-primary rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity active:scale-95 text-center min-h-[44px] flex items-center justify-center"
              >
                Get in Touch
              </Link>
              <Link
                href="/faq"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-surface-container to-surface-container-high text-primary rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity active:scale-95 text-center min-h-[44px] flex items-center justify-center"
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
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm rounded-xl bg-surface-container-low text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-3 text-xs sm:text-sm rounded-full bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors min-h-[44px] flex-shrink-0"
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
            <Link
              href="/contact"
              className="text-on-surface-variant hover:text-primary underline underline-offset-2 decoration-outline-variant/30 transition-colors"
            >
              Support
            </Link>
          </div>
          <p className="text-center text-on-surface-variant text-xs mt-6 opacity-60">
            © 2026 blomme Crafted for devotion
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
