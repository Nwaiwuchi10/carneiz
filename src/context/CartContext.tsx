"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import {
  addToCart as reduxAddToCart,
  removeFromCart as reduxRemoveFromCart,
  updateQuantity as reduxUpdateQuantity,
  clearCart as reduxClearCart,
  setCartOpen as reduxSetCartOpen,
  syncCartFromStorage,
  CartItem,
} from '@/src/redux/slices/cartSlice';

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, weight?: string) => void;
  updateQuantity: (id: string, quantity: number, weight?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const isCartOpen = useAppSelector((state) => state.cart.isOpen);

  useEffect(() => {
    dispatch(syncCartFromStorage());
  }, [dispatch]);

  const addToCart = (item: CartItem) => {
    dispatch(reduxAddToCart(item));
  };

  const removeFromCart = (id: string, weight?: string) => {
    dispatch(reduxRemoveFromCart({ id, weight }));
  };

  const updateQuantity = (id: string, quantity: number, weight?: string) => {
    dispatch(reduxUpdateQuantity({ id, quantity, weight }));
  };

  const clearCart = () => {
    dispatch(reduxClearCart());
  };

  const setIsCartOpen = (isOpen: boolean) => {
    dispatch(reduxSetCartOpen(isOpen));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
