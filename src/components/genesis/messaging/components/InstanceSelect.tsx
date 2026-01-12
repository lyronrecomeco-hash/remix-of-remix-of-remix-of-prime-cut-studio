import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InstanceOption } from '../types';

interface InstanceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  instances: InstanceOption[];
  label?: string;
}

export const InstanceSelect = ({ 
  value, 
  onValueChange, 
  instances, 
  label = "Instância" 
}: InstanceSelectProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecione uma instância" />
        </SelectTrigger>
        <SelectContent>
          {instances.length === 0 ? (
            <SelectItem value="_empty" disabled>
              Nenhuma instância disponível
            </SelectItem>
          ) : (
            instances.map((inst) => (
              <SelectItem key={inst.id} value={inst.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{inst.name}</span>
                  {inst.phone_number && (
                    <span className="text-muted-foreground">({inst.phone_number})</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
