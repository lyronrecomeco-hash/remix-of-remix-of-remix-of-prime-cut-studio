import { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

interface WelcomeToastProps {
  userName: string;
  onClose?: () => void;
}

export const WelcomeToast = ({ userName, onClose }: WelcomeToastProps) => {
  useEffect(() => {
    // Show toast notification using sonner
    toast(
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="font-medium text-foreground">
          Logado com sucesso!
        </span>
      </div>,
      {
        duration: 4000,
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
