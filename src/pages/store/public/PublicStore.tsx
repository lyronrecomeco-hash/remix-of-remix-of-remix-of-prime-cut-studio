import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Heart,
  Star,
  Loader2,
  Menu,
  X,
  MapPin,
  Clock,
  Phone,
  Truck,
  Shield,
  CreditCard,
  Headphones,
  Package,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  category_id: string | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const heroSlides = [
  {
    id: 1,
    title: 'Novidades Incríveis',
    subtitle: 'Descubra os lançamentos que vão transformar seu dia a dia',
    buttonText: 'Explorar Agora',
    bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Ofertas Especiais',
    subtitle: 'Até 50% de desconto em produtos selecionados',
    buttonText: 'Ver Ofertas',
    bgImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Qualidade Premium',
    subtitle: 'Os melhores produtos com garantia de satisfação',
    buttonText: 'Conhecer',
    bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const navigate = useNavigate();
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <div 
        onClick={() => navigate(`/loja/produto/${product.slug}`)}
        className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100/50"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-200" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="inline-flex items-center px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Top
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-50 hover:text-rose-500">
            <Heart className="w-4 h-4" />
          </button>

          {/* Quick View Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button 
              size="sm" 
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl h-10"
            >
              Ver Detalhes
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.brand && (
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="space-y-1">
            {product.original_price && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(product.original_price)}
              </p>
            )}
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </p>
            <p className="text-[11px] text-gray-500">
              ou <span className="font-semibold text-emerald-600">12x de {formatCurrency(product.price / 12)}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category, index, onClick }: { category: Category; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 aspect-[4/3] p-5 text-left shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {category.image_url && (
        <img 
          src={category.image_url} 
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-end">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:translate-x-1 transition-transform">
          {category.name}
        </h3>
        <p className="text-white/60 text-xs flex items-center gap-1 group-hover:text-white/80 transition-colors">
          Explorar <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </p>
      </div>
    </motion.button>
  );
}

export default function PublicStore() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      setSelectedCategory(category?.id || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categorySlug, categories]);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('store_categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('store_products').select('*').eq('is_active', true).order('is_featured', { ascending: false })
      ]);
      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = filteredProducts.filter(p => p.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <Store className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2 text-center text-xs font-medium tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" />
          <span>Frete grátis para compras acima de R$ 299</span>
          <span className="mx-2">•</span>
          <span className="hidden sm:inline">Parcele em até 12x sem juros</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <Link to="/loja" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-none">Minha Loja</h1>
                <p className="text-[10px] text-gray-400 font-medium">Os melhores produtos</p>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="O que você está procurando?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 h-11 bg-gray-50 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-300 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => { setSelectedCategory(null); navigate('/loja'); }}
                className={`text-sm font-medium transition-colors ${!selectedCategory ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Início
              </button>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); navigate(`/loja/categoria/${cat.slug}`); }}
                  className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-rose-500 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 rounded-xl relative">
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-gray-50 border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b shadow-lg overflow-hidden"
          >
            <div className="p-4 space-y-1">
              <button
                onClick={() => { setSelectedCategory(null); navigate('/loja'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${!selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Todos os Produtos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); navigate(`/loja/categoria/${cat.slug}`); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Slider */}
        {!searchTerm && !selectedCategory && (
          <section className="relative h-[420px] md:h-[520px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={heroSlides[currentSlide].bgImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="max-w-xl"
                    >
                      <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                        <Zap className="w-3 h-3 mr-1" />
                        Novidade
                      </Badge>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        {heroSlides[currentSlide].title}
                      </h2>
                      <p className="text-lg text-white/80 mb-8 max-w-md">
                        {heroSlides[currentSlide].subtitle}
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 rounded-xl shadow-2xl"
                      >
                        {heroSlides[currentSlide].buttonText}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </section>
        )}

        {/* Trust Badges */}
        {!searchTerm && !selectedCategory && (
          <section className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Truck, title: 'Entrega Rápida', desc: 'Para todo o Brasil' },
                  { icon: Shield, title: 'Compra Segura', desc: '100% protegido' },
                  { icon: CreditCard, title: 'Parcele em 12x', desc: 'Sem juros' },
                  { icon: Headphones, title: 'Suporte 24h', desc: 'Sempre disponível' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Categories */}
          {!searchTerm && categories.length > 0 && !selectedCategory && (
            <section className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
                  <p className="text-sm text-gray-500 mt-1">Explore por categoria</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.slice(0, 4).map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    onClick={() => { setSelectedCategory(category.id); navigate(`/loja/categoria/${category.slug}`); }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Featured Products */}
          {featuredProducts.length > 0 && !searchTerm && !selectedCategory && (
            <section className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Destaques</h2>
                  </div>
                  <p className="text-sm text-gray-500">Os produtos mais amados pelos clientes</p>
                </div>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory
                    ? categories.find(c => c.id === selectedCategory)?.name
                    : searchTerm
                    ? `Resultados para "${searchTerm}"`
                    : 'Todos os Produtos'
                  }
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSelectedCategory(null); navigate('/loja'); }}
                  className="text-sm"
                >
                  Limpar filtro
                </Button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Não encontramos produtos com esses critérios. Tente buscar por outro termo ou explore nossas categorias.
                </p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory(null); navigate('/loja'); }}>
                  Ver todos os produtos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Footer */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Minha Loja</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sua loja online de confiança. Qualidade, preços justos e atendimento que você merece.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Institucional</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trabalhe Conosco</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Ajuda</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formas de Pagamento</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rastrear Pedido</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Contato</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (00) 00000-0000
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Sua Cidade, UF
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Seg-Sex: 9h às 18h
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Minha Loja. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
