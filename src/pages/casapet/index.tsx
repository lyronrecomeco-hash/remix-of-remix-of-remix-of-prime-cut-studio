import { useState, useEffect } from 'react';
import CasapetHeader from '@/components/casapet/CasapetHeader';
import CasapetHero from '@/components/casapet/CasapetHero';
import CasapetAbout from '@/components/casapet/CasapetAbout';
import CasapetServices from '@/components/casapet/CasapetServices';
import CasapetGallery from '@/components/casapet/CasapetGallery';
import CasapetTestimonials from '@/components/casapet/CasapetTestimonials';
import CasapetSchedule from '@/components/casapet/CasapetSchedule';
import CasapetContact from '@/components/casapet/CasapetContact';
import CasapetFooter from '@/components/casapet/CasapetFooter';
import CasapetMyAppointments, { getCasapetAppointments } from '@/components/casapet/CasapetMyAppointments';
import CasapetDemoModal from '@/components/casapet/CasapetDemoModal';

const CasapetPage = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getCasapetAppointments();
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
      <CasapetHeader 
        onScheduleClick={() => setIsScheduleOpen(true)} 
        onMyAppointmentsClick={() => setIsMyAppointmentsOpen(true)}
      />
      <CasapetHero onScheduleClick={() => setIsScheduleOpen(true)} />
      <CasapetAbout />
      <CasapetServices onScheduleClick={() => setIsScheduleOpen(true)} />
      <CasapetGallery />
      <CasapetTestimonials />
      <CasapetContact onScheduleClick={() => setIsScheduleOpen(true)} />
      <CasapetFooter />
      
      <CasapetDemoModal />
      
      <CasapetSchedule 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      
      <CasapetMyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
      />
    </div>
  );
};

export default CasapetPage;
