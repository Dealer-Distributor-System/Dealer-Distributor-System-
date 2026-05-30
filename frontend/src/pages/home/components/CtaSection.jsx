import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const CtaSection = () => {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-text mb-6">
          Ready to Elevate Your Business?
        </h2>
        <p className="text-xl text-text-light mb-10 max-w-2xl mx-auto">
          Join hundreds of dealers who have streamlined their supply chain with Prince Piping. Sign up today and get access to exclusive pricing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Get Started Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-white hover:bg-gray-50 border border-gray-200 hover:scale-105 transition-transform">
              Login to Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
