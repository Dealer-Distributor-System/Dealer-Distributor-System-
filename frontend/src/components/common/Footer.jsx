import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin, Phone, Mail, Heart, Star, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface/50 border-t border-border pt-16 pb-8 mt-auto text-text backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand & About */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Prince Piping</h3>
            <p className="text-sm text-text-light leading-relaxed font-medium">
              Premium quality piping infrastructure. Building stronger foundations for tomorrow's sustainable cities.
            </p>
            <div className="flex space-x-3 pt-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all hover:scale-110">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all hover:scale-110">
                <Star className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all hover:scale-110">
                <Heart className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all hover:scale-110">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5 text-text flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm text-text-light">
              <li><Link to="/" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Products</Link></li>
              <li><Link to="/about" className="hover:text-primary hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Contact</Link></li>
              <li><Link to="/ui-demo" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Design System</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-5 text-text flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
              Support
            </h4>
            <ul className="space-y-3 text-sm text-text-light">
              <li><Link to="/login" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Dealer Portal</Link></li>
              <li><Link to="/track-order" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Returns Policy</Link></li>
              <li><Link to="/faq" className="hover:text-primary hover:translate-x-1 transition-all inline-block">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-5 text-text flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-text-light">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                <span className="group-hover:text-text transition-colors">Industrial Zone Phase 2, Mumbai, Maharashtra 400013</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+917620734833" className="group-hover:text-text transition-colors">+91 76207 34833</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@princepiping.com" className="group-hover:text-text transition-colors truncate">support@princepiping.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} Prince Piping Systems. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
