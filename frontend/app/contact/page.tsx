"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

const PHONE_NUMBER = "9950707995";
const EMAIL = "info@bloomme.co.in";
const WHATSAPP_URL = `https://wa.me/91${PHONE_NUMBER}`;

interface PageContent {
  intro?: any;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Floral Subscription Inquiry",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [content, setContent] = useState<PageContent>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=contact');
        if (!response.ok) {
          console.warn('Failed to fetch contact content:', response.status);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "Floral Subscription Inquiry",
          message: "",
        });
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 3000);
      }
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const intro = content.intro || {};

  return (
    <main className="min-h-screen bg-surface">
      <Navigation />

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="mb-20 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-8">
            <span className="text-secondary font-semibold tracking-[0.2em] text-xs uppercase">
              Get In Touch
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-on-surface max-w-2xl leading-[0.9]">
            {intro.title ? (
              <>{intro.title}</>
            ) : (
              <>
                Contact{" "}
                <span className="font-accent italic font-normal text-primary">
                  Bloomme
                </span>
              </>
            )}
          </h1>
          <p className="text-on-surface-variant max-w-lg text-lg leading-relaxed pt-4">
            {intro.subtitle || "Whether you're planning a grand ceremony or a quiet gesture of love, our florists are here to guide your choice."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Contact Form Section */}
          <motion.section
            className="space-y-12"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">
                  Full Name
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-4 text-lg focus:ring-0 placeholder:text-outline-variant transition-all focus:border-primary"
                  placeholder="Your name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-4 text-lg focus:ring-0 placeholder:text-outline-variant transition-all focus:border-primary"
                    placeholder="hello@example.com"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">
                    Phone Number
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-4 text-lg focus:ring-0 placeholder:text-outline-variant transition-all focus:border-primary"
                    placeholder="+91 000 000 0000"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">
                  Subject
                </label>
                <select
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-4 text-lg focus:ring-0 text-on-surface transition-all appearance-none cursor-pointer focus:border-primary"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option>Floral Subscription Inquiry</option>
                  <option>Wedding & Events</option>
                  <option>Order Status</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">
                  Your Message
                </label>
                <textarea
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-4 text-lg focus:ring-0 placeholder:text-outline-variant transition-all resize-none focus:border-primary"
                  placeholder="Tell us about your floral needs..."
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-on-primary transition-all duration-200 bg-primary rounded-xl hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20 overflow-hidden disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && (
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {submitStatus === "success" && (
                <p className="text-secondary font-semibold">
                  ✓ Message sent! We&rsquo;ll be in touch soon.
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-error font-semibold">
                  Something went wrong. Please try again or contact us directly.
                </p>
              )}
            </form>
          </motion.section>

          {/* Contact Information Section */}
          <motion.section
            className="lg:sticky lg:top-32 space-y-12"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-surface-container-low p-12 rounded-[2.5rem] space-y-10">
              <div>
                <h3 className="font-accent italic text-2xl text-secondary mb-8">
                  Visit the Atelier
                </h3>
                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-surface-container-highest rounded-xl text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Email Us</p>
                      <a
                        className="text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant/30"
                        href={`mailto:${EMAIL}`}
                      >
                        {EMAIL}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-surface-container-highest rounded-xl text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">call</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">
                        Call Directly
                      </p>
                      <a
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        href={`tel:+91${PHONE_NUMBER}`}
                      >
                        +91 {PHONE_NUMBER.slice(0, 4)} {PHONE_NUMBER.slice(4, 7)}{" "}
                        {PHONE_NUMBER.slice(7)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Support */}
              <div className="pt-8 border-t border-outline-variant/10 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Instant Support
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-6 bg-surface-bright rounded-2xl group hover:bg-primary transition-all duration-300 active:scale-95">
                    <span className="material-symbols-outlined text-primary group-hover:text-on-primary mb-2">
                      chat_bubble
                    </span>
                    <span className="text-sm font-bold group-hover:text-on-primary transition-colors">
                      Live Chat
                    </span>
                  </button>

                  <Link
                    href={WHATSAPP_URL}
                    target="_blank"
                    className="flex flex-col items-center justify-center p-6 bg-surface-bright rounded-2xl group hover:bg-[#25D366] transition-all duration-300 active:scale-95"
                  >
                    <span className="text-2xl mb-2">💬</span>
                    <span className="text-sm font-bold group-hover:text-white transition-colors text-[#25D366] group-hover:text-white">
                      WhatsApp
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative Image */}
            <motion.div
              className="relative h-64 rounded-[2.5rem] overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                className="w-full h-full object-cover"
                alt="Floral Shop Interior"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSTZkAX-0Wy1OmhCTTdGBPcQrbIydfCkpCmYDFdzVyNL0o_gDJ5tgAFe4tUR0HrY3hI7Ig18xzXrb9ZeovfgUBgL66KnFka14VB_Vgqi05UU1nI3DskLVpGRmcaXw_RY22k0iACM14ljKJm1fLiLK6bSpa-hSBqzTLj7xU4WIcPd-5J4DeTraZASAHSmdCIIG5wQ1DAJrOS3wKTNUx4dSURLJLTFcpnncJMwjf7bnOrS57qAkD6KsMNk_BHwE_lnnNxaiEMdWLZy4K"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex items-end p-8">
                <p className="text-surface-bright font-accent italic text-xl">
                  &ldquo;Crafted with devotion, delivered with care.&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
