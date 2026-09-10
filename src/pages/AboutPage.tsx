import React from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Heart, Sparkles, Clock, MapPin, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] py-10 px-4 sm:px-6 lg:px-8" id="about-page-container">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Hero Banner with Brand Logo */}
        <div className="text-center space-y-4">
          <BrandLogo size="lg" className="justify-center mx-auto mb-2" />
          <h1 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-white">
            ABOUT ARABIAN DELIGHTS
          </h1>
          <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light">
            Bringing authentic Middle Eastern street gastronomy, slow-roasted rotisseries, and modern mobile food truck culture to Kangayam.
          </p>
        </div>

        {/* Story Section */}
        <div className="rounded-3xl bg-gradient-to-b from-[#180d0d] via-[#120707] to-[#0c0404] border-2 border-amber-500/30 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            <span>Our Food Truck Heritage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-white leading-tight">
            Crafted with Passion on Wheels in Kangayam
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-300 text-sm leading-relaxed font-light">
            <p>
              Arabian Delights was founded with a single culinary obsession: to bring world-class, authentic Lebanese and Middle Eastern street shawarmas to food lovers in Kangayam. We designed our custom mobile food truck with high-grade vertical rotisseries, live charcoal grills, and hygienic glass counters.
            </p>
            <p>
              Unlike mass-produced fast food, every batch of chicken at Arabian Delights is hand-trimmed, marinated for 12 hours in our proprietary 18-spice blend, and slowly roasted to tender perfection. We prepare our signature garlic toum and spicy Schezwan sauce fresh every single afternoon.
            </p>
          </div>

          {/* 4 Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-amber-500/20">
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-2">
              <Flame className="w-6 h-6 text-red-500 mx-auto" />
              <h4 className="font-bold text-white text-sm">Live Rotisserie</h4>
              <p className="text-xs text-neutral-400">Sliced hot straight from the turning spit</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">100% Halal Spices</h4>
              <p className="text-xs text-neutral-400">Pure, hygienic, and zero artificial colors</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-2">
              <Clock className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Express Pre-Booking</h4>
              <p className="text-xs text-neutral-400">Pre-order online to eliminate on-site queue</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-2">
              <Award className="w-6 h-6 text-purple-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Kangayam's Favorite</h4>
              <p className="text-xs text-neutral-400">Top-rated street food experience</p>
            </div>
          </div>
        </div>

        {/* Operating & CTA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-['Cinzel'] text-white">
              Hungry for Tonight’s Feast?
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Food truck opens daily at 4:00 PM near Kangayam Bus Stand.
            </p>
          </div>

          <Link
            to="/menu"
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-['Cinzel'] font-black text-xs uppercase tracking-wider shadow-lg shrink-0"
          >
            Explore Menu & Pre-Book
          </Link>
        </div>

      </div>
    </div>
  );
};
