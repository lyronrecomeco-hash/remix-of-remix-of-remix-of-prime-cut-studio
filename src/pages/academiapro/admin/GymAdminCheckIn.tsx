import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  RefreshCw, 
  Users, 
  Clock,
  CheckCircle2,
  Settings2,
  Power,
  PowerOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCodeLib from 'qrcode';

export default function GymAdminCheckIn() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [gymCode, setGymCode] = useState<string>('');
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate unique gym code
    const code = `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
    setGymCode(code);
    generateQRCode(code);
    fetchTodayCheckIns();
    
    // Subscribe to realtime check-ins
    const channel = supabase
      .channel('check-ins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gym_check_ins'
        },
        (payload) => {
          fetchTodayCheckIns();
          toast.success('Novo check-in registrado!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateQRCode = async (code: string) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#f97316',
          light: '#18181b'
        }
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const fetchTodayCheckIns = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('gym_check_ins')
      .select('*, gym_profiles!gym_check_ins_user_id_fkey(*)')
      .gte('checked_in_at', `${today}T00:00:00`)
      .lte('checked_in_at', `${today}T23:59:59`)
      .order('checked_in_at', { ascending: false });

    if (data) {
      setCheckIns(data);
    }
    setIsLoading(false);
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-academia-genesis-${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = qrCode;
    link.click();
    toast.success('QR Code baixado!');
  };

  const handleRefreshQR = () => {
    const newCode = `GYM-GENESIS-${Date.now().toString(36).toUpperCase()}`;
    setGymCode(newCode);
    generateQRCode(newCode);
    toast.success('Novo QR Code gerado!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Check-in</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Controle de entrada dos alunos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
            {isEnabled ? (
              <Power className="w-4 h-4 text-green-500" />
            ) : (
              <PowerOff className="w-4 h-4 text-zinc-500" />
            )}
            <Label htmlFor="check-in-toggle" className="text-sm">
              {isEnabled ? 'Ativo' : 'Desativado'}
            </Label>
            <Switch
              id="check-in-toggle"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                QR Code da Academia
              </h2>
              <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-green-500/20 text-green-400' : ''}>
                {isEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-center mb-4">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="w-48 h-48 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-zinc-800 rounded-lg animate-pulse" />
              )}
            </div>

            <p className="text-xs text-zinc-500 text-center mb-4 font-mono break-all">
              {gymCode}
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleDownloadQR}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshQR}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-zinc-500 text-center mt-4">
              Imprima e coloque na recepção para os alunos escanearem
            </p>
          </div>
        </motion.div>

        {/* Check-ins List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Check-ins de Hoje
              </h2>
              <Badge variant="outline" className="text-orange-400 border-orange-500/50">
                {checkIns.length} entradas
              </Badge>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg p-4 animate-pulse h-16" />
                ))
              ) : checkIns.length > 0 ? (
                checkIns.map((checkIn) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex items-center gap-4"
                  >
                    <Avatar className="h-12 w-12 border border-orange-500/30">
                      <AvatarImage src={checkIn.gym_profiles?.avatar_url} />
                      <AvatarFallback className="bg-orange-500/20 text-orange-500">
                        {checkIn.gym_profiles?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {checkIn.gym_profiles?.full_name || 'Aluno'}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {checkIn.gym_profiles?.email}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Check-in
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {format(new Date(checkIn.checked_in_at), 'HH:mm')}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum check-in registrado hoje</p>
                  <p className="text-sm mt-1">Os alunos podem escanear o QR Code para registrar entrada</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400">Hoje</p>
          <p className="text-2xl font-bold text-orange-500">{checkIns.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400">Horário de Pico</p>
          <p className="text-2xl font-bold">18:00</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400">Média Semanal</p>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400">Este Mês</p>
          <p className="text-2xl font-bold">892</p>
        </div>
      </motion.div>
    </div>
  );
}
