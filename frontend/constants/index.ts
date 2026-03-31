export const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/plans", label: "Plans" },
  { href: "/#festivals", label: "Festivals" },
  { href: "/#add-ons", label: "Add Ons" },
  { href: "/#delivery", label: "Delivery" },
  { href: "/about", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const PRODUCTS = [
  {
    id: 1,
    category: "Add-On",
    title: "Flower Malas",
    description: "Hand-picked colorful marigolds and seasonal flowers presented on traditional brass plates. Perfect for daily puja and special occasions.",
    price: 299,
    image: "/images/addon-1.jpeg",
  },
  {
    id: 2,
    category: "Add-On",
    title: "Rose Petals",
    description: "Premium red rose petals in ornate brass bowl. Ideal for ceremonial offerings, temple worship, and festive celebrations.",
    price: 499,
    image: "/images/addon-2.jpeg",
  },
  {
    id: 3,
    category: "Add-On",
    title: "Lotus Flower",
    description: "Sacred pink lotus blooms on traditional brass plate. Symbolizes purity and divine consciousness in Hindu rituals.",
    price: 399,
    image: "/images/addon-3.jpeg",
  },
  {
    id: 4,
    category: "Add-On",
    title: "Agarbatti (Pack of 3)",
    description: "Premium incense stick packs with natural fragrance. Creates spiritual ambiance for meditation and daily prayers.",
    price: 349,
    image: "/images/addon-4.jpeg",
  },
  {
    id: 5,
    category: "Add-On",
    title: "Cotton Batti",
    description: "Pure white cotton wicks in brass bowl. Essential for diya lighting during festivals and daily evening prayers.",
    price: 449,
    image: "/images/addon-5.jpeg",
  },
  {
    id: 6,
    category: "Add-On",
    title: "Desighee Diya Set",
    description: "Premium decorative diya set perfect for Diwali and festival celebrations. Handcrafted with traditional designs.",
    price: 549,
    image: "/images/addon-6.jpeg",
  },
];

export const HOW_IT_WORKS = [
  {
    icon: "potted_plant",
    title: "Curated Sourcing",
    description: "Daily hand-picked selections from local artisan florists.",
  },
  {
    icon: "inventory_2",
    title: "Eco-Packaging",
    description: "Wrapped in biodegradable banana leaf and paper layers.",
  },
  {
    icon: "electric_moped",
    title: "Dawn Delivery",
    description: "Guaranteed doorstep delivery before your morning puja.",
  },
  {
    icon: "temple_hindu",
    title: "Divine Offering",
    description: "Transform your home into a fragrant, spiritual haven.",
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 1,
    name: "Traditional",
    price: 59,
    period: "/day",
    description: "Daily essentials for a simple puja",
    features: [
      "Loose Marigolds & Jasmine",
      "Daily Freshness Guarantee",
    ],
    disabled: ["A2 Ghee Refills"],
    cta: "Select Plan",
    highlighted: false,
  },
  {
    id: 2,
    name: "Divine",
    price: 89,
    period: "/day",
    description: "Comprehensive ritual coverage",
    features: [
      "Premium Seasonal Mix",
      "Incense Sticks (weekly)",
      "Festival Upgrades",
    ],
    cta: "Start Divine Journey",
    highlighted: true,
  },
  {
    id: 3,
    name: "Celestial",
    price: 179,
    period: "/day",
    description: "The complete florist's atelier",
    features: [
      "Exotic Floral Arrangements",
      "Full Ritual Essentials Box",
      "Concierge Ritual Support",
    ],
    cta: "Go Celestial",
    highlighted: false,
  },
];

export const TESTIMONIALS = [
  {
    name: "Anjali Sharma",
    role: "Sainik Colony, Faridabad",
    quote:
      "The quality of flowers is incomparable. My home smells like a temple every morning. The delivery is punctual, exactly at 6:30 AM.",
    rating: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBKyAy8T-02pOTwzBoic6HHJBG2HmMaLoVzEZMoAjVg9zrcN1ImZ4FdnHuJYb8zG1uoHw4tERU3OXVDBHjTxjeAPSHJRG3l3dWRWN3wDM9L5JgO9B-xtciJFPEOEXwU9gHdsJQ_mOLakuzihZ8H8_XWGL_TGXEXEijdpqdgOAeAG4wZnZJ9zq7FhhaBRljwHntklGYpiNNYde61t7lW3Sj_8KyTxYAFUX2osc-HBHV4m4R0TR3ooz0yPCL2Z6_SIQDJtHNq-gwZhDk5",
  },
  {
    name: "Ravi Malhotra",
    role: "Sector 15, Faridabad",
    quote:
      "Bloomme has made my daily puja so much more peaceful. I no longer have to worry about finding fresh flowers in the local market.",
    rating: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJi2gXWcSzLeFT0ln-XW4-nt8URRXEk7OqhtUNKhOOxZYpGlFsP35RKDc74QoMa6RFCmXDBLC45eRrytj1k8ova_hqZrnR08vcAOF8CPDikQFnestMclwsPADR7pFCLq5hLdAr1cmUGPQSS0K45Diz_x3zB_NlVaQi0pw43agMz3F3x-ieIBW64Z0F0PdGwjyW5DeCIRpyxXGcirqW5XNJipZU_o2KNmjahIvZoAcAUZD4renXOdiwHn-KhbDBY7kuXpCUEb3S1Ddu",
  },
  {
    name: "Priya Gupta",
    role: "Greenfield, Faridabad",
    quote:
      "The assorted spiritual box is a lifesaver for festival weeks. Everything I need for a complete puja arrives in one beautiful package.",
    rating: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAa9_r7zV-yunM1rBMIk_o6Dvh10lzZX1CCv5JcDFKhBW61--gNw3R-WAhi1XvVAcVlUIDPSRX6fpSv2_vc1pD_v19YV5MeG1IGTRKdEt2U7jtasj-c6KqoMPR_GxyxOHj8tyhQxw0yTO7HVusyG4otbvusMRi7xpa0FdwS5ZBinEEpN35oyzOV9GnjlFmxQGNbBt8VzQDBDoYRBKmreGHPJRyx0KPFnz8lHUPZyEuK6hC9-qaWPc-eut0QgK-caSCdtVRwG1gs9QA4",
  },
];

export const FAQ = [
  {
    question: "What time do you deliver?",
  },
  {
    question: "Can I change my flowers for a day?",
  },
  {
    question: "Is there a cancellation fee?",
  },
  {
    question: "How do you handle festival holidays?",
  },
  {
    question: "Do you deliver on Sundays?",
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Plans", href: "/#plans" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Shipping Policy", href: "#" },
  ],
  contact: [
    { label: "Contact Support", href: "/contact" },
    { label: "info@bloomme.co.in", href: "mailto:info@bloomme.co.in" },
  ],
};

export const LOGO_URL = "/images/backgroundlesslogo.png";
