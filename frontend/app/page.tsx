"use client";

import { Navigation } from "@/components/common/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { ShlokDivider } from "@/components/sections/ShlokDivider";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FestivalMode } from "@/components/sections/FestivalMode";
import { PricingSection } from "@/components/sections/PricingSection";
import { SocialProof } from "@/components/sections/SocialProof";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <HeroSection />

      <ShlokDivider
        shlok="पुष्पं फलं जलं चन्द्रं यो मे भक्ति-युक्त उपहारेत्"
        translation="One who offers to me with true devotion a leaf, a flower, fruit or water - I accept it as a heartfelt offering."
        author="Bhagavad Gita 9.26"
      />

      <HowItWorks />

      <ShlokDivider
        shlok="पुष्पवन्तं वनं सेवे पवित्रं मंदिरं शुभम्"
        translation="I cherish the blooming forest, a sacred and pure sanctuary adorned with flowers."
      />

      <PricingSection />

      <ShlokDivider
        shlok="फूलों की सुगंध, भक्ति का प्रसाद, हृदय की पूजा"
        translation="The fragrance of flowers carries the grace of devotion, a sacred prayer of the heart."
      />

      <FestivalMode />

      <ShlokDivider
        shlok="प्रतिदिन पुष्पदान, आत्मार्पण का प्रतीक"
        translation="Daily flowers are the symbol of surrendering one's soul in devotion and worship."
      />

      <ProductShowcase />

      <ShlokDivider
        shlok="पुष्प-सेवन से दिव्य शांति, फूलों में देवता का वास"
        translation="In serving flowers lies divine peace, for the divine dwells within each blossom."
      />

      <FeaturesSection />

      <ShlokDivider
        shlok="फूलों की सुगंध से भक्ति की ऊंचाई, प्रेम का अनंत रंग"
        translation="Through the fragrance of flowers ascends devotion, painting infinity with love's eternal hues."
      />

      <SocialProof />
      <Footer />
    </main>
  );
}
