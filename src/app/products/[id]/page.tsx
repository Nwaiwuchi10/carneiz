import ProductDetailPage from '@/src/views/products/[id]';

export default function AppProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return <ProductDetailPage params={props.params} />;
}
