import React from 'react';
import { Clock, Star, Plus, Eye, Sparkles } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onViewDetails: (food: FoodItem) => void;
  onPreBook: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onViewDetails, onPreBook }) => {
  return (
    <div
      id={`food-card-${food.id}`}
      className="group relative rounded-2xl bg-gradient-to-b from-neutral-900/90 via-[#180d0d]/80 to-black/90 border border-neutral-800 hover:border-amber-500/50 shadow-lg hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
        <img
          src={food.image}
          alt={food.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-black/30" />

        {/* Veg/Non-Veg & Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center ${
              food.type === 'veg'
                ? 'border-emerald-500 bg-emerald-950/80'
                : 'border-red-500 bg-red-950/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                food.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </span>

          {food.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-sm">
              {food.badge}
            </span>
          )}
        </div>

        {/* Rating Pill Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {food.rating.toFixed(1)}
        </div>

        {/* Price Tag Overlay Bottom Left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="font-['Cinzel'] text-xl font-black text-amber-300 drop-shadow-md">
            ₹{food.price}
          </span>
        </div>

        {/* Prep Time Overlay Bottom Right */}
        <div className="absolute bottom-2.5 right-3 text-[11px] text-neutral-300 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-amber-400" />
          {food.prepTimeMinutes}m
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] text-amber-400/90 font-medium uppercase tracking-wider mb-1">
            {food.category}
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors font-['Cinzel'] line-clamp-1">
            {food.name}
          </h3>
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-light leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(food)}
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </button>

          <button
            type="button"
            onClick={() => onPreBook(food)}
            disabled={!food.available}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer font-['Cinzel'] tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
            Pre-Book
          </button>
        </div>
      </div>
    </div>
  );
};
