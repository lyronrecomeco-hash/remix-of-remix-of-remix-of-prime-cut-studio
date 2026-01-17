import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '@/hooks/usePetshopCart';

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface PetshopCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const PetshopCartDrawer = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: PetshopCartDrawerProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Sua Sacola</h2>
                  <p className="text-sm text-gray-500">{cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-12 h-12 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Sacola vazia</h3>
                  <p className="text-gray-500 text-sm mb-4">Adicione produtos para continuar</p>
                  <button
                    onClick={onClose}
                    className="text-orange-600 font-medium hover:underline"
                  >
                    Ver produtos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-3 bg-gray-50 rounded-xl p-3"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-orange-600 font-bold text-sm mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                              className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:border-orange-300 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                              className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-sm hover:bg-orange-600 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product_id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                {/* Subtotal */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span className="text-gray-800">{formatPrice(cart.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Total</span>
                    <span className="text-orange-600">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
                >
                  Finalizar Pedido
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  Pagamento via PIX
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PetshopCartDrawer;
