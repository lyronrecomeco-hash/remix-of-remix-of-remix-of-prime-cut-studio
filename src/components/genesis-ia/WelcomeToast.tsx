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
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            Bem vindo de volta, {userName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sua plataforma Genesis IA está pronta
          </p>
        </div>
      </div>,
      {
        duration: 60000, // 1 minute
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
