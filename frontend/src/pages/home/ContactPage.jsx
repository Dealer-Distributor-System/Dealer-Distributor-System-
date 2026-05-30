import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ContactCard = ({ icon: Icon, title, value, label, href, color }) => (
  <a 
    href={href} 
    target={href.startsWith('http') ? "_blank" : "_self"} 
    rel="noopener noreferrer"
    className="group block"
  >
    <Card className="h-full border-none bg-surface/50 hover:bg-surface hover:shadow-soft-xl transition-all duration-500 overflow-hidden">
      <CardContent className="p-8">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-light mb-6">{value}</p>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all">
          {label} <ExternalLink className="w-3 h-3" />
        </span>
      </CardContent>
    </Card>
  </a>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Contact form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-text tracking-tighter mb-6">
            Get in <span className="text-primary italic">Touch.</span>
          </h1>
          <p className="text-xl text-text-light max-w-2xl mx-auto leading-relaxed">
            Have a question or looking to join our dealer network? Reach out to our dedicated support team through any of these channels.
          </p>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <ContactCard 
            icon={MessageSquare}
            title="WhatsApp"
            value="+91 7620734833"
            label="Chat on WhatsApp"
            href="https://wa.me/917620734833"
            color="bg-green-100 text-green-600"
          />
          <ContactCard 
            icon={Mail}
            title="Email Us"
            value="nivruttipatil8618@gmail.com"
            label="Send an Email"
            href="mailto:nivruttipatil8618@gmail.com"
            color="bg-blue-100 text-blue-600"
          />
          <ContactCard 
            icon={Phone}
            title="Call Support"
            value="+91 7620734833"
            label="Call Now"
            href="tel:7620734833"
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Contact Form & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-text mb-6">Send us a message</h2>
              <p className="text-text-light leading-relaxed">
                Fill out the form below and we'll respond within 24 hours. Whether it's about product specifications, dealership inquiries, or logistics, we're here to help.
              </p>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center shrink-0 border border-gray-100">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-text mb-1">Our Headquarters</h4>
                <p className="text-text-light text-sm leading-relaxed">
                  Prince Piping Systems, Industrial Zone Phase 2,<br />
                  Mumbai, Maharashtra 400013, India
                </p>
              </div>
            </div>
            
            <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Quality Assurance
              </h4>
              <p className="text-xs text-primary/70 leading-relaxed font-medium">
                Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST. We prioritize dealer and traveller inquiries.
              </p>
            </div>
          </div>

          <Card className="border-none shadow-soft-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Your Name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input 
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">How can we help?</label>
                  <textarea 
                    rows="5"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <Button 
                  type="submit" 
                  size="xl" 
                  className="w-full h-16 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  isLoading={loading}
                >
                  <Send className="w-5 h-5 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

// Simple icon wrapper for the info card
const ShieldCheck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default ContactPage;
