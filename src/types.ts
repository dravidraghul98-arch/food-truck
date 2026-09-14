export type FoodCategory = 'Shawarmas' | 'Plates' | 'Rice Items' | 'Noodles' | 'Starters' | 'Drinks' | 'Combos';

export type FoodType = 'veg' | 'non-veg';

export interface FoodAddOn {
  id: string;
  name: string;
  price: number;
  defaultSelected?: boolean;
}

export interface ServingOption {
  id: string;
  name: string;
  price: number;
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
  servingOptions?: ServingOption[];
  ingredients?: string[];
  calories?: string;
}

export type BookingStatus = 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export type OrderType = 'Pickup' | 'Home Delivery';

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: OrderType;
  deliveryAddress?: string;
  deliveryPhone?: string;
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

export interface CustomerMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
