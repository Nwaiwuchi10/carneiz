import CartView from '@/src/views/cart';

export const metadata = {
  title: 'Shopping Cart | Carneiz Premium Butchery',
  description: 'View your selected premium cuts and proceed to checkout.',
};

export default function CartPage() {
  return <CartView />;
}
