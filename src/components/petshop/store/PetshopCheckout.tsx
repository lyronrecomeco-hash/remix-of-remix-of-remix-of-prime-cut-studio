import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, MapPin, User, Phone, MessageSquare, Copy, Check, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/hooks/usePetshopCart';

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface PetshopCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
  onComplete: () => void;
}

type Step = 'info' | 'address' | 'payment' | 'success';

const PetshopCheckout = ({
  isOpen,
  onClose,
  cart,
  onComplete
}: PetshopCheckoutProps) => {
  const [step, setStep] = useState<Step>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [orderProtocol, setOrderProtocol] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const generateProtocol = () => {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PET${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${random}`;
  };

  const generatePixCode = () => {
    // Simulated PIX code - in production this would come from a payment gateway
    return `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}5204000053039865802BR5913PETSHOP AMOR6008BRASILIA62070503***6304`;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const protocol = generateProtocol();
      const pixCode = generatePixCode();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('petshop_orders')
        .insert({
          protocol,
          customer_name: formData.name,
          customer_phone: formData.phone,
          delivery_address: formData.address,
          delivery_notes: formData.notes,
          subtotal: cart.subtotal,
          delivery_fee: cart.deliveryFee,
          total: cart.total,
          payment_method: 'pix',
          pix_code: pixCode
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('petshop_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderProtocol(protocol);
      setStep('payment');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = async () => {
    const pixCode = generatePixCode();
    await navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPayment = () => {
    setStep('success');
  };

  const handleClose = () => {
    if (step === 'success') {
      onComplete();
    }
    setStep('info');
    setFormData({ name: '', phone: '', address: '', notes: '' });
    onClose();
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Olá! Acabei de fazer um pedido na loja PetShop.\n\nProtocolo: ${orderProtocol}\nTotal: ${formatPrice(cart.total)}\n\nPosso confirmar o pagamento?`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[90vh] bg-white rounded-2xl z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {step !== 'info' && step !== 'success' && (
                  <button
                    onClick={() => setStep(step === 'address' ? 'info' : 'address')}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <h2 className="font-bold text-gray-800">
                  {step === 'info' && 'Seus Dados'}
                  {step === 'address' && 'Endereço de Entrega'}
                  {step === 'payment' && 'Pagamento PIX'}
                  {step === 'success' && 'Pedido Confirmado!'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {/* Info Step */}
                {step === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Endereço de entrega *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua, número, bairro, complemento..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Observações (opcional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Alguma instrução especial?"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Order Summary */}
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Pedido #{orderProtocol}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal ({cart.items.length} itens)</span>
                          <span className="text-gray-800">{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa de entrega</span>
                          <span className="text-gray-800">{formatPrice(cart.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-orange-200">
                          <span className="text-gray-800">Total</span>
                          <span className="text-orange-600">{formatPrice(cart.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* PIX Payment */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💳</span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">Pague com PIX</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Copie o código e pague pelo app do seu banco
                      </p>

                      {/* PIX Code Copy */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={copyPixCode}
                        className={`w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                          copiedPix 
                            ? 'border-green-400 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-5 h-5" />
                            Código copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copiar código PIX
                          </>
                        )}
                      </motion.button>

                      <p className="text-xs text-gray-400 mt-3">
                        Após o pagamento, clique em "Confirmar Pagamento"
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Pedido Realizado! 🎉
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Seu pedido foi recebido e será preparado em breve.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-600 mb-1">Número do pedido</p>
                      <p className="text-lg font-bold text-orange-600">{orderProtocol}</p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mb-3 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Falar no WhatsApp
                    </motion.button>

                    <button
                      onClick={handleClose}
                      className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Voltar para a loja
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {(step === 'info' || step === 'payment') && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                {step === 'info' && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.name || !formData.phone || !formData.address}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Gerar PIX - {formatPrice(cart.total)}
                      </>
                    )}
                  </motion.button>
                )}

                {step === 'payment' && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmPayment}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-xl transition-all"
                  >
                    <Check className="w-5 h-5" />
                    Confirmar Pagamento
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PetshopCheckout;
