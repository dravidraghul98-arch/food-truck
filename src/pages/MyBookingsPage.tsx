import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Ticket,
  Sparkles,
  ShoppingBag,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Printer,
  ChevronDown,
  MapPin,
  Truck,
  Store,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Booking, BookingStatus } from '../types';

import { useAuth } from '../context/AuthContext';

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, cancelBooking, updateBookingStatus } = useBooking();
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeQrModal, setActiveQrModal] = useState<Booking | null>(null);
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);

  // Filter bookings to ONLY include those created by the logged-in customer account
  const myBookings = bookings.filter((b) => {
    if (!user) return false;
    return (
      (b.userId && user.id && b.userId === user.id) ||
      (b.customerEmail && user.email && b.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
      (b.customerName && user.name && b.customerName.toLowerCase() === user.name.toLowerCase())
    );
  });

  const filteredBookings = myBookings.filter((b) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready';
    if (filterStatus === 'Completed') return b.status === 'Completed';
    if (filterStatus === 'Cancelled') return b.status === 'Cancelled';
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/50';
      case 'Preparing':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse';
      case 'Ready':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'Completed':
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
      case 'Cancelled':
        return 'bg-red-950/80 text-red-300 border-red-500/50';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const advanceKitchenStatus = (booking: Booking) => {
    const sequence: BookingStatus[] = ['Confirmed', 'Preparing', 'Ready', 'Completed'];
    const currentIndex = sequence.indexOf(booking.status);
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      const next = sequence[currentIndex + 1];
      updateBookingStatus(booking.id, next);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] py-8 px-4 sm:px-6 lg:px-8" id="my-bookings-page-container">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Customer Orders & Tokens
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-['Cinzel'] text-white">
              MY PRE-BOOKINGS
            </h1>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-neutral-950 text-xs font-bold font-['Cinzel'] tracking-wider uppercase transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 fill-neutral-950" />
            + New Pre-Booking
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Active', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#180d0d] via-[#120707] to-[#0c0404] border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-xl space-y-4"
              >
                {/* Header: ID, Order Type, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                      {booking.id}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-950/80 border border-amber-500/50 text-amber-300 flex items-center gap-1">
                      {booking.orderType === 'Home Delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                      {booking.orderType || 'Pickup'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(booking.status)}`}>
                      ● {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {booking.pickupDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {booking.pickupTime}
                    </span>
                  </div>
                </div>

                {/* Main Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Food Picture & Name */}
                  <div className="md:col-span-6 flex items-start gap-3.5">
                    <img
                      src={booking.foodItem.image}
                      alt={booking.foodItem.name}
                      className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
                    />
                    <div>
                      {booking.items && booking.items.length > 1 ? (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                            Multi-Item Variety Order ({booking.items.reduce((acc, i) => acc + i.quantity, 0)} items)
                          </span>
                          <div className="space-y-1">
                            {booking.items.map((item, idx) => (
                              <div key={idx} className="text-xs text-white flex items-center gap-2">
                                <span className="font-bold text-amber-300 font-['Cinzel']">
                                  • {item.foodItem.name} (x{item.quantity})
                                </span>
                                <span className="text-neutral-400">₹{item.foodItem.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-['Cinzel'] font-bold text-base text-white">
                            {booking.foodItem.name}
                          </h3>
                          <div className="text-xs text-neutral-300">
                            Quantity: <span className="font-bold text-amber-300">{booking.quantity}</span>
                          </div>
                          {booking.selectedAddOns.length > 0 && (
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              Add-ons: {booking.selectedAddOns.map((a) => a.name).join(', ')}
                            </div>
                          )}
                        </>
                      )}
                      {booking.specialInstructions && (
                        <div className="text-[10px] text-neutral-400 italic mt-1">
                          "{booking.specialInstructions}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer & Location info */}
                  <div className="md:col-span-3 text-xs text-neutral-300 space-y-1">
                    <div>
                      <span className="text-neutral-500">Customer:</span> {booking.customerName}
                    </div>
                    {booking.orderType === 'Home Delivery' && booking.deliveryAddress ? (
                      <div className="text-[11px] text-amber-300 font-medium line-clamp-2">
                        <MapPin className="w-3 h-3 text-amber-400 inline mr-1" />
                        {booking.deliveryAddress}
                      </div>
                    ) : (
                      <div>
                        <span className="text-neutral-500">Phone:</span> {booking.customerPhone}
                      </div>
                    )}
                    <div className="text-emerald-400 font-semibold">
                      Paid: ₹{booking.totalAmount} ({booking.paymentMethod})
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveQrModal(booking)}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      View Token Pass
                    </button>

                    {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                      <div className="flex gap-2">
                        {/* Kitchen status simulator button */}
                        <button
                          type="button"
                          onClick={() => advanceKitchenStatus(booking)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                          title="Simulate Food Truck preparing & completing this order"
                        >
                          <ChefHat className="w-3 h-3 text-amber-400" />
                          Advance State
                        </button>

                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={() => setCancelPromptId(booking.id)}
                          className="py-1.5 px-2 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-300 text-[10px] font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Confirmation Prompt */}
                {cancelPromptId === booking.id && (
                  <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/80 flex items-center justify-between text-xs text-red-200">
                    <span>Cancel this pre-booking ({booking.id})?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          cancelBooking(booking.id);
                          setCancelPromptId(null);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                      >
                        Yes, Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelPromptId(null)}
                        className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded-lg"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-neutral-950/60 border border-amber-500/20 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Cinzel'] text-white">
              No bookings yet.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              You have no {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} pre-bookings right now. Select your favorite shawarma or platter to skip the queue!
            </p>
            <Link
              to="/menu"
              id="explore-menu-empty-button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-neutral-950 font-['Cinzel'] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 fill-neutral-950" />
              EXPLORE MENU
            </Link>
          </div>
        )}

      </div>

      {/* Pickup Token Pass Popup Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#140a0a] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/50 mx-auto flex items-center justify-center text-amber-300">
              <Ticket className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">
                Food Truck Pickup Token
              </span>
              <h3 className="font-mono text-2xl font-black text-white mt-1">
                {activeQrModal.id}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-left text-xs space-y-1.5">
              <div className="text-neutral-400">
                Item: <span className="font-bold text-white">{activeQrModal.foodItem.name} (x{activeQrModal.quantity})</span>
              </div>
              <div className="text-neutral-400">
                Customer: <span className="font-bold text-neutral-200">{activeQrModal.customerName}</span>
              </div>
              <div className="text-amber-300 font-bold">
                Pickup Slot: {activeQrModal.pickupTime} • {activeQrModal.pickupDate}
              </div>
              <div className="text-emerald-400 font-semibold pt-1 border-t border-neutral-800">
                Status: {activeQrModal.status} ({activeQrModal.paymentMethod})
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Close Token Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
