import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    height_cm: '',
    weight_kg: '',
    birth_date: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        birth_date: profile.birth_date || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const updateData: any = {
      full_name: formData.full_name,
      phone: formData.phone || null
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Editar Perfil</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-orange-500">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-orange-500/20 text-orange-500 text-2xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-zinc-900 border-zinc-800"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="175"
              />
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 p-4 pb-safe">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600"
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
  );
}
