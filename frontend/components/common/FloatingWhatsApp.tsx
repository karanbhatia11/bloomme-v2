"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const PHONE_NUMBER = "9950707995";
const WHATSAPP_URL = `https://wa.me/91${PHONE_NUMBER}`;

export const FloatingWhatsApp: React.FC = () => {
  return (
    <motion.div
      className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all active:scale-95 group min-w-[56px] min-h-[56px]"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="text-2xl sm:text-3xl">💬</span>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 sm:mb-3 right-0 bg-on-surface text-surface px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          WhatsApp us!
        </div>
      </Link>
    </motion.div>
  );
};
