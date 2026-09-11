/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { MessageProvider } from './context/MessageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { PreBookPage } from './pages/PreBookPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';

// Route guard for customer protected pages (redirects owner to /owner)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOwner = user?.role === 'owner' || user?.email === 'owner@arabiandelights.com';
  if (isOwner) {
    return <Navigate to="/owner" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const IndexRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isOwner = user?.role === 'owner' || user?.email === 'owner@arabiandelights.com';
  return isOwner ? <Navigate to="/owner" replace /> : <Navigate to="/home" replace />;
};

// Layout wrapper that hides Header/Footer on Login/Register or for Owner
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isOwner = user?.role === 'owner' || user?.email === 'owner@arabiandelights.com';

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-['Plus_Jakarta_Sans'] selection:bg-amber-500 selection:text-black">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && !isOwner && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <BookingProvider>
          <MessageProvider>
            <AppLayout>
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<IndexRedirect />} />

                {/* Public Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Main App routes */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Protected / Interactive Customer Booking routes */}
                <Route
                  path="/pre-book"
                  element={
                    <ProtectedRoute>
                      <PreBookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Portal Route */}
                <Route path="/owner" element={<OwnerDashboardPage />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AppLayout>
          </MessageProvider>
        </BookingProvider>
      </AuthProvider>
    </HashRouter>
  );
}
