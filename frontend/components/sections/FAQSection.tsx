"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ } from "@/constants";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-[800px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold tracking-tight text-center mb-16"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          {FAQ.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="bloom-hover w-full bg-white rounded-2xl p-6 border border-outline-variant/10 text-left font-bold text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <span>{faq.question}</span>
                  <motion.span
                    animate={{
                      rotate: openIndex === index ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="material-symbols-outlined"
                  >
                    expand_more
                  </motion.span>
                </div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface-container-lowest rounded-b-2xl overflow-hidden border border-t-0 border-outline-variant/10"
                  >
                    <div className="p-6 text-on-surface-variant">
                      <p>
                        {index === 0 &&
                          "We deliver between 5:30 AM - 7:30 AM every single day, right to your doorstep. You'll receive a notification 15 minutes before arrival."}
                        {index === 1 &&
                          "Absolutely! Use the app to customize your next day's flowers or essentials. You can change them anytime before midnight."}
                        {index === 2 &&
                          "No cancellation fee at all! You can pause or cancel anytime without any penalties. If you change your mind later, restart is free."}
                        {index === 3 &&
                          "During major festivals, your plan automatically upgrades with festival-specific flowers and essentials at no extra cost."}
                        {index === 4 &&
                          "Yes, we deliver 365 days a year, including Sundays and festivals. Your puja never pauses!"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
