"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const DashboardPreview: React.FC = () => {
  return (
    <section className="py-24 bg-surface-container-highest/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container-lowest rounded-[2rem] p-2 md:p-8 shadow-2xl border border-outline-variant/20"
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-4 mb-8 px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-surface-container-low px-4 py-1 rounded-lg text-xs font-mono text-outline">
              app.bloomme.in/dashboard
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-4">
            {/* Sidebar */}
            <div className="md:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="h-8 w-full bg-surface-container rounded-lg"></div>
                <div className="h-8 w-3/4 bg-surface-container rounded-lg"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <div className="h-12 w-full bg-primary-container/20 border border-primary/20 rounded-xl flex items-center px-4">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                </div>
                <div className="h-12 w-full bg-surface-container/50 rounded-xl"></div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="h-24 bg-surface-container/30 rounded-2xl border border-outline-variant/10"></div>
                <div className="h-24 bg-surface-container/30 rounded-2xl border border-outline-variant/10"></div>
                <div className="h-24 bg-surface-container/30 rounded-2xl border border-outline-variant/10"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="h-64 bg-surface rounded-3xl border border-outline-variant/10 relative overflow-hidden"
              >
                <Image
                  alt="Data chart"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUMMWJvhBh7X1l8cZ_AsNxAUrBNzurgBz3TiNQGOngvaVpFRzm3K8HSF1Lkel_PkI4O-HpcWdMqJYc_wbulkBfwxnPC4Cp5lXk8JzTvhgpDa9FuqUnfDJ8fVlIvDW5l0EKVJoSoikqnlM3rMcMuVBbwNKsn--v-f454518VRn7hD0NzTMbFpoyMbsQYmmHUxu0rRW1qjtKmiljLEqdOr4K-vEvoIuk7t3I_B1uPYfo9rui3a7VV7S3cbUNCAanTBjChaY4Y3zAuVgD"
                  fill
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-primary font-bold opacity-40">
                    Interactive Subscription Calendar
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
