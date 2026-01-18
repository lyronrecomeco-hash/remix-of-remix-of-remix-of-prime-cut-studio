import { useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface WelcomeToastProps {
  userName: string;
  onClose?: () => void;
}

export const WelcomeToast = ({ userName, onClose }: WelcomeToastProps) => {
  useEffect(() => {
    // Show toast notification using sonner
    toast(
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-base text-foreground">
            Bem vindo de volta, {userName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sua plataforma Genesis IA está pronta
          </p>
        </div>
      </div>,
      {
        duration: 15000, // 15 seconds
        position: 'top-center',
        onDismiss: onClose,
        onAutoClose: onClose,
      }
    );

    return () => {
      toast.dismiss();
    };
  }, [userName, onClose]);

  return null;
};
