import { useState, useRef } from 'react';
import { Image, Plus, Lock, Upload, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGallery } from '@/contexts/GalleryContext';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import FeatureLock from '@/components/subscription/FeatureLock';

const GALLERY_PER_PAGE = 12;

export default function GalleryTab() {
  const { images: galleryImages, addImage, removeImage } = useGallery();
  const { notify } = useNotification();

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [page, setPage] = useState(0);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(galleryImages.length / GALLERY_PER_PAGE);
  const paginatedImages = galleryImages.slice(page * GALLERY_PER_PAGE, (page + 1) * GALLERY_PER_PAGE);

  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    addImage({
      url: newImageUrl,
      title: newImageTitle || undefined,
    });
    setNewImageUrl('');
    setNewImageTitle('');
    notify.success('Imagem adicionada à galeria');
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify.error('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploadingGalleryImage(true);
    try {
      const fileName = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('gallery-images').upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('gallery-images').getPublicUrl(fileName);

      addImage({
        url: publicUrl,
        title: newImageTitle || undefined,
      });
      setNewImageTitle('');
      notify.success('Imagem enviada e adicionada à galeria!');
    } catch (error) {
      console.error('Upload error:', error);
      notify.error('Erro ao enviar imagem');
    }
    setUploadingGalleryImage(false);
  };

  return (
    <FeatureLock feature="gallery">
      <div>
        <h2 className="text-2xl font-bold mb-6">Gerenciar Galeria</h2>

        {/* Add new image */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Adicionar Imagem
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Título (opcional)"
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryFileUpload}
                  className="hidden"
                />
                <Button
                  variant="hero"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={uploadingGalleryImage}
                  className="w-full"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingGalleryImage ? 'Enviando...' : 'Upload'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ou cole URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleAddGalleryImage} disabled={!newImageUrl.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery grid */}
        {galleryImages.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma imagem na galeria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {paginatedImages.map((image) => (
                <div key={image.id} className="relative group rounded-lg overflow-hidden aspect-square">
                  <img src={image.url} alt={image.title || 'Galeria'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="w-8 h-8 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-1">
                      <p className="text-[10px] font-medium truncate">{image.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </FeatureLock>
  );
}
