"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/src/redux/store';
import { CartProvider } from './CartContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartProvider>
        {children}
      </CartProvider>
    </Provider>
  );
}
