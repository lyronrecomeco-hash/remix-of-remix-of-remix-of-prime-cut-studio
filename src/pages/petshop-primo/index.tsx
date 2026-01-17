import { useState, useEffect } from 'react';
import PrimoHeader from '@/components/petshop-primo/PrimoHeader';
import PrimoHero from '@/components/petshop-primo/PrimoHero';
import PrimoAbout from '@/components/petshop-primo/PrimoAbout';
import PrimoServices from '@/components/petshop-primo/PrimoServices';
import PetshopGallery from '@/components/petshop/PetshopGallery';
import PetshopTestimonials from '@/components/petshop/PetshopTestimonials';
import PrimoSchedule from '@/components/petshop-primo/PrimoSchedule';
import PrimoContact from '@/components/petshop-primo/PrimoContact';
import PrimoFooter from '@/components/petshop-primo/PrimoFooter';
import PrimoMyAppointments, { getPrimoAppointments } from '@/components/petshop-primo/PrimoMyAppointments';
import PrimoDemoModal from '@/components/petshop-primo/PrimoDemoModal';

const PetshopPrimoPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getPrimoAppointments();
      setHasAppointments(appointments.length > 0);
    };

    checkAppointments();
    
    const handleStorage = () => checkAppointments();
    window.addEventListener('storage', handleStorage);
    
    const interval = setInterval(checkAppointments, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

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
      
      <PrimoDemoModal />
      
      <PrimoSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      
      <PrimoMyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
      />
    </div>
  );
};

export default PetshopPrimoPage;
