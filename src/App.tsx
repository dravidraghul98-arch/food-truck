/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
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

// Route guard for protected pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const IndexRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

// Layout wrapper that hides Header/Footer on Login/Register if needed or keeps it clean
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-['Plus_Jakarta_Sans'] selection:bg-amber-500 selection:text-black">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
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

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </AppLayout>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
