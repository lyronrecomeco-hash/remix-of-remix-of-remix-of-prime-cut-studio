import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  ChevronLeft,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  MessageCircle,
  Loader2,
  Check,
  Heart,
  Package,
  ArrowLeft,
  Minus,
  Plus,
  Share2,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[];
  specifications: Record<string, string> | null;
  is_featured: boolean;
  stock_quantity: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct({
        ...data,
        specifications: data.specifications as Record<string, string> | null,
      } as Product);
      
      await supabase
        .from('store_products')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/loja');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!product) {
    return null;
  }

  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const allImages = [product.image_url, ...product.images].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/loja')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/loja" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">Minha Loja</span>
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-rose-500 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 rounded-xl">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li><Link to="/loja" className="hover:text-blue-600 transition-colors">Início</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Package className="w-24 h-24 text-gray-200" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge className="bg-rose-500 text-white border-0 font-bold shadow-lg">
                    -{discount}%
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-amber-500 text-white border-0 font-bold shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Destaque
                  </Badge>
                )}
              </div>

              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 hover:text-rose-500 transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === index 
                        ? 'border-blue-600 ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                  {product.brand}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                {product.original_price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm text-gray-500">
                ou <span className="font-semibold text-emerald-600">12x de {formatCurrency(product.price / 12)}</span> sem juros
              </p>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-600">PIX com 5% de desconto: <span className="font-semibold text-emerald-600">{formatCurrency(product.price * 0.95)}</span></span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    Em estoque ({product.stock_quantity} disponíveis)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium text-rose-600">Esgotado</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantidade:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-semibold rounded-xl shadow-lg shadow-blue-600/25"
                onClick={() => navigate(`/loja/interesse/${product.slug}`)}
                disabled={product.stock_quantity === 0}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Tenho Interesse
              </Button>
              <p className="text-center text-sm text-gray-500">
                Clique e converse conosco pelo WhatsApp
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Truck, title: 'Entrega Rápida', desc: 'Para todo o Brasil' },
                { icon: Shield, title: 'Garantia', desc: 'Produto garantido' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Descrição</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Especificações</h2>
                <div className="space-y-0 divide-y divide-gray-100">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 text-sm">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-900 font-medium text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Preço à vista</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl"
            onClick={() => navigate(`/loja/interesse/${product.slug}`)}
            disabled={product.stock_quantity === 0}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
