"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS, LOGO_URL } from "@/constants";
import { useCart } from "@/context/CartContext";
import StickyCart from "@/components/checkout/StickyCart";

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.addons.reduce((s, a) => s + a.quantity, 0) + (cart.planId ? 1 : 0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_20px_40px_rgba(47,21,0,0.06)] overflow-x-hidden">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src={LOGO_URL}
            alt="Bloomme Logo"
            width={100}
            height={80}
            className="h-12 sm:h-16 md:h-20 w-auto object-contain max-h-24"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-4 md:gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs md:text-sm font-medium text-on-background opacity-80 hover:text-primary transition-all whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
          <button onClick={() => setIsCartOpen(!isCartOpen)} className="hidden sm:block text-on-background opacity-70 hover:text-primary transition-colors relative min-w-[44px] h-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_basket</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {isLoggedIn ? (
            <Link href="/dashboard" className="hidden md:block text-xs md:text-sm font-medium text-on-background opacity-80 hover:text-primary transition-colors whitespace-nowrap">
              My Account
            </Link>
          ) : (
            <Link href="/login" className="hidden md:block text-xs md:text-sm font-medium text-on-background opacity-80 hover:text-primary transition-colors whitespace-nowrap">
              Login
            </Link>
          )}
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
          <div className="border-t border-outline-variant/10 py-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="block py-3 text-sm font-medium text-on-background opacity-80 hover:text-primary transition-all"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="block py-3 text-sm font-medium text-on-background opacity-80 hover:text-primary transition-all"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </motion.div>
      )}
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};
