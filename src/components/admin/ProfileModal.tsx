import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Upload, Check, Loader2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

// Professional avatars - more realistic style
const maleAvatars = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Liam&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Oliver&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=James&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=William&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Noah&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Benjamin&backgroundColor=c0aede',
];

const femaleAvatars = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Emma&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Isabella&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Mia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Charlotte&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Amelia&backgroundColor=ffd5dc',
];

const ProfileModal = ({ isOpen, onClose, onAvatarUpdate }: ProfileModalProps) => {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState<'male' | 'female'>('male');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSelectedAvatar(data.avatar_url);
      setAvatarType((data.avatar_type as 'male' | 'female') || 'male');
      if (data.avatar_url && !data.avatar_url.includes('dicebear')) {
        setCustomAvatarUrl(data.avatar_url);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setCustomAvatarUrl(publicUrl);
      setSelectedAvatar(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const profileData = {
        user_id: user.id,
        avatar_url: selectedAvatar,
        avatar_type: avatarType,
      };

      if (existing) {
        await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_profiles')
          .insert(profileData);
      }

      // Notify parent component to update avatar immediately
      if (onAvatarUpdate) {
        onAvatarUpdate(selectedAvatar);
      }

      toast.success('Perfil atualizado!');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatars = avatarType === 'male' ? maleAvatars : femaleAvatars;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil" size="md">
      <ModalBody className="space-y-5">
        {/* Current Avatar Preview */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="w-20 h-20 mx-auto ring-4 ring-primary/20 ring-offset-2 ring-offset-background">
              {selectedAvatar ? (
                <AvatarImage src={selectedAvatar} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Escolha um avatar ou faça upload de uma foto
          </p>
        </div>

        {/* Avatar Type Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={avatarType === 'male' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvatarType('male')}
          >
            <User className="w-4 h-4 mr-1" />
            Masculino
          </Button>
          <Button
            variant={avatarType === 'female' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvatarType('female')}
          >
            <User className="w-4 h-4 mr-1" />
            Feminino
          </Button>
        </div>

        {/* Avatar Grid - 6 avatars in 2 rows */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Avatares disponíveis</p>
          <div className="grid grid-cols-6 gap-2">
            {currentAvatars.map((avatar, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedAvatar(avatar);
                  setCustomAvatarUrl(null);
                }}
                className={`relative p-1 rounded-lg border-2 transition-all aspect-square ${
                  selectedAvatar === avatar
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${idx + 1}`}
                  className="w-full h-full rounded-md"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Upload - Compact */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Ou faça upload de uma foto</p>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center h-12 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  Escolher arquivo (máx 2MB)
                </span>
              )}
            </label>
            
            {customAvatarUrl && (
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                  <AvatarImage src={customAvatarUrl} />
                </Avatar>
                <Button
                  size="sm"
                  variant={selectedAvatar === customAvatarUrl ? 'default' : 'outline'}
                  onClick={() => setSelectedAvatar(customAvatarUrl)}
                  className="text-xs"
                >
                  {selectedAvatar === customAvatarUrl ? <Check className="w-3 h-3" /> : 'Usar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} size="sm">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar Perfil
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProfileModal;
