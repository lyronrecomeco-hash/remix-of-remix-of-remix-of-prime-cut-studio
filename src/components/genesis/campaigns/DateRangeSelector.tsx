/**
 * DATE RANGE SELECTOR - Seletor de período para extração de contatos
 * Permite selecionar datas personalizadas ou usar presets
 */

import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import type { DateRange } from './hooks/useCaktoContacts';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

// Presets de período
const DATE_PRESETS = [
  { label: 'Hoje', days: 0 },
  { label: 'Últimas 24h', days: 1 },
  { label: 'Últimos 2 dias', days: 2 },
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 15 dias', days: 15 },
  { label: 'Últimos 30 dias', days: 30 },
];

export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(days === 0 ? new Date() : subDays(new Date(), days));
    onChange({ startDate, endDate });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Se clicar em uma data, definir como startDate
    // Se já tem startDate e a nova data é posterior, definir como endDate
    const clickedDate = startOfDay(date);
    
    if (!value.startDate || clickedDate < value.startDate) {
      onChange({ 
        startDate: startOfDay(clickedDate), 
        endDate: endOfDay(clickedDate) 
      });
    } else if (clickedDate > value.startDate) {
      onChange({ 
        startDate: value.startDate, 
        endDate: endOfDay(clickedDate) 
      });
    } else {
      // Mesma data - selecionar só esse dia
      onChange({ 
        startDate: startOfDay(clickedDate), 
        endDate: endOfDay(clickedDate) 
      });
    }
  };

  const formatRange = () => {
    const start = format(value.startDate, 'dd/MM', { locale: ptBR });
    const end = format(value.endDate, 'dd/MM', { locale: ptBR });
    
    if (start === end) {
      return format(value.startDate, "dd 'de' MMM", { locale: ptBR });
    }
    return `${start} - ${end}`;
  };

  // Calcular qual preset está ativo
  const getActivePreset = () => {
    const now = new Date();
    const daysDiff = Math.round(
      (now.getTime() - value.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Verificar se endDate é hoje
    const isEndToday = format(value.endDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    if (!isEndToday) return null;
    
    const matchingPreset = DATE_PRESETS.find(p => p.days === daysDiff);
    return matchingPreset?.label || null;
  };

  const activePreset = getActivePreset();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Período:</span>
        
        {/* Presets rápidos */}
        <div className="flex gap-1.5 flex-wrap">
          {DATE_PRESETS.slice(0, 4).map((preset) => (
            <Badge
              key={preset.label}
              variant={activePreset === preset.label ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                activePreset === preset.label 
                  ? "" 
                  : "hover:bg-primary/10"
              )}
              onClick={() => handlePresetClick(preset.days)}
            >
              {preset.label}
            </Badge>
          ))}
        </div>
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRange()}
            <span className="ml-auto text-xs text-muted-foreground">
              Personalizar
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <p className="text-sm font-medium">Selecione o período</p>
            <p className="text-xs text-muted-foreground">
              Clique em duas datas para definir o intervalo
            </p>
          </div>
          
          {/* Presets no popover */}
          <div className="p-2 border-b flex flex-wrap gap-1">
            {DATE_PRESETS.map((preset) => (
              <Badge
                key={preset.label}
                variant={activePreset === preset.label ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => {
                  handlePresetClick(preset.days);
                }}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
          
          <Calendar
            mode="single"
            selected={value.startDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={ptBR}
            disabled={(date) => date > new Date()}
            className="pointer-events-auto"
          />
          
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              De {format(value.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
              {format(value.endDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
