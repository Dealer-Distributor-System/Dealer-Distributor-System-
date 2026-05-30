import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import ProductSlider from '../../../components/products/ProductSlider';

const FeaturedProductsSection = () => {
  return (
    <section className="py-24 bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Flame className="w-4 h-4 fill-primary" /> Trending Now
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-text tracking-tighter leading-none mb-6">
              Popular <span className="text-primary italic">Collections.</span>
            </h2>
            <p className="text-lg text-text-light leading-relaxed">
              Explore our most sought-after infrastructure solutions, precision-engineered for maximum durability and environmental efficiency.
            </p>
          </div>
          
          <Link 
            to="/products" 
            className="group flex items-center gap-3 font-bold text-text hover:text-primary transition-all pb-2 border-b-2 border-transparent hover:border-primary"
          >
            Explore Full Catalog 
            <div className="w-8 h-8 rounded-full bg-surface border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-soft">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* The Slider Component */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <ProductSlider />
        </div>

      </div>
    </section>
  );
};

export default FeaturedProductsSection;
