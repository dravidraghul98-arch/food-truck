import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus, FoodAddOn, FoodItem, OrderType, PreBookItem } from '../types';
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
  items?: PreBookItem[];
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
}

export interface RealtimeBookingEvent {
  booking: Booking;
  timestamp: number;
}

interface BookingContextType {
  bookings: Booking[];
  activeDraft: PreBookDraft | null;
  selectedFoodForModal: FoodItem | null;
  latestRealtimeEvent: RealtimeBookingEvent | null;
  openFoodModal: (item: FoodItem) => void;
  closeFoodModal: () => void;
  setDraftFromFood: (
    food: FoodItem,
    quantity: number,
    addOns: FoodAddOn[],
    userInfo?: { name: string; phone: string; email: string }
  ) => void;
  addItemToDraft: (
    food: FoodItem,
    quantity: number,
    addOns: FoodAddOn[],
    userInfo?: { name: string; phone: string; email: string }
  ) => void;
  reBookOrder: (
    booking: Booking,
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
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'arabian_delights_customer_bookings';
const BROADCAST_CHANNEL_NAME = 'arabian_delights_realtime_orders';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [activeDraft, setActiveDraft] = useState<PreBookDraft | null>(null);
  const [latestRealtimeEvent, setLatestRealtimeEvent] = useState<RealtimeBookingEvent | null>(null);

  const globalBroadcastRef = React.useRef<any>(null);

  // Real-time bookings state starting with localStorage fallback
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

  // Helper to cleanly merge incoming bookings without losing existing ones
  const mergeIncomingBooking = (newBooking: Booking, isNewRealtime: boolean = true) => {
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === newBooking.id);
      if (exists) {
        return prev.map((b) => (b.id === newBooking.id ? { ...b, ...newBooking } : b));
      }
      return [newBooking, ...prev];
    });

    if (isNewRealtime) {
      setLatestRealtimeEvent({
        booking: newBooking,
        timestamp: Date.now(),
      });
    }
  };

  // Helper function to fetch live bookings from Supabase & detect new cross-account orders
  const loadBookings = async () => {
    const dbBookings = await fetchSupabaseBookings();
    if (dbBookings && dbBookings.length > 0) {
      setBookings((prev) => {
        const prevIds = new Set(prev.map((b) => b.id));
        const map = new Map<string, Booking>();
        let brandNewOrder: Booking | null = null;

        dbBookings.forEach((b) => {
          map.set(b.id, b);
          // If a new booking arrived in DB from another account/device that wasn't in state
          if (!prevIds.has(b.id)) {
            if (!brandNewOrder || new Date(b.createdAt).getTime() > new Date(brandNewOrder.createdAt).getTime()) {
              brandNewOrder = b;
            }
          }
        });

        prev.forEach((b) => {
          if (!map.has(b.id)) {
            map.set(b.id, b);
          }
        });

        // Trigger live chime & banner notification if a brand new booking was fetched from DB
        if (brandNewOrder && prev.length > 0) {
          setLatestRealtimeEvent({
            booking: brandNewOrder,
            timestamp: Date.now(),
          });
        }

        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
  };

  // Fetch live real-time bookings from Supabase database on mount
  useEffect(() => {
    loadBookings();
  }, []);

  // 1. Supabase Persistent Global Broadcast & Postgres CDC Channels
  useEffect(() => {
    // Persistent Global WebSocket Broadcast Channel
    const broadcastChannel = supabase.channel('realtime:public:bookings_global_channel');
    broadcastChannel
      .on('broadcast', { event: 'NEW_BOOKING' }, (payload) => {
        console.log('[Global Broadcast] New booking received from remote account:', payload);
        if (payload?.payload?.id) {
          mergeIncomingBooking(payload.payload, true);
        }
      })
      .on('broadcast', { event: 'UPDATE_STATUS' }, (payload) => {
        if (payload?.payload?.id && payload?.payload?.status) {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === payload.payload.id ? { ...b, status: payload.payload.status } : b
            )
          );
        }
      })
      .subscribe((status) => {
        console.log('[Global Broadcast Channel Status]:', status);
      });

    globalBroadcastRef.current = broadcastChannel;

    // Postgres CDC listener on 'bookings' table
    const cdcChannel = supabase
      .channel('realtime:public:bookings_cdc')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('[Supabase Realtime CDC] DB change:', payload);
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            try {
              const newBooking: Booking = {
                id: newRow.id,
                userId: newRow.user_id || 'usr-guest',
                customerName: newRow.customer_name,
                customerPhone: newRow.customer_phone,
                customerEmail: newRow.customer_email,
                orderType: newRow.order_type || 'Pickup',
                deliveryAddress: newRow.delivery_address || '',
                deliveryPhone: newRow.delivery_phone || newRow.customer_phone || '',
                foodItem:
                  typeof newRow.food_item_snapshot === 'string'
                    ? JSON.parse(newRow.food_item_snapshot)
                    : newRow.food_item_snapshot,
                quantity: newRow.quantity,
                selectedAddOns:
                  typeof newRow.selected_add_ons === 'string'
                    ? JSON.parse(newRow.selected_add_ons)
                    : newRow.selected_add_ons || [],
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
              mergeIncomingBooking(newBooking, true);
            } catch (err) {
              console.error('Error parsing Realtime CDC insertion payload:', err);
            }
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
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(cdcChannel);
    };
  }, []);

  // 2. Browser BroadcastChannel API & storage event listener for 0ms cross-tab sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_BOOKING' && event.data?.booking) {
            mergeIncomingBooking(event.data.booking, true);
          } else if (event.data?.type === 'UPDATE_STATUS') {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === event.data.bookingId ? { ...b, status: event.data.status } : b
              )
            );
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BOOKINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBookings(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 3. Periodic Background Polling Fallback (Every 5 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
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
    const initialQty = Math.max(1, quantity);
    setActiveDraft({
      foodItem: food,
      quantity: initialQty,
      selectedAddOns: addOns,
      items: [{ foodItem: food, quantity: initialQty, selectedAddOns: addOns }],
      orderType: 'Pickup',
      customerName: userInfo?.name || '',
      customerPhone: userInfo?.phone || '',
      customerEmail: userInfo?.email || '',
      deliveryAddress: '',
      deliveryPhone: userInfo?.phone || '',
      pickupDate: today,
      pickupTime: '06:00 PM',
      specialInstructions: '',
    });
  };

  const addItemToDraft = (
    food: FoodItem,
    quantity: number = 1,
    addOns: FoodAddOn[] = [],
    userInfo?: { name: string; phone: string; email: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newQty = Math.max(1, quantity);

    setActiveDraft((prev) => {
      if (!prev) {
        return {
          foodItem: food,
          quantity: newQty,
          selectedAddOns: addOns,
          items: [{ foodItem: food, quantity: newQty, selectedAddOns: addOns }],
          orderType: 'Pickup',
          customerName: userInfo?.name || '',
          customerPhone: userInfo?.phone || '',
          customerEmail: userInfo?.email || '',
          deliveryAddress: '',
          deliveryPhone: userInfo?.phone || '',
          pickupDate: today,
          pickupTime: '06:00 PM',
          specialInstructions: '',
        };
      }

      const existingItems: PreBookItem[] =
        prev.items && prev.items.length > 0
          ? [...prev.items]
          : [{ foodItem: prev.foodItem, quantity: prev.quantity, selectedAddOns: prev.selectedAddOns }];

      const itemIdx = existingItems.findIndex((i) => i.foodItem.id === food.id);
      if (itemIdx >= 0) {
        existingItems[itemIdx] = {
          ...existingItems[itemIdx],
          quantity: existingItems[itemIdx].quantity + newQty,
          selectedAddOns: addOns.length > 0 ? addOns : existingItems[itemIdx].selectedAddOns,
        };
      } else {
        existingItems.push({ foodItem: food, quantity: newQty, selectedAddOns: addOns });
      }

      return {
        ...prev,
        foodItem: existingItems[0].foodItem,
        quantity: existingItems[0].quantity,
        selectedAddOns: existingItems[0].selectedAddOns,
        items: existingItems,
        customerName: prev.customerName || userInfo?.name || '',
        customerPhone: prev.customerPhone || userInfo?.phone || '',
        customerEmail: prev.customerEmail || userInfo?.email || '',
      };
    });
  };

  const reBookOrder = (
    booking: Booking,
    userInfo?: { name: string; phone: string; email: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const itemsToRebook: PreBookItem[] =
      booking.items && booking.items.length > 0
        ? booking.items
        : [{ foodItem: booking.foodItem, quantity: booking.quantity, selectedAddOns: booking.selectedAddOns }];

    setActiveDraft({
      foodItem: itemsToRebook[0].foodItem,
      quantity: itemsToRebook[0].quantity,
      selectedAddOns: itemsToRebook[0].selectedAddOns,
      items: itemsToRebook,
      orderType: booking.orderType || 'Pickup',
      customerName: booking.customerName || userInfo?.name || '',
      customerPhone: booking.customerPhone || userInfo?.phone || '',
      customerEmail: booking.customerEmail || userInfo?.email || '',
      deliveryAddress: booking.deliveryAddress || '',
      deliveryPhone: booking.deliveryPhone || booking.customerPhone || '',
      pickupDate: today,
      pickupTime: '06:30 PM',
      specialInstructions: booking.specialInstructions || '',
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
      orderType: 'Pickup' as OrderType,
      customerName: user?.name || 'Guest Customer',
      customerPhone: user?.phone || '+91 98427 12345',
      customerEmail: user?.email || 'customer@arabiandelights.com',
      deliveryAddress: '',
      deliveryPhone: user?.phone || '+91 98427 12345',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '06:00 PM',
      specialInstructions: '',
    };

    let totalAmount = 0;
    if (draft.items && draft.items.length > 0) {
      totalAmount = draft.items.reduce((sum, item) => {
        const addOnsPrice = item.selectedAddOns.reduce((aSum, addOn) => aSum + addOn.price, 0);
        return sum + (item.foodItem.price + addOnsPrice) * item.quantity;
      }, 0);
    } else {
      const itemBasePrice = draft.foodItem.price;
      const addOnsPricePerItem = draft.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
      const pricePerUnit = itemBasePrice + addOnsPricePerItem;
      const quantity = draft.quantity;
      totalAmount = pricePerUnit * quantity;
    }

    const itemBasePrice = draft.foodItem.price;
    const addOnsPricePerItem = draft.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `AD-2026-${randomNum}`;

    const newBooking: Booking = {
      id: newId,
      userId: user?.id || `usr-${Date.now()}`,
      customerName: draft.customerName || user?.name || 'Guest Customer',
      customerPhone: draft.customerPhone || user?.phone || '+91 98427 12345',
      customerEmail: draft.customerEmail || user?.email || 'customer@arabiandelights.com',
      orderType: draft.orderType || 'Pickup',
      deliveryAddress: draft.deliveryAddress || '',
      deliveryPhone: draft.deliveryPhone || draft.customerPhone || '',
      foodItem: draft.foodItem,
      quantity: draft.quantity,
      selectedAddOns: draft.selectedAddOns,
      items: draft.items || [{ foodItem: draft.foodItem, quantity: draft.quantity, selectedAddOns: draft.selectedAddOns }],
      itemBasePrice,
      addOnsTotal: addOnsPricePerItem,
      totalAmount,
      pickupDate: draft.pickupDate,
      pickupTime: draft.pickupTime,
      specialInstructions: draft.specialInstructions,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus: paymentMethod === 'Pay on Pickup' ? 'PAY_ON_PICKUP' : 'PAID',
      createdAt: new Date().toISOString(),
    };

    // Optimistically merge into local state & trigger real-time event
    mergeIncomingBooking(newBooking, true);

    // 1. Broadcast via browser BroadcastChannel (0ms local tabs)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'NEW_BOOKING', booking: newBooking });
        bc.close();
      }
    } catch {}

    // 2. Broadcast via persistent global Supabase Realtime WebSocket (cross-device/network)
    try {
      if (globalBroadcastRef.current) {
        globalBroadcastRef.current.send({
          type: 'broadcast',
          event: 'NEW_BOOKING',
          payload: newBooking,
        });
      }
    } catch (err) {
      console.warn('Global broadcast send error:', err);
    }

    // 3. Save directly into Supabase PostgreSQL database
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
    
    // Broadcast status update
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'UPDATE_STATUS', bookingId, status: 'Cancelled' });
        bc.close();
      }
    } catch {}
  };

  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    updateSupabaseBookingStatus(bookingId, newStatus);

    // Broadcast status update
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'UPDATE_STATUS', bookingId, status: newStatus });
        bc.close();
      }
    } catch {}
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
        latestRealtimeEvent,
        openFoodModal,
        closeFoodModal,
        setDraftFromFood,
        addItemToDraft,
        reBookOrder,
        updateDraft,
        clearDraft,
        calculateDraftTotals,
        createBooking,
        cancelBooking,
        updateBookingStatus,
        getBookingById,
        refreshBookings: loadBookings,
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

