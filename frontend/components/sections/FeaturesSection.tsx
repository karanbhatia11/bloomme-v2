"use client";

import Image from "next/image";

const CARDS = [
  {
    img: "/images/designed-for-devotion-1.png",
    alt: "Fresh puja flowers delivered before morning prayer — Bloomme",
    title: "Delivered Before The First Prayer",
    description: "Flowers arrive between 5:30 AM – 7:30 AM daily, ensuring your altar is ready before your day begins.",
    label: "Reliable Mornings",
    icon: "schedule",
  },
  {
    img: "/images/serene-prayer-and-modern-connection.png",
    alt: "Serene home prayer setup with fresh flowers — Bloomme flexible subscription",
    title: "Pause Anytime",
    description: "Travelling? Skip deliveries in one tap. Your subscription adapts to your life, not the other way around.",
    label: "Effortless Flexibility",
    icon: "pause_circle",
  },
  {
    img: "/images/your-ritual-your-way.png",
    alt: "Personalized puja ritual management with Bloomme dashboard",
    title: "Full Control",
    description: "Manage plan, calendar & preferences easily through your digital atelier dashboard.",
    label: "Personalized Care",
    icon: "tune",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-surface" id="features">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <span className="text-secondary font-serif italic text-xl mb-4 block">
          The Art of Daily Offerings
        </span>
        <h2 className="text-5xl md:text-6xl font-bold text-on-surface tracking-tighter mb-6">
          Designed for Devotion
        </h2>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          A seamless flower subscription built around your daily rituals. Experience the serenity of fresh blooms, delivered with reverence.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="group bg-white rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:-translate-y-2"
            style={{ boxShadow: "0 20px 40px rgba(47, 21, 0, 0.06)" }}
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <Image
                src={card.img}
                alt={card.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="font-bold text-xl text-on-surface mb-3">{card.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{card.description}</p>
              <div className="mt-6 flex items-center text-primary font-semibold text-sm tracking-wide uppercase">
                <span>{card.label}</span>
                <span className="material-symbols-outlined ml-2 text-sm">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Block */}
      <div className="mt-24 max-w-4xl mx-auto text-center px-6">
        <p className="font-serif italic text-3xl text-on-surface leading-snug">
          "Flowers are the silent language of the soul, connecting our earthly homes to the divine in every petal."
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <a
            href="/plans"
            className="px-8 py-3 bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all"
            style={{ boxShadow: "0 4px 20px rgba(119, 90, 17, 0.2)" }}
          >
            Explore Rituals
          </a>
        </div>
      </div>
    </section>
  );
};
