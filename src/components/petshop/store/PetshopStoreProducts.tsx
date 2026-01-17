import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  stock: number;
  petshop_categories: {
    name: string;
    icon: string | null;
  } | null;
}

interface PetshopStoreProductsProps {
  products: Product[];
  onAddToCart: (product: { id: string; name: string; price: number; image_url?: string }) => void;
  getItemQuantity: (productId: string) => number;
  updateQuantity: (productId: string, quantity: number) => void;
}

const PetshopStoreProducts = ({
  products,
  onAddToCart,
  getItemQuantity,
  updateQuantity
}: PetshopStoreProductsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum produto encontrado</h3>
        <p className="text-gray-500">Tente buscar por outro termo ou categoria</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Featured Products */}
      {products.some(p => p.is_featured) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⭐</span> Destaques
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.filter(p => p.is_featured).slice(0, 4).map((product, index) => (
              <ProductCardLarge 
                key={product.id} 
                product={product}
                index={index}
                formatPrice={formatPrice}
                calculateDiscount={calculateDiscount}
                onAddToCart={onAddToCart}
                quantity={getItemQuantity(product.id)}
                updateQuantity={updateQuantity}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🛒</span> Todos os Produtos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product}
              index={index}
              formatPrice={formatPrice}
              calculateDiscount={calculateDiscount}
              onAddToCart={onAddToCart}
              quantity={getItemQuantity(product.id)}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Large Card for Featured Products
const ProductCardLarge = ({
  product,
  index,
  formatPrice,
  calculateDiscount,
  onAddToCart,
  quantity,
  updateQuantity
}: {
  product: Product;
  index: number;
  formatPrice: (price: number) => string;
  calculateDiscount: (price: number, originalPrice: number) => number;
  onAddToCart: (product: { id: string; name: string; price: number; image_url?: string }) => void;
  quantity: number;
  updateQuantity: (productId: string, quantity: number) => void;
}) => {
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-xl transition-all duration-300 flex"
    >
      {/* Image */}
      <div className="relative w-32 sm:w-40 flex-shrink-0">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{calculateDiscount(product.price, product.original_price!)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {product.petshop_categories && (
            <span className="text-xs text-orange-500 font-medium">
              {product.petshop_categories.icon} {product.petshop_categories.name}
            </span>
          )}
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mt-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through block">
                {formatPrice(product.original_price!)}
              </span>
            )}
            <span className="text-lg font-bold text-orange-600">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add to Cart */}
          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onAddToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || undefined
              })}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full shadow-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-50 rounded-full p-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Minus className="w-4 h-4 text-orange-600" />
              </motion.button>
              <span className="w-6 text-center font-bold text-orange-600">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Regular Card
const ProductCard = ({
  product,
  index,
  formatPrice,
  calculateDiscount,
  onAddToCart,
  quantity,
  updateQuantity
}: {
  product: Product;
  index: number;
  formatPrice: (price: number) => string;
  calculateDiscount: (price: number, originalPrice: number) => number;
  onAddToCart: (product: { id: string; name: string; price: number; image_url?: string }) => void;
  quantity: number;
  updateQuantity: (productId: string, quantity: number) => void;
}) => {
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{calculateDiscount(product.price, product.original_price!)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-2">
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through block">
              {formatPrice(product.original_price!)}
            </span>
          )}
          <span className="text-sm sm:text-base font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart */}
        <div className="mt-3">
          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || undefined
              })}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </motion.button>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-orange-50 rounded-lg p-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Minus className="w-3.5 h-3.5 text-orange-600" />
              </motion.button>
              <span className="w-6 text-center font-bold text-orange-600 text-sm">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PetshopStoreProducts;
