"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS, LOGO_URL } from "@/constants";

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_20px_40px_rgba(47,21,0,0.06)]">
      <div className="flex justify-between items-center w-full px-3 sm:px-4 md:px-6 lg:px-12 py-2 sm:py-3 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src={LOGO_URL}
            alt="Bloomme Logo"
            width={100}
            height={80}
            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-medium text-on-background opacity-80 hover:text-primary transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <button className="hidden md:block text-on-background opacity-70 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_bag</span>
          </button>
          <Link href="/login" className="hidden md:block text-sm font-medium text-on-background opacity-80 hover:text-primary transition-colors">
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-on-background"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-surface px-4 py-3 border-t border-outline-variant/10"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-sm font-medium text-on-background opacity-80 hover:text-primary transition-all"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
