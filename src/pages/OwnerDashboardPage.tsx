import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ChefHat,
  PackageCheck,
  History,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Flame,
  ShieldCheck,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Ban,
  MapPin,
  Truck,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { foodItems, getStoredStockMap, saveStockStatus } from '../data/foodData';
import { Booking, BookingStatus, FoodItem } from '../types';

export const OwnerDashboardPage: React.FC = () => {
  const { user, login } = useAuth();
  const { bookings, updateBookingStatus } = useBooking();

  // Tab selection: 'active' | 'history' | 'stock'
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'stock'>('active');

  // Owner Login Modal State if not authenticated as owner
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stock State Map: { itemId: boolean }
  const [stockMap, setStockMap] = useState<Record<string, boolean>>(() => getStoredStockMap());

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const isOwner = user?.role === 'owner' || user?.email === 'owner@arabiandelights.com';

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await login(ownerEmail, ownerPassword);
      if (!res.success) {
        setLoginError(res.error || 'Failed to authenticate as Owner.');
      }
    } catch {
      setLoginError('Authentication error. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleToggleStock = (foodId: string, currentAvailable: boolean) => {
    const newStatus = !currentAvailable;
    const updatedMap = saveStockStatus(foodId, newStatus);
    setStockMap({ ...updatedMap });
  };

  const handleMarkCollected = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Completed');
  };

  // Filter Bookings
  const activeBookings = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready'
  );

  const historyBookings = bookings.filter(
    (b) => b.status === 'Completed' || b.status === 'Cancelled'
  );

  const filteredHistory = historyBookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If not logged in as owner, show dedicated Owner Portal Login
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0404] via-[#120707] to-black py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-b from-[#1c0e0e] via-[#140808] to-[#0d0505] rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-950 border border-amber-500/50 mx-auto flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black font-['Cinzel'] text-white">
              RESTRICTED OWNER PORTAL
            </h1>
            <p className="text-xs text-neutral-400">
              Authorized food truck manager access only. Please sign in with your single owner account credentials.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Owner ID / Email
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Enter owner email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Owner Password
              </label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-['Cinzel'] font-black text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  SIGN IN TO OWNER DASHBOARD
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080303] via-[#120707] to-black py-8 px-4 sm:px-6 lg:px-8" id="owner-dashboard-container">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Owner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-[#180d0d] to-amber-950/60 border-2 border-amber-500/40 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-black font-black shadow-lg">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black font-['Cinzel'] text-white">
                  FOOD TRUCK OWNER PORTAL
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                  LIVE MANAGER
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Kangayam Food Truck • Pre-Booking & Menu Stock Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-2.5 rounded-2xl border border-amber-500/30 text-xs text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LoggedIn: <strong className="text-amber-300">owner@arabiandelights.com</strong></span>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-amber-500/30 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Pending Pre-Bookings</span>
              <span className="text-2xl font-black text-amber-400 font-['Cinzel']">
                {activeBookings.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-emerald-500/30 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Collected Orders</span>
              <span className="text-2xl font-black text-emerald-400 font-['Cinzel']">
                {historyBookings.filter((b) => b.status === 'Completed').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-700 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Menu Stock Items</span>
              <span className="text-2xl font-black text-white font-['Cinzel']">
                {foodItems.filter((f) => (stockMap[f.id] !== undefined ? stockMap[f.id] : f.available)).length} / {foodItems.length} IN STOCK
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-neutral-800 pb-3">
          <button
            type="button"
            id="owner-tab-active-orders"
            onClick={() => setActiveTab('active')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active Customer Orders ({activeBookings.length})</span>
          </button>

          <button
            type="button"
            id="owner-tab-order-history"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Order History ({historyBookings.length})</span>
          </button>

          <button
            type="button"
            id="owner-tab-stock-management"
            onClick={() => setActiveTab('stock')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Product Stock Control</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ACTIVE PRE-BOOKED ORDERS (MARK COLLECTED) */}
        {/* ============================================================ */}
        {activeTab === 'active' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Pre-Booked Customer Orders
              </h2>
              <span className="text-xs text-neutral-400">
                Click <strong>"Mark Collected"</strong> when food is handed over to customer
              </span>
            </div>

            {activeBookings.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
                <h3 className="text-base font-bold text-white font-['Cinzel']">
                  No Active Pending Orders
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  All customer pre-bookings have been collected or moved to Order History.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-gradient-to-b from-[#180d0d] via-[#120707] to-[#0a0404] border-2 border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Token ID & Payment Pill */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                          Token ID
                        </span>
                        <span className="font-mono text-base font-black text-amber-300">
                          {booking.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/60 text-amber-300 text-xs font-black uppercase flex items-center gap-1">
                          {booking.orderType === 'Home Delivery' ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                          {booking.orderType || 'Pickup'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-bold uppercase">
                          ● {booking.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${booking.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-red-950 text-red-300 border border-red-500/50'}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-neutral-200">
                        <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-bold">{booking.customerName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-amber-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{booking.deliveryPhone || booking.customerPhone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{booking.pickupDate}</span>
                      </div>

                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{booking.pickupTime}</span>
                      </div>
                    </div>

                    {/* Home Delivery Address Display */}
                    {booking.orderType === 'Home Delivery' && booking.deliveryAddress && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-0.5">
                        <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Delivery Address:
                        </span>
                        <div className="text-white text-xs font-medium">{booking.deliveryAddress}</div>
                      </div>
                    )}

                    {/* Food Snapshot */}
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.foodItem.image}
                          alt={booking.foodItem.name}
                          className="w-12 h-12 rounded-lg object-cover border border-amber-500/30 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {booking.foodItem.name} (x{booking.quantity})
                          </div>
                          {booking.selectedAddOns.length > 0 && (
                            <div className="text-[11px] text-amber-300">
                              + {booking.selectedAddOns.map((a) => a.name).join(', ')}
                            </div>
                          )}
                          {booking.specialInstructions && (
                            <div className="text-[10px] text-neutral-400 italic">
                              Note: {booking.specialInstructions}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-['Cinzel'] font-black text-amber-300 text-sm">
                        ₹{booking.totalAmount}
                      </div>
                    </div>

                    {/* Action Button: Mark Collected */}
                    <button
                      type="button"
                      id={`mark-collected-btn-${booking.id}`}
                      onClick={() => handleMarkCollected(booking.id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-['Cinzel'] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      MARK AS COLLECTED (MOVE TO HISTORY)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ORDER HISTORY */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Completed & Collected Order History
              </h2>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone or token ID..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs outline-none focus:border-amber-400 w-60"
                  />
                </div>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-neutral-400 text-xs">
                No order history matches your filter criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300">{booking.id}</span>
                          <span className="font-bold text-white">{booking.customerName}</span>
                          <span className="text-neutral-400">({booking.customerPhone})</span>
                        </div>
                        <div className="text-neutral-300 mt-0.5">
                          {booking.foodItem.name} x{booking.quantity} • Slot: {booking.pickupTime} ({booking.pickupDate})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-['Cinzel'] font-black text-amber-300 text-sm">
                        ₹{booking.totalAmount}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase">
                        COLLECTED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PRODUCT STOCK MANAGEMENT (IN STOCK / OUT OF STOCK) */}
        {/* ============================================================ */}
        {activeTab === 'stock' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-['Cinzel'] flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  Live Product Stock & Availability Control
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Toggle items <strong>Out of Stock</strong> when ingredients run out. Customers will immediately see "SOLD OUT" on the menu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {foodItems.map((item) => {
                const isAvailable = stockMap[item.id] !== undefined ? stockMap[item.id] : item.available;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isAvailable
                        ? 'bg-neutral-950/90 border-amber-500/30'
                        : 'bg-red-950/20 border-red-500/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isAvailable
                                ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                                : 'bg-red-950 border border-red-500/50 text-red-300'
                            }`}
                          >
                            {isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm leading-tight mt-0.5 font-['Cinzel']">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-amber-300">₹{item.price}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`toggle-stock-btn-${item.id}`}
                      onClick={() => handleToggleStock(item.id, isAvailable)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isAvailable
                          ? 'bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          Mark OUT OF STOCK
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark IN STOCK
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
