export type FoodCategory = 'Shawarmas' | 'Plates' | 'Rice Items' | 'Starters' | 'Drinks' | 'Combos';

export type FoodType = 'veg' | 'non-veg';

export interface FoodAddOn {
  id: string;
  name: string;
  price: number;
  defaultSelected?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  description: string;
  image: string;
  available: boolean;
  type: FoodType;
  badge?: string;
  spicyLevel?: number; // 0 to 3
  prepTimeMinutes: number;
  rating: number;
  addOns: FoodAddOn[];
  ingredients?: string[];
  calories?: string;
}

export type BookingStatus = 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  foodItem: FoodItem;
  quantity: number;
  selectedAddOns: FoodAddOn[];
  itemBasePrice: number;
  addOnsTotal: number;
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  specialInstructions?: string;
  status: BookingStatus;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PAY_ON_PICKUP';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'customer' | 'owner';
  createdAt: string;
}
