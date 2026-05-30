import React, { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import BrandsSection from './components/BrandsSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';

const HomePage = () => {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background w-full">
      <HeroSection />
      <StatsSection />
      <BrandsSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <ServicesSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
