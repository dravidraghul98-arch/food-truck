import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, ShieldCheck, CheckCircle, Flame, Clock, MapPin, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        const from = (location.state as any)?.from?.pathname || '/home';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('customer@arabiandelights.com');
    setPassword('password123');
    setErrorMessage('');
  };

  const handleQuickOwnerFill = () => {
    setEmail('owner@arabiandelights.com');
    setPassword('owner123');
    setErrorMessage('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#080303] via-[#120707] to-black relative overflow-hidden" id="login-page-container">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Panel Login Container */}
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#180d0d] via-[#120707] to-[#0a0404] rounded-3xl border-2 border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.2)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: ARABIAN FOOD TRUCK HERO PHOTO & BRAND SHOWCASE */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[620px] bg-neutral-950 flex flex-col justify-between p-6 sm:p-8 overflow-hidden border-b lg:border-b-0 lg:border-r border-amber-500/30">
          
          {/* Background Food Truck Photo */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1600&q=85"
              alt="Arabian Delights Food Truck at Night"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.7] contrast-[1.1]"
            />
            {/* Rich Gradient Overlays for High Contrast & Brand Mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120707] via-[#120707]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120707]/90 via-transparent to-[#120707]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.25)_0%,transparent_70%)]" />
          </div>

          {/* Top Brand Badge on Photo */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/50 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Live Food Truck • Kangayam
              </span>
            </div>

            <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0</span>
            </div>
          </div>

          {/* Center Brand Identity on Photo */}
          <div className="relative z-10 my-auto py-6 text-center lg:text-left">
            <div className="inline-block p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/40 mb-4 shadow-xl">
              <BrandLogo size="lg" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-white leading-tight drop-shadow-md">
              Fresh Rotisserie Shawarma On Wheels
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200 mt-2 max-w-md font-light leading-relaxed drop-shadow">
              Kangayam’s premier authentic Middle Eastern food truck. Pre-book your hot shawarma rolls, grilled platters, and garlic toum before you arrive to skip the line.
            </p>

            {/* Quick Feature Bullets */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-amber-500/30 text-[11px] text-amber-200">
                <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                <span className="font-semibold">Live Rotisserie Spits</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-amber-500/30 text-[11px] text-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">Zero-Wait Pre-Booking</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-amber-500/30 text-[11px] text-amber-200">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-semibold">Near Bus Stand Road</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-amber-500/30 text-[11px] text-amber-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">100% Halal Spices</span>
              </div>
            </div>
          </div>

          {/* Customer Quote Bottom Overlay */}
          <div className="relative z-10 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-500/30 text-xs text-neutral-300">
            <p className="italic text-[11px] text-neutral-200">
              "The Schezwan Shawarma and Arabic Plate are sensational. Pre-booking online means food is piping hot right when I arrive!"
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-amber-400 font-bold">
              <span>— Karthik R., Regular Customer</span>
              <span>Kangayam Foodie</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LOGIN FORM & ONE-CLICK DEMO ACCESS */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-gradient-to-b from-[#1c0e0e] via-[#140808] to-[#0d0505]">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>Customer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-white">
              Sign In to Pre-Book
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Access live menu, customized spices & express pickup slots
            </p>
          </div>

          {/* Quick Demo Mode One-Click Buttons */}
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2 shadow-inner">
            <div className="text-xs text-amber-200">
              <span className="font-bold block text-amber-300">🚀 Quick Access</span>
              Instant fill demo credentials
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="demo-login-fill-btn"
                onClick={handleQuickDemoFill}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
              >
                Fill Customer
              </button>

              <button
                type="button"
                id="owner-login-fill-btn"
                onClick={handleQuickOwnerFill}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Fill Owner
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@arabiandelights.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-neutral-500 text-sm transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-neutral-500 text-sm transition-all outline-none"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-button"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-['Cinzel'] font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  SIGN IN TO PRE-BOOK
                </>
              )}
            </button>
          </form>

          {/* Bottom Register CTA */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <p className="text-xs sm:text-sm text-neutral-400">
              New to Arabian Delights?{' '}
              <Link
                to="/register"
                id="goto-register-link"
                className="text-amber-400 hover:text-amber-300 font-bold ml-1 transition-colors underline"
              >
                Create Free Account
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Kangayam Food Truck • Open Daily 4:00 PM – 11:00 PM
            </span>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#180a0a] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-['Cinzel']">
              Reset Password
            </h3>
            <p className="text-xs text-neutral-300">
              Enter your email address to receive password reset instructions.
            </p>

            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reset instructions sent to {forgotEmail}!</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm outline-none focus:border-amber-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

