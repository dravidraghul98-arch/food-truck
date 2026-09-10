import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart, Flame } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#0e0707] to-black border-t border-amber-500/20 pt-12 pb-8 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Kangayam’s premier mobile culinary sensation. Serving authentically spiced Lebanese & Arabian shawarmas, platters, and loaded grills freshly from our custom food truck.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Fresh Daily Preparation & Halal</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-['Cinzel'] font-bold text-base text-amber-300 mb-4 tracking-wider uppercase">
              Quick Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/home" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>•</span> Interactive Food Truck
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>•</span> Full Menu & Categories
                </Link>
              </li>
              <li>
                <Link to="/pre-book" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>•</span> Pre-Book Food Slot
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>•</span> My Orders & Pickup Status
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>•</span> About Our Food Truck
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Schedule */}
          <div>
            <h4 className="font-['Cinzel'] font-bold text-base text-amber-300 mb-4 tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Operating Hours
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="font-bold text-white mb-0.5">OPEN DAILY</div>
                <div className="text-amber-300 font-mono font-bold text-sm">4:00 PM – 11:00 PM</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Peak rotisserie spinning time: 6:30 PM – 10:00 PM
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Pre-book online anytime to skip on-site queue during rush hours!
              </div>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h4 className="font-['Cinzel'] font-bold text-base text-amber-300 mb-4 tracking-wider uppercase">
              Truck Location
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Near Bus Stand Main Road, Kangayam, Tirupur Dist, Tamil Nadu - 638701</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+919842712345" className="hover:text-amber-300 font-mono">
                  +91 98427 12345
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:hello@arabiandelights.com" className="hover:text-amber-300 font-mono">
                  hello@arabiandelights.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} <span className="text-amber-300 font-bold">ARABIAN DELIGHTS</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with passion for authentic street food in</span>
            <span className="text-amber-300 font-semibold">Kangayam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
