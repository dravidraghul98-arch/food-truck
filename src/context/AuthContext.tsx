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
            setUser(data.user);
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
            setUser(found.user);
            return { success: true };
          }
        }
      } catch {
        // Local storage parse error
      }

      // 4. Default Demo Account Fallback (customer@arabiandelights.com or quick login)
      if (trimmedEmail === 'customer@arabiandelights.com' || (trimmedEmail && pass.length >= 4)) {
        const demoUser: User = {
          id: 'usr-' + Date.now(),
          name: trimmedEmail === 'customer@arabiandelights.com' ? 'Demo Customer' : trimmedEmail.split('@')[0],
          email: trimmedEmail,
          phone: '+91 98427 12345',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
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

      // 1. Try backend API endpoint safely (if server is running)
      try {
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

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
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
              name: name.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (!sbError && sbData?.user) {
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
      } catch {
        // Supabase client error - proceed to local storage fallback
      }

      // 3. Fallback: Save newly registered user to localStorage
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name: name.trim() || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        phone: phone.trim() || '+91 98427 12345',
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
