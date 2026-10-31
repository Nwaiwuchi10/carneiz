"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  imageUrl: string;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string;
  discountPercent: number;
  deliveryFee: number;
  toastMessage: string | null;
}

const loadInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('carneiz_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: loadInitialCart(),
  isOpen: false,
  discountCode: '',
  discountPercent: 0,
  deliveryFee: 1500,
  toastMessage: null,
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('carneiz_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      // Match by _id AND weight so different weights are distinct items
      const existing = state.items.find(
        (i) => i._id === incoming._id && i.weight === incoming.weight
      );
      if (existing) {
        existing.quantity += incoming.quantity || 1;
      } else {
        state.items.push({
          ...incoming,
          quantity: incoming.quantity || 1,
        });
      }
      state.isOpen = true; // Auto-open Shopping Cart drawer matching Image 1
      state.toastMessage = `Added ${incoming.name} (${incoming.weight || '1.0 kg'}) to cart!`;
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; weight?: string } | string>) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.items = state.items.filter((i) => i._id !== payload);
      } else {
        state.items = state.items.filter(
          (i) => !(i._id === payload.id && (!payload.weight || i.weight === payload.weight))
        );
      }
      saveCartToStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; weight?: string; quantity: number }>
    ) => {
      const { id, weight, quantity } = action.payload;
      if (quantity < 1) return;
      const target = state.items.find(
        (i) => i._id === id && (!weight || i.weight === weight)
      );
      if (target) {
        target.quantity = quantity;
        saveCartToStorage(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    applyDiscount: (state, action: PayloadAction<{ code: string; percent?: number }>) => {
      state.discountCode = action.payload.code;
      state.discountPercent = action.payload.percent ?? 5; // Default 5% as on Figma design
      state.toastMessage = `Promo code "${action.payload.code}" applied! (5% off)`;
    },
    removeDiscount: (state) => {
      state.discountCode = '';
      state.discountPercent = 0;
    },
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = action.payload;
    },
    setToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
    syncCartFromStorage: (state) => {
      state.items = loadInitialCart();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartOpen,
  toggleCart,
  applyDiscount,
  removeDiscount,
  setDeliveryFee,
  setToastMessage,
  syncCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;
