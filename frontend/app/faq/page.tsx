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
    active: true,
  },
  {
    id: "plans",
    icon: "card_membership",
    label: "Plans",
  },
  {
    id: "subscription",
    icon: "calendar_month",
    label: "Subscription",
  },
  {
    id: "delivery",
    icon: "local_shipping",
    label: "Delivery",
  },
  {
    id: "quality",
    icon: "verified",
    label: "Quality",
  },
  {
    id: "sustainability",
    icon: "eco",
    label: "Sustainability",
  },
];

const FAQItems = [
  {
    category: "general",
    question: "What is Bloomme?",
    answer:
      "Bloomme is a subscription-based flower delivery service for daily puja and spiritual rituals. We deliver fresh, hygienic, and beautifully packed flowers directly to your doorstep early in the morning, so your flowers are ready before your daily prayers. Unlike traditional flower vendors, Bloomme focuses on freshness, variety, and reliability.",
  },
  {
    category: "general",
    question: "Why should I choose Bloomme instead of my local flower vendor?",
    answer:
      "Local vendors typically deliver low-quality flowers, the same flowers every day, sometimes skip delivery, and provide no hygiene or packaging. Bloomme solves these problems with fresh flowers sourced daily, different flowers rotated through the week, clean eco-friendly packaging, reliable morning delivery, and a pre-planned monthly subscription with no daily ordering hassle.",
  },
  {
    category: "general",
    question: "What makes Bloomme different?",
    answer:
      "Bloomme is designed to provide a premium daily puja experience. We offer fresh flowers every day, rotating flower combinations to avoid monotony, eco-friendly packaging, on-time early morning delivery, flexible subscription plans, custom delivery days, and add-ons like malas, lotus, and puja essentials. We don't just deliver flowers—we deliver a complete daily puja solution.",
  },
  {
    category: "general",
    question: "How does the Bloomme subscription work?",
    answer:
      "The process is simple: 1) Choose your plan (Basic, Premium, or Elite), 2) Select your preferred delivery days, 3) Complete your monthly subscription, 4) Receive fresh flowers at your doorstep every delivery day. Your flowers will arrive early in the morning before your prayer time.",
  },
  {
    category: "general",
    question: "Can I customize my flowers?",
    answer:
      "Yes, Bloomme allows limited customization. You can request a specific flower on a particular day, provided we receive the request at least 24 hours in advance. Since flowers are sourced fresh daily, full customization for every customer is not possible, but we do our best to accommodate special requests.",
  },
  {
    category: "plans",
    question: "What are the different Bloomme plans?",
    answer:
      "Bloomme offers three carefully designed plans: Basic Plan (perfect for simple daily puja with 3 types of flowers, rotated weekly, eco-friendly paper packaging), Premium Plan (for customers who want more variety with 3–4 flower varieties, premium packaging box, better combinations), and Elite Plan (most premium offering with 3 premium flower varieties around 200g, high-quality flowers including exotic varieties, premium box packaging).",
  },
  {
    category: "subscription",
    question: "Can I choose which days I want flowers?",
    answer:
      "Yes, Bloomme offers flexible delivery schedules. You can choose daily delivery, only weekdays, only weekends, specific days like Monday/Wednesday/Sunday, or any custom combination of days. Your monthly price automatically adjusts based on your selected days.",
  },
  {
    category: "subscription",
    question: "Can I pause my subscription?",
    answer:
      "Yes, you can easily pause your subscription if you are traveling, out of town, or temporarily not requiring deliveries. You can resume deliveries anytime without any hassle.",
  },
  {
    category: "subscription",
    question: "What if I want to change my delivery days?",
    answer:
      "You can modify your delivery schedule through your account anytime. Changes must be made at least 24 hours before the next delivery.",
  },
  {
    category: "subscription",
    question: "How do I subscribe?",
    answer:
      "Simply follow these steps: 1) Visit our website or application, 2) Sign up or Sign in, 3) Select your plan, 4) Choose delivery days, 5) Complete payment, 6) Start receiving fresh flowers.",
  },
  {
    category: "subscription",
    question: "Why is Bloomme subscription-based?",
    answer:
      "Daily ordering creates uncertainty for both customers and suppliers. Our subscription model ensures consistent flower supply, better flower quality, reliable early morning delivery, and stable pricing for customers. This allows us to maintain higher quality standards.",
  },
  {
    category: "delivery",
    question: "What time are the flowers delivered?",
    answer:
      "Flowers are delivered early in the morning, typically between 5:30 AM – 7:30 AM. This ensures flowers are available before most people perform their morning prayers.",
  },
  {
    category: "delivery",
    question: "What if I am not home during delivery?",
    answer:
      "No problem. Our delivery partners will safely place the flowers at your doorstep or designated location. You can also add delivery instructions during checkout.",
  },
  {
    category: "delivery",
    question: "What if flowers are damaged during delivery?",
    answer:
      "In the rare case of damaged flowers, please contact our support team. We will either arrange a replacement (if possible) or credit your account. Customer satisfaction is very important to us.",
  },
  {
    category: "delivery",
    question: "What if I need extra flowers or malas?",
    answer:
      "Bloomme offers Add-ons including flower malas, lotus flowers, special puja flowers, exotic flowers, and puja essentials like dhoop, diya, and agarbatti. Add-ons must be ordered 24 hours in advance.",
  },
  {
    category: "quality",
    question: "Where do your flowers come from?",
    answer:
      "Bloomme sources fresh flowers daily from trusted suppliers and carefully prepares them so they arrive at your doorstep fresh, fragrant, and ready for your prayers. We handpick fresh flowers to ensure freshness, fragrance, and quality.",
  },
  {
    category: "quality",
    question: "How fresh are the flowers?",
    answer:
      "Flowers are sourced early morning, sorted, packed, and delivered the same day. This ensures maximum freshness for your daily puja.",
  },
  {
    category: "sustainability",
    question: "Do you deliver everywhere?",
    answer:
      "Currently, Bloomme is launching in selected areas of Faridabad. We are starting with NIT areas and will expand gradually as demand grows.",
  },
  {
    category: "sustainability",
    question: "Is Bloomme environmentally friendly?",
    answer:
      "Yes, we focus on eco-friendly packaging using paper bags, recyclable materials, and minimal plastic usage. In the future, we also plan to reuse returned flowers for sustainable purposes.",
  },
  {
    category: "sustainability",
    question: "What happens to used flowers?",
    answer:
      "We are developing a flower return program. Customers who return previous day flowers for proper disposal may receive reward points. These points can later be redeemed for add-ons or special products.",
  },
  {
    category: "sustainability",
    question: "How can I contact Bloomme?",
    answer:
      "You can reach us through our website contact form, WhatsApp support, or email support. Our team will respond as quickly as possible. At Bloomme, we believe devotion deserves freshness, beauty, and reliability.",
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "general-0",
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
                  className="material-symbols-outlined mb-3 text-3xl text-primary"
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
                  className="bg-gradient-to-r from-primary to-primary-fixed text-on-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-95"
                >
                  Contact Concierge
                </Link>
                <a
                  href="https://wa.me/919950707995"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-surface-container-lowest to-surface-container-highest text-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-95"
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
