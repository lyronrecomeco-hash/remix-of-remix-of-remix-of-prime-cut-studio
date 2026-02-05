import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  ChevronLeft,
  ShoppingBag,
  MessageCircle,
  Loader2,
  Check,
  User,
  CreditCard,
  MapPin,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  user_id: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const interestSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(11),
  address: z.string().min(10, 'Endereço deve ter pelo menos 10 caracteres').max(200),
  message: z.string().max(500).optional(),
});

export default function InterestForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    address: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('id, name, slug, brand, price, image_url, user_id')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/loja');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 10) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const cleanCPF = formData.cpf.replace(/\D/g, '');
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    const result = interestSchema.safeParse({
      ...formData,
      cpf: cleanCPF,
      phone: cleanPhone,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save lead to database
      const { error: leadError } = await supabase
        .from('store_leads')
        .insert({
          user_id: product!.user_id,
          product_id: product!.id,
          name: formData.name,
          cpf: cleanCPF,
          phone: cleanPhone,
          address: formData.address,
          message: formData.message || null,
        });

      if (leadError) throw leadError;

      // Get store settings for WhatsApp number
      const { data: settings } = await supabase
        .from('store_settings')
        .select('whatsapp_number')
        .eq('user_id', product!.user_id)
        .single();

      const whatsappNumber = settings?.whatsapp_number || '5500000000000';
      
      // Create WhatsApp message
      const message = `*Novo Interesse em Produto*
      
📦 *Produto:* ${product!.name}
💰 *Preço:* ${formatCurrency(product!.price)}

👤 *Cliente:*
Nome: ${formData.name}
CPF: ${formatCPF(cleanCPF)}
Telefone: ${formatPhone(cleanPhone)}
Endereço: ${formData.address}

${formData.message ? `💬 *Mensagem:* ${formData.message}` : ''}`;

      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      setIsSuccess(true);
      
      // Wait a bit then redirect
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);

    } catch (error) {
      console.error('Error submitting interest:', error);
      toast.error('Erro ao enviar interesse. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Interesse Enviado!</h1>
          <p className="text-slate-400 mb-6">
            Você será redirecionado para o WhatsApp do vendedor.
          </p>
          <Button onClick={() => navigate('/loja')} variant="outline" className="border-slate-700">
            Voltar para a Loja
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/loja/produto/${slug}`)}
              className="text-slate-400"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Link to="/loja" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Minha Loja</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Product Summary */}
          <Card className="bg-slate-900/50 border-slate-700/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400">{product.brand || 'Produto'}</p>
                  <h2 className="font-semibold text-white">{product.name}</h2>
                  <p className="text-xl font-bold text-blue-400">{formatCurrency(product.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <h1 className="text-xl font-bold text-white mb-2">Tenho Interesse</h1>
              <p className="text-slate-400 mb-6">
                Preencha seus dados e entraremos em contato pelo WhatsApp.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome"
                    className="bg-slate-800/50 border-slate-700"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  {errors.cpf && <p className="text-red-400 text-sm">{errors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    Telefone/WhatsApp *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Endereço Completo *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade - Estado"
                    className="bg-slate-800/50 border-slate-700"
                  />
                  {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Alguma dúvida ou observação?"
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Enviar pelo WhatsApp
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Ao enviar, você concorda em ser contatado pelo vendedor via WhatsApp.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
