import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Sparkles, Utensils, Flame, Leaf, Award } from 'lucide-react';
import { foodCategories, getEffectiveFoodItems } from '../data/foodData';
import { FoodCategory, FoodItem, FoodType } from '../types';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openFoodModal, selectedFoodForModal, closeFoodModal, setDraftFromFood } = useBooking();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'veg' | 'non-veg'>('all');

  const allFoodItems = getEffectiveFoodItems();

  const filteredItems = allFoodItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ingredients && item.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesType = selectedType === 'all' || item.type === selectedType;

    return matchesCategory && matchesSearch && matchesType;
  });

  const handlePreBookDirect = (food: FoodItem) => {
    // If food has add-ons, open modal so customer can choose add-ons, or pre-populate and open modal
    openFoodModal(food);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] py-8 px-4 sm:px-6 lg:px-8" id="menu-page-container">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            <span>Full Food Truck Menu</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-white">
            ARABIAN DELIGHTS KITCHEN
          </h1>
          <p className="text-xs sm:text-base text-neutral-400 font-light">
            Every item is freshly marinated, prepared on live charcoal rotisserie, and ready for express pickup.
          </p>
        </div>

        {/* ============================================================ */}
        {/* SEARCH & FILTERS BAR */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/90 border border-amber-500/30 shadow-lg space-y-4">
          
          {/* Top row: Search input + Veg/Non-Veg toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="menu-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shawarma, plates, fries, falafel, drinks..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-sm text-white placeholder-neutral-500 outline-none transition-all"
              />
            </div>

            {/* Diet preference filter buttons */}
            <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 shrink-0 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedType === 'all'
                    ? 'bg-amber-500 text-black'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                All ({allFoodItems.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('non-veg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  selectedType === 'non-veg'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-300 hover:text-red-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Non-Veg
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('veg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  selectedType === 'veg'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-300 hover:text-emerald-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Pure Veg
              </button>
            </div>
          </div>

          {/* Bottom row: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {foodCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  id={`category-tab-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-black'
                      : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-amber-200 border border-neutral-800'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* FOOD ITEMS GRID */}
        {/* ============================================================ */}
        <div>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onViewDetails={openFoodModal}
                  onPreBook={handlePreBookDirect}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800 p-8 space-y-4">
              <Utensils className="w-12 h-12 text-neutral-600 mx-auto stroke-[1.5]" />
              <h3 className="text-xl font-bold text-white font-['Cinzel']">
                No Food Items Match Your Search
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Try searching for something else or switch categories to explore all our delicious food truck offerings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setSelectedType('all');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Food Detail Modal */}
      <FoodDetailModal
        food={selectedFoodForModal}
        isOpen={!!selectedFoodForModal}
        onClose={closeFoodModal}
      />
    </div>
  );
};
