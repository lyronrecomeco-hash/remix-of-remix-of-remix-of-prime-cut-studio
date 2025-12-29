import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const previewTheme = searchParams.get('theme');

  useEffect(() => {
    if (previewTheme) {
      // Remove existing theme classes
      document.documentElement.className = document.documentElement.className
        .split(' ')
        .filter(c => !c.startsWith('theme-'))
        .join(' ');
      
      // Apply preview theme
      if (previewTheme !== 'gold') {
        document.documentElement.classList.add(`theme-${previewTheme}`);
      }
    }
  }, [previewTheme]);

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
