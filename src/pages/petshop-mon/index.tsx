import { useState, useEffect } from 'react';
import MonHeader from '@/components/petshop-mon/MonHeader';
import MonHero from '@/components/petshop-mon/MonHero';
import MonAbout from '@/components/petshop-mon/MonAbout';
import MonServices from '@/components/petshop-mon/MonServices';
import PetshopGallery from '@/components/petshop/PetshopGallery';
import PetshopTestimonials from '@/components/petshop/PetshopTestimonials';
import MonSchedule from '@/components/petshop-mon/MonSchedule';
import MonContact from '@/components/petshop-mon/MonContact';
import MonFooter from '@/components/petshop-mon/MonFooter';
import MonMyAppointments, { getMonAppointments } from '@/components/petshop-mon/MonMyAppointments';
import MonDemoModal from '@/components/petshop-mon/MonDemoModal';

const PetshopMonPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getMonAppointments();
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
      <MonHeader 
        onScheduleClick={() => setIsScheduleOpen(true)} 
        onMyAppointmentsClick={() => setIsMyAppointmentsOpen(true)}
      />
      <MonHero onScheduleClick={() => setIsScheduleOpen(true)} />
      <MonAbout />
      <MonServices onScheduleClick={() => setIsScheduleOpen(true)} />
      <PetshopGallery />
      <PetshopTestimonials />
      <MonContact onScheduleClick={() => setIsScheduleOpen(true)} />
      <MonFooter />
      
      <MonDemoModal />
      
      <MonSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      
      <MonMyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
      />
    </div>
  );
};

export default PetshopMonPage;
