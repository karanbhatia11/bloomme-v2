"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const DEFAULT_FEATURE_IMAGES = {
  pause: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm",
  mainCard1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm",
  mainCard2: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
  mainCard3: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-8Vvzd2Xx3c8ju93HjA4gPOAFSXVeHSRoAoG2zPfB9Rlh_rp8vAB33fDFUKyI94hvjJQ90aIBzynD6haHC3KDdes_fs-Vjhc7hrXbHMox1VUJNu9nTKJk6_rnKXQUoACkEliuItPVLeDfZVPiorKu2hdvVaFRZKKoAd4z3RJjMSEddo6xzk_AQCTmZ3Wikj8Q7ENW9SNtSe9NV9zCWwtfo9UPj8X30qhqbEwfsdvVFpxPEIn-ajau3SoQ5oSEr3q6l0dxudo3xuXL",
  control: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC",
};

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  background_color?: string;
  background_image?: string;
}

interface FeaturesContent {
  title: string;
  metadata?: {
    main_card?: {
      label: string;
      title: string;
      description: string;
      images: string[];
    };
    feature_cards?: FeatureCard[];
  };
}

export const FeaturesSection: React.FC = () => {
  const [content, setContent] = useState<FeaturesContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/page-content?page=home');
        const data = await response.json();
        const section = Array.isArray(data)
          ? data.find((item: any) => item.section_name === 'features-grid')
          : null;

        if (section) {
          setContent({
            title: section.title || 'Designed for Devotion',
            metadata: section.metadata
          });
        }
      } catch (err) {
        console.error('Failed to fetch features content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return <div className="py-24 bg-surface-container-low" />;
  }

  const mainCard = content?.metadata?.main_card || {
    label: 'THE BLOOMME STANDARD',
    title: 'Delivered Before\nThe First Prayer',
    description: 'Our specialized logistics team ensures your flowers arrive between 5:30 AM and 7:30 AM, every single day.',
    images: [DEFAULT_FEATURE_IMAGES.mainCard1, DEFAULT_FEATURE_IMAGES.mainCard2, DEFAULT_FEATURE_IMAGES.mainCard3]
  };

  const featureCards = content?.metadata?.feature_cards || [
    {
      icon: 'pause_circle',
      title: 'Pause Anytime',
      description: 'Going on a vacation? Pause your subscription with a single tap in the app. No questions asked.',
      background_color: '#6b5b3d',
      background_image: DEFAULT_FEATURE_IMAGES.pause
    },
    {
      icon: 'settings_suggest',
      title: 'Full Control',
      description: 'Manage your calendar, billing, and flower preferences in one place.',
      background_color: '#2f1500',
      background_image: DEFAULT_FEATURE_IMAGES.control
    }
  ];

  return (
    <section className="py-24 bg-surface-container-low relative overflow-hidden" id="features">
      {/* Decorative Flower Background */}
      <div className="absolute top-16 right-10 opacity-15 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[200px] text-secondary">local_florist</span>
      </div>
      <div className="absolute bottom-12 left-8 opacity-15 -rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px] text-primary">local_florist</span>
      </div>
      <div className="absolute top-2/3 right-1/3 opacity-12 rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[160px] text-secondary/50">local_florist</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-12 sm:mb-16"
        >
          {content?.title || 'Designed for Devotion'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="p-6 sm:p-10 flex-grow flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 sm:mb-4">
                {mainCard.label}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                {mainCard.title}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant mb-6 sm:mb-8">
                {mainCard.description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 px-6 sm:px-10 pb-6 sm:pb-10">
              {mainCard.images.map((img, idx) => (
                <div key={idx} className="h-24 overflow-hidden rounded-lg">
                  <Image
                    src={img}
                    alt="Flowers"
                    width={150}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature Cards */}
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="md:col-span-2 text-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
              style={{ backgroundColor: card.background_color || '#6b5b3d' }}
            >
              {card.background_image && (
                <div className="h-40 overflow-hidden">
                  <Image
                    src={card.background_image}
                    alt={card.title}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-10 flex-grow flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-sm opacity-80">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
