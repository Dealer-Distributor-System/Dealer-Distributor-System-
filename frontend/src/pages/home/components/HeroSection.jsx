import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Modern Gradient Background */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/15 via-secondary/10 to-transparent rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-16 lg:pt-0 lg:pb-0">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-surface border border-border px-6 py-3 rounded-full shadow-soft text-secondary text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700 hover:border-secondary/50 transition-colors">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Next Generation Piping
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text via-primary to-secondary tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              Premium Piping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Solutions.</span>
            </h1>

            <p className="text-lg text-text-light mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
              High-performance PVC piping systems engineered for modern infrastructure with superior durability and reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/products">
                <Button size="xl" className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 hover:shadow-2xl hover:shadow-primary/40">
                  Explore Catalog <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="ghost" size="xl" className="w-full sm:w-auto h-14 px-8 text-base font-bold border border-border hover:border-primary hover:bg-primary/10 transition-all">
                  Join as Dealer
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 pt-12 border-t border-border animate-in fade-in duration-1000 delay-500">
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">25+</span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Years Experience</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">10k+</span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Active Dealers</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">500+</span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Products</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative animate-in fade-in zoom-in-95 duration-1000 delay-400">
            <div className="relative z-10 group">
              {/* Modern Image Frame with Gradient Border */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gradient from-primary/50 to-secondary/50 aspect-[4/5] lg:aspect-square p-1 bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="bg-surface rounded-xl overflow-hidden w-full h-full">
                  <img
                    src="/hero_infrastructure.png"
                    alt="Modern Infrastructure"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </div>

              {/* Modern Performance Card */}
              <div className="absolute -bottom-8 -right-8 bg-surface border border-border backdrop-blur-xl p-6 rounded-2xl shadow-2xl max-w-[280px] hidden xl:block animate-bounce-slow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-text shadow-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Certified</p>
                    <p className="text-sm font-bold text-text">ASTM Compliant</p>
                  </div>
                </div>
                <p className="text-xs text-text-light leading-relaxed font-medium">
                  Engineered for extreme durability and environmental resilience.
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
