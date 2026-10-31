const fs = require('fs');
const path = require('path');

const components = [
  'Navbar',
  'Hero',
  'ShopByCategory',
  'FeaturedProducts',
  'BestSellers',
  'Features',
  'Testimonials',
  'DeliveryMap',
  'FAQ',
  'Footer'
];

const basePath = path.join(__dirname, 'src/pages/home/components');
fs.mkdirSync(basePath, { recursive: true });

components.forEach(comp => {
  fs.writeFileSync(path.join(basePath, `${comp}.tsx`), `import styles from './${comp}.module.css';

export default function ${comp}() {
  return (
    <section className={styles.container}>
      <h2>${comp}</h2>
    </section>
  );
}`);
  fs.writeFileSync(path.join(basePath, `${comp}.module.css`), `.container {
  padding: 2rem;
}`);
});

fs.writeFileSync(path.join(__dirname, 'src/pages/home/index.tsx'), `import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShopByCategory from './components/ShopByCategory';
import FeaturedProducts from './components/FeaturedProducts';
import BestSellers from './components/BestSellers';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import DeliveryMap from './components/DeliveryMap';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ShopByCategory />
      <FeaturedProducts />
      <BestSellers />
      <Features />
      <Testimonials />
      <DeliveryMap />
      <FAQ />
      <Footer />
    </main>
  );
}`);

fs.writeFileSync(path.join(__dirname, 'src/app/page.tsx'), `import HomePage from '@/pages/home';

export default function App() {
  return <HomePage />;
}`);

console.log('Setup complete.');
