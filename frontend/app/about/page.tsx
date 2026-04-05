"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

interface PageContent {
  hero?: any;
  story?: any;
  values?: any;
  cta?: any;
}

export default function AboutPage() {
  const [content, setContent] = useState<PageContent>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=about');
        if (!response.ok) {
          console.warn('Failed to fetch about content:', response.status);
          return;
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          const pageContent: PageContent = {};
          data.forEach((item: any) => {
            pageContent[item.section_name as keyof PageContent] = item;
          });
          setContent(pageContent);
        }
      } catch (err) {
        // Keep empty content, fallbacks render default text
      }
    };

    fetchContent();
  }, []);

  const hero = content.hero || {};
  const story = content.story || {};
  const values = content.values || {};
  const cta = content.cta || {};

  return (
    <main className="min-h-screen bg-surface">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[716px] flex items-center px-8 md:px-20 overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            className="lg:col-span-7 z-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-secondary font-semibold tracking-[0.2em] text-xs uppercase mb-4 block">
              {hero.subtitle || "Our Story"}
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tighter text-on-background leading-[1.1] mb-6">
              {hero.title || "About Bloomme"}{" "}
              <span className="font-accent italic font-normal text-primary">
                {hero.accent || "Puja Flower Delivery in Faridabad"}
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed mb-8">
              {hero.description || "Bloomme is a daily puja flower delivery subscription service based in Faridabad, Haryana. We deliver fresh, hand-picked marigolds, jasmine, and seasonal flowers to your doorstep every morning between 5:30 and 7:30 AM so your altar is ready before your first prayer."}
            </p>
            <div className="flex items-center gap-8">
              <div className="h-px w-16 bg-outline-variant/30"></div>
              <p className="font-accent italic text-tertiary text-xl">
                {hero.metadata?.since || "Founded 2026"}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl hover:shadow-xl transition-all duration-500">
              <img
                className="w-full h-full object-cover"
                alt="Bloomme founder curating fresh puja flower arrangements in Faridabad"
                src={hero.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBbPchiGMM45_qQyJbBdhsOj02PEo8KNhZYKiZ5hAF2RrH74Wb3gjoiWpWAmLnfVqNmW5yVBgwRsXU9ZT0EUpFfuA8lF94DPUp8-5FdLAWbvClwE9b5OH2yb8bbF0QBjagIO7vF1iqHA6SrTfNzoFnMZ5vOM9qpRMRTtNPouJ4wS9uM_skkUWjXxvEK7kTx0rUIYv3F-sGl-LUqkegZNy6XQXZLRaiU52btZDSNX0sW_VZQQyqN5jyRVE-cInNKxufmHldvLd-mz-kL"}
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-xl overflow-hidden shadow-xl hidden md:block">
              <img
                className="w-full h-full object-cover"
                alt="Fresh marigold and jasmine puja flowers for daily worship in Faridabad"
                src={hero.metadata?.secondary_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAmuJSsl2nCgozTNhhHsVC5LzpWPUKYE6-N8YueZ6UqZ4o1Tp5aJ_RIrWiFAenOfHSnClcmWl2ng4f8JWBXNdIvSMkEIeERC2wMk0mbCsXR-7CxUQ_6ftXYsIhTe_qMNwmtehPtuyP_447nqz6NgPNf4WWKqXRqOUBegDm7YadNHGRvmj8YQ48xX6J9KjJavx1GnVHA325IXb3umto_of8MIvML_-S9Zc9Ce-p3mG5mpmB2OTykw9flXflvf3vgylPysvZh4TAuDC-M"}
              />
            </div>
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-container-low -z-10 translate-x-20"></div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-8 md:px-20 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-surface-container p-12 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <span className="text-5xl">✨</span>
                </div>
                <h2 className="font-display font-bold text-3xl mb-6 text-on-surface">
                  {story.title || "Our Story"}
                </h2>
                <div className="space-y-6 text-on-surface-variant leading-relaxed">
                  <p>
                    {story.description || "Bloomme was born in Faridabad when our founder faced the same frustration every devotee knows. Waking up early for puja only to find the local vendor had skipped delivery again, or worse, brought yesterday's wilted flowers. We built a system to fix that."}
                  </p>
                  <p className="font-accent italic text-xl text-primary-container leading-relaxed">
                    &ldquo;{story.metadata?.quote || "A reliable, subscription-based puja flower delivery service that puts fresh flowers at your door before sunrise, every single day."}&rdquo;
                  </p>
                  <p>
                    {story.metadata?.closing || "Today Bloomme serves devotees across Faridabad with hand-picked marigolds, jasmine, and seasonal flowers sourced fresh every morning. We are not just a flower delivery service. We are your daily ritual, made reliable."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2 space-y-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-accent italic text-4xl text-tertiary">
                Our Mission
              </h3>
              <p className="text-2xl font-light text-on-background leading-relaxed">
                {story.metadata?.mission || "To make fresh puja flower delivery so reliable and effortless that every devotee in India can start their morning with intention, not inconvenience."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {story.metadata?.stats?.map((stat: any, idx: number) => (
                  <div key={idx} className="aspect-square bg-surface-container-highest rounded-xl flex items-center justify-center p-8 text-center hover:shadow-lg transition-shadow">
                    <div>
                      <p className="text-4xl font-bold text-primary mb-2">
                        {stat.number}
                      </p>
                      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                )) || (
                  <>
                    <div className="aspect-square bg-surface-container-highest rounded-xl flex items-center justify-center p-8 text-center hover:shadow-lg transition-shadow">
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">100+</p>
                        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Families Served</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-surface-container-highest rounded-xl flex items-center justify-center p-8 text-center hover:shadow-lg transition-shadow">
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">5:30 AM</p>
                        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Daily Delivery</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-surface-container-highest rounded-xl flex items-center justify-center p-8 text-center hover:shadow-lg transition-shadow">
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">4.9★</p>
                        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Customer Rating</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-surface-container-highest rounded-xl flex items-center justify-center p-8 text-center hover:shadow-lg transition-shadow">
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">2026</p>
                        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Founded in Faridabad</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-8 md:px-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-4xl mb-4">
              {values.title || "What We Stand For"}
            </h2>
            <p className="font-accent italic text-xl text-on-surface-variant">
              {values.subtitle || "The principles behind every puja flower delivery we make."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              className="md:col-span-2 bg-surface-container-lowest p-10 rounded-3xl flex flex-col justify-between group hover:bg-primary-container transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="text-4xl mb-6 block group-hover:text-on-primary-container transition-colors">
                  🌿
                </span>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-on-primary-container transition-colors">
                  Freshness
                </h3>
                <p className="text-on-surface-variant group-hover:text-on-primary-container/80 transition-colors">
                  Every flower is sourced the same morning it is delivered. No cold storage, no day-old blooms. What arrives at your door was picked before sunrise to be offered at sunrise.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-surface-container-highest p-10 rounded-3xl flex flex-col justify-center text-center hover:shadow-lg transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-4xl mb-4 mx-auto">🛕</span>
              <h3 className="text-xl font-bold mb-2">Devotion</h3>
              <p className="text-sm text-on-surface-variant">
                Honoring the spiritual tradition behind every puja with flowers chosen for their ritual significance.
              </p>
            </motion.div>

            <motion.div
              className="bg-surface-container-high p-10 rounded-3xl flex flex-col justify-center text-center hover:shadow-lg transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-4xl mb-4 mx-auto">♻️</span>
              <h3 className="text-xl font-bold mb-2">Sustainability</h3>
              <p className="text-sm text-on-surface-variant">
                Eco-friendly banana leaf and paper packaging. Zero plastic in every delivery.
              </p>
            </motion.div>

            <motion.div
              className="md:col-span-4 bg-on-background p-12 rounded-3xl flex flex-col md:flex-row items-center gap-12 text-surface overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex-1 z-10">
                <h3 className="text-3xl font-bold mb-4 text-primary-fixed">
                  Community
                </h3>
                <p className="text-surface-variant/80 text-lg leading-relaxed">
                  We source from local growers in and around Faridabad, keeping the supply chain short and the flowers fresh. Every subscription directly supports small-scale farmers in Haryana.
                </p>
              </div>
              <div className="flex-1 w-full h-48 md:h-full relative overflow-hidden rounded-2xl">
                <img
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Bloomme devotee community receiving daily puja flower subscription in Faridabad"
                  src={values.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDkiE3cSJuD5LxWveSo1NfyQRiY0dRhl6yhANWSj1yUFEBGjUbjUw0zQDyK3FD3pIqg-x5R8AnTg-mW1Ul9-NpQu005_AU59n-wTsRaONTsDdz5p-WKS0JGUXHVe9W1Oxbh-5da2Ms_v-P9cx7T7hz0xBj4XODbJBf3p9bnWSTciSXWMsd5_gYsfb9ptXoht4QvLGtn7FGzpvnqO9UFeD6jmPrRzWXQtjMlMh8IN_sn9uriz382JW5yW8QL4EW0__gQrZR6juxOEurz"}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 md:px-20">
        <motion.div
          className="max-w-5xl mx-auto bg-primary-container rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="font-display font-extrabold text-4xl md:text-6xl text-on-primary-container mb-8 tracking-tighter">
              {cta.title || "Start Your Daily Puja Flower Subscription"}
            </h2>
            <p className="text-on-primary-container/80 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              {cta.subtitle || "Join over 100 families in Faridabad who receive fresh puja flowers at their doorstep every morning. Plans starting from ₹59 per day."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/plans"
                className="bg-on-primary-container text-surface px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-95"
              >
                {cta.cta_text || "View Subscription Plans"}
              </Link>
              <Link
                href="/faq"
                className="bg-surface-container-highest text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-surface-container transition-all active:scale-95"
              >
                Read FAQ
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-10 text-8xl">
            🌸
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
