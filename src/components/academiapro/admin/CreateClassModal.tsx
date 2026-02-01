import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const WEEKDAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
];

const CATEGORIES = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'forca', label: 'Força' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'flexibilidade', label: 'Flexibilidade' },
  { value: 'relaxamento', label: 'Relaxamento' },
  { value: 'danca', label: 'Dança' },
  { value: 'luta', label: 'Luta' }
];

export function CreateClassModal({ open, onOpenChange, onSuccess }: CreateClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration_minutes: '60',
    max_capacity: '20',
    start_time: '08:00',
    location: '',
    recurring_days: [] as number[]
  });

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurring_days: prev.recurring_days.includes(day)
        ? prev.recurring_days.filter(d => d !== day)
        : [...prev.recurring_days, day].sort()
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || formData.recurring_days.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('gym_classes')
      .insert({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        duration_minutes: parseInt(formData.duration_minutes),
        max_capacity: parseInt(formData.max_capacity),
        start_time: formData.start_time,
        location: formData.location || null,
        recurring_days: formData.recurring_days,
        is_active: true
      });

    if (error) {
      toast.error('Erro ao criar aula');
      setIsLoading(false);
      return;
    }

    toast.success('Aula criada com sucesso!');
    setFormData({
      name: '',
      description: '',
      category: '',
      duration_minutes: '60',
      max_capacity: '20',
      start_time: '08:00',
      location: '',
      recurring_days: []
    });
    onSuccess();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Aula Coletiva</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nome da Aula *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-zinc-800 border-zinc-700"
              placeholder="Ex: Spinning Avançado"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-zinc-800 border-zinc-700 min-h-[80px]"
              placeholder="Descreva a aula..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidade máx.</Label>
              <Input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Sala 1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana *</Label>
            <div className="grid grid-cols-4 gap-2">
              {WEEKDAYS.map((day) => (
                <label
                  key={day.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    formData.recurring_days.includes(day.value)
                      ? 'bg-orange-500/20 border-orange-500'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <Checkbox
                    checked={formData.recurring_days.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                    className="border-zinc-600 data-[state=checked]:bg-orange-500"
                  />
                  <span className="text-xs">{day.label.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-zinc-700"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Aula'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
