import React from 'react';
import { Users, PackageCheck, Truck, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const stats = [
  { id: 1, title: 'Active Dealers', value: '500+', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 2, title: 'Products Available', value: '1,200+', icon: PackageCheck, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 3, title: 'Successful Deliveries', value: '50k+', icon: Truck, color: 'text-success', bg: 'bg-success/10' },
  { id: 4, title: 'Quality Assurance', value: '100%', icon: ShieldCheck, color: 'text-warning', bg: 'bg-warning/10' },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-surface relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-6 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className={`mx-auto w-12 h-12 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-text mb-1">{stat.value}</h3>
            <p className="text-sm text-text-light font-medium">{stat.title}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
