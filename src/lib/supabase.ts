import { createClient } from '@supabase/supabase-js';
import { Booking, FoodItem, User } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xctjbhnwefgcwlnbqoxh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGpiaG53ZWZnY3dsbmJxb3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTcwMDAsImV4cCI6MjA1Njc5MzAwMH0.dummy_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database API utilities

export async function fetchSupabaseFoodItems(): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      description: item.description || '',
      image: item.image || '',
      available: item.available ?? true,
      type: item.type || 'non-veg',
      badge: item.badge || undefined,
      spicyLevel: item.spicy_level || 0,
      prepTimeMinutes: item.prep_time_minutes || 10,
      rating: Number(item.rating) || 4.5,
      ingredients: item.ingredients || [],
      calories: item.calories || '',
      addOns: typeof item.add_ons === 'string' ? JSON.parse(item.add_ons) : item.add_ons || [],
    }));
  } catch (err) {
    console.error('Error fetching food items from Supabase:', err);
    return [];
  }
}

export async function fetchSupabaseBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((b) => ({
      id: b.id,
      userId: b.user_id || 'usr-guest',
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerEmail: b.customer_email,
      orderType: b.order_type || 'Pickup',
      deliveryAddress: b.delivery_address || '',
      deliveryPhone: b.delivery_phone || b.customer_phone || '',
      foodItem: typeof b.food_item_snapshot === 'string' ? JSON.parse(b.food_item_snapshot) : b.food_item_snapshot,
      quantity: b.quantity,
      selectedAddOns: typeof b.selected_add_ons === 'string' ? JSON.parse(b.selected_add_ons) : b.selected_add_ons || [],
      itemBasePrice: Number(b.item_base_price),
      addOnsTotal: Number(b.add_ons_total),
      totalAmount: Number(b.total_amount),
      pickupDate: b.pickup_date,
      pickupTime: b.pickup_time,
      specialInstructions: b.special_instructions || '',
      status: b.status,
      paymentMethod: b.payment_method,
      paymentStatus: b.payment_status,
      createdAt: b.created_at,
    }));
  } catch (err) {
    console.error('Error fetching bookings from Supabase:', err);
    return [];
  }
}

export async function createSupabaseBooking(booking: Booking): Promise<boolean> {
  try {
    const { error } = await supabase.from('bookings').insert([{
      id: booking.id,
      user_id: booking.userId,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail,
      order_type: booking.orderType || 'Pickup',
      delivery_address: booking.deliveryAddress || '',
      delivery_phone: booking.deliveryPhone || booking.customerPhone || '',
      food_item_id: booking.foodItem.id,
      food_item_snapshot: booking.foodItem,
      quantity: booking.quantity,
      selected_add_ons: booking.selectedAddOns,
      item_base_price: booking.itemBasePrice,
      add_ons_total: booking.addOnsTotal,
      total_amount: booking.totalAmount,
      pickup_date: booking.pickupDate,
      pickup_time: booking.pickupTime,
      special_instructions: booking.specialInstructions || '',
      status: booking.status,
      payment_method: booking.paymentMethod,
      payment_status: booking.paymentStatus,
      created_at: booking.createdAt,
    }]);

    if (error) {
      console.warn('Supabase insert notice (local storage active):', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save booking to Supabase (using fallback):', err);
    return false;
  }
}

export async function updateSupabaseBookingStatus(bookingId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed updating booking status:', err);
    return false;
  }
}

// ============================================================================
// CUSTOMER MESSAGES API
// ============================================================================

export async function fetchSupabaseMessages(): Promise<import('../types').CustomerMessage[]> {
  try {
    const { data, error } = await supabase
      .from('customer_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      message: m.message,
      read: Boolean(m.read),
      createdAt: m.created_at,
    }));
  } catch (err) {
    console.error('Error fetching messages from Supabase:', err);
    return [];
  }
}

export async function createSupabaseMessage(msg: import('../types').CustomerMessage): Promise<boolean> {
  try {
    const { error } = await supabase.from('customer_messages').insert([{
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || '',
      message: msg.message,
      read: msg.read,
      created_at: msg.createdAt,
    }]);

    if (error) {
      console.error('Error inserting message into Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed saving message to Supabase:', err);
    return false;
  }
}

export async function updateSupabaseMessageReadStatus(messageId: string, read: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_messages')
      .update({ read })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message status in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed updating message status:', err);
    return false;
  }
}

// ============================================================================
// USER PROFILES API & REALTIME SUBSCRIPTIONS
// ============================================================================

export async function fetchSupabaseProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching profile from Supabase:', err);
    return null;
  }
}

export async function upsertSupabaseProfile(profile: { id: string; name: string; email: string; phone?: string }): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase profile upsert warning:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save profile to Supabase (using fallback):', err);
    return false;
  }
}

export function subscribeToProfiles(onProfileChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          onProfileChange(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.error('Error subscribing to profile changes:', err);
    return null;
  }
}

