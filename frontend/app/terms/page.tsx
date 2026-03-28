"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";
import { LOGO_URL } from "@/constants";

const sections = [
  {
    id: "tos",
    title: "Terms of Service",
    subsections: [
      {
        number: "01",
        heading: "Acceptance of Terms",
        content:
          "By accessing Bloomme Floral Atelier, you agree to be bound by these high-standard operational guidelines. Our commitment to floral excellence requires a mutual understanding of boutique commerce ethics. If you do not agree to these terms, we kindly ask you to refrain from utilizing our botanical services.",
      },
      {
        number: "02",
        heading: "Artisanal Variability",
        content:
          "Nature is inherently unique. Please acknowledge that every arrangement is a living sculpture. While we strive for consistency, seasonal availability and individual bloom characteristics mean that your specific delivery may vary subtly from the photographic representations on our digital gallery.",
      },
      {
        number: "03",
        heading: "Subscription Obligations",
        content:
          "Floral subscriptions are curated experiences. Members are responsible for maintaining accurate delivery coordinates. Cancellations or pauses must be requested no less than 72 hours prior to the scheduled delivery window to ensure the freshness of our inventory management.",
      },
      {
        number: "04",
        heading: "Intellectual Property",
        content:
          "All floral designs, photography, branding, and narrative elements on this platform are the exclusive intellectual property of Bloomme Floral Atelier. Unauthorized reproduction of our aesthetic identity is strictly prohibited under artisanal copyright laws.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 inline-block">
            <img
              alt="Bloomme Logo"
              className="w-40 h-auto object-contain"
              src={LOGO_URL}
            />
          </div>
          <h1 className="font-display font-extrabold text-5xl tracking-tighter text-on-surface mb-4">
            Legal Framework
          </h1>
          <p className="font-accent italic text-xl text-primary max-w-lg mx-auto leading-relaxed">
            Cultivating trust through transparency and artisanal devotion.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <span className="px-4 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-semibold uppercase tracking-widest">
              Effective Date: June 2024
            </span>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          className="bg-surface-container-low rounded-[2rem] p-8 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>

          <div className="flex flex-col md:flex-row gap-12 mb-12">
            {/* Table of Contents */}
            <motion.div
              className="w-full md:w-1/3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="sticky top-24 space-y-6">
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-secondary">
                  Table of Contents
                </h3>
                <nav className="flex flex-col gap-3">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-sm font-semibold text-primary hover:translate-x-1 transition-transform inline-flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {section.title}
                    </a>
                  ))}
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                    Privacy Policy
                  </Link>
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="w-full md:w-2/3 space-y-12"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="text-3xl font-black tracking-tighter mb-8 border-b border-outline-variant pb-4 text-on-surface">
                    {section.title}
                  </h2>

                  {section.subsections.map((subsection, idx) => (
                    <motion.div
                      key={idx}
                      className="mb-8"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      <h3 className="text-lg font-bold mb-3 text-on-surface flex items-start gap-3">
                        <span className="font-accent italic text-2xl text-primary flex-shrink-0">
                          {subsection.number}.
                        </span>
                        {subsection.heading}
                      </h3>
                      <p className="text-on-surface-variant leading-relaxed mb-4">
                        {subsection.content}
                      </p>
                    </motion.div>
                  ))}
                </section>
              ))}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            className="mt-16 p-8 bg-surface-container-highest rounded-2xl border border-outline-variant/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div>
                <h4 className="font-display font-bold text-lg text-on-surface">
                  Need Clarification?
                </h4>
                <p className="text-on-surface-variant text-sm mt-1">
                  Our concierge team is available to discuss any legal inquiries.
                </p>
              </div>
              <Link
                href="/contact"
                className="bg-gradient-to-r from-on-background to-on-background/70 text-surface px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95 whitespace-nowrap"
              >
                Contact Legal Counsel
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
