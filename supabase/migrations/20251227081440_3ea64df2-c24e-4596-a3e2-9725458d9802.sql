-- Create barbers table
CREATE TABLE public.barbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT,
  specialties TEXT[] DEFAULT '{}',
  experience TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  icon TEXT DEFAULT 'Scissors',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'inqueue', 'called', 'onway', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create queue table
CREATE TABLE public.queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  estimated_wait INTEGER NOT NULL DEFAULT 25,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'onway', 'attended')),
  called_at TIMESTAMP WITH TIME ZONE,
  onway_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_slots table
CREATE TABLE public.blocked_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create barber_availability table
CREATE TABLE public.barber_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_slots TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(barber_id, date)
);

-- Create shop_settings table (single row)
CREATE TABLE public.shop_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Barber Studio',
  tagline TEXT DEFAULT 'Tradição e Estilo',
  description TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  maps_link TEXT,
  logo TEXT,
  hours_weekdays TEXT DEFAULT '09:00 - 20:00',
  hours_saturday TEXT DEFAULT '09:00 - 18:00',
  hours_sunday TEXT DEFAULT 'Fechado',
  lunch_break_start TEXT DEFAULT '12:00',
  lunch_break_end TEXT DEFAULT '13:00',
  instagram TEXT,
  facebook TEXT,
  queue_enabled BOOLEAN DEFAULT true,
  max_queue_size INTEGER DEFAULT 10,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anyone can view)
CREATE POLICY "Anyone can view barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (visible = true);
CREATE POLICY "Anyone can view shop settings" ON public.shop_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can view barber availability" ON public.barber_availability FOR SELECT USING (true);

-- PUBLIC INSERT for appointments (clients can book)
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their appointments by phone" ON public.appointments FOR SELECT USING (true);

-- Queue policies
CREATE POLICY "Anyone can view queue" ON public.queue FOR SELECT USING (true);
CREATE POLICY "Anyone can create queue entry" ON public.queue FOR INSERT WITH CHECK (true);

-- ADMIN policies (for now, allow all operations - will add auth later)
CREATE POLICY "Admin can manage barbers" ON public.barbers FOR ALL USING (true);
CREATE POLICY "Admin can manage all services" ON public.services FOR ALL USING (true);
CREATE POLICY "Admin can manage appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Admin can manage queue" ON public.queue FOR ALL USING (true);
CREATE POLICY "Admin can manage blocked slots" ON public.blocked_slots FOR ALL USING (true);
CREATE POLICY "Admin can manage barber availability" ON public.barber_availability FOR ALL USING (true);
CREATE POLICY "Admin can manage shop settings" ON public.shop_settings FOR ALL USING (true);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply timestamp triggers
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_barber_availability_updated_at BEFORE UPDATE ON public.barber_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for appointments and queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue;

-- Insert default barbers
INSERT INTO public.barbers (name, photo, specialties, experience, rating, available) VALUES
('João Silva', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', ARRAY['Corte Clássico', 'Degradê'], '8 anos', 4.9, true),
('Pedro Santos', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', ARRAY['Barba Artística', 'Corte Moderno'], '5 anos', 4.8, true),
('Lucas Oliveira', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', ARRAY['Pigmentação', 'Tratamentos'], '6 anos', 4.7, true);

-- Insert default services
INSERT INTO public.services (name, description, duration, price, icon, visible) VALUES
('Corte Masculino', 'Corte personalizado com acabamento preciso e consultoria de estilo', 30, 45, 'Scissors', true),
('Barba Completa', 'Modelagem artesanal com toalha quente e produtos premium', 25, 35, 'Brush', true),
('Corte + Barba', 'Experiência completa: visual renovado dos pés à cabeça', 50, 70, 'Crown', true),
('Navalhado', 'Contorno e acabamento com navalha para definição perfeita', 20, 25, 'Zap', true),
('Pigmentação', 'Cobertura natural e discreta de fios grisalhos', 40, 55, 'Palette', true),
('Tratamento Capilar', 'Hidratação profunda para cabelos saudáveis e brilhantes', 35, 60, 'Sparkles', true);

-- Insert default shop settings
INSERT INTO public.shop_settings (name, tagline, description, address, phone, whatsapp, maps_link, hours_weekdays, hours_saturday, hours_sunday, lunch_break_start, lunch_break_end, instagram, facebook, queue_enabled, max_queue_size, theme) VALUES
('Barber Studio', 'Tradição e Estilo', 'A melhor experiência em barbearia', 'Rua das Flores, 123 - Centro', '(11) 99999-9999', '5511999999999', 'https://maps.google.com', '09:00 - 20:00', '09:00 - 18:00', 'Fechado', '12:00', '13:00', '@barberstudio', 'barberstudio', true, 10, 'dark');