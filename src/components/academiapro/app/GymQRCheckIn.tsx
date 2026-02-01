import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface GymQRCheckInProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GymQRCheckIn({ open, onOpenChange }: GymQRCheckInProps) {
  const { user, profile } = useGymAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);

  useEffect(() => {
    if (open && user) {
      generateQRCode();
      checkTodayCheckIn();
    }
  }, [open, user]);

  const generateQRCode = async () => {
    setIsLoading(true);
    // Generate a unique check-in token
    const token = `GENESIS_CHECKIN_${user?.id}_${Date.now()}`;
    
    // Create QR code data URL using a simple canvas approach
    const qrData = encodeURIComponent(JSON.stringify({
      userId: user?.id,
      name: profile?.full_name,
      timestamp: new Date().toISOString(),
      token
    }));

    // Using QR code API
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`);
    setIsLoading(false);
  };

  const checkTodayCheckIn = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('gym_check_ins')
      .select('*')
      .eq('user_id', user?.id)
      .gte('checked_in_at', today.toISOString())
      .single();

    setTodayCheckIn(data);
  };

  const handleManualCheckIn = async () => {
    if (todayCheckIn) {
      toast.info('Você já fez check-in hoje!');
      return;
    }

    setCheckInStatus('pending');

    const { error } = await supabase
      .from('gym_check_ins')
      .insert({
        user_id: user?.id,
        checked_in_at: new Date().toISOString(),
        method: 'manual'
      });

    if (error) {
      setCheckInStatus('error');
      toast.error('Erro ao fazer check-in');
      return;
    }

    setCheckInStatus('success');
    toast.success('Check-in realizado! 💪');
    checkTodayCheckIn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Check-in na Academia</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {todayCheckIn ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-green-500">Check-in realizado!</h3>
              <p className="text-zinc-400 text-sm mt-2">
                Você já fez check-in hoje às{' '}
                {new Date(todayCheckIn.checked_in_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </motion.div>
          ) : (
            <>
              {isLoading ? (
                <div className="w-48 h-48 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="bg-white p-4 rounded-xl">
                    {qrCode && (
                      <img 
                        src={qrCode} 
                        alt="QR Code Check-in"
                        className="w-48 h-48"
                      />
                    )}
                  </div>
                  <button
                    onClick={generateQRCode}
                    className="absolute -top-2 -right-2 p-2 bg-zinc-800 rounded-full border border-zinc-700 hover:bg-zinc-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              <p className="text-zinc-400 text-sm text-center mt-4 mb-4">
                Escaneie o QR Code na recepção ou clique abaixo
              </p>

              <Button
                onClick={handleManualCheckIn}
                disabled={checkInStatus === 'pending'}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {checkInStatus === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Fazer Check-in Manual
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500 text-center">
            {profile?.full_name} • {profile?.email}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
