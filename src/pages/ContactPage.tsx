import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0606] via-[#120808] to-[#080404] py-10 px-4 sm:px-6 lg:px-8" id="contact-page-container">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <BrandLogo size="md" className="justify-center mx-auto mb-1" />
          <h1 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-white">
            CONTACT & TRUCK LOCATION
          </h1>
          <p className="text-xs sm:text-base text-neutral-400 max-w-xl mx-auto">
            Find the Arabian Delights food truck in Kangayam or reach out for bulk orders and event catering.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Info Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Cards */}
            <div className="p-6 rounded-3xl bg-neutral-950/90 border-2 border-amber-500/30 shadow-xl space-y-5">
              <h3 className="font-['Cinzel'] font-bold text-lg text-amber-300 border-b border-neutral-800 pb-3 uppercase tracking-wider">
                Food Truck Info
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Truck Location</div>
                    <div className="text-neutral-400 mt-0.5 leading-relaxed">
                      Near Bus Stand Main Road, Kangayam, Tirupur Dist, Tamil Nadu - 638701
                    </div>
                  </div>
                </div>

                {/* Timing */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Opening Hours</div>
                    <div className="text-amber-300 font-bold mt-0.5">
                      OPEN DAILY: 4:00 PM – 11:00 PM
                    </div>
                    <div className="text-neutral-400 text-xs">Live rotisserie & kitchen service</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Direct Phone</div>
                    <a href="tel:+919842712345" className="text-emerald-400 font-mono font-bold block hover:underline">
                      +91 98427 12345
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Customer Support</div>
                    <a href="mailto:hello@arabiandelights.com" className="text-neutral-300 font-mono block hover:underline">
                      hello@arabiandelights.com
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Map / Navigation Visual */}
            <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase">
                <span>Kangayam Landmark</span>
                <span className="text-emerald-400">● 50m from Bus Stand</span>
              </div>
              <div className="h-32 rounded-2xl bg-[#141a1f] border border-neutral-700 relative overflow-hidden flex items-center justify-center text-center p-3">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin className="w-4 h-4 fill-white" />
                  </div>
                  <div className="font-bold text-xs text-white">Arabian Delights Spot</div>
                  <div className="text-[10px] text-neutral-400">Bus Stand Road, Kangayam</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Contact Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1a0f0f] via-[#140b0b] to-[#0d0707] border-2 border-amber-500/30 shadow-2xl space-y-6">
              
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-['Cinzel'] text-white">
                  Send Us a Message
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Have questions about catering, corporate bulk orders, or custom shawarma platters?
                </p>
              </div>

              {isSent && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Thank you for contacting Arabian Delights!</div>
                    <div>Our team will get in touch with you shortly.</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohith"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98427 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need or inquire about food truck bookings..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-['Cinzel'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      SEND INQUIRY
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
