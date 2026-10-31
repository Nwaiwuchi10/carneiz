import { Suspense } from 'react';
import CheckoutPage from '@/src/views/checkout';

export default function AppCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfcfd]" />}>
      <CheckoutPage />
    </Suspense>
  );
}
