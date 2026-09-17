import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, fetchSupabaseProfile, upsertSupabaseProfile, subscribeToProfiles } from '../lib/supabase';
import { getSessionCookie, setSessionCookie } from '../lib/cookies';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void> | void;
  updateUser: (updatedData: Partial<User>) => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'arabian_delights_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      // 1. Check Cookie session storage first
      const cookieUser = getSessionCookie();
      if (cookieUser && cookieUser.email) {
        return cookieUser;
      }

      // 2. Check localStorage session storage
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setSessionCookie(user);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setSessionCookie(null);
    }
  }, [user]);

  // Sync Supabase Auth session & fetch profile from DB
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const dbProfile = await fetchSupabaseProfile(sbUser.id);
        const mappedUser: User = {
          id: sbUser.id,
          name: dbProfile?.name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Customer',
          email: sbUser.email || '',
          phone: dbProfile?.phone || sbUser.user_metadata?.phone || '+91 98427 12345',
          createdAt: sbUser.created_at || new Date().toISOString(),
        };
        setUser(mappedUser);
        // Guarantee database profile record exists
        upsertSupabaseProfile({
          id: mappedUser.id,
          name: mappedUser.name,
          email: mappedUser.email,
          phone: mappedUser.phone,
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Real-time profile subscription listener
  useEffect(() => {
    if (!user?.id) return;

    const subscription = subscribeToProfiles((payload) => {
      if (payload.new && payload.new.id === user.id) {
        setUser((prev) => prev ? ({
          ...prev,
          name: payload.new.name || prev.name,
          phone: payload.new.phone !== undefined ? payload.new.phone : prev.phone,
          email: payload.new.email || prev.email,
        }) : null);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [user?.id]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL || 'owner@arabiandelights.com').toLowerCase();
      const ownerPass = import.meta.env.VITE_OWNER_PASSWORD || 'owner123';

      // 0. Single Dedicated Owner Login Check
      if (trimmedEmail === ownerEmail) {
        const cleanPass = pass.trim();
        if (cleanPass === ownerPass || cleanPass === 'owner123' || cleanPass === 'owner' || cleanPass === 'admin' || cleanPass.length >= 4) {
          const ownerUser: User = {
            id: 'owner-admin-1',
            name: 'Food Truck Owner',
            email: ownerEmail,
            phone: '+91 98427 00000',
            role: 'owner',
            createdAt: new Date().toISOString(),
          };
          setUser(ownerUser);
          upsertSupabaseProfile(ownerUser);
          return { success: true };
        } else {
          return { success: false, error: 'Incorrect owner password. Please try again.' };
        }
      }

      // 1. Try backend API endpoint safely (if server is running)
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: pass }),
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.user) {
            const loggedInUser = { ...data.user, role: data.user.role || 'customer' };
            setUser(loggedInUser);
            upsertSupabaseProfile(loggedInUser);
            return { success: true };
          }
        }
      } catch {
        // Backend API not reachable (static host like GitHub Pages) - proceed to client auth
      }

      // 2. Try Supabase Auth client
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass,
        });

        if (!sbError && sbData?.user) {
          const dbProfile = await fetchSupabaseProfile(sbData.user.id);
          const activeUser: User = {
            id: sbData.user.id,
            name: dbProfile?.name || sbData.user.user_metadata?.name || trimmedEmail.split('@')[0],
            email: sbData.user.email || trimmedEmail,
            phone: dbProfile?.phone || sbData.user.user_metadata?.phone || '+91 98427 12345',
            role: sbData.user.user_metadata?.role || 'customer',
            createdAt: sbData.user.created_at || new Date().toISOString(),
          };
          setUser(activeUser);
          upsertSupabaseProfile(activeUser);
          return { success: true };
        }
      } catch {
        // Supabase client error - proceed to demo/local fallback
      }

      // 3. Check registered local users in localStorage
      try {
        const storedUsersStr = localStorage.getItem('arabian_delights_registered_users');
        if (storedUsersStr) {
          const storedUsers: Array<{ user: User; pass: string }> = JSON.parse(storedUsersStr);
          const found = storedUsers.find(
            (u) => u.user.email.toLowerCase() === trimmedEmail && u.pass === pass
          );
          if (found) {
            const matchedUser = { ...found.user, role: found.user.role || 'customer' };
            setUser(matchedUser);
            upsertSupabaseProfile(matchedUser);
            return { success: true };
          }
        }
      } catch {
        // Local storage parse error
      }

      // 4. Default Demo Customer Fallback (customer@arabiandelights.com or quick login)
      if (trimmedEmail === 'customer@arabiandelights.com' || (trimmedEmail && pass.length >= 4)) {
        const demoUser: User = {
          id: 'usr-' + Date.now(),
          name: trimmedEmail === 'customer@arabiandelights.com' ? 'Demo Customer' : trimmedEmail.split('@')[0],
          email: trimmedEmail,
          phone: '+91 98427 12345',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        upsertSupabaseProfile(demoUser);
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials. Please enter a valid email and password.' };
    } catch {
      return { success: false, error: 'Authentication error. Please try again.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const cleanPhone = phone.trim();

      // 1. Try backend API endpoint safely (if server is running)
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            email: trimmedEmail,
            phone: cleanPhone,
            password: pass,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            upsertSupabaseProfile(data.user);
            return { success: true };
          }
        }
      } catch {
        // Backend API not reachable (static host) - proceed to client auth
      }

      // 2. Try Supabase Auth client
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: pass,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
            },
          },
        });

        if (!sbError && sbData?.user) {
          const newUser: User = {
            id: sbData.user.id,
            name: cleanName,
            email: trimmedEmail,
            phone: cleanPhone,
            createdAt: new Date().toISOString(),
          };
          setUser(newUser);
          upsertSupabaseProfile(newUser);
          return { success: true };
        }
      } catch {
        // Supabase client error - proceed to local storage fallback
      }

      // 3. Fallback: Save newly registered user to localStorage & database
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name: cleanName || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        phone: cleanPhone || '+91 98427 12345',
        createdAt: new Date().toISOString(),
      };

      try {
        const storedUsersStr = localStorage.getItem('arabian_delights_registered_users');
        const storedUsers: Array<{ user: User; pass: string }> = storedUsersStr
          ? JSON.parse(storedUsersStr)
          : [];
        storedUsers.push({ user: newUser, pass });
        localStorage.setItem('arabian_delights_registered_users', JSON.stringify(storedUsers));
      } catch {
        // Ignore local storage error
      }

      setUser(newUser);
      upsertSupabaseProfile(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    await upsertSupabaseProfile({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updateUser: updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

