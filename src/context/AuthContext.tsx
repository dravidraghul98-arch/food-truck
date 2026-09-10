import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'arabian_delights_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Sync Supabase Auth session if active
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const mappedUser: User = {
          id: sbUser.id,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Customer',
          email: sbUser.email || '',
          phone: sbUser.user_metadata?.phone || '+91 98427 12345',
          createdAt: sbUser.created_at || new Date().toISOString(),
        };
        setUser(mappedUser);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Authenticate directly against Supabase PostgreSQL auth.users
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: pass }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      // Fallback Supabase client login
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass,
      });

      if (!sbError && sbData.user) {
        const activeUser: User = {
          id: sbData.user.id,
          name: sbData.user.user_metadata?.name || trimmedEmail.split('@')[0],
          email: sbData.user.email || trimmedEmail,
          phone: sbData.user.user_metadata?.phone || '+91 98427 12345',
          createdAt: sbData.user.created_at || new Date().toISOString(),
        };
        setUser(activeUser);
        return { success: true };
      }

      return { success: false, error: data.error || sbError?.message || 'Invalid credentials. Please register an account.' };
    } catch {
      return { success: false, error: 'Unable to connect to authentication server.' };
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

      // Register directly in Supabase PostgreSQL (auth.users & public.profiles)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          password: pass,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      // Fallback Supabase SDK client register
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (!sbError && sbData.user) {
        const newUser: User = {
          id: sbData.user.id,
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        return { success: true };
      }

      return { success: false, error: data.error || sbError?.message || 'Registration failed.' };
    } catch {
      return { success: false, error: 'Registration failed due to network error.' };
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

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
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
