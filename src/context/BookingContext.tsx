import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus, FoodAddOn, FoodItem } from '../types';
import {
  supabase,
  fetchSupabaseBookings,
  createSupabaseBooking,
  updateSupabaseBookingStatus,
} from '../lib/supabase';
import { useAuth } from './AuthContext';


interface PreBookDraft {
  foodItem: FoodItem;
  quantity: number;
  selectedAddOns: FoodAddOn[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
}

interface BookingContextType {
  bookings: Booking[];
  activeDraft: PreBookDraft | null;
  selectedFoodForModal: FoodItem | null;
  openFoodModal: (item: FoodItem) => void;
  closeFoodModal: () => void;
  setDraftFromFood: (
    food: FoodItem,
    quantity: number,
    addOns: FoodAddOn[],
    userInfo?: { name: string; phone: string; email: string }
  ) => void;
  updateDraft: (updates: Partial<PreBookDraft>) => void;
  clearDraft: () => void;
  calculateDraftTotals: () => {
    itemBasePrice: number;
    addOnsPricePerItem: number;
    pricePerUnit: number;
    quantity: number;
    subtotal: number;
    convenienceFee: number;
    totalAmount: number;
  };
  createBooking: (paymentMethod: string) => Promise<Booking>;
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus) => void;
  getBookingById: (bookingId: string) => Booking | undefined;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'arabian_delights_customer_bookings';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [activeDraft, setActiveDraft] = useState<PreBookDraft | null>(null);

  // Pure real-time bookings starting empty
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading local bookings:', e);
    }
    return [];
  });

  // Fetch live real-time bookings from Supabase database on mount, merging with local state
  useEffect(() => {
    async function loadBookings() {
      const dbBookings = await fetchSupabaseBookings();
      if (dbBookings && dbBookings.length > 0) {
        setBookings((prev) => {
          const map = new Map<string, Booking>();
          // DB bookings first
          dbBookings.forEach((b) => map.set(b.id, b));
          // Local/recent bookings take precedence or get merged
          prev.forEach((b) => map.set(b.id, b));
          return Array.from(map.values());
        });
      }
    }
    loadBookings();
  }, []);


  // Subscribe to Realtime Supabase changes on public.bookings table
  useEffect(() => {
    const channel = supabase
      .channel('realtime:public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Real-time database change detected:', payload);
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            const newBooking: Booking = {
              id: newRow.id,
              userId: newRow.user_id || 'usr-guest',
              customerName: newRow.customer_name,
              customerPhone: newRow.customer_phone,
              customerEmail: newRow.customer_email,
              foodItem: typeof newRow.food_item_snapshot === 'string' ? JSON.parse(newRow.food_item_snapshot) : newRow.food_item_snapshot,
              quantity: newRow.quantity,
              selectedAddOns: typeof newRow.selected_add_ons === 'string' ? JSON.parse(newRow.selected_add_ons) : newRow.selected_add_ons || [],
              itemBasePrice: Number(newRow.item_base_price),
              addOnsTotal: Number(newRow.add_ons_total),
              totalAmount: Number(newRow.total_amount),
              pickupDate: newRow.pickup_date,
              pickupTime: newRow.pickup_time,
              specialInstructions: newRow.special_instructions || '',
              status: newRow.status,
              paymentMethod: newRow.payment_method,
              paymentStatus: newRow.payment_status,
              createdAt: newRow.created_at,
            };
            setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new;
            setBookings((prev) =>
              prev.map((b) => (b.id === updatedRow.id ? { ...b, status: updatedRow.status as BookingStatus } : b))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed saving local bookings:', e);
    }
  }, [bookings]);

  const openFoodModal = (item: FoodItem) => {
    setSelectedFoodForModal(item);
  };

  const closeFoodModal = () => {
    setSelectedFoodForModal(null);
  };

  const setDraftFromFood = (
    food: FoodItem,
    quantity: number,
    addOns: FoodAddOn[],
    userInfo?: { name: string; phone: string; email: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setActiveDraft({
      foodItem: food,
      quantity: Math.max(1, quantity),
      selectedAddOns: addOns,
      customerName: userInfo?.name || '',
      customerPhone: userInfo?.phone || '',
      customerEmail: userInfo?.email || '',
      pickupDate: today,
      pickupTime: '06:00 PM',
      specialInstructions: '',
    });
  };

  const updateDraft = (updates: Partial<PreBookDraft>) => {
    setActiveDraft((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const clearDraft = () => {
    setActiveDraft(null);
  };

  const calculateDraftTotals = () => {
    if (!activeDraft) {
      return {
        itemBasePrice: 0,
        addOnsPricePerItem: 0,
        pricePerUnit: 0,
        quantity: 1,
        subtotal: 0,
        convenienceFee: 0,
        totalAmount: 0,
      };
    }
    const itemBasePrice = activeDraft.foodItem.price;
    const addOnsPricePerItem = activeDraft.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const pricePerUnit = itemBasePrice + addOnsPricePerItem;
    const quantity = activeDraft.quantity;
    const subtotal = pricePerUnit * quantity;
    const convenienceFee = 0;
    const totalAmount = subtotal + convenienceFee;

    return {
      itemBasePrice,
      addOnsPricePerItem,
      pricePerUnit,
      quantity,
      subtotal,
      convenienceFee,
      totalAmount,
    };
  };

  const { user } = useAuth();

  const createBooking = async (paymentMethod: string): Promise<Booking> => {
    // If activeDraft is missing, construct a safe fallback draft
    const draft = activeDraft || {
      foodItem: selectedFoodForModal || {
        id: 'shawarma-chicken-special',
        name: 'Special Chicken Shawarma Roll',
        category: 'Shawarma',
        price: 180,
        description: 'Juicy marinated chicken cooked on rotisserie wrapped in freshly baked kubboos with classic garlic toum.',
        image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=600',
        available: true,
        type: 'non-veg',
        spicyLevel: 2,
        prepTimeMinutes: 10,
        rating: 4.8,
        ingredients: ['Spiced Chicken', 'Garlic Toum', 'Pickled Cucumber', 'French Fries'],
      },
      quantity: 1,
      selectedAddOns: [],
      customerName: user?.name || 'Guest Customer',
      customerPhone: user?.phone || '+91 98427 12345',
      customerEmail: user?.email || 'customer@arabiandelights.com',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '06:00 PM',
      specialInstructions: '',
    };

    const itemBasePrice = draft.foodItem.price;
    const addOnsPricePerItem = draft.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const pricePerUnit = itemBasePrice + addOnsPricePerItem;
    const quantity = draft.quantity;
    const totals = {
      itemBasePrice,
      addOnsPricePerItem,
      totalAmount: pricePerUnit * quantity,
    };

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `AD-2026-${randomNum}`;

    const newBooking: Booking = {
      id: newId,
      userId: user?.id || `usr-${Date.now()}`,
      customerName: draft.customerName || user?.name || 'Guest Customer',
      customerPhone: draft.customerPhone || user?.phone || '+91 98427 12345',
      customerEmail: draft.customerEmail || user?.email || 'customer@arabiandelights.com',
      foodItem: draft.foodItem,
      quantity: draft.quantity,
      selectedAddOns: draft.selectedAddOns,
      itemBasePrice: totals.itemBasePrice,
      addOnsTotal: totals.addOnsPricePerItem,
      totalAmount: totals.totalAmount,
      pickupDate: draft.pickupDate,
      pickupTime: draft.pickupTime,
      specialInstructions: draft.specialInstructions,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus: paymentMethod === 'Pay on Pickup' ? 'PAY_ON_PICKUP' : 'PAID',

      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);

    // Save directly into Supabase PostgreSQL database (non-blocking for instant UI response)
    createSupabaseBooking(newBooking).catch((err) => {
      console.warn('Background Supabase booking record error:', err);
    });

    return newBooking;
  };



  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as BookingStatus } : b))
    );
    updateSupabaseBookingStatus(bookingId, 'Cancelled');
  };

  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    updateSupabaseBookingStatus(bookingId, newStatus);
  };

  const getBookingById = (bookingId: string) => {
    return bookings.find((b) => b.id === bookingId);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        activeDraft,
        selectedFoodForModal,
        openFoodModal,
        closeFoodModal,
        setDraftFromFood,
        updateDraft,
        clearDraft,
        calculateDraftTotals,
        createBooking,
        cancelBooking,
        updateBookingStatus,
        getBookingById,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
