import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  ChevronLeft,
  ShoppingBag,
  Star,
  Tag,
  Truck,
  Shield,
  MessageCircle,
  Loader2,
  Check,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/loja')}
              className="text-gray-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Link to="/loja" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Minha Loja</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-gray-300" />
                </div>
              )}
              
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                  -{discount}%
                </Badge>
              )}

              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white">
                <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
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
            <div>
              {product.brand && (
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                {product.original_price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                )}
                <span className="text-4xl font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                ou 12x de {formatCurrency(product.price / 12)} sem juros
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                {product.stock_quantity > 0 ? (
                  <span className="text-gray-600">Em estoque ({product.stock_quantity} disponíveis)</span>
                ) : (
                  <span className="text-red-500">Esgotado</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-gray-100">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Entrega Rápida</p>
                    <p className="text-xs text-gray-500">Consulte prazo</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-100">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Garantia</p>
                    <p className="text-xs text-gray-500">Produto garantido</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg gap-2"
                onClick={() => navigate(`/loja/interesse/${product.slug}`)}
                disabled={product.stock_quantity === 0}
              >
                <MessageCircle className="w-5 h-5" />
                Tenho Interesse
              </Button>
              <p className="text-center text-sm text-gray-500">
                Entraremos em contato pelo WhatsApp
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Especificações</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-900 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
