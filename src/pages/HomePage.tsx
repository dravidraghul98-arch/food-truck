import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Clock, MapPin, Award, ArrowRight, Star, ShieldCheck, Phone } from 'lucide-react';
import { FoodTruck } from '../components/FoodTruck';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { FoodItem } from '../types';
import { foodItems } from '../data/foodData';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { openFoodModal, selectedFoodForModal, closeFoodModal } = useBooking();
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFoodId(food.id);
    openFoodModal(food);
  };

  const bestsellers = foodItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] pb-16" id="home-page-container">
      
      {/* ============================================================ */}
      {/* HERO / WELCOME BANNER */}
      {/* ============================================================ */}
      <section className="relative pt-6 sm:pt-10 pb-4 overflow-hidden border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>Kangayam’s Most Loved Arabian Street Food Truck</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-['Cinzel'] tracking-tight text-white max-w-4xl mx-auto leading-tight"
          >
            SAVOUR JUICY SHAWARMAS & PLATTERS FRESH OFF THE TRUCK
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light"
          >
            Pre-book your favorite roll or platter right now. Pick up freshly prepared, sizzling hot food without waiting in queues!
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SIGNATURE INTERACTIVE FOOD TRUCK SECTION */}
      {/* ============================================================ */}
      <section className="pt-4 pb-12 relative z-20">
        <FoodTruck
          onSelectFood={handleSelectFood}
          selectedFoodId={selectedFoodId}
        />
      </section>

      {/* ============================================================ */}
      {/* THREE PILLARS / PROMISES */}
      {/* ============================================================ */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180e0e] to-[#0f0707] border border-amber-500/30 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Flame className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-base text-white">Live Rotisserie Charcoal</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Slow-roasted chicken marinated for 12 hours in authentic Arabian spices, carved fresh on order.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180e0e] to-[#0f0707] border border-amber-500/30 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-base text-white">Express 0-Wait Pre-Booking</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Choose your exact pickup slot between 4:00 PM – 11:00 PM. We time the grill so it's ready when you arrive.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180e0e] to-[#0f0707] border border-amber-500/30 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-base text-white">Authentic Garlic Toum</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Signature creamy Lebanese garlic toum whipped fresh without artificial thickeners or palm oils.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK POPULAR SHOWCASE & MENU CTA */}
      {/* ============================================================ */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-white">
              Trending Sizzlers Today
            </h2>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-sm font-semibold hover:bg-amber-950/40 transition-all cursor-pointer"
          >
            <span>Explore Full 15+ Item Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((food) => (
            <div
              key={food.id}
              onClick={() => handleSelectFood(food)}
              className="group cursor-pointer rounded-2xl bg-gradient-to-b from-neutral-900/90 via-[#150a0a] to-black border border-neutral-800 hover:border-amber-400 p-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] flex gap-4 items-center"
            >
              <img
                src={food.image}
                alt={food.name}
                className="w-20 h-20 rounded-xl object-cover border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-amber-300 font-['Cinzel']">₹{food.price}</span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded">
                    {food.badge || 'Popular'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                  {food.name}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-light">
                  {food.description}
                </p>
                <div className="mt-2 text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Pre-Book</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* LOCATION & HOW TO PRE-BOOK BANNER */}
      {/* ============================================================ */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950/80 via-neutral-950 to-amber-950/80 border-2 border-amber-500/40 p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider">
                Visit the Food Truck
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-['Cinzel'] text-white">
                Located near Kangayam Bus Stand
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-light">
                Spot our vibrant red & gold illuminated Arabian Delights food truck every evening. Enjoy high-energy open cooking, soothing Arabian melodies, and fresh aromatic grills.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Daily 4:00 PM – 11:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>Main Bus Stand Road, Kangayam</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <a href="tel:+919842712345" className="hover:text-amber-300 font-mono">
                    +91 98427 12345
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/pre-book"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-['Cinzel'] font-black text-sm tracking-wider uppercase text-center shadow-lg transition-all"
              >
                Pre-Book Pickup Now
              </Link>
              <Link
                to="/contact"
                className="w-full py-3.5 px-6 rounded-xl bg-neutral-900/80 border border-neutral-700 hover:border-amber-400 text-white font-semibold text-xs text-center transition-all"
              >
                Get Directions & Map
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFoodForModal}
        isOpen={!!selectedFoodForModal}
        onClose={() => {
          closeFoodModal();
          setSelectedFoodId(null);
        }}
      />
    </div>
  );
};
