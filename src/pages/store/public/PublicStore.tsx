import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Search,
  ShoppingBag,
  ChevronRight,
  Heart,
  Star,
  Tag,
  Loader2,
  Menu,
  X,
  Grid3X3,
  List,
  SlidersHorizontal
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

export default function PublicStore() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
        🚚 Frete Grátis acima de R$ 199 | Parcele em até 12x sem juros
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Logo */}
            <Link to="/loja" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">Minha Loja</span>
                <p className="text-[10px] text-gray-500 -mt-1">Sua vitrine virtual</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <Input
                  placeholder="O que você está procurando?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-12 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-full text-gray-900 placeholder:text-gray-400"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600 relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-full text-gray-900 placeholder:text-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Categories Nav - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategory(null);
                navigate('/loja');
              }}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(category.id);
                  navigate(`/loja/categoria/${category.slug}`);
                }}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed inset-x-0 top-[120px] bg-white border-b shadow-lg z-40 max-h-[60vh] overflow-y-auto"
        >
          <div className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categorias</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                navigate('/loja');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  navigate(`/loja/categoria/${category.slug}`);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Banner */}
        {!searchTerm && !selectedCategory && (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12">
              <div className="relative z-10 max-w-lg">
                <Badge className="mb-4 bg-white/20 text-white border-0">🔥 Novidades</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Encontre os melhores produtos
                </h1>
                <p className="text-blue-100 mb-6">
                  Qualidade garantida, preços incríveis e atendimento personalizado.
                </p>
                <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6">
                  Ver Ofertas
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10">
                <ShoppingBag className="w-64 h-64" />
              </div>
            </div>
          </section>
        )}

        {/* Categories Quick Access */}
        {!searchTerm && categories.length > 0 && !selectedCategory && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    navigate(`/loja/categoria/${category.slug}`);
                  }}
                  className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Tag className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && !searchTerm && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-gray-900">Destaques</h2>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : searchTerm
                  ? `Resultados para "${searchTerm}"`
                  : 'Todos os Produtos'
                }
              </h2>
              <p className="text-sm text-gray-500">
                {filteredProducts.length} produto(s) encontrado(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="hidden md:flex border-gray-200">
                <Grid3X3 className="w-4 h-4 text-gray-500" />
              </Button>
              <Button variant="outline" size="icon" className="hidden md:flex border-gray-200">
                <List className="w-4 h-4 text-gray-500" />
              </Button>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="bg-white border-gray-100">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-4">Tente buscar por outro termo ou explore nossas categorias.</p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory(null); navigate('/loja'); }}>
                  Ver todos os produtos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(searchTerm ? filteredProducts : regularProducts).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Minha Loja</span>
              </div>
              <p className="text-gray-500 text-sm">
                Sua vitrine virtual com os melhores produtos e preços do mercado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Sobre nós</a></li>
                <li><a href="#" className="hover:text-blue-600">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-blue-600">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Atendimento</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Fale Conosco</a></li>
                <li><a href="#" className="hover:text-blue-600">Trocas e Devoluções</a></li>
                <li><a href="#" className="hover:text-blue-600">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Pagamento</h4>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-600">PIX</div>
                <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-600">Crediário</div>
                <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-600">Cartão</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Minha Loja. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, index, featured = false }: { product: Product; index: number; featured?: boolean }) {
  const navigate = useNavigate();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className="bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/30 transition-all cursor-pointer group overflow-hidden"
        onClick={() => navigate(`/loja/produto/${product.slug}`)}
      >
        <div className={`relative ${featured ? 'aspect-square' : 'aspect-[4/5]'} bg-gray-50`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 font-bold">
              -{discount}%
            </Badge>
          )}

          {featured && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Destaque
            </Badge>
          )}

          <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <CardContent className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{product.brand}</p>
          )}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-3 min-h-[40px] group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="space-y-1">
            {product.original_price && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(product.original_price)}
              </p>
            )}
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-500">
              ou 12x de {formatCurrency(product.price / 12)}
            </p>
          </div>
          <Button
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/loja/interesse/${product.slug}`);
            }}
          >
            Tenho Interesse
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
