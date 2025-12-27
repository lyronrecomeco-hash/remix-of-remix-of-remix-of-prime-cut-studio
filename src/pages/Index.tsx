import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import Services from '@/components/landing/Services';
import Gallery from '@/components/landing/Gallery';
import Testimonials from '@/components/landing/Testimonials';
import Location from '@/components/landing/Location';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import PWAInstallPrompt from '@/components/admin/PWAInstallPrompt';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      <Services />
      <Gallery />
      <Testimonials />
      <Location />
      <CTA />
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
