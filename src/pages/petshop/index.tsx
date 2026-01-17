import { useState } from 'react';
import PetshopHeader from '@/components/petshop/PetshopHeader';
import PetshopHero from '@/components/petshop/PetshopHero';
import PetshopAbout from '@/components/petshop/PetshopAbout';
import PetshopServices from '@/components/petshop/PetshopServices';
import PetshopGallery from '@/components/petshop/PetshopGallery';
import PetshopTestimonials from '@/components/petshop/PetshopTestimonials';
import PetshopSchedule from '@/components/petshop/PetshopSchedule';
import PetshopContact from '@/components/petshop/PetshopContact';
import PetshopFooter from '@/components/petshop/PetshopFooter';

const PetshopPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <PetshopHeader onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopHero onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopAbout />
      <PetshopServices onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopGallery />
      <PetshopTestimonials />
      <PetshopContact onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopFooter />
      
      <PetshopSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
    </div>
  );
};

export default PetshopPage;
