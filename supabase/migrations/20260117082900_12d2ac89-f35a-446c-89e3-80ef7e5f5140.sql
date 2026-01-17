
-- Categorias de produtos do petshop
CREATE TABLE public.petshop_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos do petshop
CREATE TABLE public.petshop_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.petshop_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pedidos do petshop
CREATE TABLE public.petshop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  delivery_notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  pix_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens do pedido
CREATE TABLE public.petshop_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.petshop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.petshop_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.petshop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petshop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petshop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petshop_order_items ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura (loja pública)
CREATE POLICY "Anyone can view active categories" ON public.petshop_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active products" ON public.petshop_products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can create orders" ON public.petshop_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their orders by phone" ON public.petshop_orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON public.petshop_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.petshop_order_items FOR SELECT USING (true);

-- Inserir categorias iniciais
INSERT INTO public.petshop_categories (name, slug, icon, description, display_order) VALUES
('Rações e Alimentos', 'racoes', '🍖', 'Rações premium e alimentos especiais', 1),
('Petiscos e Snacks', 'petiscos', '🦴', 'Petiscos deliciosos e saudáveis', 2),
('Brinquedos', 'brinquedos', '🎾', 'Diversão garantida para seu pet', 3),
('Higiene e Beleza', 'higiene', '🧴', 'Shampoos, condicionadores e mais', 4),
('Acessórios', 'acessorios', '🎀', 'Coleiras, roupinhas e mais', 5),
('Camas e Casas', 'camas', '🛏️', 'Conforto para descanso', 6),
('Saúde', 'saude', '💊', 'Vitaminas e suplementos', 7),
('Transporte', 'transporte', '🚗', 'Caixas e bolsas de transporte', 8);

-- Inserir produtos de exemplo
INSERT INTO public.petshop_products (category_id, name, description, price, original_price, image_url, stock, is_featured, tags) VALUES
((SELECT id FROM public.petshop_categories WHERE slug = 'racoes'), 'Ração Premium Golden Cães Adultos 15kg', 'Ração super premium para cães adultos de porte médio e grande', 189.90, 219.90, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400', 50, true, ARRAY['cães', 'adulto', 'premium']),
((SELECT id FROM public.petshop_categories WHERE slug = 'racoes'), 'Ração Royal Canin Gatos Adultos 7.5kg', 'Nutrição completa para gatos adultos', 249.90, NULL, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 30, true, ARRAY['gatos', 'adulto']),
((SELECT id FROM public.petshop_categories WHERE slug = 'racoes'), 'Ração Whiskas Sachê Carne 85g', 'Sachê úmido sabor carne ao molho', 4.90, 5.90, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400', 200, false, ARRAY['gatos', 'sachê']),
((SELECT id FROM public.petshop_categories WHERE slug = 'petiscos'), 'Bifinho de Frango 500g', 'Petisco natural de frango desidratado', 34.90, NULL, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', 80, true, ARRAY['cães', 'natural']),
((SELECT id FROM public.petshop_categories WHERE slug = 'petiscos'), 'Osso Defumado Grande', 'Osso natural defumado para roer', 19.90, 24.90, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 60, false, ARRAY['cães', 'natural']),
((SELECT id FROM public.petshop_categories WHERE slug = 'brinquedos'), 'Bolinha com Corda Resistente', 'Brinquedo durável para brincadeiras', 29.90, NULL, 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400', 100, false, ARRAY['cães', 'interativo']),
((SELECT id FROM public.petshop_categories WHERE slug = 'brinquedos'), 'Arranhador para Gatos Torre', 'Torre arranhador com 3 níveis', 159.90, 199.90, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400', 15, true, ARRAY['gatos', 'arranhador']),
((SELECT id FROM public.petshop_categories WHERE slug = 'higiene'), 'Shampoo Neutro Pet 500ml', 'Shampoo suave para todos os tipos de pelo', 24.90, NULL, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', 70, false, ARRAY['cães', 'gatos', 'banho']),
((SELECT id FROM public.petshop_categories WHERE slug = 'higiene'), 'Kit Escova + Pente Desembaraçador', 'Kit completo para escovação', 49.90, 59.90, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400', 40, false, ARRAY['cães', 'gatos', 'escovação']),
((SELECT id FROM public.petshop_categories WHERE slug = 'acessorios'), 'Coleira LED Recarregável', 'Coleira com luz LED para passeios noturnos', 39.90, NULL, 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400', 45, true, ARRAY['cães', 'segurança']),
((SELECT id FROM public.petshop_categories WHERE slug = 'acessorios'), 'Roupinha de Inverno M', 'Casaco quentinho para dias frios', 69.90, 89.90, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', 25, false, ARRAY['cães', 'roupa']),
((SELECT id FROM public.petshop_categories WHERE slug = 'camas'), 'Cama Redonda Pelúcia G', 'Cama super macia e aconchegante', 129.90, 159.90, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400', 20, true, ARRAY['cães', 'gatos', 'conforto']),
((SELECT id FROM public.petshop_categories WHERE slug = 'saude'), 'Vitaminas para Pelos e Pele', 'Suplemento para pelagem saudável', 54.90, NULL, 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', 35, false, ARRAY['cães', 'gatos', 'suplemento']),
((SELECT id FROM public.petshop_categories WHERE slug = 'transporte'), 'Bolsa Transporte Ventilada M', 'Bolsa confortável para transporte', 119.90, 149.90, 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400', 18, false, ARRAY['cães', 'gatos', 'viagem']);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_petshop_categories_updated_at
BEFORE UPDATE ON public.petshop_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_petshop_products_updated_at
BEFORE UPDATE ON public.petshop_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_petshop_orders_updated_at
BEFORE UPDATE ON public.petshop_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
