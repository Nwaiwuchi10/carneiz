import { Suspense } from 'react';
import ProductsPage from '@/src/views/products';

export default function AppProductsPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">Loading products...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
