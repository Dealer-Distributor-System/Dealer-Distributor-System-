import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Hammer, Wrench, Settings } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const categories = [
  { id: 1, name: 'PVC Pipes', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Fittings', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, name: 'Adhesives', icon: Hammer, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, name: 'Valves', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-50' },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text mb-4">Explore Categories</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Browse our wide range of products designed for all your plumbing and infrastructure needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.name.toLowerCase()}`} className="group">
              <Card className="p-8 text-center h-full hover:border-primary/50 hover:shadow-soft-lg transition-all duration-300">
                <div className={`mx-auto w-16 h-16 rounded-2xl ${category.bg} ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
