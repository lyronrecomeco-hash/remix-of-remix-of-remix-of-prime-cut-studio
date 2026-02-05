-- Enum for installment status
CREATE TYPE store_installment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Enum for sale status
CREATE TYPE store_sale_status AS ENUM ('pending', 'approved', 'delivered', 'cancelled');

-- Enum for customer credit score
CREATE TYPE store_credit_score AS ENUM ('excellent', 'good', 'regular', 'bad');

-- Store settings table
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_name TEXT NOT NULL DEFAULT 'Minha Loja',
  store_description TEXT,
  store_logo TEXT,
  store_banner TEXT,
  whatsapp_number TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store categories table
CREATE TABLE public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store products table
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  sku TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  stock_quantity INT DEFAULT 0,
  min_stock_alert INT DEFAULT 5,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store customers table
CREATE TABLE public.store_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  birth_date DATE,
  credit_score store_credit_score DEFAULT 'good',
  credit_limit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store sales table
CREATE TABLE public.store_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  customer_id UUID REFERENCES public.store_customers(id) ON DELETE SET NULL,
  sale_number TEXT NOT NULL,
  status store_sale_status DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  down_payment NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'crediario',
  installments_count INT DEFAULT 1,
  notes TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store sale items table
CREATE TABLE public.store_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.store_sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.store_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Store installments table
CREATE TABLE public.store_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.store_sales(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.store_customers(id) ON DELETE SET NULL,
  installment_number INT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status store_installment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store leads table
CREATE TABLE public.store_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.store_products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  address TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Store admin users table
CREATE TABLE public.store_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_settings
CREATE POLICY "Users can view their own settings" ON public.store_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.store_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.store_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view active store settings" ON public.store_settings FOR SELECT USING (is_active = true);

-- RLS Policies for store_categories
CREATE POLICY "Users can manage their categories" ON public.store_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view active categories" ON public.store_categories FOR SELECT USING (is_active = true);

-- RLS Policies for store_products
CREATE POLICY "Users can manage their products" ON public.store_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view active products" ON public.store_products FOR SELECT USING (is_active = true);

-- RLS Policies for store_customers
CREATE POLICY "Users can manage their customers" ON public.store_customers FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for store_sales
CREATE POLICY "Users can manage their sales" ON public.store_sales FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for store_sale_items
CREATE POLICY "Users can manage sale items" ON public.store_sale_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.store_sales WHERE id = sale_id AND user_id = auth.uid())
);

-- RLS Policies for store_installments
CREATE POLICY "Users can manage installments" ON public.store_installments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.store_sales WHERE id = sale_id AND user_id = auth.uid())
);

-- RLS Policies for store_leads
CREATE POLICY "Users can manage their leads" ON public.store_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can insert leads" ON public.store_leads FOR INSERT WITH CHECK (true);

-- RLS Policies for store_admin_users
CREATE POLICY "Users can view their own admin profile" ON public.store_admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin profile" ON public.store_admin_users FOR UPDATE USING (auth.uid() = user_id);

-- Function to generate sale number
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.store_sales;
  new_number := 'VND-' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate sale number
CREATE OR REPLACE FUNCTION set_sale_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sale_number IS NULL OR NEW.sale_number = '' THEN
    NEW.sale_number := generate_sale_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_sale_number
  BEFORE INSERT ON public.store_sales
  FOR EACH ROW
  EXECUTE FUNCTION set_sale_number();

-- Indexes for performance
CREATE INDEX idx_store_products_category ON public.store_products(category_id);
CREATE INDEX idx_store_products_user ON public.store_products(user_id);
CREATE INDEX idx_store_sales_customer ON public.store_sales(customer_id);
CREATE INDEX idx_store_installments_sale ON public.store_installments(sale_id);
CREATE INDEX idx_store_installments_due_date ON public.store_installments(due_date);
CREATE INDEX idx_store_customers_cpf ON public.store_customers(cpf);