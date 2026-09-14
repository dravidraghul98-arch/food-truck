import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Flame, Clock, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { FoodAddOn, FoodItem, ServingOption } from '../types';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setDraftFromFood } = useBooking();

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<FoodAddOn[]>([]);
  const [selectedServingOption, setSelectedServingOption] = useState<ServingOption | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Reset or preset add-ons and serving options when modal opens with a food item
  useEffect(() => {
    if (food) {
      setQuantity(1);
      // Pre-select default add-ons if any
      setSelectedAddOns(food.addOns.filter((a) => a.defaultSelected));
      if (food.servingOptions && food.servingOptions.length > 0) {
        setSelectedServingOption(food.servingOptions[0]);
      } else {
        setSelectedServingOption(null);
      }
    }
  }, [food]);

  if (!isOpen || !food) return null;

  const toggleAddOn = (addOn: FoodAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const basePrice = selectedServingOption ? selectedServingOption.price : food.price;
  const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const singleItemPrice = basePrice + addOnsTotal;
  const totalPrice = singleItemPrice * quantity;

  const handlePreBook = () => {
    const customizedFood: FoodItem = selectedServingOption
      ? {
          ...food,
          name: `${food.name} (${selectedServingOption.name})`,
          price: selectedServingOption.price,
        }
      : food;

    setDraftFromFood(
      customizedFood,
      quantity,
      selectedAddOns,
      user
        ? {
            name: user.name,
            phone: user.phone,
            email: user.email,
          }
        : undefined
    );
    onClose();
    navigate('/pre-book');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c1212] via-[#140b0b] to-[#0d0707] rounded-3xl border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.2)] overflow-hidden z-10 my-auto"
          id="food-detail-modal"
        >
          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 border border-amber-500/40 text-neutral-300 hover:text-white hover:bg-red-900/80 transition-all flex items-center justify-center shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Image Section */}
          <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-neutral-900">
            <img
              src={food.image}
              alt={food.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1212] via-black/40 to-transparent" />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  food.type === 'veg'
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                    : 'bg-red-950/90 text-red-300 border border-red-500/50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    food.type === 'veg' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                {food.type === 'veg' ? 'Pure Veg' : 'Non-Veg Special'}
              </span>

              {food.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-md">
                  {food.badge}
                </span>
              )}
            </div>

            {/* Favorite Quick Button */}
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-neutral-700 flex items-center justify-center transition-all hover:scale-110"
              aria-label="Favorite"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-300'
                }`}
              />
            </button>

            {/* Price Badge on Image Corner */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-500/40">
              <span className="text-xs text-neutral-400 font-medium block">Base Price</span>
              <span className="text-xl sm:text-2xl font-['Cinzel'] font-black text-amber-300">
                ₹{food.price}
              </span>
            </div>
          </div>

          {/* Modal Body & Customization Controls */}
          <div className="p-5 sm:p-7 max-h-[calc(85vh-14rem)] overflow-y-auto space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
                  {food.category}
                </span>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {food.prepTimeMinutes} mins
                  </span>
                  {food.calories && <span>• {food.calories}</span>}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-white mt-1">
                {food.name}
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                {food.description}
              </p>
            </div>

            {/* Ingredients Tags if available */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Key Ingredients & Spices
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SERVING STYLE OPTION (ROLL VS PLATE) */}
            {food.servingOptions && food.servingOptions.length > 1 && (
              <div className="rounded-2xl bg-neutral-950/80 border border-amber-500/30 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Select Serving Style (Roll or Plate)
                  </h4>
                  <span className="text-xs font-semibold text-amber-400">Required</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {food.servingOptions.map((option) => {
                    const isSelected = selectedServingOption?.id === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedServingOption(option)}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-950/60 to-red-950/40 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                            <span>{option.id === 'roll' ? '🌯' : '🍽️'}</span>
                            <span>{option.name}</span>
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-400 bg-amber-500' : 'border-neutral-600 bg-neutral-800'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-300 font-['Cinzel']">
                          ₹{option.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADD-ONS SECTION */}
            {food.addOns.length > 0 && (
              <div className="rounded-2xl bg-neutral-950/80 border border-amber-500/20 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Customize & Add-Ons
                  </h4>
                  <span className="text-xs text-neutral-400">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {food.addOns.map((addOn) => {
                    const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-black'
                                : 'border-neutral-600 bg-neutral-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{addOn.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-300">+ ₹{addOn.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR & CALCULATION SUMMARY */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#180a0a] to-neutral-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Quantity
                </span>
                <div className="flex items-center gap-2 bg-neutral-900 border border-amber-500/40 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-base text-amber-300">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-colors font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Price Breakdown Formula Display */}
              <div className="text-right w-full sm:w-auto">
                <div className="text-[11px] text-neutral-400">
                  ₹{singleItemPrice} {quantity > 1 ? `× ${quantity} items` : ''}
                </div>
                <div className="text-2xl sm:text-3xl font-['Cinzel'] font-black text-amber-300">
                  ₹{totalPrice}
                </div>
              </div>
            </div>

            {/* PRE-BOOK ACTION BUTTON */}
            <div>
              {food.available ? (
                <button
                  type="button"
                  id="pre-book-modal-submit-button"
                  onClick={handlePreBook}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-neutral-950 font-['Cinzel'] font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transform hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 fill-neutral-950" />
                  PRE-BOOK NOW • ₹{totalPrice}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 rounded-2xl bg-neutral-800 text-neutral-500 font-bold uppercase tracking-wider cursor-not-allowed text-center"
                >
                  UNAVAILABLE TODAY
                </button>
              )}

              <p className="text-center text-[11px] text-neutral-400 mt-2">
                Fast pickup at Arabian Delights Food Truck, Kangayam • Freshly prepared for your slot
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
