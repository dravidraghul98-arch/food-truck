import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, ShoppingBag, ShieldCheck, LogOut, CheckCircle2, Award, Sparkles, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { BrandLogo } from '../components/BrandLogo';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, updateUser } = useAuth();
  const { bookings } = useBooking();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalSpent = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeOrdersCount = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready'
  ).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saveFn = updateProfile || updateUser;
      if (saveFn) {
        await saveFn({ name, phone });
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] py-10 px-4 sm:px-6 lg:px-8" id="profile-page-container">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#180d0d] via-[#120707] to-[#0c0404] border-2 border-amber-500/30 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-amber-500/20 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-300 font-['Cinzel'] font-black text-2xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-['Cinzel'] text-white">
                    {user?.name || 'Customer Account'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    VIP Foodie
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 font-mono">{user?.email}</p>
                <div className="text-xs text-amber-300/90 mt-0.5 font-mono">{user?.phone}</div>
              </div>
            </div>

            <button
              type="button"
              id="profile-logout-button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Total Bookings</div>
                <div className="font-['Cinzel'] font-black text-lg text-white">
                  {bookings.length} Orders
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Active Pickup Slots</div>
                <div className="font-['Cinzel'] font-black text-lg text-emerald-300">
                  {activeOrdersCount} Pending
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Total Spent</div>
                <div className="font-['Cinzel'] font-black text-lg text-amber-300">
                  ₹{totalSpent}
                </div>
              </div>
            </div>

          </div>

          {/* Edit Profile Form */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Cinzel'] font-bold text-base text-white">
                Account Information
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.name || '');
                      setPhone(user?.phone || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Customer Name</span>
                  <span className="font-bold text-white text-sm">{user?.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Mobile Contact</span>
                  <span className="font-mono font-bold text-white text-sm">{user?.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
            <Link
              to="/bookings"
              className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 text-xs font-bold text-center"
            >
              View Order Tokens & Pickups
            </Link>
            <Link
              to="/menu"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-neutral-950 text-xs font-black font-['Cinzel'] tracking-wider uppercase text-center"
            >
              Pre-Book Next Meal
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
