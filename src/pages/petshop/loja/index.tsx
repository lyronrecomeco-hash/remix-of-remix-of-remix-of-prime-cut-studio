import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PetshopStoreHeader from '@/components/petshop/store/PetshopStoreHeader';
import PetshopStoreCategories from '@/components/petshop/store/PetshopStoreCategories';
import PetshopStoreProducts from '@/components/petshop/store/PetshopStoreProducts';
import PetshopCartDrawer from '@/components/petshop/store/PetshopCartDrawer';
import PetshopCheckout from '@/components/petshop/store/PetshopCheckout';
import { usePetshopCart } from '@/hooks/usePetshopCart';
import { Loader2 } from 'lucide-react';

const PetshopStorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, itemCount } = usePetshopCart();

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['petshop-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petshop_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['petshop-products', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('petshop_products')
        .select('*, petshop_categories(name, icon)')
        .eq('is_active', true)
        .gt('stock', 0);
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('is_featured', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    clearCart();
    setIsCheckoutOpen(false);
  };

  if (loadingCategories || loadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <PetshopStoreHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemCount={itemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="pt-20 pb-24">
        <PetshopStoreCategories 
          categories={categories || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <PetshopStoreProducts 
          products={products || []}
          onAddToCart={addItem}
          getItemQuantity={getItemQuantity}
          updateQuantity={updateQuantity}
        />
      </main>

      <PetshopCartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      <PetshopCheckout 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onComplete={handleOrderComplete}
      />
    </div>
  );
};

export default PetshopStorePage;
