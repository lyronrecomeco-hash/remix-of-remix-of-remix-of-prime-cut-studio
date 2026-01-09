import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  createdAt: string;
}

interface GalleryContextType {
  images: GalleryImage[];
  isLoading: boolean;
  addImage: (image: Omit<GalleryImage, 'id' | 'createdAt'>) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  updateImage: (id: string, updates: Partial<GalleryImage>) => Promise<void>;
  refreshImages: () => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const defaultImages: Omit<GalleryImage, 'id' | 'createdAt'>[] = [
  {
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop',
    title: 'Corte Degradê',
    description: 'Degradê moderno com acabamento perfeito',
  },
  {
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop',
    title: 'Barba Estilizada',
    description: 'Modelagem artesanal de barba',
  },
  {
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop',
    title: 'Corte Clássico',
    description: 'Estilo clássico atemporal',
  },
  {
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop',
    title: 'Navalhado',
    description: 'Acabamento com navalha',
  },
  {
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop',
    title: 'Ambiente Premium',
    description: 'Nossa estrutura de qualidade',
  },
  {
    url: 'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=600&h=600&fit=crop',
    title: 'Detalhes',
    description: 'Atenção aos detalhes em cada corte',
  },
];

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching gallery images:', error);
        // Se não tiver imagens no banco, usa as imagens default para visualização pública
        setImages(defaultImages.map((img, index) => ({
          ...img,
          id: `default-${index}`,
          createdAt: new Date().toISOString(),
        })));
        return;
      }

      if (data && data.length > 0) {
        setImages(data.map(img => ({
          id: img.id,
          url: img.url,
          title: img.title || undefined,
          description: img.description || undefined,
          category: img.category || undefined,
          createdAt: img.created_at,
        })));
      } else {
        // Se não tiver imagens no banco, mostra as default
        setImages(defaultImages.map((img, index) => ({
          ...img,
          id: `default-${index}`,
          createdAt: new Date().toISOString(),
        })));
      }
    } catch (err) {
      console.error('Error in fetchImages:', err);
      // Fallback para imagens default
      setImages(defaultImages.map((img, index) => ({
        ...img,
        id: `default-${index}`,
        createdAt: new Date().toISOString(),
      })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const addImage = useCallback(async (image: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    try {
      // Buscar tenant_id do usuário atual
      const { data: tenantData } = await supabase.rpc('current_tenant_id');
      
      if (!tenantData) {
        console.error('No tenant found for user');
        return;
      }

      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          tenant_id: tenantData,
          url: image.url,
          title: image.title,
          description: image.description,
          category: image.category || 'general',
          is_active: true,
          display_order: images.length,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding gallery image:', error);
        return;
      }

      if (data) {
        setImages(prev => [...prev, {
          id: data.id,
          url: data.url,
          title: data.title || undefined,
          description: data.description || undefined,
          category: data.category || undefined,
          createdAt: data.created_at,
        }]);
      }
    } catch (err) {
      console.error('Error in addImage:', err);
    }
  }, [images.length]);

  const removeImage = useCallback(async (id: string) => {
    // Se for uma imagem default, apenas remove do state
    if (id.startsWith('default-')) {
      setImages(prev => prev.filter(img => img.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error removing gallery image:', error);
        return;
      }

      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error('Error in removeImage:', err);
    }
  }, []);

  const updateImage = useCallback(async (id: string, updates: Partial<GalleryImage>) => {
    // Se for uma imagem default, apenas atualiza no state
    if (id.startsWith('default-')) {
      setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updates } : img)));
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({
          url: updates.url,
          title: updates.title,
          description: updates.description,
          category: updates.category,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating gallery image:', error);
        return;
      }

      setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updates } : img)));
    } catch (err) {
      console.error('Error in updateImage:', err);
    }
  }, []);

  const refreshImages = useCallback(async () => {
    setIsLoading(true);
    await fetchImages();
  }, [fetchImages]);

  return (
    <GalleryContext.Provider value={{ images, isLoading, addImage, removeImage, updateImage, refreshImages }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = (): GalleryContextType => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
