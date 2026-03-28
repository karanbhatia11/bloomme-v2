"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

const FAQCategories = [
  {
    id: "general",
    icon: "info",
    label: "General",
  },
  {
    id: "delivery",
    icon: "local_shipping",
    label: "Delivery",
    active: true,
  },
  {
    id: "subscription",
    icon: "calendar_month",
    label: "Subscription",
  },
  {
    id: "payment",
    icon: "payments",
    label: "Payment",
  },
  {
    id: "festival",
    icon: "auto_awesome",
    label: "Festival Upgrades",
    secondary: true,
  },
  {
    id: "referral",
    icon: "group_add",
    label: "Referrals",
  },
];

const FAQItems = [
  {
    category: "delivery",
    question: "Can I schedule a specific time for my flower delivery?",
    answer:
      "Yes! We offer time-slot selection during checkout. For our premium subscribers, we provide a 1-hour delivery window tracking. Standard orders can choose between Morning (9 AM - 1 PM) and Evening (4 PM - 8 PM) slots.",
  },
  {
    category: "delivery",
    question: "Do you offer same-day delivery for artisan bouquets?",
    answer:
      "Same-day delivery is available for orders placed before 1:00 PM local time. Please note that certain 'Reserve Collection' arrangements require a 24-hour lead time to ensure the rarest stems are sourced fresh from our growers.",
  },
  {
    category: "delivery",
    question: "How are the flowers kept fresh during transport?",
    answer:
      "We use custom-engineered climate-controlled delivery pods. Each bouquet is housed in a hydration-lock base containing our proprietary nutrient solution, ensuring they remain at peak freshness from our atelier to your doorstep.",
  },
  {
    category: "festival",
    question: "Can I customize a bouquet for religious festivals?",
    answer:
      "Absolutely. Our 'Ritual Collection' is specifically designed for ceremonies. You can select traditional flowers like Marigolds, Lotus, or Jasmine. Use the 'Festival Upgrade' toggle in your cart to include ritual-specific packaging.",
  },
  {
    category: "festival",
    question: "What is included in the 'Sacred Offering' pack?",
    answer:
      "The Sacred Offering pack includes hand-picked ceremonial grade flowers, a curated selection of eco-friendly incense, and a vial of artisanal rose water, all delivered in a biodegradable, compostable woven basket.",
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("delivery");
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "delivery-0",
  ]);

  const filteredFAQs = FAQItems.filter((item) => item.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <main className="min-h-screen bg-surface">
      <Navigation />

      <div className="pt-32 pb-20">
        {/* Hero Section */}
        <motion.section
          className="max-w-4xl mx-auto px-6 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <span className="text-secondary font-semibold tracking-[0.2em] text-xs uppercase">
              Help Center
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold tracking-tighter mb-4 text-on-background">
            How can we{" "}
            <span className="font-accent italic font-normal text-primary">
              assist you
            </span>{" "}
            today?
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-12">
            Explore our curated guide to gifting, subscriptions, and our
            artisanal floral processes.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">
                search
              </span>
            </div>
            <input
              className="w-full pl-14 pr-6 py-6 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary-container shadow-sm transition-all text-lg placeholder:text-outline-variant"
              placeholder="Search for delivery times, flower care, or referral codes..."
              type="text"
            />
          </div>
        </motion.section>

        {/* Category Grid */}
        <motion.section
          className="max-w-7xl mx-auto px-6 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FAQCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-6 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary-container border-2 border-primary"
                    : "bg-surface-container-lowest hover:bg-surface-container-highest"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`material-symbols-outlined mb-3 text-3xl ${
                    category.secondary ? "text-secondary" : "text-primary"
                  }`}
                >
                  {category.icon}
                </span>
                <span className="text-sm font-semibold text-on-surface">
                  {category.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* FAQ Accordions */}
        <motion.section
          className="max-w-4xl mx-auto px-6 space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-on-background">
              <span className="material-symbols-outlined text-primary">
                {FAQCategories.find((c) => c.id === selectedCategory)?.icon}
              </span>
              {FAQCategories.find((c) => c.id === selectedCategory)?.label}
            </h2>
          </div>

          {filteredFAQs.map((item, index) => {
            const itemId = `${selectedCategory}-${index}`;
            const isExpanded = expandedItems.includes(itemId);

            return (
              <motion.div
                key={itemId}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => toggleExpanded(itemId)}
                  className={`w-full flex justify-between items-center p-6 cursor-pointer transition-all ${
                    isExpanded ? "bg-surface-container-low" : ""
                  }`}
                >
                  <span className="text-lg font-semibold text-on-surface text-left">
                    {item.question}
                  </span>
                  <motion.span
                    className="material-symbols-outlined text-outline flex-shrink-0 ml-4"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    expand_more
                  </motion.span>
                </button>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="max-w-4xl mx-auto px-6 mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-surface-container rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4 text-on-background">
                Still have questions?
              </h3>
              <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
                Our floral consultants are available 24/7 to help you choose
                the perfect arrangement for your devotion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-95"
                >
                  Contact Concierge
                </Link>
                <a
                  href="https://wa.me/919950707995"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-lowest text-primary px-8 py-3 rounded-xl font-semibold hover:bg-surface-container-highest transition-colors active:scale-95"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </main>
  );
}
