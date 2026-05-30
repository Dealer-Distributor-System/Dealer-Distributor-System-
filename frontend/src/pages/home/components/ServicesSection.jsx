import React from 'react';
import { Truck, ShieldCheck, CreditCard, Clock } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Fast & Reliable Delivery',
    description: 'Our dedicated traveller network ensures your orders reach you on time, every time.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Quality',
    description: '100% genuine products sourced directly from top-tier manufacturers.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description: 'Easy credit terms and secure digital payment options for verified dealers.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our customer success team is always available to resolve your queries.',
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white rounded-full shadow-soft flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <service.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{service.title}</h3>
              <p className="text-text-light leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
