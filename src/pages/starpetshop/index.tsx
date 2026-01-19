import { useState, useEffect } from 'react';
import StarpetshopHeader from '@/components/starpetshop/StarpetshopHeader';
import StarpetshopHero from '@/components/starpetshop/StarpetshopHero';
import StarpetshopAbout from '@/components/starpetshop/StarpetshopAbout';
import StarpetshopServices from '@/components/starpetshop/StarpetshopServices';
import StarpetshopGallery from '@/components/starpetshop/StarpetshopGallery';
import StarpetshopTestimonials from '@/components/starpetshop/StarpetshopTestimonials';
import StarpetshopContact from '@/components/starpetshop/StarpetshopContact';
import StarpetshopFooter from '@/components/starpetshop/StarpetshopFooter';
import StarpetshopSchedule from '@/components/starpetshop/StarpetshopSchedule';
import StarpetshopMyAppointments, { getStarpetshopAppointments } from '@/components/starpetshop/StarpetshopMyAppointments';
import StarpetshopDemoModal from '@/components/starpetshop/StarpetshopDemoModal';

const StarpetshopPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getStarpetshopAppointments();
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
      <StarpetshopHeader 
        onScheduleClick={() => setIsScheduleOpen(true)} 
        onMyAppointmentsClick={() => setIsMyAppointmentsOpen(true)}
      />
      <StarpetshopHero onScheduleClick={() => setIsScheduleOpen(true)} />
      <StarpetshopAbout />
      <StarpetshopServices onScheduleClick={() => setIsScheduleOpen(true)} />
      <StarpetshopGallery />
      <StarpetshopTestimonials />
      <StarpetshopContact onScheduleClick={() => setIsScheduleOpen(true)} />
      <StarpetshopFooter />
      
      <StarpetshopDemoModal />
      
      <StarpetshopSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      
      <StarpetshopMyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
      />
    </div>
  );
};

export default StarpetshopPage;
