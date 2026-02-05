import { useEffect, useState, useCallback } from 'react';
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
  Tag,
  Loader2,
  Menu,
  X,
  MapPin,
  Clock,
  Phone,
  Percent,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

// Hero Slider Data
const heroSlides = [
  {
    id: 1,
    title: 'Novidades que você vai amar',
    subtitle: 'Confira os lançamentos da semana',
    buttonText: 'Ver Novidades',
    gradient: 'from-rose-500 via-pink-500 to-purple-600',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Ofertas Imperdíveis',
    subtitle: 'Até 50% OFF em produtos selecionados',
    buttonText: 'Aproveitar',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: Percent,
  },
  {
    id: 3,
    title: 'Mais Vendidos',
    subtitle: 'Os produtos favoritos dos clientes',
    buttonText: 'Conferir',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: TrendingUp,
  },
];

function ProductCard({ product, index, featured = false }: { product: Product; index: number; featured?: boolean }) {
  const navigate = useNavigate();
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/loja/produto/${product.slug}`)}
    >
      <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{discount}%
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 right-3 p-2 bg-amber-400 rounded-full shadow-lg">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Quick Action */}
          <button className="absolute bottom-3 right-3 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        
        <CardContent className="p-4">
          {product.brand && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
            )}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2">
            ou 12x de {formatCurrency(product.price / 12)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
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

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
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
      const { data: categoriesData } = await supabase
        .from('store_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: productsData } = await supabase
        .from('store_products')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });

      setCategories(categoriesData || []);
      setProducts(productsData || []);
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
  const regularProducts = filteredProducts.filter(p => !p.is_featured);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Logo */}
            <Link to="/loja" className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Minha Loja
                </span>
                <p className="text-[10px] text-gray-400 font-medium -mt-0.5">Os melhores produtos</p>
              </div>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Input
                  placeholder="O que você está procurando?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-5 pr-14 h-12 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500/20 rounded-full text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Categories */}
          <nav className="hidden lg:flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory(null); navigate('/loja'); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => { setSelectedCategory(category.id); navigate(`/loja/categoria/${category.slug}`); }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-[72px] bg-white border-b shadow-xl z-40 max-h-[60vh] overflow-y-auto"
          >
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Categorias</p>
              <button
                onClick={() => { setSelectedCategory(null); navigate('/loja'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                  selectedCategory === null ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Todos os Produtos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { setSelectedCategory(category.id); navigate(`/loja/categoria/${category.slug}`); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                    selectedCategory === category.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Slider */}
        {!searchTerm && !selectedCategory && (
          <section className="mb-10">
            <div className="relative overflow-hidden rounded-3xl h-[280px] md:h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} p-8 md:p-12 flex items-center`}
                >
                  <div className="relative z-10 max-w-lg">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {(() => {
                        const IconComponent = heroSlides[currentSlide].icon;
                        return (
                          <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1.5">
                            <IconComponent className="w-4 h-4 mr-2" />
                        Destaque
                      </Badge>
                    </motion.div>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
                    >
                      {heroSlides[currentSlide].title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/90 text-lg mb-6"
                    >
                      {heroSlides[currentSlide].subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 rounded-full shadow-lg">
                        {heroSlides[currentSlide].buttonText}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20">
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Grid */}
        {!searchTerm && categories.length > 0 && !selectedCategory && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedCategory(category.id); navigate(`/loja/categoria/${category.slug}`); }}
                  className="group p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <Tag className="w-7 h-7 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {category.name}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && !searchTerm && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Destaques</h2>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} featured />
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
                {filteredProducts.length} produto(s) encontrado(s)
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="py-20 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-6">Tente buscar por outro termo ou explore nossas categorias.</p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory(null); navigate('/loja'); }}>
                  Ver todos os produtos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {(searchTerm ? filteredProducts : regularProducts).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Minha Loja</span>
              </div>
              <p className="text-gray-500 max-w-md">
                Sua loja virtual com os melhores produtos e preços do mercado. Qualidade garantida e atendimento personalizado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Links Úteis</h4>
              <ul className="space-y-3 text-gray-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contato</h4>
              <ul className="space-y-3 text-gray-500">
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
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Minha Loja. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
