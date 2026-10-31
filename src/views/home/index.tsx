
import Hero from './components/Hero';
import ShopByCategory from './components/ShopByCategory';
import FeaturedProducts from './components/FeaturedProducts';
import BestSellers from './components/BestSellers';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import DeliveryMap from './components/DeliveryMap';
import FAQ from './components/FAQ';


export default function HomePage() {
  return (
    <main>

      <Hero />
      <ShopByCategory />
      <FeaturedProducts />
      <BestSellers />
      <Features />
      <Testimonials />
      <DeliveryMap />
      <FAQ />

    </main>
  );
}