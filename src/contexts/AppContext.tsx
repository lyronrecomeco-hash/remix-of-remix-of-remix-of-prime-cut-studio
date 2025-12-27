import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
  visible?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  experience: string;
  rating: number;
  available: boolean;
}

export interface Appointment {
  id: string;
  protocol?: string;
  clientName: string;
  clientPhone: string;
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'inqueue' | 'called' | 'onway' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ShopSettings {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  mapsLink: string;
  logo?: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  lunchBreak: {
    start: string;
    end: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  barberId: string;
  reason?: string;
}

export interface BarberAvailability {
  barberId: string;
  date: string;
  availableSlots: string[];
}

export interface QueueEntry {
  id: string;
  appointmentId: string;
  position: number;
  estimatedWait: number;
  status: 'waiting' | 'called' | 'onway' | 'attended';
  calledAt?: string;
  onwayAt?: string;
}

export type ThemeType = 'dark' | 'light' | 'gold' | 'gold-shine' | 'gold-metallic';

interface AppState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleServiceVisibility: (id: string) => void;
  barbers: Barber[];
  updateBarber: (id: string, barber: Partial<Barber>) => void;
  toggleBarberAvailability: (id: string) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
  confirmAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByBarber: (barberId: string, date: string) => Appointment[];
  queueEnabled: boolean;
  setQueueEnabled: (enabled: boolean) => void;
  maxQueueSize: number;
  setMaxQueueSize: (size: number) => void;
  queue: QueueEntry[];
  addToQueue: (appointmentId: string) => QueueEntry;
  callNextInQueue: () => QueueEntry | null;
  markClientOnWay: (appointmentId: string) => void;
  updateQueuePosition: (id: string, position: number) => void;
  getQueuePosition: (appointmentId: string) => number | null;
  getQueueEntry: (appointmentId: string) => QueueEntry | null;
  blockedSlots: BlockedSlot[];
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => void;
  removeBlockedSlot: (id: string) => void;
  barberAvailability: BarberAvailability[];
  setBarberDayAvailability: (barberId: string, date: string, slots: string[]) => void;
  getBarberDayAvailability: (barberId: string, date: string) => string[] | null;
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => void;
  getAvailableTimeSlots: (date: Date, barberId: string, serviceDuration: number) => TimeSlot[];
  isSlotAvailable: (date: string, time: string, barberId: string, duration: number) => boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const defaultShopSettings: ShopSettings = {
  name: 'Barber Studio',
  tagline: 'Tradição e Estilo',
  description: 'A melhor experiência em barbearia',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  mapsLink: 'https://maps.google.com',
  hours: {
    weekdays: '09:00 - 20:00',
    saturday: '09:00 - 18:00',
    sunday: 'Fechado',
  },
  lunchBreak: {
    start: '12:00',
    end: '13:00',
  },
  social: {
    instagram: '@barberstudio',
    facebook: 'barberstudio',
  },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [barberAvailability, setBarberAvailabilityState] = useState<BarberAvailability[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings);
  const [queueEnabled, setQueueEnabledState] = useState(true);
  const [maxQueueSize, setMaxQueueSizeState] = useState(10);

  // Fetch all data from database
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('created_at');
      
      if (servicesData) {
        setServices(servicesData.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          duration: s.duration,
          price: Number(s.price),
          icon: s.icon || 'Scissors',
          visible: s.visible,
        })));
      }

      // Fetch barbers
      const { data: barbersData } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at');
      
      if (barbersData) {
        setBarbers(barbersData.map(b => ({
          id: b.id,
          name: b.name,
          photo: b.photo || '',
          specialties: b.specialties || [],
          experience: b.experience || '',
          rating: Number(b.rating),
          available: b.available,
        })));
      }

      // Fetch appointments with service and barber data
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*, services(*), barbers(*)')
        .order('created_at', { ascending: false });
      
      if (appointmentsData && servicesData && barbersData) {
        setAppointments(appointmentsData.map(a => {
          const service = servicesData.find(s => s.id === a.service_id);
          const barber = barbersData.find(b => b.id === a.barber_id);
          return {
            id: a.id,
            protocol: a.protocol,
            clientName: a.client_name,
            clientPhone: a.client_phone,
            service: service ? {
              id: service.id,
              name: service.name,
              description: service.description || '',
              duration: service.duration,
              price: Number(service.price),
              icon: service.icon || 'Scissors',
              visible: service.visible,
            } : {} as Service,
            barber: barber ? {
              id: barber.id,
              name: barber.name,
              photo: barber.photo || '',
              specialties: barber.specialties || [],
              experience: barber.experience || '',
              rating: Number(barber.rating),
              available: barber.available,
            } : {} as Barber,
            date: a.date,
            time: a.time,
            status: a.status as Appointment['status'],
            createdAt: a.created_at,
          };
        }));
      }

      // Fetch queue
      const { data: queueData } = await supabase
        .from('queue')
        .select('*')
        .order('position');
      
      if (queueData) {
        setQueue(queueData.map(q => ({
          id: q.id,
          appointmentId: q.appointment_id,
          position: q.position,
          estimatedWait: q.estimated_wait,
          status: q.status as QueueEntry['status'],
          calledAt: q.called_at || undefined,
          onwayAt: q.onway_at || undefined,
        })));
      }

      // Fetch blocked slots
      const { data: blockedData } = await supabase
        .from('blocked_slots')
        .select('*');
      
      if (blockedData) {
        setBlockedSlots(blockedData.map(b => ({
          id: b.id,
          date: b.date,
          startTime: b.start_time,
          endTime: b.end_time,
          barberId: b.barber_id,
          reason: b.reason || undefined,
        })));
      }

      // Fetch barber availability
      const { data: availabilityData } = await supabase
        .from('barber_availability')
        .select('*');
      
      if (availabilityData) {
        setBarberAvailabilityState(availabilityData.map(a => ({
          barberId: a.barber_id,
          date: a.date,
          availableSlots: a.available_slots || [],
        })));
      }

      // Fetch shop settings
      const { data: settingsData } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (settingsData) {
        setShopSettings({
          name: settingsData.name,
          tagline: settingsData.tagline || '',
          description: settingsData.description || '',
          address: settingsData.address || '',
          phone: settingsData.phone || '',
          whatsapp: settingsData.whatsapp || '',
          mapsLink: settingsData.maps_link || '',
          logo: settingsData.logo || undefined,
          hours: {
            weekdays: settingsData.hours_weekdays || '09:00 - 20:00',
            saturday: settingsData.hours_saturday || '09:00 - 18:00',
            sunday: settingsData.hours_sunday || 'Fechado',
          },
          lunchBreak: {
            start: settingsData.lunch_break_start || '12:00',
            end: settingsData.lunch_break_end || '13:00',
          },
          social: {
            instagram: settingsData.instagram || '',
            facebook: settingsData.facebook || '',
          },
        });
        setQueueEnabledState(settingsData.queue_enabled);
        setMaxQueueSizeState(settingsData.max_queue_size);
        setThemeState(settingsData.theme as ThemeType || 'dark');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Realtime subscriptions
  useEffect(() => {
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        refreshData();
      })
      .subscribe();

    const queueChannel = supabase
      .channel('queue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [refreshData]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-gold');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = useCallback(async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await supabase.from('shop_settings').update({ theme: newTheme }).neq('id', '00000000-0000-0000-0000-000000000000');
  }, []);

  // Services CRUD
  const addService = useCallback(async (service: Omit<Service, 'id'>) => {
    const { data } = await supabase.from('services').insert({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      icon: service.icon,
      visible: true,
    }).select().single();
    
    if (data) {
      setServices(prev => [...prev, {
        id: data.id,
        name: data.name,
        description: data.description || '',
        duration: data.duration,
        price: Number(data.price),
        icon: data.icon || 'Scissors',
        visible: data.visible,
      }]);
    }
  }, []);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    await supabase.from('services').update({
      name: updates.name,
      description: updates.description,
      duration: updates.duration,
      price: updates.price,
      icon: updates.icon,
      visible: updates.visible,
    }).eq('id', id);
    
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteService = useCallback(async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleServiceVisibility = useCallback(async (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      const newVisible = !service.visible;
      await supabase.from('services').update({ visible: newVisible }).eq('id', id);
      setServices(prev => prev.map(s => s.id === id ? { ...s, visible: newVisible } : s));
    }
  }, [services]);

  // Barbers
  const updateBarber = useCallback(async (id: string, updates: Partial<Barber>) => {
    await supabase.from('barbers').update({
      name: updates.name,
      photo: updates.photo,
      specialties: updates.specialties,
      experience: updates.experience,
      rating: updates.rating,
      available: updates.available,
    }).eq('id', id);
    
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const toggleBarberAvailability = useCallback(async (id: string) => {
    const barber = barbers.find(b => b.id === id);
    if (barber) {
      const newAvailable = !barber.available;
      await supabase.from('barbers').update({ available: newAvailable }).eq('id', id);
      setBarbers(prev => prev.map(b => b.id === id ? { ...b, available: newAvailable } : b));
    }
  }, [barbers]);

  // Appointments
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>): Appointment => {
    const protocol = `GEN${Date.now().toString(36).toUpperCase()}`;
    const tempId = crypto.randomUUID();
    
    const newAppointment: Appointment = {
      ...appointment,
      id: tempId,
      protocol,
    };

    // Insert into database
    supabase.from('appointments').insert({
      protocol,
      client_name: appointment.clientName,
      client_phone: appointment.clientPhone,
      service_id: appointment.service.id,
      barber_id: appointment.barber.id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    }).select().single().then(({ data }) => {
      if (data) {
        setAppointments(prev => prev.map(a => 
          a.id === tempId ? { ...a, id: data.id } : a
        ));
        
        // Also update the temp ID in queue if exists
        setQueue(prev => prev.map(q => 
          q.appointmentId === tempId ? { ...q, appointmentId: data.id } : q
        ));
      }
    });

    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    await supabase.from('appointments').update({
      client_name: updates.clientName,
      client_phone: updates.clientPhone,
      status: updates.status,
    }).eq('id', id);
    
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const cancelAppointment = useCallback(async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    await supabase.from('queue').delete().eq('appointment_id', id);
    
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    setQueue(prev => prev.filter(q => q.appointmentId !== id));
  }, []);

  const completeAppointment = useCallback(async (id: string) => {
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', id);
    await supabase.from('queue').delete().eq('appointment_id', id);
    
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    setQueue(prev => {
      const filtered = prev.filter(q => q.appointmentId !== id);
      return filtered.map((q, index) => ({ ...q, position: index + 1 }));
    });
  }, []);

  const confirmAppointment = useCallback(async (id: string) => {
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
  }, []);

  const getAppointmentsByDate = useCallback((date: string): Appointment[] => {
    return appointments.filter(a => a.date === date && a.status !== 'cancelled');
  }, [appointments]);

  const getAppointmentsByBarber = useCallback((barberId: string, date: string): Appointment[] => {
    return appointments.filter(a => 
      a.barber.id === barberId && 
      a.date === date && 
      a.status !== 'cancelled'
    );
  }, [appointments]);

  // Queue management
  const setQueueEnabled = useCallback(async (enabled: boolean) => {
    setQueueEnabledState(enabled);
    await supabase.from('shop_settings').update({ queue_enabled: enabled }).neq('id', '00000000-0000-0000-0000-000000000000');
  }, []);

  const setMaxQueueSize = useCallback(async (size: number) => {
    setMaxQueueSizeState(size);
    await supabase.from('shop_settings').update({ max_queue_size: size }).neq('id', '00000000-0000-0000-0000-000000000000');
  }, []);

  const addToQueue = useCallback((appointmentId: string): QueueEntry => {
    const position = queue.filter(q => q.status === 'waiting').length + 1;
    const avgServiceTime = 25;
    const tempId = crypto.randomUUID();
    
    const newEntry: QueueEntry = {
      id: tempId,
      appointmentId,
      position,
      estimatedWait: position * avgServiceTime,
      status: 'waiting',
    };

    supabase.from('queue').insert({
      appointment_id: appointmentId,
      position,
      estimated_wait: position * avgServiceTime,
      status: 'waiting',
    }).select().single().then(({ data }) => {
      if (data) {
        setQueue(prev => prev.map(q => 
          q.id === tempId ? { ...q, id: data.id } : q
        ));
      }
    });

    setQueue(prev => [...prev, newEntry]);
    return newEntry;
  }, [queue]);

  const callNextInQueue = useCallback((): QueueEntry | null => {
    const next = queue.find(q => q.status === 'waiting');
    if (next) {
      const now = new Date().toISOString();
      
      supabase.from('queue').update({ 
        status: 'called', 
        called_at: now 
      }).eq('id', next.id);

      setQueue(prev => prev.map(q => 
        q.id === next.id 
          ? { ...q, status: 'called', calledAt: now } 
          : q
      ));

      setTimeout(() => {
        setQueue(prev => {
          const waiting = prev.filter(q => q.status === 'waiting');
          const others = prev.filter(q => q.status !== 'waiting');
          const reordered = waiting.map((q, index) => ({
            ...q,
            position: index + 1,
            estimatedWait: (index + 1) * 25,
          }));
          return [...others, ...reordered];
        });
      }, 100);

      return next;
    }
    return null;
  }, [queue]);

  const updateQueuePosition = useCallback(async (id: string, position: number) => {
    await supabase.from('queue').update({ position }).eq('id', id);
    setQueue(prev => prev.map(q => q.id === id ? { ...q, position } : q));
  }, []);

  const getQueuePosition = useCallback((appointmentId: string): number | null => {
    const entry = queue.find(q => q.appointmentId === appointmentId && q.status === 'waiting');
    return entry?.position ?? null;
  }, [queue]);

  const getQueueEntry = useCallback((appointmentId: string): QueueEntry | null => {
    return queue.find(q => q.appointmentId === appointmentId) ?? null;
  }, [queue]);

  const markClientOnWay = useCallback(async (appointmentId: string) => {
    const now = new Date().toISOString();
    
    await supabase.from('queue').update({ status: 'onway', onway_at: now }).eq('appointment_id', appointmentId);
    await supabase.from('appointments').update({ status: 'onway' }).eq('id', appointmentId);

    setQueue(prev => prev.map(q =>
      q.appointmentId === appointmentId
        ? { ...q, status: 'onway', onwayAt: now }
        : q
    ));
    setAppointments(prev => prev.map(a =>
      a.id === appointmentId
        ? { ...a, status: 'onway' }
        : a
    ));
  }, []);

  // Blocked Slots
  const addBlockedSlot = useCallback(async (slot: Omit<BlockedSlot, 'id'>) => {
    const { data } = await supabase.from('blocked_slots').insert({
      barber_id: slot.barberId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      reason: slot.reason,
    }).select().single();
    
    if (data) {
      setBlockedSlots(prev => [...prev, {
        id: data.id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        barberId: data.barber_id,
        reason: data.reason || undefined,
      }]);
    }
  }, []);

  const removeBlockedSlot = useCallback(async (id: string) => {
    await supabase.from('blocked_slots').delete().eq('id', id);
    setBlockedSlots(prev => prev.filter(s => s.id !== id));
  }, []);

  // Barber Availability
  const setBarberDayAvailability = useCallback(async (barberId: string, date: string, slots: string[]) => {
    await supabase.from('barber_availability').upsert({
      barber_id: barberId,
      date: date,
      available_slots: slots,
    }, { onConflict: 'barber_id,date' });

    setBarberAvailabilityState(prev => {
      const existing = prev.findIndex(a => a.barberId === barberId && a.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { barberId, date, availableSlots: slots };
        return updated;
      }
      return [...prev, { barberId, date, availableSlots: slots }];
    });
  }, []);

  const getBarberDayAvailability = useCallback((barberId: string, date: string): string[] | null => {
    const found = barberAvailability.find(a => a.barberId === barberId && a.date === date);
    return found ? found.availableSlots : null;
  }, [barberAvailability]);

  // Shop Settings
  const updateShopSettings = useCallback(async (updates: Partial<ShopSettings>) => {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.tagline) dbUpdates.tagline = updates.tagline;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.address) dbUpdates.address = updates.address;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.whatsapp) dbUpdates.whatsapp = updates.whatsapp;
    if (updates.mapsLink) dbUpdates.maps_link = updates.mapsLink;
    if (updates.logo) dbUpdates.logo = updates.logo;
    if (updates.hours) {
      dbUpdates.hours_weekdays = updates.hours.weekdays;
      dbUpdates.hours_saturday = updates.hours.saturday;
      dbUpdates.hours_sunday = updates.hours.sunday;
    }
    if (updates.lunchBreak) {
      dbUpdates.lunch_break_start = updates.lunchBreak.start;
      dbUpdates.lunch_break_end = updates.lunchBreak.end;
    }
    if (updates.social) {
      dbUpdates.instagram = updates.social.instagram;
      dbUpdates.facebook = updates.social.facebook;
    }

    await supabase.from('shop_settings').update(dbUpdates).neq('id', '00000000-0000-0000-0000-000000000000');
    setShopSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Time slot availability
  const isSlotAvailable = useCallback((date: string, time: string, barberId: string, duration: number): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = hours * 60 + minutes;
    const slotEnd = slotStart + duration;

    const [lunchStartH, lunchStartM] = shopSettings.lunchBreak.start.split(':').map(Number);
    const [lunchEndH, lunchEndM] = shopSettings.lunchBreak.end.split(':').map(Number);
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;
    
    if ((slotStart < lunchEnd && slotEnd > lunchStart)) {
      return false;
    }

    const blocked = blockedSlots.filter(b => b.date === date && b.barberId === barberId);
    for (const block of blocked) {
      const [bStartH, bStartM] = block.startTime.split(':').map(Number);
      const [bEndH, bEndM] = block.endTime.split(':').map(Number);
      const blockStart = bStartH * 60 + bStartM;
      const blockEnd = bEndH * 60 + bEndM;
      if (slotStart < blockEnd && slotEnd > blockStart) {
        return false;
      }
    }

    const barberAppointments = getAppointmentsByBarber(barberId, date);
    for (const apt of barberAppointments) {
      const [aptH, aptM] = apt.time.split(':').map(Number);
      const aptStart = aptH * 60 + aptM;
      const aptEnd = aptStart + apt.service.duration;
      if (slotStart < aptEnd && slotEnd > aptStart) {
        return false;
      }
    }

    return true;
  }, [blockedSlots, shopSettings, getAppointmentsByBarber]);

  const getAvailableTimeSlots = useCallback((date: Date, barberId: string, serviceDuration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    const customAvailability = getBarberDayAvailability(barberId, dateStr);
    
    if (customAvailability !== null) {
      for (const time of customAvailability) {
        const available = isSlotAvailable(dateStr, time, barberId, serviceDuration);
        slots.push({ time, available });
      }
      return slots;
    }
    
    let startHour = 9;
    let endHour = 20;
    if (dayOfWeek === 6) {
      endHour = 18;
    } else if (dayOfWeek === 0) {
      return [];
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = isSlotAvailable(dateStr, time, barberId, serviceDuration);
        slots.push({ time, available });
      }
    }

    return slots;
  }, [isSlotAvailable, getBarberDayAvailability]);

  const value: AppState = {
    theme,
    setTheme,
    services: services.filter(s => s.visible !== false),
    addService,
    updateService,
    deleteService,
    toggleServiceVisibility,
    barbers,
    updateBarber,
    toggleBarberAvailability,
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    getAppointmentsByDate,
    getAppointmentsByBarber,
    queueEnabled,
    setQueueEnabled,
    maxQueueSize,
    setMaxQueueSize,
    queue,
    addToQueue,
    callNextInQueue,
    markClientOnWay,
    updateQueuePosition,
    getQueuePosition,
    getQueueEntry,
    blockedSlots,
    addBlockedSlot,
    removeBlockedSlot,
    barberAvailability,
    setBarberDayAvailability,
    getBarberDayAvailability,
    shopSettings,
    updateShopSettings,
    getAvailableTimeSlots,
    isSlotAvailable,
    isLoading,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
