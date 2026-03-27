export interface NavLink {
  href: string;
  label: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
}

export interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  disabled?: string[];
  cta: string;
  highlighted: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image: string;
}

export interface FAQ {
  question: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
