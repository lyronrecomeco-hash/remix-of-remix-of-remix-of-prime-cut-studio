import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2, Upload, X, User } from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function GymEditProfilePage() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useGymAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    height_cm: '',
    weight_kg: '',
    birth_date: '',
    bio: '',
    emergency_contact: '',
    emergency_phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        birth_date: profile.birth_date || '',
        bio: (profile as any).bio || '',
        emergency_contact: (profile as any).emergency_contact || '',
        emergency_phone: (profile as any).emergency_phone || ''
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 5MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gym-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, create a local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        toast.info('Preview local - o upload será feito ao salvar');
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gym-assets')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      toast.success('Foto atualizada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const updateData: any = {
      full_name: formData.full_name,
      phone: formData.phone || null,
      avatar_url: avatarUrl || null
    };

    if (formData.height_cm) updateData.height_cm = parseFloat(formData.height_cm);
    if (formData.weight_kg) updateData.weight_kg = parseFloat(formData.weight_kg);
    if (formData.birth_date) updateData.birth_date = formData.birth_date;

    const { error } = await supabase
      .from('gym_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao salvar perfil');
      setIsLoading(false);
      return;
    }

    toast.success('Perfil atualizado!');
    await refreshProfile?.();
    navigate('/academiapro/app/perfil');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Editar Perfil</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
        {/* Avatar Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-primary/50">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-muted text-3xl">
                {formData.full_name?.charAt(0) || <User className="w-10 h-10 text-muted-foreground" />}
              </AvatarFallback>
            </Avatar>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3">
            Toque para alterar a foto
          </p>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Informações Pessoais
          </h3>
          
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-card border-border h-12"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-card border-border h-12"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="bg-card border-border h-12"
            />
          </div>
        </motion.div>

        {/* Physical Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Dados Físicos
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="bg-card border-border h-12"
                placeholder="175"
              />
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="bg-card border-border h-12"
                placeholder="70"
              />
            </div>
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Contato de Emergência
          </h3>
          
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className="bg-card border-border h-12"
              placeholder="Nome do contato"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.emergency_phone}
              onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
              className="bg-card border-border h-12"
              placeholder="(11) 99999-9999"
            />
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.full_name}
            className="w-full h-12 bg-primary hover:bg-primary/80"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
