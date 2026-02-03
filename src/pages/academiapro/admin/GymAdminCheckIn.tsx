import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  RefreshCw, 
  Users, 
  Clock,
  CheckCircle2,
  Power,
  PowerOff,
  Palette,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import QRCodeLib from 'qrcode';

const COLOR_PRESETS = [
  { name: 'Laranja', dark: '#f97316', light: '#18181b' },
  { name: 'Verde', dark: '#22c55e', light: '#18181b' },
  { name: 'Azul', dark: '#3b82f6', light: '#18181b' },
  { name: 'Roxo', dark: '#a855f7', light: '#18181b' },
  { name: 'Vermelho', dark: '#ef4444', light: '#18181b' },
  { name: 'Branco', dark: '#000000', light: '#ffffff' },
];

export default function GymAdminCheckIn() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [gymCode, setGymCode] = useState<string>('');
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrColors, setQrColors] = useState({ dark: '#f97316', light: '#18181b' });
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    loadOrCreateGymCode();
    fetchTodayCheckIns();
    fetchStats();
    
    // Subscribe to realtime check-ins
    const channel = supabase
      .channel('check-ins-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gym_check_ins' },
        () => {
          fetchTodayCheckIns();
          fetchStats();
          toast.success('Novo check-in registrado!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOrCreateGymCode = async () => {
    try {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_type', 'gym_qr_code')
        .maybeSingle();

      if (settings?.settings) {
        const settingsData = settings.settings as { code?: string; colors?: { dark: string; light: string } };
        const code = settingsData.code || `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
        const colors = settingsData.colors || { dark: '#f97316', light: '#18181b' };
        setGymCode(code);
        setQrColors(colors);
        generateQRCode(code, colors);
      } else {
        const code = `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
        setGymCode(code);
        generateQRCode(code, qrColors);
        // Store in localStorage as fallback
        localStorage.setItem('gym_qr_config', JSON.stringify({ code, colors: qrColors }));
      }
    } catch (error) {
      console.error('Error loading gym code:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('gym_qr_config');
      if (saved) {
        const { code, colors } = JSON.parse(saved);
        setGymCode(code);
        setQrColors(colors);
        generateQRCode(code, colors);
      } else {
        const code = `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
        setGymCode(code);
        generateQRCode(code, qrColors);
      }
    }
  };

  const saveGymCode = async (code: string, colors: { dark: string; light: string }) => {
    // Always save to localStorage first
    localStorage.setItem('gym_qr_config', JSON.stringify({ code, colors }));
    
    // Try to save to database
    try {
      await supabase
        .from('admin_settings')
        .upsert({
          setting_type: 'gym_qr_code',
          settings: { code, colors }
        }, { onConflict: 'setting_type' });
    } catch (error) {
      console.warn('Could not save to database, using localStorage');
    }
  };

  const generateQRCode = async (code: string, colors: { dark: string; light: string }) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(code, {
        width: 400,
        margin: 2,
        color: { dark: colors.dark, light: colors.light }
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const fetchTodayCheckIns = async () => {
    setIsLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      // Fetch check-ins WITHOUT the problematic foreign key join
      const { data: checkInsData, error } = await supabase
        .from('gym_check_ins')
        .select('*')
        .gte('checked_in_at', `${today}T00:00:00`)
        .lte('checked_in_at', `${today}T23:59:59`)
        .order('checked_in_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (checkInsData && checkInsData.length > 0) {
        const userIds = [...new Set(checkInsData.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('gym_profiles')
          .select('*')
          .in('user_id', userIds);

        // Merge profiles with check-ins
        const merged = checkInsData.map(checkIn => ({
          ...checkIn,
          profile: profiles?.find(p => p.user_id === checkIn.user_id)
        }));
        
        setCheckIns(merged);
      } else {
        setCheckIns([]);
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Erro ao carregar check-ins');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStr = format(startOfWeek, 'yyyy-MM-dd');
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStr = format(startOfMonth, 'yyyy-MM-dd');

    try {
      const [todayRes, weekRes, monthRes] = await Promise.all([
        supabase.from('gym_check_ins').select('*', { count: 'exact', head: true }).gte('checked_in_at', `${todayStr}T00:00:00`),
        supabase.from('gym_check_ins').select('*', { count: 'exact', head: true }).gte('checked_in_at', `${weekStr}T00:00:00`),
        supabase.from('gym_check_ins').select('*', { count: 'exact', head: true }).gte('checked_in_at', `${monthStr}T00:00:00`)
      ]);

      setStats({
        today: todayRes.count || 0,
        week: weekRes.count || 0,
        month: monthRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = `qrcode-academia-genesis-${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = qrCode;
    link.click();
    toast.success('QR Code baixado!');
  };

  const handleRefreshQR = async () => {
    const newCode = `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
    setGymCode(newCode);
    await saveGymCode(newCode, qrColors);
    generateQRCode(newCode, qrColors);
    toast.success('Novo QR Code gerado!');
  };

  const handleColorChange = async (colors: { dark: string; light: string }) => {
    setQrColors(colors);
    await saveGymCode(gymCode, colors);
    generateQRCode(gymCode, colors);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Check-in</h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle de entrada dos alunos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            {isEnabled ? <Power className="w-4 h-4 text-green-500" /> : <PowerOff className="w-4 h-4 text-muted-foreground" />}
            <Label htmlFor="check-in-toggle" className="text-sm">{isEnabled ? 'Ativo' : 'Desativado'}</Label>
            <Switch id="check-in-toggle" checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>
          <Button onClick={() => setShowQRModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hoje', value: stats.today, color: 'text-primary' },
          { label: 'Esta Semana', value: stats.week, color: 'text-foreground' },
          { label: 'Este Mês', value: stats.month, color: 'text-foreground' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Check-ins List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Check-ins de Hoje
            </h2>
            <Badge variant="outline" className="text-primary border-primary/50">
              {checkIns.length} entradas
            </Badge>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : checkIns.length > 0 ? (
              checkIns.map((checkIn) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-muted/50 border border-border rounded-lg p-4 flex items-center gap-4"
                >
                  <Avatar className="h-12 w-12 border border-primary/30">
                    <AvatarImage src={checkIn.profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {checkIn.profile?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{checkIn.profile?.full_name || 'Aluno'}</p>
                    <p className="text-sm text-muted-foreground">{checkIn.profile?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Check-in
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {format(new Date(checkIn.checked_in_at), 'HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum check-in registrado hoje</p>
                <p className="text-sm mt-1">Os alunos podem escanear o QR Code para registrar entrada</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal - Premium Design */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-gradient-to-b from-card to-card/95 border-border text-foreground max-w-md p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 pb-4">
            <DialogTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span>QR Code da Academia</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">Check-in dos alunos</p>
              </div>
            </DialogTitle>
          </div>

          <div className="p-6 pt-2 space-y-5">
            {/* QR Code Preview - Premium */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-background via-background to-muted/30 rounded-2xl p-6 flex flex-col items-center border border-border/50">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-xl shadow-lg" />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-xl animate-pulse" />
                )}
                <div className="mt-4 bg-muted/50 rounded-lg px-4 py-2 w-full">
                  <p className="text-[11px] text-muted-foreground text-center font-mono truncate">{gymCode}</p>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Palette className="w-4 h-4 text-primary" />
                Personalizar Cores
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorChange({ dark: preset.dark, light: preset.light })}
                    title={preset.name}
                    className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center hover:scale-105 ${
                      qrColors.dark === preset.dark
                        ? 'border-primary shadow-lg shadow-primary/30'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-lg shadow-inner"
                      style={{ backgroundColor: preset.dark }}
                    />
                  </button>
                ))}
              </div>

              {/* Custom Color Inputs */}
              <div className="flex gap-3 pt-2">
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">QR Code</Label>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 border border-border/50">
                    <input
                      type="color"
                      value={qrColors.dark}
                      onChange={(e) => handleColorChange({ ...qrColors, dark: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <Input
                      value={qrColors.dark}
                      onChange={(e) => handleColorChange({ ...qrColors, dark: e.target.value })}
                      className="bg-transparent border-0 text-xs h-8 uppercase font-mono p-0"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Fundo</Label>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 border border-border/50">
                    <input
                      type="color"
                      value={qrColors.light}
                      onChange={(e) => handleColorChange({ ...qrColors, light: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <Input
                      value={qrColors.light}
                      onChange={(e) => handleColorChange({ ...qrColors, light: e.target.value })}
                      className="bg-transparent border-0 text-xs h-8 uppercase font-mono p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleDownloadQR} 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold shadow-lg shadow-primary/20"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar QR Code
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshQR} 
                className="border-border hover:bg-muted h-12 w-12 p-0"
                title="Gerar novo código"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg py-2 px-4">
              💡 Imprima este QR Code e coloque na recepção para check-in dos alunos
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
