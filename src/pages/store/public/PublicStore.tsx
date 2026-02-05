import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Search,
  ShoppingBag,
  Filter,
  ChevronRight,
  Heart,
  Star,
  Tag,
  Loader2
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
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('store_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      // Fetch products
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/loja" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Minha Loja</span>
            </Link>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => {
                setSelectedCategory(null);
                navigate('/loja');
              }}
              className={selectedCategory === null 
                ? 'bg-blue-600 hover:bg-blue-500 shrink-0' 
                : 'border-slate-700 text-slate-300 shrink-0'
              }
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedCategory(category.id);
                  navigate(`/loja/categoria/${category.slug}`);
                }}
                className={selectedCategory === category.id 
                  ? 'bg-blue-600 hover:bg-blue-500 shrink-0' 
                  : 'border-slate-700 text-slate-300 shrink-0'
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && !searchTerm && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Destaques</h2>
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
            <h2 className="text-lg font-semibold text-white">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'Todos os Produtos'
              }
            </h2>
            <span className="text-sm text-slate-400">
              {filteredProducts.length} produto(s)
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum produto encontrado</p>
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
      <footer className="bg-slate-900/50 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Minha Loja. Todos os direitos reservados.
          </p>
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
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden"
        onClick={() => navigate(`/loja/produto/${product.slug}`)}
      >
        <div className={`relative ${featured ? 'aspect-square' : 'aspect-[4/5]'} bg-slate-800/50`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-slate-600" />
            </div>
          )}
          
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discount}%
            </Badge>
          )}
          
          {featured && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          <p className="text-xs text-slate-500 mb-1">{product.brand || 'Sem marca'}</p>
          <h3 className="font-medium text-white text-sm line-clamp-2 mb-2 min-h-[40px]">
            {product.name}
          </h3>
          <div className="space-y-1">
            {product.original_price && (
              <p className="text-xs text-slate-500 line-through">
                {formatCurrency(product.original_price)}
              </p>
            )}
            <p className="text-lg font-bold text-blue-400">
              {formatCurrency(product.price)}
            </p>
          </div>
          <Button 
            className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-sm h-9"
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
