import { useState } from 'react';
import PrimoHeader from '@/components/petshop-primo/PrimoHeader';
import PrimoHero from '@/components/petshop-primo/PrimoHero';
import PrimoAbout from '@/components/petshop-primo/PrimoAbout';
import PrimoServices from '@/components/petshop-primo/PrimoServices';
import PetshopGallery from '@/components/petshop/PetshopGallery';
import PetshopTestimonials from '@/components/petshop/PetshopTestimonials';
import PetshopSchedule from '@/components/petshop/PetshopSchedule';
import PrimoContact from '@/components/petshop-primo/PrimoContact';
import PrimoFooter from '@/components/petshop-primo/PrimoFooter';
import PetshopMyAppointments from '@/components/petshop/PetshopMyAppointments';

const PetshopPrimoPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <PrimoHeader 
        onScheduleClick={() => setIsScheduleOpen(true)} 
        onMyAppointmentsClick={() => setIsMyAppointmentsOpen(true)}
      />
      <PrimoHero onScheduleClick={() => setIsScheduleOpen(true)} />
      <PrimoAbout />
      <PrimoServices onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopGallery />
      <PetshopTestimonials />
      <PrimoContact onScheduleClick={() => setIsScheduleOpen(true)} />
      <PrimoFooter />
      
      <PetshopSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      
      <PetshopMyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
      />
    </div>
  );
};

export default PetshopPrimoPage;
