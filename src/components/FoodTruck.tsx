import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Utensils, Flame, Clock, Award, ChevronRight, CheckCircle2, Camera, Eye, MapPin, Star, ShieldCheck } from 'lucide-react';
import { FoodItem } from '../types';
import { foodItems } from '../data/foodData';
import { BrandLogo } from './BrandLogo';

interface FoodTruckProps {
  onSelectFood: (food: FoodItem) => void;
  selectedFoodId?: string | null;
}

export const FoodTruck: React.FC<FoodTruckProps> = ({ onSelectFood, selectedFoodId }) => {
  const [boardCategory, setBoardCategory] = useState<'All' | 'Shawarmas' | 'Plates' | 'Rice & Starters'>('Shawarmas');
  const [hoveredFoodId, setHoveredFoodId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'interactive' | 'photo'>('interactive');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Filter items for the interactive board
  const boardItems = foodItems.filter((item) => {
    if (boardCategory === 'Shawarmas') return item.category === 'Shawarmas';
    if (boardCategory === 'Plates') return item.category === 'Plates';
    if (boardCategory === 'Rice & Starters') return item.category === 'Rice Items' || item.category === 'Starters';
    return true; // All
  });

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 select-none" id="interactive-food-truck-section">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-gradient-to-b from-red-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Floating Header Banner above Truck */}
      <div className="text-center mb-5 sm:mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 via-neutral-900/90 to-amber-950/80 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] mb-3 text-xs sm:text-sm"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-amber-200 font-semibold tracking-wide">Interactive Food Truck Experience</span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-300 font-medium">Tap any item on the board to order</span>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black font-['Cinzel'] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-md"
          >
            THE ARABIAN FOOD TRUCK
          </motion.h2>
        </div>

        <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto mt-1.5 font-light">
          Fresh rotisserie shawarmas & authentic Arabic platters prepared live in Kangayam.
        </p>

        {/* View Switcher: Interactive Truck vs Live Food Truck Photo */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveView('interactive')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'interactive'
                ? 'bg-amber-500 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-amber-500/50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Interactive Truck Stage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('photo')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'photo'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-amber-500/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Real Food Truck Photo & Hotspots</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHOTO VIEW WITH INTERACTIVE HOTSPOTS */}
      {/* ============================================================ */}
      {activeView === 'photo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-8 rounded-3xl bg-[#140808] border-2 border-amber-500/40 p-3 sm:p-5 shadow-2xl overflow-hidden"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] max-h-[460px] bg-black">
            <img
              src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1600&q=85"
              alt="Arabian Delights Official Food Truck in Kangayam"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

            {/* Overlaid Brand Logo on Food Truck Photo */}
            <div className="absolute top-4 left-4 z-10">
              <div className="p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/50 shadow-xl">
                <BrandLogo size="sm" />
              </div>
            </div>

            {/* Live Status on Photo */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Kangayam Spot • 4 PM – 11 PM</span>
              </div>
            </div>

            {/* Hotspot 1: Live Rotisserie Spit */}
            <div
              className="absolute top-[45%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onClick={() => {
                setActiveHotspot('spit');
                onSelectFood(foodItems[0]);
              }}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 border-2 border-white flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap px-2.5 py-1 rounded-lg bg-black/90 border border-amber-500/60 text-[11px] font-bold text-amber-300 shadow-xl pointer-events-none group-hover:block transition-all">
                🔥 Live Rotisserie Spit
              </div>
            </div>

            {/* Hotspot 2: Service & Order Counter */}
            <div
              className="absolute top-[52%] left-[62%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onClick={() => {
                setActiveHotspot('counter');
                onSelectFood(foodItems[6]); // Arabic Plate
              }}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-75"></span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap px-2.5 py-1 rounded-lg bg-black/90 border border-amber-500/60 text-[11px] font-bold text-amber-300 shadow-xl pointer-events-none group-hover:block transition-all">
                🍽️ Serving Counter
              </div>
            </div>

            {/* Hotspot 3: Express Pickup Counter */}
            <div
              className="absolute top-[65%] left-[84%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onClick={() => setActiveHotspot('pickup')}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 border-2 border-white flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap px-2.5 py-1 rounded-lg bg-black/90 border border-amber-500/60 text-[11px] font-bold text-emerald-300 shadow-xl pointer-events-none group-hover:block transition-all">
                ⚡ Express Pre-Book Pickup
              </div>
            </div>

            {/* Bottom Caption on Photo */}
            <div className="absolute bottom-4 inset-x-4 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-amber-500/30 text-xs text-neutral-300">
              <div className="flex items-center gap-2 flex-wrap">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <a
                  href="https://maps.app.goo.gl/VujHZr17nRoEEraA7?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Kangayam Bus Stand Road Location 🗺️
                </a>
                <span className="hidden sm:inline text-neutral-400">•</span>
                <span className="text-amber-300">Open Daily 4:00 PM – 11:00 PM</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectFood(foodItems[0])}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow"
              >
                Pre-Book from Food Truck →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* THE FOOD TRUCK CONTAINER */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative bg-gradient-to-b from-[#1c0808] via-[#140505] to-[#0d0303] rounded-3xl border-2 border-amber-500/30 p-3 sm:p-6 lg:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(185,28,28,0.25)] overflow-hidden"
        id="arabian-food-truck-body"
      >
        {/* String of Warm Fairy / Bistro Lights Hanging on Top */}
        <div className="flex justify-between items-center px-4 sm:px-12 -mt-1 sm:-mt-3 mb-4 relative z-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="w-[1px] h-3 sm:h-5 bg-amber-600/60" />
              <div className="w-2.5 h-3.5 sm:w-3.5 sm:h-4.5 rounded-full bg-gradient-to-b from-amber-100 via-amber-400 to-amber-600 shadow-[0_0_12px_#f59e0b,0_0_20px_#d97706] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            </div>
          ))}
        </div>

        {/* Top Awning Roof Canopy with Red and Black Stripes */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-b-4 border-amber-500/80 mb-5 bg-[#0e0202]">
          <div className="h-10 sm:h-14 flex w-full">
            {[...Array(16)].map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 ${
                  idx % 2 === 0
                    ? 'bg-gradient-to-b from-red-700 via-red-800 to-red-950 border-r border-red-600/40'
                    : 'bg-gradient-to-b from-neutral-900 via-stone-900 to-black border-r border-amber-900/30'
                } relative`}
              >
                {/* Scalloped cloth fringe edge at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-t from-amber-500/30 to-transparent" />
              </div>
            ))}
          </div>

          {/* Roof Top Name Signboard with Neon Gold Rim */}
          <div className="bg-gradient-to-r from-neutral-950 via-[#260a0a] to-neutral-950 py-2.5 px-4 sm:px-8 border-y border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" showTagline={false} />
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-bounce" />
                  Live Charcoal & Rotisserie Grill
                </span>
              </div>
            </div>

            {/* Truck Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-bold text-xs tracking-wider uppercase">Open Now • 4 PM – 11 PM</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TRUCK CABIN + SERVING COUNTER + INTERACTIVE BOARD GRID */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 relative z-10">
          
          {/* LEFT SECTION: LIVE ROTISSERIE / CHEF WINDOW & BRAND BADGE (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Live Service Window Simulation */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#1c1210] to-[#0a0605] border-2 border-amber-500/40 p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
              
              {/* Window Frame Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
                <span className="text-xs font-bold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Live Shawarma Counter
                </span>
                <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-500/40 px-2 py-0.5 rounded-full font-medium">
                  Fresh Spit Turning
                </span>
              </div>

              {/* Window Graphic Display with Real-Life Photo Texture */}
              <div className="relative h-44 sm:h-48 rounded-xl bg-gradient-to-b from-[#2b110a] via-[#1a0805] to-black border border-amber-500/30 overflow-hidden flex items-center justify-center">
                {/* Background photo texture */}
                <div className="absolute inset-0 opacity-20">
                  <img
                    src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80"
                    alt="Shawarma Spit"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Glowing warm kitchen background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,rgba(185,28,28,0.2)_50%,transparent_100%)] animate-pulse-glow" />
                
                {/* Animated Steam Rising */}
                <div className="absolute top-2 flex gap-4 text-amber-200/40 font-mono text-xs">
                  <span className="animate-warm-steam">♨</span>
                  <span className="animate-warm-steam" style={{ animationDelay: '0.4s' }}>♨</span>
                  <span className="animate-warm-steam" style={{ animationDelay: '0.8s' }}>♨</span>
                </div>

                {/* Animated Shawarma Spit Skewer */}
                <div className="relative flex flex-col items-center">
                  {/* Metal Spit Rod */}
                  <div className="w-1.5 h-36 bg-gradient-to-r from-neutral-400 via-white to-neutral-500 rounded-full shadow-md z-10" />
                  
                  {/* Rotating Juicy Meat Cone */}
                  <motion.div
                    animate={{ rotateY: [0, 180, 360] }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute top-6 w-20 h-28 bg-gradient-to-r from-amber-700 via-red-900 to-amber-900 rounded-b-2xl rounded-t-lg border border-amber-600/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col justify-evenly items-center py-1 overflow-hidden"
                  >
                    {/* Char Marks / Meat Texture Lines */}
                    <div className="w-16 h-1 bg-amber-500/60 rounded-full" />
                    <div className="w-18 h-1 bg-amber-950/80 rounded-full" />
                    <div className="w-14 h-1 bg-amber-500/50 rounded-full" />
                    <div className="w-12 h-1 bg-amber-950/80 rounded-full" />
                    <div className="w-10 h-1 bg-amber-400/60 rounded-full" />
                  </motion.div>

                  {/* Tomato and Onion Skewer Crown on Top */}
                  <div className="absolute top-3 w-8 h-4 rounded-full bg-red-600 border border-amber-400 shadow-sm z-20" />
                  <div className="absolute top-5 w-6 h-2 rounded-full bg-amber-200 border border-amber-400 shadow-sm z-20" />
                </div>

                {/* Counter Shelf Plate Overlay */}
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-neutral-900 to-transparent border-t border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] text-amber-200/90 font-medium">Kangayam's #1 Authentic Shawarma Spit</span>
                </div>
              </div>

              {/* Quick Highlights Under Window */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                <div className="p-2 rounded-lg bg-neutral-900/80 border border-amber-500/20">
                  <div className="text-[10px] text-neutral-400">Preparation</div>
                  <div className="text-xs font-bold text-amber-300">100% Live & Fresh</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/80 border border-amber-500/20">
                  <div className="text-[10px] text-neutral-400">Pre-Book Benefit</div>
                  <div className="text-xs font-bold text-emerald-400">Zero Wait Time</div>
                </div>
              </div>
            </div>

            {/* Special Chef Recommendation Card */}
            <div
              onClick={() => onSelectFood(foodItems[0])} // Schezwan Shawarma
              className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-neutral-900 to-amber-950/70 border border-red-500/40 hover:border-amber-400 transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={foodItems[0].image}
                  alt={foodItems[0].name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded">
                      Featured
                    </span>
                    <span className="text-xs font-bold text-amber-300">₹{foodItems[0].price}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {foodItems[0].name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">
                    Spicy chicken with Schezwan sauce & toum
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT / MAIN SECTION: THE INTERACTIVE FRONT MENU BOARD */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 flex flex-col" id="food-truck-front-board">
            
            {/* The Outer Illuminated Board Frame */}
            <div className="relative flex-1 rounded-2xl bg-gradient-to-b from-[#180a0a] via-[#120707] to-[#0c0404] border-2 border-amber-400/60 p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.25),inset_0_0_25px_rgba(0,0,0,0.9)] flex flex-col">
              
              {/* Board Header with Gold Filigree and Neon Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-amber-500/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel'] text-lg sm:text-xl font-extrabold text-amber-300 tracking-wider flex items-center gap-2">
                      TRUCK MENU BOARD
                      <span className="text-[10px] font-sans font-normal text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        LIVE TAP
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Tap any food item to customize quantity, spicy level & add-ons
                    </p>
                  </div>
                </div>

                {/* Category Switcher Tabs on Board */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-amber-500/30 w-full sm:w-auto overflow-x-auto">
                  {(['Shawarmas', 'Plates', 'Rice & Starters', 'All'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBoardCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        boardCategory === cat
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md font-bold'
                          : 'text-neutral-300 hover:text-amber-200 hover:bg-neutral-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* ============================================================ */}
              {/* INTERACTIVE FOOD ITEMS TILES ON THE BOARD */}
              {/* ============================================================ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 flex-1">
                <AnimatePresence mode="popLayout">
                  {boardItems.map((food) => {
                    const isSelected = selectedFoodId === food.id;
                    const isHovered = hoveredFoodId === food.id;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.25 }}
                        key={food.id}
                        id={`board-item-${food.id}`}
                        onMouseEnter={() => setHoveredFoodId(food.id)}
                        onMouseLeave={() => setHoveredFoodId(null)}
                        onClick={() => onSelectFood(food)}
                        className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-950/90 via-red-950/80 to-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02] ring-2 ring-amber-400/60'
                            : 'bg-gradient-to-b from-neutral-900/90 via-[#180d0d] to-black/90 border-neutral-800 hover:border-amber-500/60 hover:shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:scale-[1.01]'
                        }`}
                      >
                        {/* Food Category / Veg-NonVeg Marker & Price Top Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            {/* Veg / Non-veg square dot indicator */}
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                food.type === 'veg'
                                  ? 'border-emerald-500 bg-emerald-950/50'
                                  : 'border-red-500 bg-red-950/50'
                              }`}
                              title={food.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  food.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                            </span>

                            {food.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                                {food.badge}
                              </span>
                            )}
                          </div>

                          {/* Price Tag with Warm Glow */}
                          <div className="text-right">
                            <span className="font-['Cinzel'] font-black text-base sm:text-lg text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                              ₹{food.price}
                            </span>
                          </div>
                        </div>

                        {/* Food Name & Mini Description */}
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="relative shrink-0">
                            <img
                              src={food.image}
                              alt={food.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-amber-500/30 group-hover:scale-105 transition-transform"
                            />
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black rounded-full p-0.5 shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-black text-amber-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                                isSelected ? 'text-amber-200' : 'text-white group-hover:text-amber-300'
                              } transition-colors`}
                            >
                              {food.name}
                            </h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 font-light leading-snug">
                              {food.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Interaction Strip */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {food.prepTimeMinutes} mins
                          </span>

                          <span
                            className={`font-semibold tracking-wide flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'text-amber-300 underline'
                                : 'text-neutral-300 group-hover:text-amber-400'
                            }`}
                          >
                            {isSelected ? 'Configuring...' : 'Pre-Book'}
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>

                        {/* Active Selection Pulsing Glow */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-amber-500/5 pointer-events-none animate-pulse" />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Bottom Truck Board Footer / Guarantee */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Halal Spices • Marinated Daily • Zero Preservatives</span>
                </div>
                <div className="text-amber-300/80 font-medium">
                  Pickup point: Kangayam Bus Stand Road
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TRUCK CHASSIS & WHEELS BOTTOM BAR */}
        {/* ============================================================ */}
        <div className="mt-6 pt-4 border-t-2 border-amber-500/30 flex items-center justify-between px-4 sm:px-10 relative z-10">
          
          {/* Left Wheel Assembly */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border-4 border-amber-500/60 shadow-[0_5px_15px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-900" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono">CHASSIS AD-01</span>
            </div>
          </div>

          {/* Center License Plate */}
          <div className="px-4 py-1.5 rounded-lg bg-neutral-950 border-2 border-amber-400 text-amber-300 font-mono font-bold tracking-widest text-xs sm:text-sm shadow-md">
            TN 33 AD 2026
          </div>

          {/* Right Wheel Assembly */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono">KANGAYAM FOOD TRUCK</span>
            </div>
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border-4 border-amber-500/60 shadow-[0_5px_15px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Road Surface Shadow */}
        <div className="w-full h-3 bg-gradient-to-r from-transparent via-neutral-950 to-transparent mt-2 opacity-80" />
      </motion.div>
    </div>
  );
};

