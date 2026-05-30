import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Hardware Store Owner',
    content: 'Prince Piping has transformed how I manage my inventory. The order process is seamless and deliveries are always on time.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Amit Singh',
    role: 'Plumbing Contractor',
    content: 'The quality of materials and the competitive pricing make them my go-to choice for all large-scale projects.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Retail Dealer',
    content: 'Their customer support is fantastic. Whenever there is a slight delay, the travellers keep us updated in real-time.',
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-surface border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text mb-4">What Our Dealers Say</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Don't just take our word for it. Hear from the businesses that trust us every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full bg-background border-none shadow-sm hover:shadow-soft transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-6 text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-text leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text">{testimonial.name}</h4>
                    <p className="text-sm text-text-light">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
