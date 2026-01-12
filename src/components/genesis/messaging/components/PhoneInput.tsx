import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const PhoneInput = ({ 
  value, 
  onChange, 
  label = "Destinatário",
  placeholder = "5511999999999"
}: PhoneInputProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Input
        type="tel"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 font-mono"
      />
    </div>
  );
};
