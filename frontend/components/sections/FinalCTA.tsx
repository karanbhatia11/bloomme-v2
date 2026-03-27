"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/constants";
import { Button } from "../common/Button";

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-32 bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#2f1500] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-container rounded-full blur-[120px]"></div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <Image
              alt="Bloomme Logo White"
              src={LOGO_URL}
              width={128}
              height={128}
              className="h-32 w-auto mx-auto mb-12 invert grayscale brightness-200"
            />

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
              Bring Divine Purity <br />
              to Your Home
            </h2>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Join 5000+ families who wake up to fresh flowers and a peaceful
              morning ritual.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-primary-container text-on-primary-container px-10 hover:bg-primary-container/90"
                >
                  Start Your Subscription
                </Button>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-10 py-5 rounded-2xl font-bold text-lg active:scale-95 transition-all hover:bg-white/20"
              >
                Download App
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
