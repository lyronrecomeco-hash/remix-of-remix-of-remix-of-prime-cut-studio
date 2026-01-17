import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CART_KEY = 'petshop_cart';
const DELIVERY_FEE = 8.90;

export const usePetshopCart = () => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    deliveryFee: DELIVERY_FEE,
    total: 0
  });

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const subtotal = parsed.items.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
        setCart({
          items: parsed.items || [],
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total: subtotal + DELIVERY_FEE
        });
      } catch {
        // Invalid data, reset
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = useCallback((items: CartItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newCart = {
      items,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: subtotal > 0 ? subtotal + DELIVERY_FEE : 0
    };
    setCart(newCart);
    localStorage.setItem(CART_KEY, JSON.stringify({ items }));
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('petshop-cart-updated'));
  }, []);

  const addItem = useCallback((product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  }) => {
    const existing = cart.items.find(item => item.product_id === product.id);
    
    if (existing) {
      const updated = cart.items.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1
      };
      saveCart([...cart.items, newItem]);
    }
  }, [cart.items, saveCart]);

  const removeItem = useCallback((productId: string) => {
    const updated = cart.items.filter(item => item.product_id !== productId);
    saveCart(updated);
  }, [cart.items, saveCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const updated = cart.items.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    );
    saveCart(updated);
  }, [cart.items, saveCart, removeItem]);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, [saveCart]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = cart.items.find(i => i.product_id === productId);
    return item?.quantity || 0;
  }, [cart.items]);

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    itemCount
  };
};
