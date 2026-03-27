# Bloomme - Daily Fresh Puja Flowers & Essentials

A production-ready Next.js frontend application for Bloomme, delivering hand-picked fresh puja flowers and spiritual essentials every morning before sunrise.

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Home page
├── components/
│   ├── common/             # Reusable components
│   │   ├── Button.tsx
│   │   ├── Navigation.tsx
│   │   └── ProductCard.tsx
│   └── sections/           # Page sections
│       ├── HeroSection.tsx
│       ├── ProductShowcase.tsx
│       ├── HowItWorks.tsx
│       ├── FeaturesSection.tsx
│       ├── PricingSection.tsx
│       └── Footer.tsx
├── constants/              # Constants and data
│   └── index.ts
├── types/                  # TypeScript types
│   └── index.ts
├── styles/
│   └── globals.css        # Global styles and animations
├── public/                # Static assets
└── configuration files
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.ts
    └── .eslintrc.json
```

## ⚡ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11
- **UI Components**: Material Symbols Outlined Icons

## 🎨 Design System

### Colors
The design uses a warm, spiritual color palette:
- **Primary**: #775a11 (Warm Brown)
- **Secondary**: #ab3500 (Burnt Orange)
- **Tertiary**: #815500 (Earthy Tone)
- **Surface**: #fff8f5 (Warm White)

All colors are defined in `tailwind.config.ts` matching the Material Design 3 system.

### Typography
- **Headlines**: Inter (700, 600, 500 weights)
- **Body**: Inter (400, 500 weights)
- **Editorial**: Playfair Display (italic accents)

### Animations
- **Petal Drift**: Floating animation for hero section petals
- **Bloom Hover**: Scale and shadow effects on cards
- **Framer Motion**: Page transitions and scroll animations

## 📦 Components

### Common Components

#### Button
Versatile button component with multiple variants:
```tsx
<Button variant="primary" size="lg">Subscribe Now</Button>
```
- **Variants**: primary, secondary, outline, ghost, glass
- **Sizes**: sm, md, lg

#### Navigation
Fixed navbar with mobile menu support:
- Responsive menu with smooth animations
- Quick navigation links
- Auth and CTA buttons

#### ProductCard
Reusable product display card with:
- Image with hover effects
- Title and description
- Price/variant information
- Add to cart functionality

### Section Components

#### HeroSection
- Animated headline with italic accent text
- Floating petal animations
- Customer social proof
- Quality score badge
- Feature image with rotation effect

#### ProductShowcase
- Grid layout with 4 product cards
- Navigation carousel controls
- Responsive grid (1 col mobile, 4 cols desktop)

#### HowItWorks
- 3-step process with icons
- Horizontal connecting line (desktop only)
- Staggered animations on scroll
- Hover effects on step cards

#### FeaturesSection
- Bento grid layout (responsive)
- Main featured content with carousel images
- Feature cards: Pause, Custom Add-ons, Festival, Control
- Mixed card styles and colors

#### PricingSection
- 3-tier pricing plans
- Recommended plan highlighted and scaled
- Feature checklists with checkmarks
- CTA buttons

#### Footer
- 4-column layout (responsive)
- Logo and social links
- Product, Legal, Contact sections
- Link organization by category

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📱 Responsive Design

All components are fully responsive:
- **Mobile**: Single column layouts, optimized spacing
- **Tablet**: 2-column grids where applicable
- **Desktop**: Full multi-column layouts with max-width containers

Viewport containers use `max-w-[1440px]` for consistent maximum width.

## ♿ Accessibility

- Semantic HTML structure
- Material Symbols Outlined icons with proper styling
- Text contrast ratios meet WCAG standards
- Mobile menu with aria-friendly navigation

## 🎭 Key Features

### 1. Floating Petal Animation
Smooth, continuous animation of decorative petals in the hero section with varying speeds and delays.

### 2. Bloom Hover Effects
Cards scale up and gain shadow on hover, image elements show zoom and saturation increase.

### 3. Scroll Animations
Sections and components fade in and animate as they come into view using Framer Motion `whileInView`.

### 4. Glass Morphism Navigation
Semi-transparent navbar with backdrop blur effect for a modern look.

### 5. Responsive Grids
Smart grid layouts that adapt from single column on mobile to multi-column on desktop.

## 📊 Performance Optimizations

- **Image Optimization**: Next.js Image component with remote URL support
- **Code Splitting**: Automatic route-based code splitting
- **CSS Optimization**: Tailwind CSS purges unused styles
- **Font Loading**: Google Fonts with preconnect for faster loading

## 🔧 Configuration

### Tailwind Config
Custom color palette, fonts, and animations defined in `tailwind.config.ts`. Extends default theme with Material Design 3 colors.

### TypeScript
Strict mode enabled with:
- `noImplicitAny`: true
- `strictNullChecks`: true
- `noUnusedLocals`: true

## 📝 Constants and Data

Data is centralized in `/constants/index.ts`:
- Navigation links
- Product catalog
- Pricing plans
- Testimonials
- FAQ
- Footer links

Types are defined in `/types/index.ts` for type safety.

## 🎯 Next Steps

1. **API Integration**: Connect pricing and product pages to backend
2. **Authentication**: Add login/signup flows
3. **Dashboard**: Build user subscription management dashboard
4. **Payment Gateway**: Integrate Razorpay or Stripe
5. **Forms**: Add newsletter signup and contact forms
6. **SEO**: Add schema markup and meta tags
7. **Analytics**: Implement Google Analytics and Hotjar

## 📄 License

All rights reserved © Bloomme 2024

## 👤 Author

Built with ❤️ for Bloomme - Daily Fresh Puja Flowers & Essentials
