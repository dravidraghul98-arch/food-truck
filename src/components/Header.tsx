import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, ShoppingBag, UtensilsCrossed, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { bookings } = useBooking();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Preparing' || b.status === 'Ready'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isOwner = user?.role === 'owner' || user?.email === 'owner@arabiandelights.com';

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Menu', path: '/menu' },
    { name: 'Pre-Book', path: '/pre-book' },
    { name: 'My Bookings', path: '/bookings', count: activeBookingsCount },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0c0909]/95 backdrop-blur-md border-b border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo on Left */}
          <NavLink to="/home" className="flex items-center" id="header-logo-link">
            <BrandLogo size="md" />
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-amber-300 bg-amber-950/60 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'text-neutral-300 hover:text-amber-200 hover:bg-neutral-900/60'
                  }`
                }
              >
                {link.name}
                {link.count !== undefined && link.count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {link.count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions (Profile & Logout) */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/profile"
              id="header-profile-button"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-amber-500/40 hover:text-white'
                }`
              }
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-black font-bold text-[10px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[100px] truncate">{user?.name || 'Account'}</span>
            </NavLink>

            <button
              type="button"
              id="header-logout-button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-red-500/60 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <NavLink
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-black font-bold text-xs"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </NavLink>

            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-amber-300"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#120a0a] border-b border-amber-500/30 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold ${
                  isActive
                    ? 'bg-gradient-to-r from-red-950/80 to-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-300 hover:bg-neutral-900'
                }`
              }
            >
              <span>{link.name}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                  {link.count} active
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{user?.name}</div>
                <div className="text-neutral-400 text-[10px]">{user?.phone}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
